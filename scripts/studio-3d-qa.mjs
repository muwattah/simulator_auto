import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/?qa=1';
const dir = resolve(process.argv[2] ?? '.test-build/studio-3d');
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
const results = [];
try {
  for (const mobile of [false, true]) {
    const device = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1600, height: 1000 }, hasTouch: mobile, isMobile: mobile });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(base);
    await page.evaluate(async base => {
      const { demoConfiguration } = await import(new URL('src/data/demoConfiguration.ts', base).href);
      localStorage.setItem('detailing-configurator-v1', JSON.stringify({ version: 2, state: { configuration: demoConfiguration, step: 'tank', quotes: [], visitedSteps: [] } }));
    }, base);
    await page.reload();
    await page.getByRole('button', { name: 'Start configureren' }).first().click();
    await page.waitForFunction(() => window.__rs3d?.triangles > 50000);
    await page.waitForTimeout(1800);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
    const gpu = await page.locator('.viewer-shell canvas').evaluate(canvas => {
      const gl = canvas.getContext('webgl2'); const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable';
    });
    await page.screenshot({ path: resolve(dir, device + '-studio.png'), fullPage: true });
    await page.getByRole('button', { name: 'Achter', exact: true }).click();
    await page.waitForTimeout(500);
    const before = await page.evaluate(() => window.__rs3d.camera);
    await page.getByRole('button', { name: 'Inzoomen', exact: true }).click();
    await page.waitForTimeout(400);
    assert.notDeepEqual(await page.evaluate(() => window.__rs3d.camera), before);
    if (mobile) {
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo({ top: 0, behavior: 'instant' }); });
      const box = await page.locator('.viewer-shell canvas').boundingBox();
      const cdp = await context.newCDPSession(page);
      const old = await page.evaluate(() => window.__rs3d.camera);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * .45, y: box.y + box.height * .5 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * .65, y: box.y + box.height * .55 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
      assert.notDeepEqual(await page.evaluate(() => window.__rs3d.camera), old, 'touch drag rotates the real 3D camera');
    }
    // Remove the generator through its actual card; the final render must change.
    await page.getByRole('button', { name: 'Stroom', exact: true }).click();
    const card = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Generator 3800 W — 66 dB', exact: true }) });
    await card.getByRole('button', { name: 'Verwijderen', exact: true }).click();
    const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.configuration);
    assert.equal(selected.generatorId, null);
    await page.getByRole('button', { name: 'Overzicht', exact: true }).click();
    await page.getByAltText('Jouw geselecteerde apparatuur samen op één installatieframe').waitFor({ timeout: 40000 });
    await page.locator('#qf-vehicle').fill('Ford Transit Custom L2, 2022');
    await page.locator('#qf-name').fill('QA voorbeeld');
    await page.locator('#qf-email').fill('voorbeeld@example.invalid');
    await page.locator('#qf-phone').fill('0000000000');
    await page.locator('#qf-privacy').check();
    await page.getByRole('button', { name: 'Aanvraag voorbereiden' }).click();
    await page.getByText('Configuratie voorbereid', { exact: true }).waitFor({ timeout: 40000 });
    const picture = page.getByAltText('3D-weergave van uw gekozen configuratie');
    const data = await picture.getAttribute('src');
    assert(data?.startsWith('data:image/jpeg;base64,'), 'final request contains a real render');
    writeFileSync(resolve(dir, device + '-samenvatting.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    const request = await page.getByRole('link', { name: 'Volledige aanvraag bewaren' }).getAttribute('href');
    const payload = JSON.parse(decodeURIComponent(request.split(',').slice(1).join(',')));
    assert.equal(payload.previewImageDataUrl, data);
    assert.equal(payload.systems.generatorName, null);
    assert.equal(payload.reviewStatus, 'awaiting-admin-review');
    assert.equal(await page.locator('body > div[aria-hidden="true"]').count(), 0, 'temporary rendering roots cleaned up');
    assert.deepEqual(errors, []);
    results.push({ device, gpu, imageBytes: data.length, tests: 'passed' });
    console.log(device + ': real 3D, camera, selection, final image and cleanup passed');
    await context.close();
  }
  writeFileSync(resolve(dir, 'results.json'), JSON.stringify(results, null, 2));
} finally { await browser.close(); }
