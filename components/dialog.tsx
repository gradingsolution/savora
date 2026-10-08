'use client';
import { useEffect,useId,useRef } from 'react';
import { X } from 'lucide-react';
export function Dialog({title,children,onClose,closable=true,className=''}:{title:string;children:React.ReactNode;onClose:()=>void;closable?:boolean;className?:string}){
  const ref=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),id=useId();
  useEffect(()=>{const el=ref.current,previous=document.activeElement as HTMLElement|null;el?.showModal();heading.current?.focus();return()=>{el?.close();previous?.focus();};},[]);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={id} onCancel={e=>{e.preventDefault();if(closable)onClose();}}><div className="dialog-heading"><h2 id={id} ref={heading} tabIndex={-1}>{title}</h2>{closable&&<button className="icon-button" aria-label="Tutup dialog" onClick={onClose}><X size={20}/></button>}</div>{children}</dialog>;
}
