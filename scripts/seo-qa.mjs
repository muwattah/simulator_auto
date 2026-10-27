import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { routes, NOT_FOUND, BASE_PATH, SITE_URL, seoHead } from '../.ssr-build/entry-server.js';

const dist=resolve('dist');
const indexed=routes.filter(r=>r.indexable);
assert.equal(indexed.length,6);
assert.equal(new Set(routes.map(r=>r.title)).size,routes.length);
assert.equal(new Set(routes.map(r=>r.description)).size,routes.length);
for(const route of [...routes,NOT_FOUND]) {
  const file=resolve(dist,route.path==='/404.html'?'404.html':'.'+route.path+'index.html');
  const html=readFileSync(file,'utf8');
  assert(html.includes(seoHead(route)),`Metadata missing: ${route.path}`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`One h1: ${route.path}`);
  assert(!html.includes('<div id="root"></div>'));
  assert.equal((html.match(/<title>/g)||[]).length,1);
}
const sitemap=readFileSync(resolve(dist,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,indexed.length);
for(const route of indexed)assert(sitemap.includes(SITE_URL+route.path.slice(1)));
assert(!sitemap.includes('/beheer/')&&!sitemap.includes('/overzicht/'));
assert(existsSync(resolve(dist,'images/social-preview.jpg')));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.glb':'model/gltf-binary'};
const server=createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(dist,'.'+pathname.slice(BASE_PATH.length-1));
  let status=200;
  if(!pathname.startsWith(BASE_PATH)||!file.startsWith(dist)) {file=resolve(dist,'404.html');status=404;}
  else if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file)){file=resolve(dist,'404.html');status=404;}
  res.writeHead(status,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
try {
  const nojs=await browser.newContext({javaScriptEnabled:false});
  const page=await nojs.newPage();
  for(const route of indexed){
    assert.equal((await page.goto(origin+BASE_PATH+route.path.slice(1))).status(),200);
    assert.equal(await page.title(),route.title);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),SITE_URL+route.path.slice(1));
    const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    assert(links.some(href=>href.startsWith(BASE_PATH)));
  }
  assert.equal((await page.goto(origin+BASE_PATH+'bestaat-niet/')).status(),404);
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);
  await nojs.close();
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const live=await context.newPage();const errors=[];live.on('pageerror',error=>errors.push(error.message));
  await live.goto(origin+BASE_PATH+'contact/');
  await live.locator('header a[href$="realisaties/"]').first().click();
  await live.waitForURL('**/realisaties/');
  await live.waitForFunction(()=>document.title.includes('realisaties'));
  await live.goBack();await live.waitForURL('**/contact/');
  await live.goto(origin+BASE_PATH+'configurator/extras/');
  await live.waitForFunction(()=>document.title.startsWith('Extra'));
  assert.match(await live.locator('meta[name=robots]').getAttribute('content'),/noindex/);
  assert.equal(await live.locator('link[rel=canonical]').getAttribute('href'),SITE_URL+'configurator/');
  await live.reload();await live.waitForFunction(()=>document.title.startsWith('Extra'));
  await live.setViewportSize({width:390,height:844});
  mkdirSync('.test-build/seo-qa',{recursive:true});
  for(const route of indexed.filter(r=>r.page!=='configurator')){
    await live.goto(origin+BASE_PATH+route.path.slice(1));
    await live.locator('main h1').waitFor();
    assert(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Mobile overflow: ${route.path}`);
  }
  await live.screenshot({path:'.test-build/seo-qa/mobile-contact.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('SEO PASS: 17 HTML pages, 6 sitemap URLs, metadata, no-JS content, deep refresh, navigation, mobile and true 404.');
} finally {await browser.close();server.close();}
