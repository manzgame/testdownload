# DATZON DOWNLOADER

Website downloader media universal berbasis Next.js dengan deteksi platform otomatis, preview video/audio/gambar, pilihan tema, aksen warna, skeleton loading, dan riwayat lokal.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Build produksi

```bash
npm run build
npm start
```

## Deploy ke Vercel

1. Upload folder ini ke GitHub.
2. Import repository di Vercel.
3. Framework akan terdeteksi sebagai Next.js.
4. Klik Deploy.

## Konfigurasi provider opsional

Secara default backend mencoba domain provider bawaan. Untuk memakai alamat provider sendiri atau mengubah urutannya, tambahkan environment variable:

```env
DOWNR_BASE_URLS=https://provider-utama.example,https://provider-cadangan.example
```

`DOWNR_BASE_URL` juga didukung untuk satu alamat.

## Struktur utama

- `app/page.tsx` — antarmuka downloader.
- `app/api/download/route.ts` — API internal dan dukungan tautan media langsung.
- `lib/downr.ts` — koneksi provider dengan domain cadangan dan cache.
- `lib/normalize.ts` — normalisasi respons berbagai platform.
- `lib/platforms.ts` — deteksi platform.
- `components/` — logo SVG, ikon platform SVG, dan pemutar audio.

## Catatan

- Tautan langsung `.mp4`, `.webm`, `.mp3`, `.m4a`, `.jpg`, `.png`, dan format umum lain dapat diproses tanpa provider eksternal.
- Untuk tautan halaman platform, ketersediaan format bergantung pada respons platform dan provider.
- Tautan media langsung dapat kedaluwarsa.
- Gunakan hanya untuk media yang dimiliki atau diizinkan untuk diunduh.

## Catatan penting soal hosting

Proyek ini **tidak cocok untuk GitHub Pages** karena memakai API server-side di `app/api/download/route.ts`. Deploy menggunakan Vercel. Bila GitHub Pages menampilkan README, nonaktifkan Pages di Settings > Pages; repository GitHub cukup dipakai sebagai sumber kode untuk Vercel.
