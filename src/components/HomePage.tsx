import { useEffect, useState } from 'react';
import {
  ArrowRight, Box, Check, Droplets, Gauge, Layers, Package, Truck, Wind, Zap, Menu, X,
} from 'lucide-react';

interface Props { onStart: () => void; }

const SYSTEMS = [
  { id: 'water', icon: Droplets, title: 'Water', desc: '210–1000 L tanks', meta: 'Vlotter optioneel' },
  { id: 'pressure', icon: Gauge, title: 'Hogedruk', desc: 'Elektrisch / benzine', meta: 'Haspel 10–25 m' },
  { id: 'air', icon: Wind, title: 'Perslucht', desc: 'Compressor + haspel', meta: '3+3 tot 24 L' },
  { id: 'power', icon: Zap, title: 'Stroom', desc: 'Generator + haspel', meta: '3000–8000 W' },
  { id: 'vacuum', icon: Box, title: 'Stofzuiging', desc: 'Met of zonder haspel', meta: 'Handhaspel 18 m' },
  { id: 'storage', icon: Package, title: 'Opslag', desc: 'Frames, rekken, houders', meta: 'Modulair' },
];
const STEPS = [
  { n: '01', title: 'Kies je voertuig', text: 'Compact, medium, groot of aanhanger.' },
  { n: '02', title: 'Stel je installatie samen', text: 'Tank, haspels, machines en opslag.' },
  { n: '03', title: 'Bekijk alles direct in 3D', text: 'Zie plaatsing en ruimte in realtime.' },
  { n: '04', title: 'Vraag je offerte aan', text: 'Configuratie + wensen naar de installateur.' },
];
const VEHICLES = [
  { id: 'compact', label: 'Compact', example: 'Caddy / Berlingo-formaat' },
  { id: 'medium', label: 'Medium', example: 'Vito / Transporter-formaat' },
  { id: 'large', label: 'Large', example: 'Sprinter / Crafter-formaat' },
  { id: 'trailer', label: 'Trailer', example: 'Mobiele aanhangwagenopstelling' },
];
const COMPONENTS = [
  { title: 'Watertank', meta: '210–1000 L' },
  { title: 'Hogedruk', meta: 'Elektrisch / benzine' },
  { title: 'Haspels', meta: 'Hogedruk · lucht · stroom · stof' },
  { title: 'Compressor', meta: 'Compacte persluchtsystemen' },
  { title: 'Power', meta: 'Generatoren' },
  { title: 'Frame', meta: 'Modulaire montageconstructie' },
  { title: 'Opslag', meta: 'Rekken · bottle · bucket holders' },
];

function HeroInstallPreview({ dense }: { dense?: boolean }) {
  return (
    <div className={`relative w-full max-w-md mx-auto ${dense ? 'scale-90' : ''}`} aria-hidden>
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 340, aspectRatio: '5/3.2' }}>
        <div className="absolute bottom-[18%] left-[8%] right-[8%] h-[3px] rounded-full bg-[var(--border-strong)]/80" />
        <div className="absolute inset-[12%_10%_22%_10%] border-2 border-[var(--border-strong)] rounded-sm bg-[var(--surface)]/40" />
        <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 rounded-md border border-sky-800/60" style={{ width: '28%', height: '22%', background: 'linear-gradient(180deg,#1e3a5f,#152a45)' }} />
        <div className="absolute top-[22%] left-[18%] right-[18%] h-[2px] bg-[var(--text-muted)]/50" />
        <div className="absolute top-[22%] bottom-[28%] left-[18%] w-[2px] bg-[var(--text-muted)]/40" />
        <div className="absolute top-[22%] bottom-[28%] right-[18%] w-[2px] bg-[var(--text-muted)]/40" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute top-[28%] w-[14%] aspect-square rounded-full border-2 border-[var(--text-muted)]/70 bg-[var(--surface-elevated)]" style={{ left: `${22 + i * 22}%` }}>
            <div className="absolute inset-[22%] rounded-full border border-[var(--text-muted)]/40" />
          </div>
        ))}
        <div className="absolute bottom-[28%] left-[16%] w-[12%] h-[14%] rounded-sm bg-[var(--surface-muted)] border border-[var(--border)]" />
        <div className="absolute bottom-[28%] right-[16%] w-[14%] h-[16%] rounded-sm bg-[var(--surface-muted)] border border-[var(--border)]" />
        <div className="absolute top-[18%] bottom-[22%] left-[2%] w-[6%] border border-[var(--border-strong)]/60 bg-[var(--surface)]/30 origin-right -skew-y-6" />
        <div className="absolute top-[18%] bottom-[22%] right-[2%] w-[6%] border border-[var(--border-strong)]/60 bg-[var(--surface)]/30 origin-left skew-y-6" />
      </div>
    </div>
  );
}

