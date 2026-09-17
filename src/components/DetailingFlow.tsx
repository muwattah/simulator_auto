import type { ReactNode } from 'react';
import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import {
  vehicleCategories,
  tankOptions,
  pressureOptions,
  pressureReelOptions,
  compressorOptions,
  airReelOptions,
  generatorOptions,
  powerReelOptions,
  vacuumOptions,
  liningOptions,
  frameOptions,
  extraOptions,
  STEP_ORDER,
  STEP_LABELS,
  getProduct,
} from '../data/detailingCatalog';
import LoadSpaceViewer from './LoadSpaceViewer';
import QuoteForm from './QuoteForm';
import { formatPriceOrPending } from '../lib/pricing';
import { estimatedWaterWeight } from '../lib/layoutEngine';
import { DEMO_MODE } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Droplets,
  Zap,
  Wind,
  Package,
  List,
  Box,
  LayoutGrid,
} from 'lucide-react';

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-selected={selected}
      data-disabled={disabled || undefined}
      aria-pressed={selected}
      className="option-card"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)] leading-snug">{title}</p>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-snug">{subtitle}</p>}
          {children}
        </div>
        <span
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            selected
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-[var(--border-strong)] text-transparent'
          }`}
          aria-hidden
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </div>
    </button>
  );
}

function ProgressBar() {
  const step = useConfiguratorStore((s) => s.step);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const configuration = useConfiguratorStore((s) => s.configuration);
  const compact = STEP_ORDER.filter((s) => s !== 'cab' || configuration.vehicleCategory !== 'trailer');
  const currentIdx = Math.max(0, compact.indexOf(step as (typeof compact)[number]));
  const total = compact.length;
  const progress = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Stap {currentIdx + 1} van {total}
          </p>
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {STEP_LABELS[step] ?? step}
          </p>
        </div>
        <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-base"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="hidden sm:block overflow-x-auto scrollbar-thin pb-0.5">
        <div className="flex items-center gap-1 min-w-max" role="tablist" aria-label="Configuratiestappen">
          {compact.map((s, i) => {
            const done = i < currentIdx;
            const active = s === step;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStep(s)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-base inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : done
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-muted)]'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : <span className="tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>}
                {STEP_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// CONTINUED IN NEXT UPDATE - partial to avoid payload issues
export default function DetailingFlow() {
  return <div className="p-4">Configurator loading...</div>;
}
