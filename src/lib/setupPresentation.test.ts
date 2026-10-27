import assert from 'node:assert/strict';
import { demoConfiguration } from '../data/demoConfiguration';
import { computeLayout, collectProducts } from './layoutEngine';
import { setupBounds, setupParts } from './setupPresentation';
import { getProduct } from '../data/detailingCatalog';

const demo = structuredClone(demoConfiguration);
const layout = computeLayout(demo);
const bounds = setupBounds(layout.placements);
for (const item of layout.placements) for (let a = 0; a < 3; a++) {
  assert(bounds.min[a] <= item.position[a] - item.size[a] / 2 + 1e-9);
  assert(bounds.max[a] >= item.position[a] + item.size[a] / 2 - 1e-9);
}
assert(setupBounds([]).size.every(Number.isFinite), 'empty selections have a finite camera envelope');
const names = setupParts(demo, layout.placements);
for (const item of layout.placements) assert(names.includes(getProduct(item.productId)!.name));
assert(names.includes('Vlotter op watertank'));
assert(names.includes(getProduct('lining_aluminium')!.name));

const changed = { ...demo, generatorId: null, tankId: 'tank_210', floatValve: false };
const after = computeLayout(changed);
const changedNames = setupParts(changed, after.placements);
assert(!changedNames.includes(getProduct('generator_3800')!.name), 'removed equipment cannot survive in the summary');
assert(!changedNames.includes(getProduct('tank_400')!.name));
assert(changedNames.includes(getProduct('tank_210')!.name));
assert(!changedNames.includes('Vlotter op watertank'));
assert(collectProducts(changed).every(p => after.placements.some(i => i.productId === p.id)), 'every selected physical product is accounted for');
console.log('Setup bounds, exact-selection summary and removed-equipment checks passed.');
