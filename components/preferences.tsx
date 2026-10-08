'use client';
import { useEffect } from 'react';
import { useGame } from '@/lib/store';
export function Preferences(){const {hydrate,settings}=useGame();useEffect(()=>hydrate(),[hydrate]);useEffect(()=>{document.documentElement.dataset.reduceMotion=String(settings.reduceMotion);},[settings.reduceMotion]);return null;}
