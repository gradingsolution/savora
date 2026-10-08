import type {Metadata} from 'next';
import {Result} from '@/components/result';
export const metadata:Metadata={title:'Hasil Bulanmu — SAVORA',robots:{index:false,follow:false}};
export default function ResultPage(){return <Result/>;}
