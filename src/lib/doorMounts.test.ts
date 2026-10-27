import assert from 'node:assert/strict';
import { demoConfiguration } from '../data/demoConfiguration';
import { computeLayout, getCargoSpace } from './layoutEngine';
import { placedSize, presentationItems } from './doorMounts';
import { buildQuotePayload, snapshotFromPayload, formatQuoteSummary } from '../services/quoteService';
import { calculatePricing } from './pricing';
import type { DetailingConfiguration } from '../types';

const config: DetailingConfiguration = { ...demoConfiguration,extraIds:['door_spray_rack','door_brush_rack','door_gun_holder'] };
const layout=computeLayout(config);
assert(layout.fits,layout.warnings.join('\n'));
const racks=layout.placements.filter(i=>i.productId.startsWith('door_'));
assert.equal(racks.length,3);
assert(racks.every(i=>i.zone==='leftRearDoor'));
for(let i=1;i<racks.length;i++) assert(racks[i].position[1]-racks[i].size[1]/2 > racks[i-1].position[1]+racks[i-1].size[1]/2);
const tooFull=computeLayout({...config,bottleHolder:true});
assert(!tooFull.fits && tooFull.warnings.some(w=>w.includes('past niet op')), 'a full door never silently sends a rack to the floor');
const changed: DetailingConfiguration={...config,doorMounts:{door_brush_rack:'rightSideAccess'}};
const moved=computeLayout(changed);
assert(moved.fits,moved.warnings.join('\n'));
const brush=moved.placements.find(i=>i.productId==='door_brush_rack')!;
assert.equal(brush.zone,'rightSideAccess');
assert(Math.abs(placedSize(brush)[0]-brush.size[2])<1e-8,'side mount rotates its collision envelope');
const opened=presentationItems(moved.placements);
assert.deepEqual(opened.map(i=>i.productId),moved.placements.map(i=>i.productId));
const openBrush=opened.find(i=>i.productId===brush.productId)!;
assert.deepEqual(openBrush.position,brush.position,'side-access racks stay on a fixed bracket');

assert.notDeepEqual(opened.find(i=>i.productId==='door_spray_rack')!.position,racks[0].position);
const payload=buildQuotePayload({configurationId:'RS-DOOR-QA',createdAt:new Date().toISOString(),configuration:changed,
  customer:{name:'QA',email:'qa@example.invalid',phone:'000'},pricing:calculatePricing(changed),estimatedWaterWeightKg:400,layoutWarnings:moved.warnings,privacyConsent:true});
assert.equal(payload.installation.doorMounts?.door_brush_rack,'rightSideAccess');
assert.equal(snapshotFromPayload(payload).doorMounts?.door_brush_rack,'rightSideAccess');
assert(formatQuoteSummary(payload).includes('Zijwand tegenover schuifdeur'));
const space=getCargoSpace('medium','single');
assert.equal(space.length,2.602);assert.equal(space.width,1.777);
console.log('Door capacity, closed clearances, side-door rotation, open poses and quote persistence passed.');
