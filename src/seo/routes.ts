export const BASE_PATH = '/simulator_auto/';
export const SITE_URL = 'https://muwattah.github.io/simulator_auto/';
export type PublicPage = 'home' | 'how' | 'realisations' | 'possibilities' | 'contact';
export type CategoryKey = 'tank' | 'pressure' | 'compressor' | 'power' | 'vacuum' | 'lining' | 'frame' | 'extras';
export interface SiteRoute {
  path: string; page: PublicPage | 'configurator' | 'admin' | 'not-found';
  label: string; title: string; description: string; indexable: boolean;
  category?: CategoryKey; panel?: 'products' | 'installation' | 'overview';
}
export const CATEGORY_PATHS: Record<CategoryKey,string> = {
  tank:'/configurator/water/',pressure:'/configurator/hogedruk/',compressor:'/configurator/lucht/',power:'/configurator/stroom/',
  vacuum:'/configurator/stofzuiging/',lining:'/configurator/afwerking/',frame:'/configurator/frame/',extras:'/configurator/extras/',
};
export const routes: SiteRoute[] = [
  {path:'/',page:'home',label:'Home',title:'Werkbusinrichting voor detailing | RS Car Detailing',description:'Stel jouw mobiele detailinginstallatie samen. Ontdek watertanks, haspels, machines en opslag op maat bij RS Car Detailing in Borsbeek.',indexable:true},
  {path:'/hoe-het-werkt/',page:'how',label:'Hoe het werkt',title:'Hoe werkt de 3D-configurator? | RS Car Detailing',description:'Van watertank en apparatuur kiezen tot jouw eigen bestelwagen doorgeven. Ontdek de stappen naar een mobiele detailingwerkplaats op maat.',indexable:true},
  {path:'/realisaties/',page:'realisations',label:'Realisaties',title:'Werkbusinrichtingen: onze realisaties | RS Car Detailing',description:'Bekijk echte RS Car Detailing werkbussen en interieurinrichtingen. Inspiratie voor een mobiele carwash met haspels, opslag en reinigingsapparatuur.',indexable:true},
  {path:'/mogelijkheden/',page:'possibilities',label:'Mogelijkheden',title:'Detailingapparatuur voor je werkbus | RS Car Detailing',description:'Ontdek water, hogedruk, perslucht, generatoren, stofzuiging en deurrekken voor jouw werkbus. Configureer een samenstelling en vraag een prijs op maat.',indexable:true},
  {path:'/contact/',page:'contact',label:'Contact',title:'Contact en advies in Borsbeek | RS Car Detailing',description:'Bespreek jouw mobiele detailinginstallatie met RS Car Detailing in Borsbeek. Bel 0492 07 05 98 of neem contact op via WhatsApp over jouw werkbus.',indexable:true},
  {path:'/configurator/',page:'configurator',label:'3D Configurator',title:'3D-werkbusconfigurator | RS Car Detailing',description:'Ontwerp jouw mobiele detailingwerkplaats in 3D. Kies tanks, haspels, machines en deurrekken en bewaar een samenvatting met afbeelding voor je aanvraag.',indexable:true},
  ...Object.entries(CATEGORY_PATHS).map(([category,path]):SiteRoute=>({path,page:'configurator',category:category as CategoryKey,panel:'products',label:({tank:'Water',pressure:'Hogedruk',compressor:'Lucht',power:'Stroom',vacuum:'Stofzuiging',lining:'Afwerking',frame:'Frame',extras:"Extra’s"})[category as CategoryKey],title:`Onderdelen kiezen | RS Car Detailing configurator`,description:'Kies onderdelen voor jouw persoonlijke mobiele detailinginstallatie. Je selectie blijft in deze browser bewaard.',indexable:false})),
  {path:'/configurator/installatie/',page:'configurator',panel:'installation',label:'Installatie',title:'Installatiekeuze | RS Car Detailing configurator',description:'Kies professionele inbouw of een pakket voor eigen montage voor jouw gekozen installatie.',indexable:false},
  {path:'/configurator/overzicht/',page:'configurator',panel:'overview',label:'Configuratieoverzicht',title:'Jouw configuratieoverzicht | RS Car Detailing',description:'Controleer jouw gekozen onderdelen, montageplekken en afbeelding en bereid jouw offerteaanvraag voor.',indexable:false},
  {path:'/beheer/',page:'admin',label:'Beheer',title:'Lokaal beheer | RS Car Detailing',description:'Lokale beheeromgeving van de RS Car Detailing configurator.',indexable:false},
];
for(const route of routes) if(route.category){route.title=`${route.label} kiezen | RS Car Detailing configurator`;route.description=`${route.label} voor jouw mobiele detailingwerkplaats: bekijk de beschikbare onderdelen en pas je persoonlijke 3D-samenstelling aan.`;}
export const NOT_FOUND: SiteRoute={path:'/404.html',page:'not-found',label:'Pagina niet gevonden',title:'Pagina niet gevonden | RS Car Detailing',description:'Deze pagina bestaat niet. Ga naar de homepage of open de 3D-configurator.',indexable:false};
export function sitePath(path='/') { return BASE_PATH + path.replace(/^\/+/, ''); }
export function absoluteUrl(path='/') { return new URL(path.replace(/^\/+/,''),SITE_URL).href; }
export function resolveRoute(pathname: string): SiteRoute {
  let path: string;
  try { path=decodeURI(pathname); } catch { return NOT_FOUND; }
  if(!path.startsWith(BASE_PATH))return NOT_FOUND;
  path='/'+path.slice(BASE_PATH.length);
  if(path.endsWith('/index.html'))path=path.slice(0,-10);
  if(path==='/index.html')path='/';
  if(!path.endsWith('/') && !path.endsWith('.html'))path+='/';
  return routes.find(route=>route.path===path) ?? NOT_FOUND;
}
