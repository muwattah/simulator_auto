import { company } from '../config/company';
import { absoluteUrl, SITE_URL, type SiteRoute } from './routes';
const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function canonicalFor(route:SiteRoute) {
  return route.page==='not-found' ? null : absoluteUrl(route.page==='configurator'?'/configurator/':route.path);
}
export function structuredData(route:SiteRoute) {
  const canonical=canonicalFor(route);
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':SITE_URL+'#organization',name:company.name,url:company.website,telephone:company.phoneE164,logo:absoluteUrl('/brand/rs-logo.png'),address:{'@type':'PostalAddress',addressLocality:'Borsbeek',addressCountry:'BE'}},
    {'@type':'WebSite','@id':SITE_URL+'#website',url:SITE_URL,name:'RS Car Detailing Configurator',inLanguage:'nl-BE',publisher:{'@id':SITE_URL+'#organization'}},
    ...(route.indexable && canonical ? [
      {'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:route.title,description:route.description,inLanguage:'nl-BE',isPartOf:{'@id':SITE_URL+'#website'}},
      ...(route.path==='/'?[]:[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:route.label,item:canonical}]}]),
    ] : []),
  ]};
}
export function seoHead(route:SiteRoute) {
  const canonical=canonicalFor(route), image=absoluteUrl('/images/social-preview.jpg');
  return `<title>${escape(route.title)}</title>
<meta name="description" content="${escape(route.description)}">
<meta name="robots" content="${route.indexable?'index,follow,max-image-preview:large':'noindex,follow'}">
${canonical?`<link rel="canonical" href="${escape(canonical)}">`:''}
<meta property="og:type" content="website"><meta property="og:locale" content="nl_BE">
<meta property="og:site_name" content="RS Car Detailing">
<meta property="og:title" content="${escape(route.title)}"><meta property="og:description" content="${escape(route.description)}">
${canonical?`<meta property="og:url" content="${escape(canonical)}">`:''}
<meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="RS Car Detailing mobiele werkbusinrichting">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(route.title)}"><meta name="twitter:description" content="${escape(route.description)}"><meta name="twitter:image" content="${image}">
<script type="application/ld+json" id="site-structured-data">${JSON.stringify(structuredData(route)).replace(/</g,'\\u003c')}</script>`;
}
export function applyMetadata(route:SiteRoute) {
  const fragment=document.createElement('template');fragment.innerHTML=seoHead(route);
  document.head.querySelectorAll('title,meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],#site-structured-data').forEach(node=>node.remove());
  document.head.append(fragment.content);document.documentElement.lang='nl-BE';
}
