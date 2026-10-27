// Offline authoring tool. Start Vite first; no Thrixel calls or runtime thumbnail canvases.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/';
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
try {
  const page = await browser.newPage();
  await page.goto(base);
  const ids = await page.evaluate(async base => {
    const { products } = await import(new URL('src/data/detailingCatalog.ts', base).href);
    return products.map(p => p.id);
  }, base);
  mkdirSync('public/product-renders', { recursive: true });
  for (const id of ids.filter(id => !process.env.PRODUCT_IDS || process.env.PRODUCT_IDS.split(',').includes(id))) {
    const image = await page.evaluate(async ({ base, id }) => {
      const { renderProductImage } = await import(new URL('src/services/renderSetupImage.tsx', base).href);
      const { demoConfiguration } = await import(new URL('src/data/demoConfiguration.ts', base).href);
      return renderProductImage(demoConfiguration, id);
    }, { base, id });
    if (!image) throw new Error('Incomplete render: ' + id);
    writeFileSync(`public/product-renders/${id}.jpg`, Buffer.from(image.split(',')[1], 'base64'));
    console.log('Baked ' + id);
  }
} finally { await browser.close(); }
