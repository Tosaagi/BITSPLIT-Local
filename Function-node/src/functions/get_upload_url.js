const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require('uuid');

const connectStr = process.env.billsplitterstorage0725_STORAGE;

app.http('get_upload_url', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Request received for a SAS upload URL.');
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectStr);
            const containerName = "receipts";

            // Membuat nama file unik acak menggunakan uuid.
            const blobName = `${uuidv4()}.jpg`;

            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);
            
            // Membuat URL write sementara
            const sasToken = await blobClient.generateSasUrl({
                permissions: "w",
                expiresOn: new Date(new Date().valueOf() + 300 * 1000)
            });

            // sasUrl untuk tujuan unggahan
            // blobName untuk melacak dan meminta hasil analisis file
            return { jsonBody: { sasUrl: sasToken, blobName: blobName } };
        } catch (error) {
            context.log(`Error generating SAS URL: ${error}`);
            return { status: 500, body: "Failed to generate upload URL." };
        }
    }
});