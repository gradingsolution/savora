# SAVORA

![Logo SAVORA](public/assets/logo.webp)

**Satu bulan. Banyak pilihan. Cerita finansialmu sendiri.**

SAVORA adalah web game simulasi finansial untuk mahasiswa Indonesia. Jalani 30 hari melalui 13 keputusan: mengatur uang bulanan, membayar kebutuhan, menjaga kesehatan, menyelesaikan kuliah, dan meluangkan waktu untuk teman. Setiap pilihan memengaruhi kondisi akhir bulan.

**[Mainkan live demo → https://savoraid.vercel.app/](https://savoraid.vercel.app/)**

## Cara menjalankan

Gunakan **Node.js 24 LTS** dan **npm 10 atau lebih baru**.

```bash
git clone https://github.com/gradingsolution/savora.git
cd savora
npm ci
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Tidak diperlukan akun, database, atau API key. Aset siap pakai sudah tersedia di `public/assets/`.

Untuk menjalankan build produksi, hentikan server dev terlebih dahulu:

```bash
npm run build
npm start
```

Build produksi menggunakan Webpack. Server development dan produksi lokal berjalan pada port 3000.

### Konfigurasi opsional

Salin `.env.example` menjadi `.env.local` jika ingin mengubah URL dasar metadata. Untuk deployment publik:

```dotenv
NEXT_PUBLIC_SITE_URL=https://savoraid.vercel.app
```

Tanpa variabel ini, metadata menggunakan `http://localhost:3000`. Jangan commit file `.env.local` atau kredensial.

## Tech stack

| Teknologi | Peran |
| --- | --- |
| Next.js 16, React 19 | App Router, halaman, dan komponen antarmuka |
| TypeScript | Tipe data dan logika permainan |
| Tailwind CSS 4, CSS | Tampilan responsif dan tata letak |
| Zustand | State sesi dan preferensi permainan |
| Motion | Animasi adegan, statistik, dan interaksi |
| Web Audio API | Musik latar dan efek suara sintetis |
| Lucide React | Ikon antarmuka |
| Vitest, Playwright | Unit tests dan spesifikasi pengujian browser |
| Vercel | Hosting live demo |

Seluruh perhitungan permainan berjalan di browser. Tidak ada backend transaksi atau koneksi ke rekening keuangan.

## Struktur fitur

| Bagian | Fitur |
| --- | --- |
| Beranda | Pengenalan permainan dan cara bermain |
| Persiapan | Nama opsional, pilihan uang bulanan, nominal kustom, tutorial |
| Permainan | 13 keputusan dalam 30 hari, adegan interaktif, tiga pilihan dengan dampak berbeda |
| Statistik | Saldo tersedia, tabungan, wellbeing, productivity |
| Konsekuensi | Feedback setiap keputusan, konfirmasi biaya besar, batas utang, checkpoint paruh bulan |
| Hasil | SAVORA Score, 6 personality, 8 achievement, rincian pengeluaran, insight, riwayat pilihan |
| Replay | Variasi susunan kejadian dari 15 event lokal |
| Audio dan animasi | Musik “Bulan Baru”, efek suara, satu kontrol suara, pengurangan gerak |
| Mobile | HUD ringkas, adegan dan pilihan dalam satu layar pada ukuran ponsel yang didukung; layar sangat pendek tetap dapat digulir |
| Berbagi | Web Share dan salin teks hasil |

Musik dan efek aktif setelah menekan **Mulai Hari 1**. Musik berhenti ketika permainan dijeda atau tab tersembunyi. Pengaturan suara dan animasi dapat diubah selama bermain.

## Struktur project

```text
app/                    Halaman, layout, metadata, dan stylesheet
  page.tsx              Beranda
  play/                 Persiapan dan permainan
  result/               Hasil sesi
  credits/              Informasi project dan kredit
components/             Adegan, dialog, HUD, preferensi, dan hasil
lib/
  events.ts             Data kejadian dan pilihan
  engine.ts             Perhitungan uang, skor, personality, dan achievement
  store.ts              State sesi dan preferensi
  audio.ts              Musik dan efek Web Audio
  assets.ts             Manifest ilustrasi
  types.ts              Tipe data permainan
  webmcp.ts             Integrasi opsional pembacaan kondisi permainan
public/                 Logo, ikon, dan sprite WebP
scripts/                Utilitas persiapan aset
tests/                  Unit tests dan spesifikasi E2E
```

`scripts/prepare-assets.mjs` hanya diperlukan untuk mengolah ulang sprite dari sheet sumber. Jalankan `node scripts/prepare-assets.mjs /path/ke/sheet` jika memiliki file sumber. Sheet asli tidak diperlukan untuk menjalankan aplikasi.

## Pengujian

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Atau jalankan semua pemeriksaan tersebut dengan `npm run check`.

Unit tests mencakup perhitungan uang, batas statistik dan utang, variasi event, skor, personality, achievement, serta siklus audio. Terdapat 25 tes, termasuk simulasi 1.000 sesi strategi dan 500 kombinasi seed/budget.

Untuk pengujian browser, jalankan `npm run dev` di terminal pertama, lalu di terminal kedua:

```bash
npx playwright install chromium
npm run test:e2e
```

## Data dan privasi

- Tidak memerlukan login dan tidak menggunakan analytics.
- Nama, budget, keputusan, dan hasil hanya disimpan selama sesi; refresh halaman mengulang sesi.
- `localStorage` hanya menyimpan preferensi suara/animasi dan status tutorial.
- Teks berbagi tidak menyertakan nama pemain atau budget awal.
- Tidak ada transaksi uang nyata.

## Lisensi dan aset

Kode menggunakan [MIT License](LICENSE). Logo dan ilustrasi memiliki hak tersendiri dan tidak termasuk lisensi MIT untuk kode. Rincian sumber serta kredit komponen tersedia di [ASSET-CREDITS.md](ASSET-CREDITS.md).

SAVORA merupakan simulasi edukasi. Nilai dan hasil permainan tidak menggambarkan kondisi finansial nyata pemain dan bukan nasihat keuangan profesional.
