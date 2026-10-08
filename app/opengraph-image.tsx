import {ImageResponse} from 'next/og';
export const alt='SAVORA — Simulasi Finansial Mahasiswa';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function OpenGraph(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:85,background:'#f1f5fe',color:'#142d53',fontFamily:'sans-serif'}}><div style={{display:'flex',fontSize:34,fontWeight:800,color:'#1755ce',letterSpacing:5}}>SAVORA</div><div style={{display:'flex',fontSize:78,fontWeight:800,lineHeight:1.1,marginTop:35,maxWidth:980}}>Bisa bertahan sampai akhir bulan?</div><div style={{display:'flex',fontSize:28,marginTop:32,color:'#617694'}}>30 hari. 13 keputusan. Temukan gaya mengelola uangmu.</div><div style={{display:'flex',fontSize:21,marginTop:40,color:'#1755ce'}}>SIMULASI FINANSIAL MAHASISWA · TANPA LOGIN</div></div>,size);}
