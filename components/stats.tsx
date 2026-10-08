'use client';
import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useGame } from '@/lib/store';
import { Art } from './art';
import { rupiah } from '@/lib/engine';
import type { GameState } from '@/lib/types';
function Counter({value,money=false}:{value:number;money?:boolean}){
  const reduced=useGame(s=>s.settings.reduceMotion),count=useMotionValue(value);
  const display=useTransform(count,n=>money?rupiah(Math.round(n)):String(Math.round(n)));
  useEffect(()=>{const control=animate(count,value,{duration:reduced?0:.65,ease:'easeOut'});return()=>control.stop();},[count,value,reduced]);
  return <motion.span>{display}</motion.span>;
}
export function Stats({game}:{game:GameState}){return <div className="stats-row" aria-label="Kondisi bulanmu"><div className={`stat-card ${game.balance<0?'stat-negative':''}`}><Art name="walletIcon"/><div><span>Saldo tersedia</span><strong><Counter value={game.balance} money/></strong></div></div><div className="stat-card"><Art name="savingsIcon"/><div><span>Tabungan</span><strong><Counter value={game.savings} money/></strong></div></div>{[{name:'Wellbeing',value:game.wellbeing,art:'heartIcon',tone:'pink'},{name:'Productivity',value:game.productivity,art:'productivityIcon',tone:'purple'}].map(s=><div className={`stat-card ${s.tone}`} key={s.name}><Art name={s.art}/><div><span>{s.name}</span><strong><Counter value={s.value}/><small> / 100</small></strong><div className="mini-progress" aria-hidden="true"><span style={{width:`${s.value}%`}}/></div></div></div>)}</div>;}
