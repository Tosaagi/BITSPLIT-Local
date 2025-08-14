const { app, output } = require('@azure/functions');
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const { BlobServiceClient } = require("@azure/storage-blob");

// Value dari Konfigurasi Environment Variables
const endpoint = process.env.DOC_INTELLIGENCE_ENDPOINT;
const key = process.env.DOC_INTELLIGENCE_KEY;
const connectStr = process.env.billsplitterstorage0725_STORAGE;

// Tabel tujuan
const tableOutput = output.table({
    tableName: 'receiptresults',
    connection: 'billsplitterstorage0725_STORAGE',
});

app.storageBlob('AnalyzeReceipt', {
    path: 'receipts/{name}',
    connection: 'billsplitterstorage0725_STORAGE',
    extraOutputs: [tableOutput],
    handler: async (blob, context) => {
        const receiptId = context.triggerMetadata.name.split('.')[0];
        context.log(`📦 AnalyzeReceipt triggered for blob: ${context.triggerMetadata.name}`);
        context.log(`🧾 Extracted receiptId: ${receiptId}`);

        try {
            const docAnalysisClient = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key), {
                apiVersion: "2023-10-31-preview"
            });
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectStr);

            const containerClient = blobServiceClient.getContainerClient("receipts");
            const blobClient = containerClient.getBlobClient(context.triggerMetadata.name);

            // Membuat SAS URL
            const sasUrl = await blobClient.generateSasUrl({
                permissions: "r",
                expiresOn: new Date(Date.now() + 5 * 60 * 1000)
            });
            context.log(`🔗 SAS URL generated`);

            // Menunggu hasil analisis menggunakan polling
            context.log(`📤 Calling Form Recognizer for receipt analysis...`);
            const poller = await docAnalysisClient.beginAnalyzeDocumentFromUrl("prebuilt-receipt", sasUrl);
            const result = await poller.pollUntilDone();
            
            context.log("📥 Full AI Service Response received.");

            if (result.documents && result.documents.length > 0) {
                const receipt = result.documents[0];
                const taxFields = {};

                if (receipt.fields.TaxDetails && Array.isArray(receipt.fields.TaxDetails.values)) {
                    context.log(`🧾 Found TaxDetails array with ${receipt.fields.TaxDetails.values.length} items.`);
                    for (const taxItem of receipt.fields.TaxDetails.values) {
                        const props = taxItem.properties || {};
                        const description = props.Description?.content?.replace(/\s/g, '') || `TaxItem${Object.keys(taxFields).length}`;
                        
                        const amount = props.Amount?.value?.amount ?? 0;
                        if (amount > 0) {
                            taxFields[description] = amount;
                            context.log(`   -> SUCCESS: Parsed Tax: ${description}, Amount: ${amount}`);
                        } else {
                            context.log(`   -> WARNING: Could not parse amount for tax item. Raw Amount field: ${JSON.stringify(props.Amount)}`);
                        }
                    }
                } else {
                    // jika TaxDetails tidak ada, maka cari field apa pun yang mengandung kata 'tax'.
                    context.log(`⚠️ TaxDetails field not found. Falling back to simple tax field search.`);
                    for (const [fieldName, fieldData] of Object.entries(receipt.fields)) {
                        if (/tax/i.test(fieldName) && fieldData?.value) {
                            taxFields[fieldName] = fieldData.value;
                        }
                    }
                }
                
                const itemsList = [];
                const itemsField = receipt.fields.Items;

                if (Array.isArray(itemsField?.values)) {
                    context.log(`📃 Items found: ${itemsField.values.length}`);
                    for (const item of itemsField.values) {
                        const props = item.properties || {};
                        const description = props.Description?.content ?? "N/A";
                        const quantity = props.Quantity?.value ?? 1; 
                        const totalPrice = props.TotalPrice?.value ?? 0;
                        context.log(`📝 Parsed item -> Description: ${description}, Quantity: ${quantity}, TotalPrice: ${totalPrice}`);
                        itemsList.push({ description, quantity, totalPrice });
                    }
                } else {
                    context.log("⚠️ Items.values is not an array. Raw Items field:", JSON.stringify(itemsField, null, 2));
                }

                // Kalkulasi subtotal dari jumlah harga seluruh item
                const calculatedSubtotal = parseFloat(itemsList.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
                context.log(`🧮 Calculated Subtotal from items: ${calculatedSubtotal}`);

                let recognizedTax = parseFloat(Object.values(taxFields).reduce((acc, val) => acc + val, 0).toFixed(2));
                let recognizedTotal = receipt.fields.Total?.value ?? 0;

                // Mendapatkan tax jika hanya total yang terdeteksi
                if (recognizedTotal > 0 && recognizedTax === 0 && recognizedTotal > calculatedSubtotal) {
                    recognizedTax = parseFloat((recognizedTotal - calculatedSubtotal).toFixed(2));
                    context.log(`💡 Tax was 0. Calculated tax from total and subtotal: ${recognizedTax}`);
                // Mendapatkan total jika hanya tax yang terdeteksi
                } else if (recognizedTax > 0 && recognizedTotal === 0) {
                    recognizedTotal = parseFloat((calculatedSubtotal + recognizedTax).toFixed(2));
                    context.log(`💡 Total was 0. Calculated total from subtotal and tax: ${recognizedTotal}`);
                // Jika keduanya tidak terdeteksi, asumsikan tidak ada tax, dan harga total sesuai dengan subtotal
                } else if (recognizedTotal === 0 && recognizedTax === 0) {
                    recognizedTotal = calculatedSubtotal;
                    context.log(`⚠️ Neither total nor tax were found. Setting total equal to subtotal.`);
                }

                const outputData = {
                    PartitionKey: "receipt",
                    RowKey: receiptId,
                    items: itemsList,
                    subtotal: calculatedSubtotal,
                    tax: recognizedTax,
                    taxBreakdown: taxFields,
                    total: recognizedTotal,
                };

                // Mengirimkan data yang sudah diolah ke tabel tujuan
                context.log("📤 Final output data:", JSON.stringify(outputData, null, 2));
                context.extraOutputs.set(tableOutput, outputData);
                context.log(`✅ Successfully saved receipt data for: ${receiptId}`);
            } else {
                context.log(`⚠️ No documents returned from receipt model.`);
            }
        } catch (error) {
            context.log(`❌ Error in AnalyzeReceipt: ${error.message || error}`);
            context.log(`📉 Stack trace: ${error.stack}`);
        }
    }
});
