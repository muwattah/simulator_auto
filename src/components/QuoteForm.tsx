import { summaryImage, renderSetupImage } from '../services/renderSetupImage';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Check, Copy, MessageCircle, Phone, AlertCircle, FileText } from 'lucide-react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { company } from '../config/company';
import {
  generateConfigurationId,
  snapshotFromPayload,
  buildQuotePayload,
  formatQuoteSummary,
  submitQuoteRequest,
  type QuotePayload,
} from '../services/quoteService';
import type { Customer } from '../types';

interface Props {
  onClose?: () => void;
}

type FormState = {
  vehicleDescription: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  remarks: string;
  privacyConsent: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

// FormSubmit requires a regular multipart form for JPG attachments and
// non-AJAX submission for its built-in customer auto-response.
// In local development, keep the existing local-only behavior for testing.
const FORM_SUBMIT_RECIPIENT = import.meta.env.PROD ? 'zakaria.el.a@hotmail.com' : null;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

/**
 * Browser-native form post: FormSubmit handles its own reCAPTCHA, email
 * activation, delivery and customer text auto-response.
 */
function deliverThroughFormSubmit(payload: QuotePayload, summary: string): void {
  if (!FORM_SUBMIT_RECIPIENT) throw new Error('Verzenden is niet actief in deze ontwikkelomgeving.');
  const encoded = payload.previewImageDataUrl;
  if (!encoded?.startsWith('data:image/jpeg;base64,')) {
    throw new Error('De eindfoto kon niet worden gemaakt. Probeer opnieuw in een browser met 3D-ondersteuning.');
  }
  const bytes = atob(encoded.slice('data:image/jpeg;base64,'.length));
  const jpg = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) jpg[i] = bytes.charCodeAt(i);
  const photo = new File([jpg], payload.configurationId + '.jpg', { type: 'image/jpeg' });
  // A single documented JPEG attachment is more reliable than sending two
  // file inputs; the selected configuration is already included as text.
  if (photo.size > FILE_SIZE_LIMIT)
    throw new Error('De eindfoto is te groot om als bijlage te verzenden.');

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://formsubmit.co/' + encodeURIComponent(FORM_SUBMIT_RECIPIENT);
  form.enctype = 'multipart/form-data';
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  const add = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };
  const attach = (name: string, file: File) => {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    const input = document.createElement('input');
    input.type = 'file';
    input.name = name;
    input.accept = 'image/jpeg';
    input.files = transfer.files;
    form.appendChild(input);
  };

  // FormSubmit redirects after processing back to our own website.
  // Use an absolute URL as required by FormSubmit; all paths work on GitHub Pages.
  const doneUrl = new URL(import.meta.env.BASE_URL + 'configurator/', window.location.origin);
  doneUrl.searchParams.set('offerte', 'verzonden');
  doneUrl.searchParams.set('referentie', payload.configurationId);
  add('_next', doneUrl.toString());
  add('_subject', 'Nieuwe offerteaanvraag ' + payload.configurationId + ' - RS Car Detailing');
  add('_template', 'table');
  add('_captcha', 'true');
  add('_honey', '');
  add('_autoresponse',
    'Bedankt voor jouw offerteaanvraag bij RS Car Detailing. ' +
    'Wij hebben jouw aanvraag met referentie ' + payload.configurationId +
    ' ontvangen en zullen je contacteren. Dit is nog geen definitieve offerte.\n\n' +
    summary.slice(0, 4500));
  add('name', payload.customer.name);
  add('email', payload.customer.email);
  add('telefoon', payload.customer.phone);
  add('bedrijf', payload.customer.company ?? '');
  add('postcode_en_plaats', payload.customer.location ?? '');
  add('bestelwagen', payload.vehicle.customerDescription ?? '');
  add('referentie', payload.configurationId);
  add('gekozen_onderdelen_en_montage', summary);
  add('opmerkingen', payload.customer.remarks ?? '');
  add('privacytoestemming', payload.privacyConsent ? 'Ja' : 'Nee');
  // FormSubmit documents the standard file-input field name "attachment".
  attach('attachment', photo);
  document.body.appendChild(form);
  HTMLFormElement.prototype.submit.call(form);
}


const initialForm: FormState = {
  vehicleDescription: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  location: '',
  remarks: '',
  privacyConsent: false,
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.vehicleDescription.trim()) errors.vehicleDescription = 'Vertel ons welke bestelwagen je hebt';
  if (!form.name.trim()) errors.name = 'Naam is verplicht';
  if (!form.email.trim()) errors.email = 'E-mail is verplicht';
  else if (!validateEmail(form.email)) errors.email = 'Vul een geldig e-mailadres in';
  if (!form.phone.trim()) errors.phone = 'Telefoonnummer is verplicht';
  if (!form.privacyConsent) errors.privacyConsent = 'Bevestig dat u akkoord gaat met de verwerking van uw gegevens';
  return errors;
}

