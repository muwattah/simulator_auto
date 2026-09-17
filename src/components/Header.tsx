import { ArrowLeft, Settings, Phone } from 'lucide-react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { company } from '../config/company';

interface Props {
  onAdminClick: () => void;
  onBackHome?: () => void;
}

export default function Header({ onAdminClick, onBackHome }: Props) {
  const pricing = useConfiguratorStore((s) => s.getPricing());
  const vehicleLabel = useConfiguratorStore((s) => s.getVehicleLabel());
  const hasVehicle = useConfiguratorStore((s) => s.configuration.vehicleCategory);
  const itemCount = pricing.items.length;
  const priceLabel =
    itemCount === 0 ? 'Nog geen selectie' : pricing.hasPending ? `${pricing.pendingCount}× op aanvraag` : 'Volledig bekend';

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBackHome && (
            <button type="button" onClick={onBackHome} className="btn-ghost btn-sm shrink-0 -ml-1" aria-label="Terug naar home">
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={`${import.meta.env.BASE_URL}brand/rs-logo-sm.png`}
              alt="RS Car Cleaning — Tools And Supplies"
              className="h-8 w-auto object-contain shrink-0"
              width={80}
              height={40}
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--text-muted)] leading-none">{company.shortName.toUpperCase()}</p>
              <p className="text-sm font-bold text-[var(--text-primary)] truncate leading-tight">Configurator</p>
            </div>
          </div>
        </div>
        {hasVehicle && (
          <div className="hidden md:flex items-center gap-5 text-right">
            <div>
              <p className="label-meta">Voertuig</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{vehicleLabel}</p>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div>
              <p className="label-meta">Prijsstatus</p>
              <p className="text-sm font-semibold text-[var(--accent)]">{priceLabel}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <a
            href={`tel:${company.phoneE164}`}
            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] rounded-btn transition-colors hidden sm:inline-flex"
            title={`Bel ${company.phoneDisplay}`}
            aria-label={`Bel ${company.phoneDisplay}`}
          >
            <Phone size={18} />
          </a>
          <button type="button" onClick={onAdminClick} className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] rounded-btn transition-colors" title="Admin" aria-label="Admin panel">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