export default function HomePage({ onStart }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-base border-b border-transparent ${scrolled || menuOpen ? 'header-scrolled' : 'bg-transparent'}`}>
        <div className="container-content flex items-center justify-between h-16 md:h-[4.25rem]">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left group">
            <span className="block text-[11px] font-semibold tracking-[0.16em] text-[var(--text-muted)]">MOBILE DETAILING</span>
            <span className="block text-sm font-bold tracking-wide text-[var(--text-primary)] -mt-0.5">CONFIGURATOR</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <button type="button" onClick={() => scrollTo('hoe-het-werkt')} className="hover:text-[var(--text-primary)] transition-colors">Hoe het werkt</button>
            <button type="button" onClick={() => scrollTo('mogelijkheden')} className="hover:text-[var(--text-primary)] transition-colors">Mogelijkheden</button>
            <button type="button" onClick={() => scrollTo('showcase')} className="hover:text-[var(--text-primary)] transition-colors">3D Configurator</button>
            <button type="button" onClick={onStart} className="hover:text-[var(--text-primary)] transition-colors">Configurator</button>
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onStart} className="btn-primary btn-sm hidden sm:inline-flex">Start configuratie <ArrowRight size={16} /></button>
            <button type="button" className="md:hidden p-2.5 rounded-btn text-[var(--text-secondary)] hover:bg-[var(--surface)]" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]">
            <div className="container-content py-4 flex flex-col gap-1">
              {[{ label: 'Hoe het werkt', id: 'hoe-het-werkt' }, { label: 'Mogelijkheden', id: 'mogelijkheden' }, { label: '3D Configurator', id: 'showcase' }].map((item) => (
                <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className="text-left py-3 px-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">{item.label}</button>
              ))}
              <button type="button" onClick={onStart} className="btn-primary mt-2 w-full">Start configuratie <ArrowRight size={16} /></button>
            </div>
          </div>
        )}
      </header>

      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_40%,rgba(14,165,233,0.07),transparent_55%)]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>
        <div className="container-content relative grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-7">
            <p className="eyebrow">Mobile detailing systems</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08]">Bouw jouw mobiele<br className="hidden sm:block" /> detailing unit.</h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Stel stap voor stap jouw mobiele werkplek samen. Kies je watertank, haspels, compressor, stroomvoorziening en inrichting en bekijk je configuratie direct in 3D.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={onStart} className="btn-primary btn-lg">Start met configureren <ArrowRight size={18} /></button>
              <button type="button" onClick={() => scrollTo('hoe-het-werkt')} className="btn-secondary btn-lg">Bekijk hoe het werkt</button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-[var(--text-muted)]">
              {['3D configuratie', 'Modulaire inrichting', 'Direct overzicht'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-[var(--accent)]" />{t}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="viewer-shell aspect-[4/3] md:aspect-[16/11] relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10"><HeroInstallPreview /></div>
              <div className="absolute top-4 left-4 md:top-6 md:left-6 space-y-2 pointer-events-none">
                {['250 L WATER', '25 M HIGH PRESSURE'].map((l) => (
                  <div key={l} className="flex items-center gap-2"><span className="w-6 h-px bg-[var(--accent)]/70" /><span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)]">{l}</span></div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 space-y-2 text-right pointer-events-none">
                {['AIR SYSTEM', 'POWER SYSTEM'].map((l) => (
                  <div key={l} className="flex items-center justify-end gap-2"><span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)]">{l}</span><span className="w-6 h-px bg-[var(--accent)]/70" /></div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-[var(--text-muted)]">Voorbeeldinstallatie · live configureerbaar in de 3D configurator</p>
          </div>
        </div>
      </section>

      <section id="hoe-het-werkt" className="section border-t border-[var(--border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-3">Hoe het werkt</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Van lege laadruimte naar complete mobiele werkplek.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-6 hover:border-[var(--border-strong)] transition-colors">
                <span className="text-3xl font-bold text-[var(--accent)]/80 tabular-nums">{s.n}</span>
                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mogelijkheden" className="section bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-3">Systemen</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Alles wat je nodig hebt. Eén systeem.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              return (
                <button key={sys.id} type="button" onClick={onStart} className="card p-6 text-left group hover:border-[var(--accent)]/40 transition-all duration-slow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform"><Icon size={22} /></div>
                    <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-1" />
                  </div>
                  <h3 className="mt-5 font-semibold text-lg">{sys.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{sys.desc}</p>
                  <p className="mt-3 label-meta">{sys.meta}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section border-t border-[var(--border)]">
        <div className="container-content grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-3">Efficiënte werkplek</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Alles op zijn plaats.<br />Alles binnen handbereik.</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg">
              Een mobiele detailinginstallatie moet efficiënt zijn. Tank, haspels, machines en opslag moeten logisch worden geplaatst zodat de beschikbare laadruimte optimaal gebruikt wordt.
            </p>
            <ul className="space-y-4">
              {['Ruimte efficiënt gebruiken', 'Apparatuur logisch organiseren', 'Configuratie vooraf visualiseren'].map((t, i) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-sm font-bold text-[var(--accent)] tabular-nums mt-0.5">0{i + 1}</span>
                  <span className="text-[var(--text-primary)] font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="viewer-shell aspect-[5/4] flex items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="h-3 rounded bg-[var(--surface-muted)] w-full" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-20 rounded bg-[var(--surface-muted)] border border-[var(--border)]" />
                <div className="h-20 rounded bg-[var(--accent-soft)] border border-[var(--accent-muted)]" />
                <div className="h-20 rounded bg-[var(--surface-muted)] border border-[var(--border)]" />
              </div>
              <div className="h-14 rounded bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center"><Layers size={20} className="text-[var(--text-muted)]" /></div>
              <div className="flex gap-2"><div className="h-10 flex-1 rounded bg-[var(--surface-muted)]" /><div className="h-10 flex-1 rounded bg-[var(--surface-muted)]" /></div>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="section bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-3">3D Configurator</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Zie je installatie voordat ze gebouwd wordt.</h2>
          </div>
          <div className="card-elevated overflow-hidden">
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-3 viewer-shell !rounded-none !border-0 min-h-[280px] lg:min-h-[360px] relative flex items-center justify-center">
                <HeroInstallPreview dense />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide bg-black/40 text-[var(--text-secondary)] border border-white/10">INTERACTIEVE 3D</span>
                  <span className="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide bg-black/40 text-[var(--text-secondary)] border border-white/10">LIVE CONFIGURATIE</span>
                </div>
              </div>
              <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[var(--border)]">
                <ul className="space-y-4 mb-8">
                  {['Interactieve 3D-weergave', 'Componentselectie & verwijderen', 'Ruimtecontrole & waarschuwingen', 'Prijsstatus op aanvraag', 'Volledig configuratieoverzicht'].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"><Check size={16} className="text-[var(--accent)] shrink-0" />{t}</li>
                  ))}
                </ul>
                <button type="button" onClick={onStart} className="btn-primary w-full sm:w-auto">Open de 3D configurator <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-t border-[var(--border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-3">Onderdelen</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Detailinstallatie-componenten</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COMPONENTS.map((c) => (
              <div key={c.title} className="card px-4 py-4">
                <p className="font-semibold text-sm">{c.title}</p>
                <p className="label-meta mt-1">{c.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-3">Voertuigen</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Van compacte bestelwagen tot complete mobiele unit.</h2>
            <p className="mt-3 text-[var(--text-secondary)] text-sm">Categorievoorbeelden — exacte fitment wordt per project beoordeeld.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VEHICLES.map((v) => (
              <button key={v.id} type="button" onClick={onStart} className="card p-5 text-left hover:border-[var(--accent)]/40 transition-all group">
                <Truck size={22} className="text-[var(--accent)] mb-4" />
                <h3 className="font-semibold">{v.label}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{v.example}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">Kies je voertuig <ArrowRight size={12} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-[var(--border)]">
        <div className="container-content max-w-3xl text-center">
          <p className="eyebrow mb-3">Maatwerk</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Geen twee mobiele werkplekken zijn hetzelfde.</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
            De configurator is een sterk uitgangspunt. Speciale wensen — extra opslag, specifieke machinepositie, eigen apparatuur of een andere haspelopstelling — kun je meenemen in je configuratie.
          </p>
          <button type="button" onClick={onStart} className="btn-primary">Bouw je configuratie <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="section border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="container-content text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Klaar om jouw mobiele werkplek samen te stellen?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Start met je voertuig en bouw stap voor stap je installatie.</p>
          <button type="button" onClick={onStart} className="btn-primary btn-lg">Start configuratie <ArrowRight size={18} /></button>
          <p className="mt-6 text-xs text-[var(--text-muted)] max-w-md mx-auto">Geen definitieve prijs? Onderdelen zonder prijs worden duidelijk als &lsquo;prijs op aanvraag&rsquo; weergegeven.</p>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-12 md:py-16">
        <div className="container-content">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="block text-[11px] font-semibold tracking-[0.16em] text-[var(--text-muted)]">MOBILE DETAILING</span>
              <span className="block text-sm font-bold">CONFIGURATOR</span>
              <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">Demoversie van de 3D configurator voor mobiele detailing- en carwashinstallaties.</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] mb-4">PRODUCT</p>
              <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
                <li><button type="button" onClick={onStart} className="hover:text-[var(--text-primary)]">Configurator</button></li>
                <li><button type="button" onClick={() => scrollTo('mogelijkheden')} className="hover:text-[var(--text-primary)]">Mogelijkheden</button></li>
                <li><button type="button" onClick={() => scrollTo('hoe-het-werkt')} className="hover:text-[var(--text-primary)]">Hoe het werkt</button></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] mb-4">INSTALLATIE</p>
              <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]"><li>Water</li><li>Hogedruk</li><li>Lucht & stroom</li><li>Opslag</li></ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] mb-4">INFO</p>
              <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]"><li>Demoversie</li><li>Contact volgt later</li></ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between gap-3 text-xs text-[var(--text-muted)]">
            <p>Mobile Detailing Configurator · © {new Date().getFullYear()}</p>
            <p>Demoversie — prijzen worden aangevuld</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