export default function QuoteForm({ onClose }: Props) {
  const configuration = useConfiguratorStore((s) => s.configuration);
  const getPricing = useConfiguratorStore((s) => s.getPricing);
  const getLayout = useConfiguratorStore((s) => s.getLayout);
  const submitQuoteStore = useConfiguratorStore((s) => s.submitQuote);
  const buildSnapshot = useConfiguratorStore((s) => s.buildSnapshot);

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    payload: QuotePayload;
    summary: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ key: string; image: string | null } | null>(null);
  const previewKey = JSON.stringify(configuration);
  useEffect(() => {
    let current = true;
    void renderSetupImage(configuration).then(image => {
      if (current) setPreview({ key: previewKey, image });
    });
    return () => { current = false; };
  }, [previewKey]);

  const pricing = useMemo(() => getPricing(), [getPricing, configuration]);
  const layout = useMemo(() => getLayout(), [getLayout, configuration]);

  const update = useCallback((field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmissionError(null);
    setSubmitting(true);
    try {
      const configurationId = generateConfigurationId();
      const createdAt = new Date().toISOString();
      const customerPayload = {
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
      };

      const weight = buildSnapshot().estimatedWaterWeightKg;
      const previewImageDataUrl = await summaryImage(configuration, configurationId, form.vehicleDescription.trim());
      const finalPayload = buildQuotePayload({
        configurationId,
        createdAt,
        customer: customerPayload,
        vehicleDescription: form.vehicleDescription.trim(),
        configuration,
        previewImageDataUrl,
        pricing,
        estimatedWaterWeightKg: weight,
        layoutWarnings: layout.warnings,
        privacyConsent: form.privacyConsent,
      });

      const summary = formatQuoteSummary(finalPayload);
      if (FORM_SUBMIT_RECIPIENT) {
        // Save the quote locally as a fallback before leaving for FormSubmit's
        // own reCAPTCHA / one-time Hotmail address-activation flow.
        const prepared = await submitQuoteRequest(finalPayload);
        if (!prepared.ok) throw new Error(prepared.error);
        deliverThroughFormSubmit(finalPayload, summary);
        return;
      }
      const submitResult = await submitQuoteRequest(finalPayload);

      const legacyCustomer: Customer = {
        firstName: form.name.trim().split(/\s+/)[0] || form.name.trim(),
        lastName: form.name.trim().split(/\s+/).slice(1).join(' ') || '',
        company: form.company.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        postcode: form.location.trim(),
        remarks: `Bestelwagen: ${form.vehicleDescription.trim()}${form.remarks.trim() ? '\n' + form.remarks.trim() : ''}`,
      };
      submitQuoteStore(legacyCustomer, snapshotFromPayload(finalPayload));

      setResult({
        payload: finalPayload,
        summary,
        message: submitResult.ok ? submitResult.message : submitResult.error,
      });
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'De verzending kon niet worden gestart. Probeer opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  const copySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--accent-muted)] bg-[var(--accent-soft)]/40 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
              <Check size={20} className="text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">Configuratie voorbereid</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{result.message}</p>
              <p className="mt-3 text-sm">
                <span className="text-[var(--text-muted)]">Referentie: </span>
                <span className="font-mono font-semibold text-[var(--accent)]">{result.payload.configurationId}</span>
              </p>
            </div>
          </div>
        </div>

        {result.payload.previewImageDataUrl ? <div className="card p-4 space-y-3">
          <img src={result.payload.previewImageDataUrl} alt="3D-weergave van uw gekozen configuratie" className="rounded-lg w-full" />
          <a className="btn-secondary" href={result.payload.previewImageDataUrl} download={`${result.payload.configurationId}.jpg`}>Afbeelding bewaren</a>
        </div> : <p className="text-sm text-[var(--warning)]">Geen 3D-afbeelding beschikbaar. Open de 3D-weergave om je configuratie te bekijken.</p>}
        <a className="btn-secondary" href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result.payload, null, 2))}`} download={`${result.payload.configurationId}.json`}>Volledige aanvraag bewaren</a>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText size={16} /> Samenvatting
            </h4>
            <button type="button" onClick={copySummary} className="btn-ghost btn-sm">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Gekopieerd' : 'Kopieer'}
            </button>
          </div>
          <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            {result.summary}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {company.whatsappUrl && (
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 justify-center"
            >
              <MessageCircle size={18} /> WhatsApp contact
            </a>
          )}
          <a href={`tel:${company.phoneE164}`} className="btn-secondary flex-1 justify-center">
            <Phone size={18} /> Bel {company.phoneDisplay}
          </a>
        </div>

        {onClose && (
          <button type="button" onClick={onClose} className="btn-ghost w-full">
            Terug naar overzicht
          </button>
        )}

        <p className="text-xs text-[var(--text-muted)] text-center">
          Dit overzicht is lokaal voorbereid. Er werd vanuit deze ontwikkelomgeving geen e-mail verstuurd.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Offerteaanvraag</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Welke bus heb je? Vertel het ons hieronder. De 3D is een algemeen voorbeeld; wij controleren de echte inbouw bij de offerte.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        {preview?.key === previewKey ? (preview.image ? <img src={preview.image}
          alt="Jouw geselecteerde apparatuur samen op één installatieframe" className="w-full max-h-64 object-contain bg-[#aeb3b6]" />
          : <p className="p-4 text-sm text-[var(--warning)]">De 3D-afbeelding kon niet worden gemaakt. De onderdelenlijst blijft beschikbaar.</p>)
          : <p className="p-4 text-sm text-[var(--text-secondary)]" role="status">Afbeelding van jouw installatie wordt gemaakt…</p>}
        <p className="p-3 text-xs text-[var(--text-muted)]">{FORM_SUBMIT_RECIPIENT
          ? 'Jouw onderdelenlijst en de JPG-eindfoto worden doorgestuurd naar ons e-mailadres. De klant krijgt een automatische tekstbevestiging (zonder foto-bijlage). Na verzenden kom je terug op deze website. Bij de eerste aanvraag moet het ontvangstadres geactiveerd zijn.'
          : 'Je kunt deze aanvraag en eindfoto bewaren. Verzending is in deze ontwikkelomgeving niet actief.'}</p>
      </div>

      <div className="rounded-lg border border-[var(--accent-muted)] bg-[var(--accent-soft)] p-3">
        <label htmlFor="qf-vehicle" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
          Welke bestelwagen heb jij? <span className="text-[var(--accent)]">*</span>
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-2">Merk, model en indien bekend bouwjaar of lengte.</p>
        <input id="qf-vehicle" type="text" required maxLength={180}
          placeholder="Bijv. Ford Transit Custom, bouwjaar 2021, L2"
          value={form.vehicleDescription}
          onChange={e => update('vehicleDescription', e.target.value)}
          className={`input w-full ${errors.vehicleDescription ? 'border-red-500/60' : ''}`}
          aria-invalid={!!errors.vehicleDescription}
          aria-describedby={errors.vehicleDescription ? 'qf-vehicle-err' : undefined}
        />
        {errors.vehicleDescription && <p id="qf-vehicle-err" className="mt-1 text-xs text-red-400">{errors.vehicleDescription}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="qf-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Naam <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="qf-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={`input w-full ${errors.name ? 'border-red-500/60' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'qf-name-err' : undefined}
          />
          {errors.name && (
            <p id="qf-name-err" className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.name}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="qf-company" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Bedrijfsnaam <span className="text-[var(--text-muted)]">(optioneel)</span>
          </label>
          <input
            id="qf-company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="qf-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            E-mail <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="qf-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={`input w-full ${errors.email ? 'border-red-500/60' : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'qf-email-err' : undefined}
          />
          {errors.email && (
            <p id="qf-email-err" className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="qf-phone" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Telefoon <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="qf-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={`input w-full ${errors.phone ? 'border-red-500/60' : ''}`}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'qf-phone-err' : undefined}
          />
          {errors.phone && (
            <p id="qf-phone-err" className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.phone}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="qf-location" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Postcode / plaats <span className="text-[var(--text-muted)]">(optioneel)</span>
          </label>
          <input
            id="qf-location"
            type="text"
            autoComplete="postal-code"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="qf-remarks" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Aanvullende opmerkingen / speciale wensen
          </label>
          <textarea
            id="qf-remarks"
            rows={3}
            value={form.remarks}
            onChange={(e) => update('remarks', e.target.value)}
            className="input w-full resize-y min-h-[80px]"
            placeholder="Bijv. voorkeursperiode, specifieke eisen…"
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="qf-privacy"
          type="checkbox"
          checked={form.privacyConsent}
          onChange={(e) => update('privacyConsent', e.target.checked)}
          className="mt-1 rounded border-[var(--border-strong)]"
          aria-invalid={!!errors.privacyConsent}
        />
        <label htmlFor="qf-privacy" className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Ik ga akkoord met de verwerking van mijn gegevens voor het opmaken van een offerte door {company.name}.
          <span className="text-[var(--accent)]"> *</span>
        </label>
      </div>
      {errors.privacyConsent && (
        <p className="text-xs text-red-400 flex items-center gap-1 -mt-2">
          <AlertCircle size={12} /> {errors.privacyConsent}
        </p>
      )}

      {submissionError && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{submissionError}</p>}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
          {submitting ? 'Bezig…' : FORM_SUBMIT_RECIPIENT ? 'Offerteaanvraag versturen' : 'Aanvraag voorbereiden'}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-ghost">
            Annuleren
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Prijzen worden op maat bepaald. Er worden geen bedragen automatisch doorgestuurd als definitieve offerte.
      </p>
    </form>
  );
}
