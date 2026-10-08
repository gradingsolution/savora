import {test,expect} from '@playwright/test';
test('balanced first session completes thirteen decisions and opens results',async({page})=>{
  await page.goto('/play');
  await page.getByRole('textbox',{name:'Nama panggilan',exact:true}).fill('Alya');
  await page.getByRole('button',{name:'Lanjut ▶',exact:true}).click();
  await page.getByRole('button',{name:'Lewati tutorial'}).click();
  await page.getByRole('button',{name:'▶ Mulai Hari 1'}).click();
  const choices=['Sisihkan 20%','Bayar penuh sekarang','Belanja bahan mingguan','Paket transport mingguan','Paket belajar hemat','Cari bekas dan versi digital','Pakai ruang kampus','Lewati promo','Ambil peran volunteer','Ambil shift pendek','Periksa ke klinik','Datang dengan batas budget','Pilih perayaan sederhana'];
  for(let i=0;i<choices.length;i++){
    await page.getByRole('button',{name:new RegExp(choices[i])}).click();
    if(i<2)await page.getByRole('button',{name:'Pilih opsi ini',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Pilihanmu, ceritamu.'})).toBeVisible();
    await page.getByRole('button',{name:i===12?'Lihat hasilku':'Lanjut',exact:true}).click();
    if(i===6)await page.getByRole('button',{name:'Lanjut ke paruh kedua'}).click();
  }
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole('heading',{name:'Balanced Planner'})).toBeVisible();
  await expect(page.getByRole('meter')).toHaveCount(6);
  await page.getByRole('button',{name:'Main Lagi',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Nama panggilan',exact:true})).toHaveValue('');
});
test('direct result URL safely returns to setup',async({page})=>{await page.goto('/result');await expect(page).toHaveURL(/\/play$/);await expect(page.getByRole('status')).toContainText('Selesaikan simulasi');});
test('custom budgets require the documented range and increments',async({page})=>{await page.goto('/play');await page.getByRole('radio',{name:/Tentukan sendiri/}).check();await page.getByLabel('Nominal skenario (rupiah)').fill('760000');await page.getByRole('button',{name:'Lanjut ▶'}).click();await expect(page.getByText('Pilih Rp750.000–Rp5.000.000, dengan kelipatan Rp50.000.')).toBeVisible();await expect(page.getByRole('heading',{name:'Kenalan dulu, yuk.'})).toBeVisible();});
test('mobile landing and setup fit a 360px viewport',async({page})=>{await page.setViewportSize({width:360,height:640});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('link',{name:'▶ Mulai Simulasi'}).first().click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
