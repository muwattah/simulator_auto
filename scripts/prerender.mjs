import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
const {routes,NOT_FOUND,seoHead,renderRoute,SITE_URL}=await import(pathToFileURL(resolve('.ssr-build/entry-server.js')).href);
const template=readFileSync('dist/index.html','utf8');
if(!template.includes('<!--seo:start-->') || !template.includes('<div id="root"></div>'))throw new Error('Static HTML template markers missing');
for(const route of [...routes,NOT_FOUND]) {
  const html=template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/,()=>seoHead(route))
    .replace('<div id="root"></div>',()=>`<div id="root">${renderRoute(route)}</div>`);
  const target=route.page==='not-found' ? resolve('dist/404.html') : resolve('dist',route.path.slice(1),'index.html');
  mkdirSync(dirname(target),{recursive:true});writeFileSync(target,html);
}
const urls=routes.filter(r=>r.indexable).map(r=>new URL(r.path.replace(/^\//,''),SITE_URL).href);
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('dist/robots.txt',`# A project-path robots.txt is not a host-root robots policy. Meta robots handles noindex on this GitHub Pages site.\nUser-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
writeFileSync('dist/.nojekyll','');
writeFileSync('.ssr-build/routes.json',JSON.stringify([...routes,NOT_FOUND],null,2));
console.log(`Prerendered ${routes.length} real route pages + 404; sitemap contains ${urls.length} public URLs.`);
