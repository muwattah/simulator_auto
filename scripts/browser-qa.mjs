/**
 * Smoke test for the equipment-first studio (desktop and phone layouts).
 * Run with the Vite dev server listening on port 5278.
 */
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '.test-build/browser-qa');
mkdirSync(dir, { recursive: true });
const url = process.env.QA_URL ?? 'http://127.0.0.1:5278/simulator_auto/?qa=1';
const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
});
const results = [];

try {
  for (const mobile of [false, true]) {
    const device = mobile ? 'mobile' : 'desktop';
    if (process.env.QA_DEVICE && process.env.QA_DEVICE !== device) continue;
    const ctx = await browser.newContext(
      mobile
        ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
        : { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 },
    );
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Start configureren' }).first().click();
    await page.getByRole('heading', { name: 'Jouw mobiele werkplaats, in 3D' }).waitFor();
    await page.locator('.viewer-shell').waitFor();
    await page.getByRole('button', { name: 'Toevoegen', exact: true }).first().waitFor();

    assert.equal(await page.getByText('Welk type voertuig wil je inrichten?').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Laad de 3D-demo' }).count(), 0);

    const positions = await page.evaluate(() => {
      const viewer = document.querySelector('.viewer-shell').getBoundingClientRect();
      const catalog = document.querySelector('[aria-label="Onderdelen en offerte"]').getBoundingClientRect();
      const header = document.querySelector('header').getBoundingClientRect();
      return {
        viewerX: viewer.x, viewerY: viewer.y, viewerWidth: viewer.width,
        catalogX: catalog.x, catalogY: catalog.y,
        navbarHeight: header.height,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    });
    assert(!positions.overflow, device + ' has horizontal page overflow');
    assert(positions.navbarHeight < 75, 'navbar remains compact');
    assert(positions.viewerY < 240, 'the viewer starts near the top, without bulky banners');
    if (!mobile) {
      assert(positions.viewerX < positions.catalogX, '3D viewer is to the left of product cards');
      assert(positions.catalogY < 100, 'catalog starts immediately below navbar');
    } else {
      assert(positions.viewerY < positions.catalogY, 'mobile shows 3D above parts library');
    }
    await page.screenshot({ path: resolve(dir, device + '-studio.png'), fullPage: true });

    // Add and remove a real tank using the displayed product card.
    await page.getByRole('button', { name: 'Toevoegen', exact: true }).first().click();
    await page.getByRole('button', { name: 'Verwijderen', exact: true }).first().waitFor();
    let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.configuration);
    assert(stored.tankId, 'adding a tank updates the configuration');

    await page.getByRole('button', { name: 'Hogedruk', exact: true }).click();
    await page.getByRole('button', { name: 'Toevoegen', exact: true }).first().waitFor();

    // Search works across categories; filters can be cleared.
    await page.getByRole('searchbox', { name: 'Zoek onderdelen' }).fill('generator');
    await page.getByText('Generator 3000 W').first().waitFor();
    await page.getByRole('searchbox', { name: 'Zoek onderdelen' }).fill('');

    await page.getByRole('button', { name: 'Installatie', exact: true }).first().click();
    await page.getByRole('button', { name: 'Door ons laten inbouwen' }).click();
    await page.getByRole('button', { name: 'Overzicht', exact: true }).click();
    await page.locator('#qf-vehicle').fill('Ford Transit Custom, 2022, L2');
    await page.locator('#qf-name').fill('Test RS');
    await page.locator('#qf-email').fill('voorbeeld@example.invalid');
    await page.locator('#qf-phone').fill('00000000');
    await page.locator('#qf-privacy').check();
    await page.getByRole('button', { name: 'Aanvraag voorbereiden' }).click();
    await page.getByText('Configuratie voorbereid', { exact: true }).waitFor();
    const savedRequest = await page.evaluate(() => JSON.parse(localStorage.getItem('rs-quote-requests'))[0]);
    assert.equal(savedRequest.vehicle.customerDescription, 'Ford Transit Custom, 2022, L2');
    const savedQuote = await page.evaluate(() => JSON.parse(localStorage.getItem('detailing-configurator-v1')).state.quotes[0]);
    assert.equal(savedQuote.snapshot.customerVehicleDescription, 'Ford Transit Custom, 2022, L2');
    assert.equal(savedRequest.configurationId, savedQuote.snapshot.configurationId);
    assert.deepEqual(pageErrors, [], 'no browser runtime errors');

    results.push({ device, ...positions, assertions: 'passed' });
    console.log(device + ': passed');
    await ctx.close();
  }
  writeFileSync(resolve(dir, 'results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
