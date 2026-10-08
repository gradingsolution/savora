'use client';
import { useState } from 'react';
import { assets } from '@/lib/assets';
export function Art({ name, alt='', className='', eager=false }: {name:string;alt?:string;className?:string;eager?:boolean}) {
  const [failed,setFailed] = useState(false);
  if(failed) return <span className={`art-fallback ${className}`} role={alt?'img':undefined} aria-label={alt||undefined}>✦</span>;
  return <img src={assets[name]} alt={alt} className={`art ${className}`} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)} draggable={false}/>;
}
