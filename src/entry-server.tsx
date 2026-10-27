import { renderToStaticMarkup } from 'react-dom/server';
import HomePage from './components/HomePage';
import { ConfiguratorInfo, NotFoundPage } from './components/RouteContent';
import { routes, NOT_FOUND, sitePath, type SiteRoute } from './seo/routes';
import { seoHead } from './seo/metadata';
export { routes, NOT_FOUND, seoHead };

export function renderRoute(route:SiteRoute) {
  if(route.page==='not-found')return renderToStaticMarkup(<NotFoundPage/>);
  if(route.page==='admin')return renderToStaticMarkup(<main><h1>Lokaal beheer</h1><p>Deze lokale beheeromgeving wordt niet geïndexeerd.</p><a href={sitePath('/')}>Naar de homepage</a></main>);
  if(route.page==='configurator')return renderToStaticMarkup(<main><section className="container-content pt-24 pb-8"><a href={sitePath('/')}>RS Car Detailing · Home</a><h1 className="mt-5 text-3xl font-bold">3D-configurator voor jouw mobiele werkplaats</h1><p className="mt-4">Kies apparatuur voor jouw detailingwerkbus. De interactieve configurator wordt geladen.</p></section><ConfiguratorInfo/></main>);
  return renderToStaticMarkup(<HomePage page={route.page} onStart={()=>{}}/>);
}

export { SITE_URL, BASE_PATH } from './seo/routes';
