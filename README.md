# BITSPLIT
Bill Splitting app that utilize various resource from Microsoft Azure

Untuk menjalankan proyek ini di mesin lokal, perlu untuk menyiapkan sumber daya Azure dan kode lokalnya:

- Node.js (v20+)
- Azure Functions Core Tools
- Akun Azure

## Penyiapan Sumber Daya Azure
a. Azure Storage Account
  1) Masuk ke Azure Portal dan buat Storage Account baru.
  2) Setelah dibuat, buka Storage Account Anda dan masuk ke bagian Access keys. Salin Connection string. Anda akan membutuhkannya nanti.
  3) Selanjutnya, buka bagian Containers (di bawah Data storage) dan buat container privat baru dengan nama receipts.
  4) Terakhir, buka bagian Tables (di bawah Data storage) dan buat tabel baru dengan nama receiptresults.

b. Azure AI Document Intelligence
  1) Di Azure Portal, buat sumber daya baru Azure AI services. Saat diminta memilih layanan, pilih Document Intelligence.
  2) Setelah berhasil dibuat, buka bagian Keys and Endpoint pada sumber daya tersebut.
  3) Salin Key 1 dan Endpoint URL. Anda akan membutuhkannya.

2. Penyiapan Backend (Azure Functions)
  1) Clone repository ini dan masuk ke direktori root proyek.
  2) Buat file baru bernama local.settings.json di root proyek. File ini akan menyimpan kunci rahasia dan string koneksi Anda secara lokal.
  3) Tempel konten berikut ke dalam local.settings.json, ganti nilai placeholder dengan kunci yang Anda salin dari Azure Portal:

            {
              "IsEncrypted": false,
              "Values": {
                "AzureWebJobsStorage": "UseDevelopmentStorage=true",
                "FUNCTIONS_WORKER_RUNTIME": "node",
                "billsplitterstorage0725_STORAGE": "YOUR_AZURE_STORAGE_CONNECTION_STRING",
                "DOC_INTELLIGENCE_ENDPOINT": "YOUR_DOCUMENT_INTELLIGENCE_ENDPOINT",
                "DOC_INTELLIGENCE_KEY": "YOUR_DOCUMENT_INTELLIGENCE_KEY"
              }
            }

  4) Instal dependensi backend:

            npm install

  5) Jalankan server pengembangan Azure Functions lokal:

func start

API backend sekarang berjalan, biasanya di:
http://localhost:7071
3. Penyiapan Frontend (React)

  1) Di jendela terminal baru, masuk ke direktori frontend (misalnya di subfolder frontend/ atau sesuai struktur proyek Anda).
  2) Penting: Buka file UploadScreen.jsx. Temukan baris yang mendefinisikan URL backend dan ubah menjadi mengarah ke host fungsi lokal Anda:

            // SEBELUM
            const functionAppUrl = 'https://billsplitterfunction-node-hjb6gye8f4bsgqdy.eastus-01.azurewebsites.net';

            // SESUDAH
            const functionAppUrl = 'http://localhost:7071';

  3) Instal dependensi frontend:

            npm install

  4) Jalankan server pengembangan React:

            npm start

Browser default Anda akan membuka tab baru dengan aplikasi yang berjalan, biasanya di:
http://localhost:3000
