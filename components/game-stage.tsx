'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Info, Heart, GraduationCap, Wallet, LockKeyhole, AlertTriangle } from 'lucide-react';
import { Art } from './art';
import { Stats } from './stats';
import { Dialog } from './dialog';
import { availableChoices, canChoose, debtFloor, resolveMoney, rupiah } from '@/lib/engine';
import { categoryNames } from '@/lib/events';
import { playTone } from '@/lib/audio';
import type { Choice, GameEvent, GameState } from '@/lib/types';

export function GameStage({ game, event, interactive, reduceMotion, soundEnabled, onChoose }: {
  game: GameState; event: GameEvent; interactive: boolean; reduceMotion: boolean; soundEnabled: boolean; onChoose: (choice: Choice) => void;
}) {
  const [details, setDetails] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [event.id]);
  const choices = availableChoices(game);
  const day = game.queue[game.index].day;
  const history = game.history.at(-1);
  const reacted = history?.eventId === event.id;
  const mood = reacted ? (history.wellbeingDelta < -3 ? 'worried' : 'happy') : game.wellbeing < 35 ? 'tired' : game.balance < 0 ? 'worried' : 'thinking';
  return <div className="play-shell shell immersive-play">
    <div className="game-greeting"><span>Hei, <strong>{game.name}</strong>. Bulan ini adalah ceritamu.</span><span>KEPUTUSAN {game.index + 1} / {game.queue.length}</span></div>
    <Stats game={game}/>
    <div className="game-layout">
      <section className="scene-panel" aria-label={`Adegan ${event.location}`}>
        <div className="scene-location"><MapPin size={13}/>{event.location}<span>{game.index + 1} / 13 keputusan</span></div>
        <div className={`scene-visual ${reacted ? 'scene-reacted' : ''}`} key={event.id}>
          <div className="scene-circle"/>
          <Art name={event.scene} alt={`Suasana ${event.location.toLowerCase()}`} className="scene-background" eager/>
          <Art name={mood} alt="Karakter mahasiswa" className="scene-character" eager/>
          <button className="scene-object" aria-label="Periksa situasi dan dampak pilihan" onClick={() => { setDetails(true); playTone(soundEnabled); }}><Art name={event.illustrationKey}/><span><Info size={12}/> Periksa</span></button>
          <span className="scene-star" aria-hidden="true">✦</span>
          <span className="scene-spark second" aria-hidden="true">✧</span>
          <span className="day-arrival" key={day}>HARI {day}<small>{event.location}</small></span>
          {reacted && <div className="scene-reward" aria-hidden="true">{history.savingsDelta > 0 ? '✦ Tabungan bertambah!' : history.cashDelta > 0 ? '✦ Pemasukan baru!' : '✓ Pilihan tercatat'}</div>}
        </div>
        <div className="scene-quote"><Art name="avatar"/><p>“Satu langkah hari ini,<br/><strong>cerita baru untuk nanti.”</strong></p></div>
        <div className="day-timeline" aria-label="Perjalanan 30 hari">{[1,7,13,20,30].map(d => <div key={d} className={day >= d ? 'reached' : ''}><span/><small>{d === 30 ? 'Selesai' : `Hari ${d}`}</small></div>)}</div>
      </section>
      <motion.section key={event.id} className="event-panel" initial={reduceMotion ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .32 }}>
        <div className="event-category"><span>✦</span>{categoryNames[event.category]}<span className="mobile-day">HARI {day}</span></div>
        <h1 ref={heading} tabIndex={-1}>{event.title}</h1>
        <p className="event-body">{event.body}</p>
        <div className="choice-label">PILIH LANGKAHMU<button className="choice-detail-toggle" onClick={() => setDetails(true)}><Info size={13}/> Lihat dampak</button></div>
        <div className="choices">{choices.map((choice, i) => {
          const cash = resolveMoney(choice.cashDelta, game.initialBudget), available = canChoose(game, choice);
          return <button key={choice.id} style={{ '--choice-order': i } as React.CSSProperties} className={`choice-card ${!available ? 'choice-disabled' : ''}`} disabled={!interactive || !available} onClick={() => onChoose(choice)} data-testid={`choice-${i}`}>
            <span className="choice-letter">{String.fromCharCode(65+i)}</span>
            <span className="choice-content"><span className="choice-top"><strong>{choice.label}</strong><span className={`choice-money ${cash > 0 ? 'positive' : ''}`}>{cash === 0 ? 'Tanpa biaya' : `${cash > 0 ? '+' : ''}${rupiah(cash)}`}</span></span>
            <span className="choice-helper">{choice.helper}</span><ChoiceEffects choice={choice} budget={game.initialBudget}/>
            {!available ? <span className="choice-warning"><LockKeyhole size={12}/> Melewati batas saldo</span> : game.balance + cash < 0 ? <span className="choice-warning"><AlertTriangle size={12}/> Saldo akan minus</span> : null}</span>
          </button>;
        })}</div>
        <div className="event-note">Satu pilihan. Banyak kemungkinan.</div>
      </motion.section>
    </div>
    {details && <Dialog title="Pertimbangkan langkahmu" onClose={() => setDetails(false)} className="choice-details-dialog"><p className="dialog-copy">{event.body}</p><div className="choice-details-list">{choices.map((c, i) => <article key={c.id}><h3>{String.fromCharCode(65+i)}. {c.label}</h3><p>{c.helper}</p><strong className="detail-price">Saldo {resolveMoney(c.cashDelta, game.initialBudget) > 0 ? '+' : ''}{rupiah(resolveMoney(c.cashDelta, game.initialBudget))}</strong><ChoiceEffects choice={c} budget={game.initialBudget}/>{!canChoose(game,c) && <p className="negative">Melewati batas saldo {rupiah(debtFloor(game))}.</p>}</article>)}</div><button className="button full-width" onClick={() => setDetails(false)}>Kembali memilih</button></Dialog>}
  </div>;
}

function ChoiceEffects({ choice, budget }: { choice: Choice; budget: number }) {
  const savings = resolveMoney(choice.savingsDelta, budget);
  return <span className="choice-effects">{savings !== 0 && <span><Wallet size={12}/> Tabungan {savings > 0 ? '+' : ''}{rupiah(savings)}</span>}{!!choice.stats?.wellbeing && <span><Heart size={12}/> Wellbeing {choice.stats.wellbeing > 0 ? '+' : ''}{choice.stats.wellbeing}</span>}{!!choice.stats?.productivity && <span><GraduationCap size={12}/> Productivity {choice.stats.productivity > 0 ? '+' : ''}{choice.stats.productivity}</span>}</span>;
}
