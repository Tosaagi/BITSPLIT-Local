const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const connection = process.env.billsplitterstorage0725_STORAGE;
const tableName = "receiptresults";

// Mengubah BigInt menjadi string agar stringify bekerja dengan baik
function sanitizeBigInts(obj) {
    return JSON.parse(JSON.stringify(obj, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
    ));
}

app.http('get_receipt_results', {
    methods: ['GET'],
    route: 'get_receipt_results/{blobName}', // Parameter dinamis dari URL
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('📩 Request received for receipt results.');
        const blobName = request.params.blobName;
        const receiptId = blobName.split('.')[0];

        context.log(`🔍 Looking up RowKey: ${receiptId} in table: ${tableName}`);

        try {
            const tableClient = TableClient.fromConnectionString(connection, tableName);

            // Mengambil data dari tabel menggunakan PartitionKey "receipt" dan RowKey dari ID struk
            const result = await tableClient.getEntity("receipt", receiptId);

            // Memastikan field 'items' diubah kembali menjadi objek JavaScript yang sebenarnya
            if (result && typeof result.items === 'string') {
                try {
                    result.items = JSON.parse(result.items);
                } catch (parseErr) {
                    context.log(`⚠️ Could not parse 'items' JSON string: ${parseErr.message}`);
                }
            }

            const sanitized = sanitizeBigInts(result);

            context.log("📦 Receipt result payload:", JSON.stringify(sanitized, null, 2));

            return { jsonBody: sanitized };
        } catch (error) {
            if (error.statusCode === 404) {
                context.log(`⚠️ RowKey ${receiptId} not found.`);
                return { status: 404, body: "Not found." };
            }
            context.log(`❌ Error fetching from table: ${error.message || error}`);
            return { status: 500, body: "Error fetching results." };
        }
    }
});
