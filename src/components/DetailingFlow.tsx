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
} from 'lucide-react';
import type { ConfigStep } from '../types';

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card p-4 text-left transition-all w-full ${
        selected ? 'border-brand-500 ring-2 ring-brand-200 shadow-md' : 'hover:border-brand-300'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-industrial-900">{title}</p>
          {subtitle && <p className="text-sm text-industrial-500 mt-0.5">{subtitle}</p>}
          {children}
        </div>
        {selected && (
          <span className="bg-brand-600 text-white rounded-full p-0.5 shrink-0">
            <Check size={14} />
          </span>
        )}
      </div>
    </button>
  );
}

function ProgressBar() {
  const step = useConfiguratorStore((s) => s.step);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const configuration = useConfiguratorStore((s) => s.configuration);

  const compact = STEP_ORDER.filter((s) => s !== 'cab' || configuration.vehicleCategory !== 'trailer');

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-1 min-w-max">
        {compact.map((s, i) => {
          const idx = STEP_ORDER.indexOf(s);
          const currentIdx = STEP_ORDER.indexOf(step);
          const done = idx < currentIdx;
          const active = s === step;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`text-[10px] sm:text-xs px-2 py-1 rounded-full border transition-colors ${
                active
                  ? 'bg-brand-600 text-white border-brand-600'
                  : done
                    ? 'bg-brand-50 text-brand-800 border-brand-200'
                    : 'bg-white text-industrial-500 border-industrial-200'
              }`}
            >
              {STEP_LABELS[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Checklist() {
  const c = useConfiguratorStore((s) => s.configuration);
  const items: { label: string; ok: boolean }[] = [
    { label: 'VOERTUIG', ok: !!c.vehicleCategory },
    { label: 'CABINE', ok: c.vehicleCategory === 'trailer' || !!c.cabType },
    { label: 'WATER', ok: c.tankId !== undefined && (c.tankId === null || c.floatValve !== null || !c.tankId) },
    { label: 'HOGEDRUK', ok: true },
    { label: 'LUCHT', ok: true },
    { label: 'STROOM', ok: true },
    { label: 'STOFZUIGING', ok: true },
    { label: 'FRAME', ok: !!c.frameComboId },
    { label: "EXTRA'S", ok: true },
  ];
  // Simplify: mark based on whether user has made explicit choices where required
  items[2].ok = c.vehicleCategory ? true : false;

  return (
    <div className="flex flex-wrap gap-1.5 text-[10px]">
      {items.map((it) => (
        <span
          key={it.label}
          className={`px-1.5 py-0.5 rounded border ${
            it.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-industrial-50 text-industrial-500 border-industrial-200'
          }`}
        >
          {it.label} {it.ok ? '✓' : '—'}
        </span>
      ))}
    </div>
  );
}

function ConfigSummary() {
  const c = useConfiguratorStore((s) => s.configuration);
  const pricing = useConfiguratorStore((s) => s.getPricing());
  const removeProductById = useConfiguratorStore((s) => s.removeProductById);
  const water = estimatedWaterWeight(c);

  const rows: { label: string; value: string; id?: string }[] = [];
  if (c.tankId) {
    const p = getProduct(c.tankId);
    rows.push({
      label: 'Watertank',
      value: `${p?.name ?? ''}${c.floatValve ? ' · met vlotter' : c.floatValve === false ? ' · zonder vlotter' : ''}`,
      id: c.tankId,
    });
  }
  if (c.pressureWasherId === 'pressure_both') {
    rows.push({ label: 'Hogedruk', value: 'Elektrisch + benzine' });
  } else if (c.pressureWasherId) {
    rows.push({ label: 'Hogedruk', value: getProduct(c.pressureWasherId)?.name ?? '', id: c.pressureWasherId });
  }
  if (c.pressureReelId)
    rows.push({ label: 'HD-haspel', value: getProduct(c.pressureReelId)?.name ?? '', id: c.pressureReelId });
  if (c.compressorId)
    rows.push({ label: 'Compressor', value: getProduct(c.compressorId)?.name ?? '', id: c.compressorId });
  if (c.airReelId)
    rows.push({ label: 'Persluchthaspel', value: getProduct(c.airReelId)?.name ?? '', id: c.airReelId });
  if (c.generatorId)
    rows.push({ label: 'Generator', value: getProduct(c.generatorId)?.name ?? '', id: c.generatorId });
  if (c.powerReelId)
    rows.push({ label: 'Stroomhaspel', value: getProduct(c.powerReelId)?.name ?? '', id: c.powerReelId });
  if (c.vacuumId)
    rows.push({ label: 'Stofzuiger', value: getProduct(c.vacuumId)?.name ?? '', id: c.vacuumId });
  if (c.liningId && c.liningId !== 'lining_none')
    rows.push({ label: 'Bekleding', value: getProduct(c.liningId)?.name ?? '', id: c.liningId });
  if (c.frameComboId)
    rows.push({ label: 'Frame', value: getProduct(c.frameComboId)?.name ?? '', id: c.frameComboId });
  if (c.bottleHolder) rows.push({ label: 'Bottle holder', value: 'Ja', id: 'bottle_holder' });
  if (c.bucketHolder) rows.push({ label: 'Bucket holder', value: 'Ja', id: 'bucket_holder' });
  for (const e of c.extraIds) {
    rows.push({ label: 'Extra', value: getProduct(e)?.name ?? e, id: e });
  }
  if (c.installationType)
    rows.push({
      label: 'Installatie',
      value: c.installationType === 'installed' ? 'Door ons geïnstalleerd' : 'Ophaalpakket',
    });

  return (
    <div className="card p-4 sticky top-24">
      <h3 className="font-bold text-industrial-900 mb-3 flex items-center gap-2">
        <Package size={18} /> Jouw detailing unit
      </h3>
      <Checklist />
      {rows.length === 0 ? (
        <p className="text-sm text-industrial-500 py-6 text-center">Nog geen onderdelen geselecteerd.</p>
      ) : (
        <ul className="mt-3 space-y-2 max-h-64 overflow-y-auto text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between gap-2 border-b border-industrial-50 pb-1.5">
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-industrial-400">{r.label}</p>
                <p className="text-industrial-800 truncate">{r.value}</p>
              </div>
              {r.id && (
                <button
                  type="button"
                  className="text-xs text-red-500 shrink-0"
                  onClick={() => removeProductById(r.id!)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {water > 0 && (
        <p className="text-xs text-industrial-500 mt-3">
          Geschat watergewicht: ±{water} kg
          <span className="block text-[10px] mt-0.5">
            Alleen watergewicht — geen voertuigpayload-validatie.
          </span>
        </p>
      )}
      <div className="border-t border-industrial-100 mt-3 pt-3 text-sm">
        {pricing.hasPending ? (
          <>
            <p className="text-industrial-600">
              Bekend subtotaal:{' '}
              <span className="font-semibold">{pricing.knownSubtotal > 0 ? formatPriceOrPending(pricing.knownSubtotal) : '—'}</span>
            </p>
            <p className="text-amber-700 text-xs mt-1">
              + {pricing.pendingCount} onderdeel{pricing.pendingCount !== 1 ? 'en' : ''} prijs op aanvraag
            </p>
          </>
        ) : (
          <p className="font-bold text-brand-700">{formatPriceOrPending(pricing.knownSubtotal)}</p>
        )}
      </div>
    </div>
  );
}

function StepContent() {
  const step = useConfiguratorStore((s) => s.step);
  const c = useConfiguratorStore((s) => s.configuration);
  const {
    setVehicleCategory,
    setCabType,
    setTank,
    setFloatValve,
    setPressureWasher,
    setPressureReel,
    setCompressor,
    setAirReel,
    setGenerator,
    setPowerReel,
    setVacuum,
    setLining,
    setFrameCombo,
    toggleExtra,
    setBottleHolder,
    setBucketHolder,
    setInstallationType,
    setSpecialRequests,
  } = useConfiguratorStore();

  if (step === 'vehicle') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-industrial-900 flex items-center gap-2">
          <Truck size={20} /> Welk type voertuig wil je inrichten?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {vehicleCategories.map((v) => (
            <OptionCard
              key={v.id}
              selected={c.vehicleCategory === v.id}
              onClick={() => setVehicleCategory(v.id)}
              title={v.name}
              subtitle={v.description}
            >
              <p className="text-xs text-industrial-400 mt-2">{v.examples.slice(0, 3).join(' · ')}</p>
            </OptionCard>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'cab') {
    if (c.vehicleCategory === 'trailer') {
      return (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Cabine</h2>
          <p className="text-sm text-industrial-600">Niet van toepassing op aanhangwagen.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-industrial-900">Welke cabine heeft het voertuig?</h2>
        <p className="text-sm text-industrial-500">Dubbele cabine = minder laadlengte in de 3D-simulatie (demo-afmetingen).</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <OptionCard selected={c.cabType === 'single'} onClick={() => setCabType('single')} title="Enkele cabine" subtitle="Maximale laadlengte" />
          <OptionCard selected={c.cabType === 'double'} onClick={() => setCabType('double')} title="Dubbele cabine" subtitle="Kortere laadruimte" />
        </div>
      </div>
    );
  }

  if (step === 'tank') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Droplets size={20} /> Welke watertank wil je?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tankOptions.map((o) => (
            <OptionCard
              key={String(o.id)}
              selected={c.tankId === o.id}
              onClick={() => setTank(o.id)}
              title={o.label}
            />
          ))}
        </div>
        {c.tankId && (
          <div>
            <h3 className="font-semibold mb-2">Vlotter</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <OptionCard selected={c.floatValve === true} onClick={() => setFloatValve(true)} title="Met vlotter" />
              <OptionCard selected={c.floatValve === false} onClick={() => setFloatValve(false)} title="Zonder vlotter" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'pressure') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Hogedrukoplossing</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {pressureOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.pressureWasherId === o.id} onClick={() => setPressureWasher(o.id)} title={o.label} />
          ))}
        </div>
        <h3 className="font-semibold">Hogedrukhaspel — 200 bar</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {pressureReelOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.pressureReelId === o.id} onClick={() => setPressureReel(o.id)} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'compressor') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wind size={20} /> Compressor
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {compressorOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.compressorId === o.id} onClick={() => setCompressor(o.id)} title={o.label} />
          ))}
        </div>
        {c.compressorId && (
          <>
            <h3 className="font-semibold">Persluchthaspel — 20 bar</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {airReelOptions.map((o) => (
                <OptionCard key={String(o.id)} selected={c.airReelId === o.id} onClick={() => setAirReel(o.id)} title={o.label} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (step === 'power') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap size={20} /> Generator
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {generatorOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.generatorId === o.id} onClick={() => setGenerator(o.id)} title={o.label} />
          ))}
        </div>
        <h3 className="font-semibold">Stroomhaspel</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {powerReelOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.powerReelId === o.id} onClick={() => setPowerReel(o.id)} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'vacuum') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Stofzuiger</h2>
        <div className="grid sm:grid-cols-1 gap-2">
          {vacuumOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.vacuumId === o.id} onClick={() => setVacuum(o.id)} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'lining') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Laadruimtebekleding</h2>
        <div className="grid sm:grid-cols-1 gap-2">
          {liningOptions.map((o) => (
            <OptionCard key={o.id} selected={c.liningId === o.id} onClick={() => setLining(o.id)} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'frame') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Frame-opstelling</h2>
        <div className="grid gap-2">
          {frameOptions.map((o) => (
            <OptionCard key={o.id} selected={c.frameComboId === o.id} onClick={() => setFrameCombo(o.id)} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'extras') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Extra's</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <OptionCard selected={c.bottleHolder} onClick={() => setBottleHolder(!c.bottleHolder)} title="Bottle holder set" />
          <OptionCard selected={c.bucketHolder} onClick={() => setBucketHolder(!c.bucketHolder)} title="Bucket holder set" />
        </div>
        <h3 className="font-semibold">Extra apparatuur</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {extraOptions.map((o) => (
            <OptionCard
              key={o.id}
              selected={c.extraIds.includes(o.id)}
              onClick={() => toggleExtra(o.id)}
              title={o.label}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'installation') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Hoe wil je het pakket ontvangen?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <OptionCard
            selected={c.installationType === 'installed'}
            onClick={() => setInstallationType('installed')}
            title="Door ons geïnstalleerd"
            subtitle="Prijs installatie later"
          />
          <OptionCard
            selected={c.installationType === 'pickup'}
            onClick={() => setInstallationType('pickup')}
            title="Ophaalpakket"
            subtitle="Zelf monteren"
          />
        </div>
        <div>
          <label className="font-semibold text-sm block mb-1">Opmerkingen / speciale wensen</label>
          <textarea
            className="w-full border border-industrial-200 rounded-lg p-3 text-sm min-h-[100px]"
            placeholder="Bijvoorbeeld: drie haspels naast elkaar, extra ruimte vrijhouden voor eigen machine..."
            value={c.specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
        </div>
      </div>
    );
  }

  // overview
  const snap = useConfiguratorStore.getState().buildSnapshot();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Overzicht configuratie</h2>
      <div className="card p-4 text-sm space-y-1">
        <p>
          <strong>Voertuig:</strong> {useConfiguratorStore.getState().getVehicleLabel()}
        </p>
        <p>
          <strong>Onderdelen:</strong> {snap.pendingPriceItems.length + (snap.knownSubtotal > 0 ? 1 : 0)} geselecteerd
        </p>
        <p>
          <strong>Watergewicht:</strong> ±{snap.estimatedWaterWeightKg} kg
        </p>
        {snap.layoutWarnings.length > 0 && (
          <div className="text-amber-700 text-xs mt-2">
            {snap.layoutWarnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        )}
        {snap.specialRequests && (
          <p className="mt-2">
            <strong>Wensen:</strong> {snap.specialRequests}
          </p>
        )}
      </div>
      <p className="text-xs text-industrial-500">
        Prijzen worden later aangevuld. Deze configuratie kun je opslaan via lokale browser-opslag (snapshot).
      </p>
    </div>
  );
}

export default function DetailingFlow() {
  const step = useConfiguratorStore((s) => s.step);
  const nextStep = useConfiguratorStore((s) => s.nextStep);
  const prevStep = useConfiguratorStore((s) => s.prevStep);
  const configuration = useConfiguratorStore((s) => s.configuration);

  const canNext = (() => {
    if (step === 'vehicle') return !!configuration.vehicleCategory;
    if (step === 'cab') return configuration.vehicleCategory === 'trailer' || !!configuration.cabType;
    return true;
  })();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 pb-28 lg:pb-6">
      {DEMO_MODE && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <strong>Demoversie</strong> — productgegevens en prijzen worden nog aangevuld. Geen bindende offerte.
        </div>
      )}

      <div className="mb-4">
        <ProgressBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          <div className="card p-4 sm:p-5">
            <StepContent />
            <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-industrial-100">
              <button type="button" onClick={prevStep} className="btn-secondary py-2 px-3 text-sm inline-flex items-center gap-1" disabled={step === 'vehicle'}>
                <ChevronLeft size={16} /> Terug
              </button>
              {step !== 'overview' && (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canNext}
                  className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-1 disabled:opacity-50"
                >
                  Volgende <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <LoadSpaceViewer />
        </div>

        <div className="lg:col-span-3 order-3">
          <ConfigSummary />
        </div>
      </div>
    </div>
  );
}
