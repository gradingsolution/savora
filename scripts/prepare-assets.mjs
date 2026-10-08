import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/prepare-assets.mjs <source-directory>');
  process.exit(1);
}
const output = path.resolve('public/assets');
await mkdir(output, { recursive: true });
// Remove only disconnected fragments touching a crop edge (neighbouring sprites).
async function cleanCrop(filename, rectangle, name) {
  const {data,info}=await sharp(filename).extract(rectangle).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {width,height,channels}=info,visited=new Uint8Array(width*height),regions=[];
  for(let start=0;start<width*height;start++){
    if(visited[start]||data[start*channels+3]<24)continue;
    const points=[start];visited[start]=1;let edge=false;
    for(let cursor=0;cursor<points.length;cursor++){
      const p=points[cursor],x=p%width,y=Math.floor(p/width);
      if(x===0||y===0||x===width-1||y===height-1)edge=true;
      for(const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1])if(n>=0&&!visited[n]&&data[n*channels+3]>=24){visited[n]=1;points.push(n);}
    }
    regions.push({points,edge});
  }
  const largest=regions.reduce((max,r)=>Math.max(max,r.points.length),0);
  for(const region of regions)if(region.edge&&region.points.length<largest*.2)for(const p of region.points){const x=p%width,y=Math.floor(p/width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<width&&ny>=0&&ny<height)data[(ny*width+nx)*channels+3]=0;}}
  // These two cells have irregular neighbours; exclude their empty corner margins.
  if(name==='happy'||name==='thinking')for(let y=0;y<height;y++)for(let x=0;x<width;x++)if((name==='happy'&&x>width*.84&&y>height*.76)||(name==='thinking'&&x<width*.115&&y<height*.76))data[(y*width+x)*channels+3]=0;
  return sharp(data,{raw:{width,height,channels}});
}
// Rectangles describe individual sprites in the supplied sheets; originals remain untouched.
const cuts = {
  1: { mascot: [15,15,225,610], happy: [240,30,280,580], thinking: [510,25,220,590], worried: [730,30,250,595], tired: [960,85,245,540], avatar: [950,685,240,315] },
  2: { barista: [320,10,275,575], doctor: [875,590,300,475] },
  3: { room: [5,35,440,510], study: [440,65,310,455], classroom: [750,45,335,485], library: [1090,55,350,480], canteen: [8,575,382,485], market: [395,580,350,480], cafe: [750,570,335,480], bus: [1090,550,350,500] },
  4: { wallet: [25,55,340,300], savings: [5,340,330,350], money: [830,60,380,365] },
  5: { laptop: [195,130,430,310], food: [185,465,335,260], laundry: [350,710,385,345] },
  6: { books: [582,812,320,250], graduate: [1005,65,430,245] },
  7: { umbrella: [1080,405,370,345], medicine: [10,750,225,290] },
  8: { friends: [0,48,313,335], shopping: [313,15,303,358], sale: [615,28,285,355], work: [1193,30,255,355], homework: [0,380,313,335], lowdata: [315,385,287,322], sick: [510,760,220,295], family: [727,770,278,282] },
  9: { walletIcon: [15,12,298,320], savingsIcon: [320,12,274,307], heartIcon: [600,30,253,285], productivityIcon: [860,13,270,319], trophyIcon: [410,340,205,210] },
  10: { 'badge-safety': [0,0,352,365], 'badge-balance': [360,0,369,360], 'badge-wealth': [735,0,365,365], 'badge-debt': [1110,0,335,365], 'badge-promo': [0,363,354,339], 'badge-study': [364,359,365,341], 'badge-social': [727,364,373,339], 'badge-needs': [1102,358,342,350], 'badge-survival': [361,700,372,365], 'badge-broke': [733,700,367,365], 'badge-master': [1100,698,345,367] }
};
for (const [sheet, sprites] of Object.entries(cuts)) {
  const filename = path.join(source, `Asset Savora ${sheet}.png`);
  const meta = await sharp(filename).metadata();
  console.log(`Sheet ${sheet}: ${meta.width} x ${meta.height}, alpha=${meta.hasAlpha}`);
  for (const [name, [x,y,w,h]] of Object.entries(sprites)) {
    const left = Math.round(x / 1450 * meta.width), top = Math.round(y / 1070 * meta.height);
    const width = Math.min(meta.width-left, Math.round(w/1450*meta.width));
    const height = Math.min(meta.height-top, Math.round(h/1070*meta.height));
    const crop=await cleanCrop(filename,{left,top,width,height},name);
    await crop.resize({width: name.includes('Icon') ? 96 : 700, withoutEnlargement:true}).webp({quality:88}).toFile(path.join(output, `${name}.webp`));
  }
}
await sharp(path.join(source,'Logo SAVORA.png')).trim().webp({quality:95}).toFile(path.join(output,'logo.webp'));
console.log('SAVORA sprites prepared.');
