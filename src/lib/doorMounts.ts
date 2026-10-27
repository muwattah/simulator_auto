import type { DetailingConfiguration, DetailingProduct, PlacedItem, PlacementZone } from '../types';

export type DoorMount = 'leftRearDoor' | 'rightRearDoor' | 'rightSideAccess';
export const DOOR_LABELS: Record<DoorMount, string> = {
  leftRearDoor: 'Linker achterdeur', rightRearDoor: 'Rechter achterdeur', rightSideAccess: 'Zijwand tegenover schuifdeur',
};
export const REAR_OPEN_ANGLE = Math.PI * .91;
/** Canonical door pivots measured from the generated, normalized GLB. */
export const REAR_PIVOTS = { leftRearDoor: [.85807,0,-1.32025], rightRearDoor:[-.85807,0,-1.32025] };
export function presentationItems(items: PlacedItem[]): PlacedItem[] {
  return items.map(item => {
    if (!isDoorZone(item.zone)) return item;
    if (item.zone === 'rightSideAccess') return item;
    const pivot=REAR_PIVOTS[item.zone], angle=(item.zone === 'leftRearDoor' ? -1 : 1)*REAR_OPEN_ANGLE;
    const x=item.position[0]-pivot[0],z=item.position[2]-pivot[2];
    return { ...item,rotationY:(item.rotationY??0)+angle,
      position:[pivot[0]+Math.cos(angle)*x+Math.sin(angle)*z,item.position[1],pivot[2]-Math.sin(angle)*x+Math.cos(angle)*z] };
  });
}
export function isDoorZone(zone: PlacementZone): zone is DoorMount {
  return zone === 'leftRearDoor' || zone === 'rightRearDoor' || zone === 'rightSideAccess';
}
export function canMountOnDoor(product: DetailingProduct) {
  return product.placement.allowedZones.some(isDoorZone);
}
export function doorFor(config: DetailingConfiguration, product: DetailingProduct): DoorMount {
  const requested = config.doorMounts?.[product.id];
  return requested && isDoorZone(requested) ? requested : isDoorZone(product.placement.preferredZone) ? product.placement.preferredZone : 'leftRearDoor';
}
/** Axis-aligned occupied envelope after a quarter-turn on the side-wall bracket. */
export function placedSize(item: PlacedItem): [number, number, number] {
  const c = Math.abs(Math.cos(item.rotationY ?? 0)), s = Math.abs(Math.sin(item.rotationY ?? 0));
  return [item.size[0] * c + item.size[2] * s, item.size[1], item.size[0] * s + item.size[2] * c];
}
/** Mounting surfaces are vehicle context, never extra quoted products. */
export function mountingPanels(items: PlacedItem[], opened: boolean): PlacedItem[] {
  const zones=[...new Set(items.filter(i=>isDoorZone(i.zone)).map(i=>i.zone as DoorMount))];
  const panels: PlacedItem[]=zones.map(zone=>({productId:'mount-context:'+zone,zone,
    position:zone==='rightSideAccess'?[.855,1.0,.681]:[zone==='leftRearDoor'?.35:-.35,.67,-1.235],
    size:[.65,zone==='rightSideAccess'?.6:1.14,.009],rotationY:zone==='rightSideAccess'?Math.PI/2:0}));
  return opened ? presentationItems(panels) : panels;
}
