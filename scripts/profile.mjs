import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] ?? '.test-build/browser-qa');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
const report = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext(mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
      : { viewport: { width: 1600, height: 1100 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const start = Date.now();
    await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/?qa=1');
    await page.getByRole('button', { name: 'Start configureren' }).first().click();
    await page.getByRole('button', { name: 'Laad de 3D-demo', exact: true }).click();
    await page.waitForFunction(() => window.__rs3d?.triangles > 200000);
    const readyMs = Date.now() - start;
    await page.locator('canvas').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.evaluate(() => window.dispatchEvent(new Event('rs-profile-start')));
    await page.waitForFunction(() => window.__rs3d.frames.length > 60, { timeout: 60000 });
    await page.evaluate(() => window.dispatchEvent(new Event('rs-profile-stop')));
    const runs = [];
    for (let run = 0; run < 3; run++) {
      await page.evaluate(() => window.dispatchEvent(new Event('rs-profile-start')));
      await page.waitForFunction(() => window.__rs3d.frames.length >= 121, { timeout: 60000 });
      await page.evaluate(() => window.dispatchEvent(new Event('rs-profile-stop')));
      const data = await page.evaluate(() => ({ ...window.__rs3d, frames: window.__rs3d.frames.slice(1, 121) }));
      const sorted = [...data.frames].sort((a, b) => a - b);
      const percentile = p => Math.round(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)] * 10) / 10;
      runs.push({ frames: sorted.length, p50Ms: percentile(0.5), p95Ms: percentile(0.95), p99Ms: percentile(0.99),
        maxMs: sorted.at(-1), over50Ms: sorted.filter(v => v > 50).length, drawCalls: data.calls,
        triangles: data.triangles, programs: data.programs });
    }
    report.push({ viewport: mobile ? '390×844, DPR 3 capped at 1.5' : '1600×1100, DPR 1',
      mode: 'headless Edge, continuous OrbitControls rotation, warm shader cache',
      readyMs, physicalPhone: false, errors, runs });
    console.log(mobile ? 'mobile profile complete' : 'desktop profile complete', runs);
    await context.close();
  }
  writeFileSync(resolve(out, 'performance.json'), JSON.stringify(report, null, 2));
} finally { await browser.close(); }
