import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (element: HTMLElement, options: {
    sitekey: string; theme: string; callback: (token: string) => void;
    'expired-callback': () => void; 'error-callback': () => void;
  }) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptPromise = null; reject(new Error('Beveiliging laden mislukt')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function QuoteTurnstile({ sitekey, onToken, resetSignal }: {
  sitekey: string;
  onToken: (token: string | null) => void;
  resetSignal: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const tokenRef = useRef(onToken);
  tokenRef.current = onToken;

  useEffect(() => {
    let alive = true;
    void loadScript().then(() => {
      if (!alive || !host.current || !window.turnstile) return;
      idRef.current = window.turnstile.render(host.current, {
        sitekey, theme: 'dark',
        callback: token => tokenRef.current(token),
        'expired-callback': () => tokenRef.current(null),
        'error-callback': () => tokenRef.current(null),
      });
    }).catch(() => { if (alive) tokenRef.current(null); });
    return () => {
      alive = false;
      if (idRef.current != null && window.turnstile) window.turnstile.remove(idRef.current);
      idRef.current = null;
    };
  }, [sitekey]);

  useEffect(() => {
    if (resetSignal > 0 && idRef.current && window.turnstile) {
      window.turnstile.reset(idRef.current);
      tokenRef.current(null);
    }
  }, [resetSignal]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[var(--text-secondary)]">Beveiligingscontrole</label>
      <div ref={host} />
      <p className="text-[11px] text-[var(--text-muted)]">Beschermt je aanvraag tegen automatische spam.</p>
    </div>
  );
}
