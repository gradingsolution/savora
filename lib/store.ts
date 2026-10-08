'use client';
import { create } from 'zustand';
import type {GameState} from './types';
import { advance, applyChoice, initialState } from './engine';
type Phase='setup'|'tutorial'|'intro'|'playing'|'feedback'|'pulse'|'result';
interface Store {game:GameState|null;phase:Phase;replay:boolean;notice:string;settings:{soundEnabled:boolean;reduceMotion:boolean};hydrated:boolean;hydrate:()=>void;setSettings:(x:Partial<Store['settings']>)=>void;start:(name:string,budget:number)=>void;begin:()=>void;finishTutorial:()=>void;choose:(id:string)=>void;next:()=>void;continuePulse:()=>void;reset:()=>void;setNotice:(notice:string)=>void}
export const safeRead=(key:string)=>{try{return localStorage.getItem(key);}catch{return null;}};
export const safeWrite=(key:string,value:string)=>{try{localStorage.setItem(key,value);}catch{/* Preferences are optional. */}};
export const useGame=create<Store>((set,get)=>({
  game:null,phase:'setup',replay:false,notice:'',settings:{soundEnabled:true,reduceMotion:false},hydrated:false,
  hydrate:()=>{if(get().hydrated)return;let soundEnabled=true,reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;try{const saved=JSON.parse(safeRead('savora:settings:v1')||'null');if(saved){soundEnabled=saved.soundEnabled===true;if(typeof saved.reduceMotion==='boolean')reduceMotion=saved.reduceMotion;}}catch{/* Invalid preference uses defaults. */}set({settings:{soundEnabled,reduceMotion},hydrated:true});},
  setSettings:(x)=>{const settings={...get().settings,...x};set({settings});safeWrite('savora:settings:v1',JSON.stringify(settings));},
  start:(name,budget)=>{const replay=get().replay;set({game:initialState(name,budget,replay),phase:safeRead('savora:onboarding:v1')==='true'?'intro':'tutorial',notice:''});},
  finishTutorial:()=>{safeWrite('savora:onboarding:v1','true');set({phase:'intro'});},
  begin:()=>{if(get().phase==='intro')set({phase:'playing'});},
  choose:(id)=>{const {game,phase}=get();if(!game||phase!=='playing')return;const updated=applyChoice(game,id);if(updated!==game)set({game:updated,phase:'feedback'});},
  next:()=>{const {game,phase}=get();if(!game||phase!=='feedback')return;if(game.history.length===7){set({phase:'pulse'});return;}const updated=advance(game);set({game:updated,phase:updated.index>=updated.queue.length?'result':'playing',replay:updated.index>=updated.queue.length||get().replay});},
  continuePulse:()=>{const {game,phase}=get();if(game&&phase==='pulse')set({game:advance(game),phase:'playing'});},
  reset:()=>set({game:null,phase:'setup',notice:''}),setNotice:(notice)=>set({notice})
}));
