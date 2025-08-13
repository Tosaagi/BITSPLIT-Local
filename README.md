# BITSPLIT
Bill Splitting app that utilize various resource from Microsoft Azure

Untuk menjalankan projek ini di mesin lokal, perlu untuk menyiapkan sumber daya Azure dan kode lokalnya:

- Node.js (v20 hingga terbaru)
- Azure Functions Core Tools
- Azurite: Emulator untuk Azure Storage yang digunakan untuk pengembangan lokal. Instal dengan perintah berikut di terminal:
  
      npm install -g azurite
- Akun Azure

## Penyiapan Sumber Daya Azure
### a. Azure Storage Account
  1) Masuk ke Azure Portal dan buat Storage Account baru.
  2) Buka Storage Account dan masuk ke bagian Access keys. Salin Connection string.
  3) Buka bagian Containers dan buat container privat baru dengan nama `receipts`.
  4) Buka bagian Tables dan buat tabel baru dengan nama `receiptresults`.

### b. Azure AI Document Intelligence
  1) Pada Azure Portal, buat sumber daya baru Azure Document Intelligence.
  2) Setelah berhasil dibuat, buka bagian Keys and Endpoint pada sumber daya tersebut. Salin Key 1 dan Endpoint URL.

## Penyiapan Backend (Azure Functions)
  1) Clone repository ini dan masuk ke direktori Function-node.
  2) Buat file baru bernama `local.settings.json`.
  3) Tempel konten berikut ke dalam local.settings.json, ganti nilai placeholder dengan kunci yang telah disalin dari Azure Portal:
          
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

  5) Buka terminal baru yang terpisah, lalu jalankan emulator Azurite:
     
         azurite
     
     Biarkan terminal ini tetap berjalan di latar belakang

  7) Jalankan server pengembangan Azure Functions lokal:

         func start

API backend sekarang berjalan, biasanya pada port berikut:

    http://localhost:7071

## Penyiapan Frontend (React)
  1) Masuk ke direktori WebApp.
  2) Buka file UploadScreen.jsx. Temukan baris yang mendefinisikan URL backend dan ubah menjadi mengarah ke host fungsi lokal Anda:

         // SEBELUM
         const functionAppUrl = 'https://billsplitterfunction-node-hjb6gye8f4bsgqdy.eastus-01.azurewebsites.net';
      
         // SESUDAH
         const functionAppUrl = 'http://localhost:7071';

  3) Instal dependensi frontend:

         npm install

  4) Jalankan server pengembangan React:

         npm start

Browser default Anda akan membuka tab baru dengan aplikasi yang berjalan, biasanya pada port berikut:

    http://localhost:5173, atau http://localhost:3000

**CATATAN PENTING**: Pada Storage Account yang sudah Anda buat di portal Azure, pastikan untuk menambahkan aturan CORS untuk port anda. Berikut adalah contoh pengaturan yang tepat:

```
Allowed origins: http://localhost:5173
Allowed methods: Pilih PUT dan GET (atau pilih semua).
Allowed headers: *
Exposed headers: *
Max age: 3600
```
