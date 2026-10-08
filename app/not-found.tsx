import Link from 'next/link';
import {Art} from '@/components/art';
export default function NotFound(){return <main id="main" className="error-page"><Art name="thinking"/><span className="eyebrow">404 · HALAMAN TIDAK DITEMUKAN</span><h1>Sepertinya kita salah jalan.</h1><p>Cerita bulanmu masih bisa dimulai dari beranda.</p><Link className="button" href="/">Kembali ke Beranda</Link></main>;}
