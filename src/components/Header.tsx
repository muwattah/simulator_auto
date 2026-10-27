import { sitePath } from '../seo/routes';
import { ArrowLeft, Settings, Phone } from 'lucide-react';
import { company } from '../config/company';

interface Props {
  onAdminClick: () => void;
  onBackHome?: () => void;
}

export default function Header({ onAdminClick, onBackHome }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {onBackHome && (
            <a href={sitePath('/')} aria-label="Terug naar home"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-white sm:text-sm">
              <ArrowLeft size={18} /><span>Home</span>
            </a>
          )}
          <div className="h-7 w-px shrink-0 bg-[var(--border)]" />
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={import.meta.env.BASE_URL + 'brand/rs-logo-sm.png'}
              alt="RS Car Detailing" width={75} height={38}
              className="h-8 w-auto shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {company.shortName}
              </p>
              <p className="text-sm font-bold leading-tight text-[var(--text-primary)]">Configurator</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a href={'tel:' + company.phoneE164}
            aria-label={'Bel ' + company.phoneDisplay} title={'Bel ' + company.phoneDisplay}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-white">
            <Phone size={18} />
          </a>
          <button type="button" onClick={onAdminClick} title="Beheer" aria-label="Beheer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-white">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
