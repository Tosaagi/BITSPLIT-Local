# BITSPLIT
Bill Splitting app that utilize various resource from Microsoft Azure

Untuk menjalankan proyek ini di mesin lokal Anda, Anda perlu menyiapkan baik sumber daya Azure maupun kode lokalnya.
Prasyarat

    Node.js (disarankan versi 18 atau lebih baru)

    Azure Functions Core Tools

    Git

    Akun Azure (akun gratis sudah cukup)

1. Penyiapan Sumber Daya Azure

Aplikasi ini membutuhkan dua sumber daya Azure yang harus disiapkan di cloud, karena tidak memiliki emulator lokal.
a) Azure Storage Account

    Masuk ke Azure Portal dan buat Storage Account baru.

    Setelah dibuat, buka Storage Account Anda dan masuk ke bagian Access keys. Salin Connection string. Anda akan membutuhkannya nanti.

    Selanjutnya, buka bagian Containers (di bawah Data storage) dan buat container privat baru dengan nama receipts.

    Terakhir, buka bagian Tables (di bawah Data storage) dan buat tabel baru dengan nama receiptresults.

b) Azure AI Document Intelligence

    Di Azure Portal, buat sumber daya baru Azure AI services. Saat diminta memilih layanan, pilih Document Intelligence.

    Setelah berhasil dibuat, buka bagian Keys and Endpoint pada sumber daya tersebut.

    Salin Key 1 dan Endpoint URL. Anda akan membutuhkannya.

2. Penyiapan Backend (Azure Functions)

    Clone repository ini dan masuk ke direktori root proyek.

    Buat file baru bernama local.settings.json di root proyek. File ini akan menyimpan kunci rahasia dan string koneksi Anda secara lokal.

    Tempel konten berikut ke dalam local.settings.json, ganti nilai placeholder dengan kunci yang Anda salin dari Azure Portal:

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

    Instal dependensi backend:

npm install

    Jalankan server pengembangan Azure Functions lokal:

func start

API backend sekarang berjalan, biasanya di:
http://localhost:7071
3. Penyiapan Frontend (React)

    Di jendela terminal baru, masuk ke direktori frontend (misalnya di subfolder frontend/ atau sesuai struktur proyek Anda).

    Penting: Buka file UploadScreen.jsx. Temukan baris yang mendefinisikan URL backend dan ubah menjadi mengarah ke host fungsi lokal Anda:

// SEBELUM
const functionAppUrl = 'https://billsplitterfunction-node-hjb6gye8f4bsgqdy.eastus-01.azurewebsites.net';

// SESUDAH
const functionAppUrl = 'http://localhost:7071';

    Instal dependensi frontend:

npm install

    Jalankan server pengembangan React:

npm start

Browser default Anda akan membuka tab baru dengan aplikasi yang berjalan, biasanya di:
http://localhost:3000
