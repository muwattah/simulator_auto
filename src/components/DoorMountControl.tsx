import { useConfiguratorStore } from '../store/configuratorStore';
import { DOOR_LABELS, doorFor, type DoorMount } from '../lib/doorMounts';
import type { DetailingProduct } from '../types';

export default function DoorMountControl({ product }: { product: DetailingProduct }) {
  const config = useConfiguratorStore(s=>s.configuration);
  const setMount = useConfiguratorStore(s=>s.setDoorMount);
  return <label className="mt-3 block text-[11px] text-[var(--text-secondary)]">
    Plaatsing
    <select aria-label={'Plaatsing ' + product.name} value={doorFor(config,product)}
      onChange={e=>{setMount(product.id,e.target.value as DoorMount);window.dispatchEvent(new CustomEvent('rs-door-focus',{detail:e.target.value}));}} className="input mt-1 w-full !px-2 !py-2 text-[11px]">
      {Object.entries(DOOR_LABELS).map(([id,label])=><option key={id} value={id}>{label}</option>)}
    </select>
  </label>;
}
