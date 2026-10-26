import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] ?? '.test-build/browser-qa');
mkdirSync(out, { recursive: true });
const url = process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/?qa=1';
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
const results = [];
try {
  for (const mobile of [false, true]) {
    const name = mobile ? 'mobile' : 'desktop';
    if (process.env.QA_DEVICE && process.env.QA_DEVICE !== name) continue;
    const context = await browser.newContext(mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
      : { viewport: { width: 1600, height: 1100 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await page.getByRole('button', { name: 'Start configureren' }).first().click();
    await page.getByRole('button', { name: 'Laad de 3D-demo', exact: true }).click();
    await page.waitForTimeout(7000);
    assert.equal(await page.locator('canvas').count(), 1, 'only one active renderer');
    const canvas = page.locator('canvas');
    await canvas.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(500);
    const dimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const rect = canvas.getBoundingClientRect();
      const gl = canvas.getContext('webgl2');
      const debug = gl?.getExtension('WEBGL_debug_renderer_info');
      return { overflow: document.documentElement.scrollWidth > innerWidth,
        cssWidth: rect.width, bufferWidth: canvas.width,
        renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable' };
    });
    assert(!dimensions.overflow, 'no horizontal page overflow');
    assert(dimensions.bufferWidth <= dimensions.cssWidth * 1.51, 'DPR budget is capped');
    await page.screenshot({ path: resolve(out, `${name}-overview.png`), fullPage: true });
    const beforeZoom = await page.evaluate(() => window.__rs3d?.camera);
    await page.getByRole('button', { name: 'Inzoomen', exact: true }).click();
    await page.waitForTimeout(400);
    const afterZoom = await page.evaluate(() => window.__rs3d?.camera);
    assert.notDeepEqual(beforeZoom, afterZoom, 'zoom changes the real camera');
    await page.getByRole('button', { name: 'Reset camera', exact: true }).click();
    await page.waitForTimeout(400);
    const reset = await page.evaluate(() => window.__rs3d?.camera);
    assert(reset.every((v, i) => Math.abs(v - beforeZoom[i]) < 0.01), 'reset also works when overview is already selected');
    await canvas.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const bounds = await canvas.boundingBox();
    const beforeDrag = await page.evaluate(() => window.__rs3d?.camera);
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      const x = bounds.x + bounds.width * 0.4, y = bounds.y + bounds.height * 0.5;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
      for (let i = 1; i <= 8; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 9, y, id: 1 }] });
        await page.waitForTimeout(40);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(bounds.x + bounds.width * 0.4, bounds.y + bounds.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.55, { steps: 20 });
      await page.mouse.up();
    }
    await page.waitForTimeout(500);
    assert.notDeepEqual(beforeDrag, await page.evaluate(() => window.__rs3d?.camera), 'real mouse/touch drag rotates the camera');
    await page.getByRole('button', { name: 'Achter', exact: true }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: resolve(out, `${name}-rear.png`), fullPage: true });
    if (mobile) await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
    await page.getByRole('button', { name: 'Achterdeuren open', exact: true }).click();
    await page.waitForTimeout(1800);
    await page.getByRole('button', { name: 'Gesloten', exact: true }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: resolve(out, `${name}-closed.png`), fullPage: true });
    await page.getByRole('button', { name: 'Achterdeuren dicht', exact: true }).click();
    await page.getByRole('button', { name: 'Doorzichtig', exact: true }).click();
    await page.waitForTimeout(1800);

    const metrics = await page.evaluate(() => {
      const m = window.__rs3d;
      return { drawCalls: m?.calls, triangles: m?.triangles, programs: m?.programs };
    });
    if (mobile) {
      await page.getByRole('button', { name: 'Keuzes', exact: true }).click();
      for (let i = 0; i < 11; i++) await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    } else {
      // Removing a real selected item must update the render and configuration.
      await page.getByRole('button', { name: 'Verwijder Generator', exact: true }).click();
      await page.waitForTimeout(500);
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.configuration);
      assert.equal(stored.generatorId, null);
      await page.getByRole('button', { name: 'Laad de 3D-demo', exact: true }).click();
      await page.getByRole('tab', { name: /Overzicht/ }).click();
    }
    await page.locator('#qf-name').fill('QA Demo');
    await page.locator('#qf-email').fill('demo@example.invalid');
    await page.locator('#qf-phone').fill('000000000');
    await page.locator('#qf-privacy').check();
    await page.getByRole('button', { name: 'Aanvraag voorbereiden', exact: true }).click();
    await page.getByText('Configuratie voorbereid', { exact: true }).waitFor();
    const image = page.getByAltText('3D-weergave van uw gekozen configuratie');
    assert.equal(await image.count(), 1, 'quote contains the exact current 3D image');
    const request = await page.getByRole('link', { name: 'Volledige aanvraag bewaren', exact: true }).getAttribute('href');
    const payload = JSON.parse(decodeURIComponent(request.split(',').slice(1).join(',')));
    assert.equal(payload.reviewStatus, 'awaiting-admin-review');
    assert.equal(payload.vehicle.modelId, 'mercedes-sprinter');
    assert(payload.previewImageDataUrl.startsWith('data:image/jpeg;base64,'));
    writeFileSync(resolve(out, `${name}-configuration.jpg`), Buffer.from(payload.previewImageDataUrl.split(',')[1], 'base64'));
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('rs-quote-requests'))[0]);
    const quote = await page.evaluate(() => JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.quotes[0]);
    assert.equal(saved.configurationId, quote.snapshot.configurationId, 'same reference in both local stores');
    assert.equal(saved.previewImageDataUrl, null, 'large image is not stored in localStorage');
    assert.deepEqual(errors, [], 'no browser runtime errors');
    results.push({ name, ...dimensions, ...metrics, quoteReference: payload.configurationId, assertions: 'passed' });
    console.log(`${name}: passed`);
    await context.close();
  }
  writeFileSync(resolve(out, 'browser-qa.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}


