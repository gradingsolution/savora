'use client';
import {useRouter} from 'next/navigation';
import {useGame} from '@/lib/store';
export default function ErrorPage({reset}:{reset:()=>void}){const router=useRouter(),resetGame=useGame(s=>s.reset);return <main id="main" className="error-page"><span className="eyebrow">KITA COBA SEKALI LAGI</span><h1>Ada bagian simulasi yang tidak dapat dimuat.</h1><p>Mulai kembali untuk menjalani cerita bulan yang baru.</p><button className="button" onClick={()=>{resetGame();reset();router.replace('/play');}}>Mulai ulang dengan aman</button></main>;}
