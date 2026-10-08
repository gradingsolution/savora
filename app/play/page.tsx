import type { Metadata } from 'next';
import { Play } from '@/components/play';
export const metadata:Metadata={title:'Main SAVORA — Cerita Bulanmu',robots:{index:false,follow:false}};
export default function PlayPage(){return <Play/>;}
