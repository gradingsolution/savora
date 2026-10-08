import { curated, events, eventMap, expenseNames } from './events';
import type {Choice, ExpenseCategory, GameState, MoneyDelta, ScheduledEvent} from './types';
export const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));
export const rupiah=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export const resolveMoney=(value:MoneyDelta|undefined,budget:number)=>typeof value==='number'?value:Math.round((value?.budgetRate||0)*budget);
export function seeded(seed:number){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function validQueue(queue:ScheduledEvent[],budget:number,checkCost=true){
  if(queue.length!==13||new Set(queue.map(x=>x.id)).size!==13||queue[0].day!==1||queue.at(-1)?.day!==30)return false;
  const ids=queue.map(x=>x.id),cats=queue.flatMap(x=>[eventMap[x.id].category,...(eventMap[x.id].also||[])]);
  if(!['plan-savings','kos-utilities','food-stock','academic-materials','month-close'].every(id=>ids.includes(id)))return false;
  if(!['income','social','temptation','academic','health-emergency'].every(c=>cats.includes(c as never)))return false;
  let lastBig=-10;
  for(let i=0;i<queue.length;i++){
    const q=queue[i],e=eventMap[q.id];
    if(q.day<e.dayWindow[0]||q.day>e.dayWindow[1]||(i>0&&q.day<=queue[i-1].day))return false;
    if(e.excludes?.some(id=>ids.includes(id))||e.prerequisites?.some(id=>!ids.slice(0,i).includes(id)))return false;
    if(i>1&&e.category===eventMap[queue[i-1].id].category&&e.category===eventMap[queue[i-2].id].category)return false;
    const big=e.choices.some(c=>resolveMoney(c.cashDelta,budget)+resolveMoney(c.savingsDelta,budget)<=-.12*budget);
    if(checkCost&&big){if(q.day-lastBig<5)return false;lastBig=q.day;}
  }
  const health=queue.find(x=>x.id==='health-surprise'),device=queue.find(x=>x.id==='device-repair');
  return !(health&&device&&Math.abs(health.day-device.day)<6);
}
export function selectQueue(seed:number,budget:number,attempts=50){
  const random=seeded(seed);
  for(let attempt=0;attempt<attempts;attempt++){
    const emergency=random()<.5?'health-surprise':'device-repair';
    const removable=['transport-choice','data-package','group-project','laundry-week','campus-organization'];
    const omit=removable[Math.floor(random()*removable.length)];
    const selected=events.filter(e=>e.id!==omit&&(!['health-surprise','device-repair'].includes(e.id)||e.id===emergency));
    const queue=selected.map(e=>({id:e.id,day:e.id==='month-close'?30:e.dayWindow[0]+Math.floor(random()*(e.dayWindow[1]-e.dayWindow[0]+1))})).sort((a,b)=>a.day-b.day);
    if(validQueue(queue,budget))return queue;
  }
  return curated.map(x=>({...x}));
}
export function initialState(name:string,budget:number,replay=false,seed=Date.now()>>>0):GameState{
  if(!Number.isInteger(budget)||budget<750000||budget>5000000||budget%50000)throw new Error('Skenario uang bulanan tidak valid.');
  return {name:name.trim()||'Sobat SAVORA',initialBudget:budget,balance:budget,savings:0,wellbeing:60,productivity:60,discipline:50,queue:replay?selectQueue(seed,budget):curated.map(x=>({...x})),index:0,seed,history:[]};
}
export const debtFloor=(s:GameState)=>-Math.floor(s.initialBudget*.25);
export function canChoose(s:GameState,c:Choice){return s.balance+resolveMoney(c.cashDelta,s.initialBudget)>=debtFloor(s)&&s.savings+resolveMoney(c.savingsDelta,s.initialBudget)>=0;}
export function availableChoices(s:GameState):Choice[]{
  const e=eventMap[s.queue[s.index]?.id];if(!e)return [];
  if(e.choices.some(c=>canChoose(s,c)))return e.choices;
  return [...e.choices,{id:'fallback',label:'Cari bantuan tanpa biaya',helper:'Gunakan dukungan kampus; kebutuhan belum sepenuhnya selesai.',cashDelta:0,stats:{wellbeing:-5,productivity:-5,discipline:-2},needResolution:e.needWeight?0:undefined,tags:['safety-fallback'],feedback:'Dukungan tanpa biaya menjaga saldo dari batas utang. Kebutuhan ini masih perlu perhatian, dan kamu dapat melanjutkan bulan.'}];
}
export function needsConfirmation(s:GameState,c:Choice){const cash=resolveMoney(c.cashDelta,s.initialBudget);return s.balance+cash<0||cash<=-.15*s.initialBudget||resolveMoney(c.savingsDelta,s.initialBudget)<0;}
export function applyChoice(s:GameState,choiceId:string):GameState{
  const scheduled=s.queue[s.index];if(!scheduled||s.history.some(h=>h.eventId===scheduled.id))return s;
  const event=eventMap[scheduled.id],choice=availableChoices(s).find(c=>c.id===choiceId);
  if(!choice||!canChoose(s,choice))throw new Error('Pilihan melewati batas saldo atau tidak tersedia.');
  const cashDelta=resolveMoney(choice.cashDelta,s.initialBudget),savingsDelta=resolveMoney(choice.savingsDelta,s.initialBudget),net=cashDelta+savingsDelta;
  const wellbeing=clamp(s.wellbeing+(choice.stats?.wellbeing||0)),productivity=clamp(s.productivity+(choice.stats?.productivity||0)),discipline=clamp(s.discipline+(choice.stats?.discipline||0));
  return {...s,balance:s.balance+cashDelta,savings:s.savings+savingsDelta,wellbeing,productivity,discipline,history:[...s.history,{eventId:event.id,choiceId,label:choice.label,day:scheduled.day,cashDelta,savingsDelta,wellbeingDelta:wellbeing-s.wellbeing,productivityDelta:productivity-s.productivity,disciplineDelta:discipline-s.discipline,expense:Math.max(0,-net),income:Math.max(0,net),expenseCategory:choice.expenseCategory,needResolution:choice.needResolution,needWeight:event.needWeight,tags:choice.tags||[],feedback:choice.feedback}]};
}
export function advance(s:GameState){return s.history.length===s.index+1?{...s,index:s.index+1}:s;}
export function needsCoverage(s:GameState,academicOnly=false){const entries=s.history.filter(h=>h.needWeight&&(!academicOnly||eventMap[h.eventId].category==='academic'||eventMap[h.eventId].also?.includes('academic')));const total=entries.reduce((n,h)=>n+(h.needWeight||0),0);return total?entries.reduce((n,h)=>n+(h.needResolution||0)*(h.needWeight||0),0)/total:0;}
export function spending(s:GameState){const totals:Partial<Record<ExpenseCategory,number>>={};s.history.forEach(h=>{if(h.expense){const cat=h.expenseCategory||'other';totals[cat]=(totals[cat]||0)+h.expense;}});return Object.entries(totals).map(([id,value])=>({id:id as ExpenseCategory,label:expenseNames[id as ExpenseCategory],value:value!})).sort((a,b)=>b.value-a.value);}
export function calculateScore(s:GameState){
  const components=[{id:'liquidity',label:'Ketahanan Saldo',value:clamp(Math.max(s.balance,0)/(s.initialBudget*.15)*100),weight:.15},{id:'savings',label:'Kemajuan Tabungan',value:clamp(s.savings/(s.initialBudget*.15)*100),weight:.2},{id:'needs',label:'Kebutuhan Terpenuhi',value:needsCoverage(s),weight:.2},{id:'wellbeing',label:'Wellbeing',value:s.wellbeing,weight:.15},{id:'productivity',label:'Productivity',value:s.productivity,weight:.15},{id:'discipline',label:'Kebiasaan Finansial',value:s.discipline,weight:.15}];
  const debtPenalty=s.balance<0?Math.min(12,Math.abs(s.balance)/s.initialBudget*48):0;
  const criticalPenalty=Math.min(8,s.history.filter(h=>h.needWeight&&(h.needResolution??100)<30).length*2);
  const base=components.reduce((n,c)=>n+c.value*c.weight,0);
  const score=Math.min(s.balance<0?59:100,clamp(Math.round(base-debtPenalty-criticalPenalty)));
  const tier=score>=85?'Terkelola Sangat Baik':score>=70?'Cukup Seimbang':score>=55?'Perlu Penyesuaian':'Perlu Rencana Baru';
  return {score,tier,components,debtPenalty,criticalPenalty,base};
}
export function personality(s:GameState){
  const spend=spending(s),total=spend.reduce((n,x)=>n+x.value,0),fun=spend.filter(x=>['wants','social'].includes(x.id)).reduce((n,x)=>n+x.value,0);
  if(s.balance<0)return {name:'Broke Before Payday',art:'badge-broke',copy:'Pengeluaran melewati uang yang tersedia. Bulan berikutnya, coba beri ruang lebih besar untuk buffer dan kebutuhan.'};
  if(s.balance>=s.initialBudget*.05&&s.savings>=s.initialBudget*.1&&needsCoverage(s)>=80&&s.wellbeing>=55&&s.productivity>=55)return {name:'Balanced Planner',art:'badge-balance',copy:'Kamu menjaga kebutuhan, tabungan, dan kualitas hidup. Rencanamu punya ruang untuk hari ini dan nanti.'};
  if(s.savings>=s.initialBudget*.2&&s.discipline>=65)return {name:'Smart Saver',art:'badge-safety',copy:'Kamu kuat membangun buffer dan menahan pengeluaran. Tetap beri ruang untuk kebutuhan dan wellbeing.'};
  if(total>0&&fun/total>=.25&&s.wellbeing>=65)return {name:'Happy Spender',art:'badge-social',copy:'Kamu menghargai pengalaman dan kebersamaan. Batas budget membantu menjaga kebahagiaan ini lebih lama.'};
  if(s.productivity>=75&&needsCoverage(s,true)>=80)return {name:'Campus Achiever',art:'badge-study',copy:'Kamu memberi prioritas pada perkembangan akademik. Lindungi juga energi dan tabunganmu.'};
  return {name:'Survival Strategist',art:'badge-survival',copy:'Kamu beradaptasi dengan keadaan sepanjang bulan. Coba rencana yang lebih konsisten pada kesempatan berikutnya.'};
}
export function achievements(s:GameState){
  const social=spending(s).find(x=>x.id==='social')?.value||0;
  return [
    {id:'safety-net',name:'Safety Net',art:'badge-safety',description:'Tabungan akhir minimal 15% budget.',earned:s.savings>=s.initialBudget*.15},
    {id:'zero-debt',name:'Zero Debt',art:'badge-debt',description:'Tutup bulan dengan saldo tidak minus.',earned:s.balance>=0},
    {id:'needs-first',name:'Needs First',art:'badge-needs',description:'Kebutuhan terpenuhi minimal 90%.',earned:needsCoverage(s)>=90},
    {id:'balanced-life',name:'Balanced Life',art:'badge-balance',description:'Wellbeing 70, productivity 65, tabungan 10%.',earned:s.wellbeing>=70&&s.productivity>=65&&s.savings>=s.initialBudget*.1},
    {id:'study-supporter',name:'Study Supporter',art:'badge-study',description:'Productivity 75 dan kebutuhan akademik 80%.',earned:s.productivity>=75&&needsCoverage(s,true)>=80},
    {id:'promo-proof',name:'Promo Proof',art:'badge-promo',description:'Tidak mengambil pilihan impulsif besar.',earned:!s.history.some(h=>h.tags.includes('impulse-high'))},
    {id:'social-smart',name:'Social Smart',art:'badge-social',description:'Dua pilihan sosial, biaya maksimal 10% budget.',earned:s.history.filter(h=>h.tags.some(t=>t.startsWith('social-'))).length>=2&&social<=s.initialBudget*.1},
    {id:'savora-master',name:'SAVORA Master',art:'badge-master',description:'Raih SAVORA Score minimal 85.',earned:calculateScore(s).score>=85}
  ].sort((a,b)=>Number(b.earned)-Number(a.earned));
}
export function insights(s:GameState){
  const result=calculateScore(s),sorted=[...result.components].sort((a,b)=>b.value-a.value),best=sorted[0],weak=[...result.components].sort((a,b)=>a.value-b.value)[0];
  const experiments:Record<string,string>={liquidity:'Coba sisihkan buffer saldo sebelum mengambil dua pengeluaran keinginan.',savings:'Coba sisihkan 20% di awal, lalu amati ruang untuk kebutuhan harian.',needs:'Coba tuntaskan kebutuhan kos, makan, dan materi sebelum pengeluaran lain.',wellbeing:'Coba beri ruang untuk istirahat dan satu kegiatan sosial yang terjangkau.',productivity:'Coba prioritaskan materi belajar dan pilih shift kerja yang lebih singkat.',discipline:'Coba lewati satu promo dan tetapkan batas biaya sebelum bersosialisasi.'};
  return [{type:'Kekuatanmu',title:best.label,text:`${best.label} menjadi komponen terkuatmu (${Math.round(best.value)}/100). Pertahankan pola yang mendukungnya.`},{type:'Perlu perhatian',title:s.balance<0?'Ruang bernapas untuk saldo':weak.label,text:s.balance<0?`Saldo akhir ${rupiah(s.balance)} membuat skor dibatasi 59. Jaga buffer sebelum belanja berikutnya.`:`${weak.label} adalah ruang perbaikan terbesar (${Math.round(weak.value)}/100). Perhatikan dampak pilihanmu pada sisi ini.`},{type:'Eksperimen berikutnya',title:'Satu perubahan kecil',text:experiments[s.balance<0?'liquidity':weak.id]}];
}
export function validateEvents(){const errors:string[]=[];const ids=new Set<string>();for(const e of events){if(ids.has(e.id))errors.push(`Duplicate event ${e.id}`);ids.add(e.id);if(e.choices.length<2||e.choices.length>3)errors.push(`${e.id}: choice count`);if(new Set(e.choices.map(c=>c.id)).size!==e.choices.length)errors.push(`${e.id}: duplicate choice`);for(const c of e.choices){if(!c.feedback)errors.push(`${e.id}: missing feedback`);if(e.needWeight&&c.needResolution===undefined)errors.push(`${e.id}: missing resolution`);for(const v of [c.cashDelta,c.savingsDelta])if(typeof v==='number'&&!Number.isInteger(v))errors.push(`${e.id}: invalid amount`);for(const v of Object.values(c.stats||{}))if(!Number.isFinite(v)||Math.abs(v)>30)errors.push(`${e.id}: invalid stat`);}}return errors;}
