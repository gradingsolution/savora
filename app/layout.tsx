import type { Metadata } from 'next';
import './globals.css';
import { Preferences } from '@/components/preferences';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'SAVORA — Simulasi Finansial Mahasiswa',
  description: 'Jalani 30 hari virtual, ambil keputusan finansial, dan temukan gaya mengelola uangmu dalam 3–5 menit.',
  icons: { icon: '/favicon.svg' },
  openGraph: { title: 'SAVORA — Simulasi Finansial Mahasiswa', description: '30 hari. 13 keputusan. Temukan gaya mengelola uangmu.', locale:'id_ID', type:'website' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main">Lewati ke konten</a><Preferences/>{children}</body></html>;
}
