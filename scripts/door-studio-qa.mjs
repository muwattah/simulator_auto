import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base=process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/?qa=1';
const out=resolve(process.argv[2] ?? '.test-build/door-qa');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[];
try {
  for(const mobile of [false,true]) {
    const device=mobile?'mobile':'desktop';
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1600,height:1000},isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    await page.evaluate(async()=>{
      const {demoConfiguration}=await import(new URL('src/data/demoConfiguration.ts',location.href).href);
      localStorage.setItem('detailing-configurator-v1',JSON.stringify({version:2,state:{configuration:{...demoConfiguration,extraIds:['door_spray_rack','door_brush_rack','door_gun_holder']},step:'extras',quotes:[],visitedSteps:[]}}));
    });
    await page.reload();await page.getByRole('button',{name:'Start configureren'}).first().click();
    await page.waitForFunction(()=>Object.keys(window.__rsDoorMounts??{}).length===3,{timeout:40000});
    await page.waitForTimeout(1700);
    await page.getByRole('button',{name:'Achter',exact:true}).click();await page.waitForTimeout(300);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:resolve(out,device+'-rear-racks.png'),fullPage:false});
    const open=await page.evaluate(()=>window.__rsDoorMounts);
    await page.getByRole('button',{name:'Weergave-instellingen',exact:true}).click();
    await page.getByRole('button',{name:'Deuren sluiten',exact:true}).click();await page.waitForTimeout(1700);
    const closed=await page.evaluate(()=>window.__rsDoorMounts);
    assert.notDeepEqual(open.door_spray_rack,closed.door_spray_rack,'equipment physically follows the door hinge');
    const expected=await page.evaluate(async()=>{
      const c=JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.configuration;
      const {computeLayout}=await import(new URL('src/lib/layoutEngine.ts',location.href).href);
      return Object.fromEntries(computeLayout(c).placements.filter(i=>i.productId.startsWith('door_')).map(i=>[i.productId,i.position]));
    });
    for(const [id,pos] of Object.entries(expected)) pos.forEach((v,a)=>assert(Math.abs(v-closed[id][a])<.01,'closed door pose '+id));
    await page.getByRole('button',{name:'Deuren openen',exact:true}).click();
    await page.getByRole('button',{name:"Extra's",exact:true}).click();
    await page.getByRole('combobox',{name:'Plaatsing Deurrek voor borstels en aerosols'}).selectOption('rightSideAccess');
    await page.waitForTimeout(1700);
    const sideOpen=await page.evaluate(()=>window.__rsDoorMounts.door_brush_rack);
    const sliderOpen=await page.evaluate(()=>window.__rsSlidingDoor);
    await page.getByRole('button',{name:'Zijdeur sluiten',exact:true}).click();await page.waitForTimeout(1700);
    const sideClosed=await page.evaluate(()=>window.__rsDoorMounts.door_brush_rack);
    assert.deepEqual(sideOpen,sideClosed,'fixed side-access rack never rides through the body');
    const sliderClosed=await page.evaluate(()=>window.__rsSlidingDoor);
    assert(Math.abs(sliderOpen[0]-sliderClosed[0]+.22)<.01);
    assert(Math.abs(sliderOpen[2]-sliderClosed[2]+1.08)<.01);
    await page.getByRole('button',{name:'Zijdeur openen',exact:true}).click();await page.waitForTimeout(1500);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:resolve(out,device+'-side-rack.png'),fullPage:false});
    await page.getByRole('button',{name:'Voorkant',exact:true}).click();await page.waitForTimeout(300);
    await page.screenshot({path:resolve(out,device+'-front.png'),fullPage:false});
    const full=await page.evaluate(async()=>{
      const c=JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.configuration;
      const {summaryImage}=await import(new URL('src/services/renderSetupImage.tsx',location.href).href);
      return summaryImage(c,'RS-DEURMONTAGE-DEMO','Transit Custom L1H1');
    });
    assert(full?.startsWith('data:image/jpeg;base64,'));writeFileSync(resolve(out,device+'-setup.jpg'),Buffer.from(full.split(',')[1],'base64'));
    const brushCard=page.locator('article').filter({has:page.getByRole('heading',{name:'Deurrek voor borstels en aerosols',exact:true})});
    await brushCard.getByRole('button',{name:'Verwijderen',exact:true}).click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>Boolean(window.__rsDoorMounts.door_brush_rack)),false);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    assert.deepEqual(errors,[]);
    results.push({device,doorMeshes:3,rearHinge:'passed',slidingTranslation:'passed',remove:'passed',image:'passed',errors});
    await context.close();console.log(device+': rear hinge, sliding door, mount selection, removal and setup render passed');
  }
  writeFileSync(resolve(out,'results.json'),JSON.stringify(results,null,2));
} finally {await browser.close();}
