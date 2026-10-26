import type { DetailingConfiguration } from '../types';

let cached: { key: string; image: string } | null = null;
let active: { key: string; capture: () => string | null } | null = null;
export const configurationKey = (config: DetailingConfiguration) => JSON.stringify(config);

export function registerCapture(key: string, capture: (() => string | null) | null) {
  if (capture) { active = { key, capture }; cached = null; }
  else if (active?.key === key) {
    const image = active.capture();
    cached = image ? { key, image } : null;
    active = null;
  }
}

/** Never reuse a picture taken for a different selection. */
export function captureConfiguration(config: DetailingConfiguration): string | null {
  const key = configurationKey(config);
  return active?.key === key ? active.capture() : cached?.key === key ? cached.image : null;
}
