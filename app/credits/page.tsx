import Link from 'next/link';
import {Header} from '@/components/header';

export default function Credits() {
  return <>
    <Header compact/>
    <main id="main" className="credits shell">
      <div className="eyebrow">DI BALIK SAVORA</div>
      <h1>Dibangun untuk belajar,<br/>satu keputusan setiap hari.</h1>
      <section>
        <h2>Tentang SAVORA</h2>
        <p>Simulasi kehidupan finansial untuk mahasiswa Indonesia. Produk dan aturan permainan mengacu pada SAVORA PRD v1.0 dari Tim SAVORA.</p>
      </section>
      <section>
        <h2>Ilustrasi & identitas</h2>
        <p>Logo SAVORA dan ilustrasi berasal dari materi project SAVORA. Aset dioptimalkan menjadi sprite WebP. Hak atas merek dan ilustrasi tetap pada pemiliknya.</p>
      </section>
      <section>
        <h2>Musik & suara</h2>
        <p>Musik instrumental “Bulan Baru” dan efek suara permainan diputar melalui Web Audio. Satu pengaturan suara mengendalikan keduanya.</p>
      </section>
      <section>
        <h2>Privasi</h2>
        <p>Hanya preferensi suara, animasi, dan status tutorial yang disimpan di perangkat. Nama panggilan, skenario, keputusan, dan hasil hanya ada selama sesi. Tidak ada login, pelacakan, atau transaksi nyata.</p>
      </section>
      <section>
        <h2>Komponen terbuka</h2>
        <p>Next.js, React, TypeScript, Tailwind CSS, Motion, Zustand, serta ikon Lucide. Font memakai font sistem perangkat.</p>
      </section>
      <Link className="button" href="/">Kembali ke Beranda</Link>
    </main>
  </>;
}
