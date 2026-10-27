import { sitePath, CATEGORY_PATHS } from '../seo/routes';
import { company } from '../config/company';

export function ConfiguratorInfo() {
  return <section className="container-content py-14 border-t border-[var(--border)]">
    <h2 className="text-2xl font-bold">Een mobiele detailinginstallatie samenstellen</h2>
    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">Combineer een watertank, hogedrukreiniger, haspels, perslucht, stroomvoorziening en opslag tot een werkplek voor mobiele carwash en detailing. De 3D-weergave toont een Transit Custom-vormbenadering; de werkelijke passing en belading controleren we voor jouw eigen bestelwagen.</p>
    <nav aria-label="Onderdelen in de configurator" className="mt-5 flex flex-wrap gap-4 text-sm text-sky-300">
      {Object.entries(CATEGORY_PATHS).map(([key,path])=><a key={key} href={sitePath(path)}>{({tank:'Watertanks',pressure:'Hogedruk en haspels',compressor:'Perslucht',power:'Generatoren en stroom',vacuum:'Stofzuiging',lining:'Afwerking',frame:'Montageframes',extras:'Opslag en deurrekken'} as Record<string,string>)[key]}</a>)}
    </nav>
    <h2 className="mt-8 text-xl font-bold">Van configuratie naar offerte</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">Bekijk de gekozen apparatuur en montageplekken, geef je voertuiggegevens door en bewaar een samenvatting met afbeelding. Prijzen worden op maat bepaald. Automatische e-mailverzending is nog niet actief; neem rechtstreeks contact op met {company.name} om je aanvraag te bespreken.</p>
    <div className="mt-5 flex flex-wrap gap-5 text-sm text-sky-300"><a href={sitePath('/realisaties/')}>Bekijk echte realisaties</a><a href={sitePath('/hoe-het-werkt/')}>Hoe werkt het?</a><a href={sitePath('/contact/')}>Contact over jouw installatie</a></div>
  </section>;
}
export function NotFoundPage() {
  return <main className="container-content py-24"><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-bold">Deze pagina bestaat niet.</h1><p className="mt-5 text-[var(--text-secondary)]">Ga naar de homepage of stel jouw mobiele detailinginstallatie samen.</p><div className="mt-7 flex gap-4"><a href={sitePath('/')} className="btn-primary">Naar de homepage</a><a href={sitePath('/configurator/')} className="btn-secondary">Open de configurator</a></div></main>;
}
