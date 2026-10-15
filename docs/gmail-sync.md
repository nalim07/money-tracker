# Gmail Sync Setup

Fitur ini hanya memproses email yang diterima setelah `activateMooneySync()` dijalankan.

## Sumber yang didukung

- Jago
- BCA
- LINE Bank
- Hana Bank
- Bank Saqu
- SeaBank
- blu by BCA

## Apps Script properties

Tambahkan nilai berikut melalui **Project Settings → Script properties**. Jangan simpan token di file `.gs`.

```text
MOONEY_INGEST_URL=https://txrkimtlugynnezdbrnw.supabase.co/functions/v1/email-ingest
MOONEY_INGEST_TOKEN=<EMAIL_INGEST_TOKEN>
MOONEY_GMAIL_QUERY=<query Gmail khusus notifikasi bank>
MOONEY_SOURCE_BY_SENDER=<JSON mapping sender ke sumber dan Kantong>
MOONEY_MAX_THREADS=25
```

Contoh `MOONEY_SOURCE_BY_SENDER` (ganti alamat pengirim dengan alamat sebenarnya dari email notifikasi):

```json
{
  "notification@bank.example": { "source": "Jago", "wallet_name": "Kantong Jago" },
  "notice@bank.example": { "source": "BCA", "wallet_name": "Kantong BCA" }
}
```

`wallet_name` harus persis atau setara dengan nama **Kantong yang sudah ada** di Mooney Tracker. Jika tidak ditemukan, transaksi tidak dibuat dan Kantong baru tidak dibuat.

## Aktivasi

1. Tempel `google-apps-script/mooney-gmail-sync.gs` ke project Google Apps Script baru.
2. Isi Script Properties.
3. Jalankan `selfTestMooneySync()`.
4. Jalankan `activateMooneySync()` sekali. Saat itu `MOONEY_STARTED_AT` disimpan.
5. Jalankan `syncMooneyEmails()` secara manual dan periksa hasilnya.
6. Setelah aman, tambahkan time trigger untuk `syncMooneyEmails()`.

## Batas aman

- Email sebelum `MOONEY_STARTED_AT` diabaikan, tidak dihapus.
- Message ID yang sama tidak dapat menjadi dua transaksi.
- Dompet/Kantong yang tidak cocok, tipe yang tidak bisa ditentukan, nominal yang tidak memiliki `Rp`/`IDR`, dan sumber tak didukung semuanya gagal tanpa menulis transaksi.
- Kirim sampel email notifikasi yang sudah disensor untuk menambahkan parser spesifik bank. Jangan aktifkan trigger sebelum mapping pengirim dan Kantong diverifikasi.
