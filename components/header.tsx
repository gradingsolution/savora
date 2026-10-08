import Link from 'next/link';
import { Art } from './art';
export function Header({compact=false}:{compact?:boolean}) { return <header className="header"><div className="header-inner"><Link href="/" className="brand" aria-label="SAVORA — Beranda"><Art name="logo" eager/></Link>{!compact&&<nav aria-label="Navigasi utama"><a href="#cara-bermain">Cara Bermain</a><a href="#tentang">Tentang SAVORA</a></nav>}<Link className="button button-small" href="/play">Mulai Main <span className="play-symbol">▶</span></Link></div></header>; }
