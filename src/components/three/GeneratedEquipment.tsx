import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { PlacedItem } from '../../types';

export const generatedModelFor = (id: string) => {
  if (id.startsWith('pressure_reel_') || id.startsWith('power_reel_') || id.startsWith('air_reel_')) return 'reel';
  if (id.startsWith('generator_')) return 'generator';
  if (id === 'pressure_electric') return 'washer';
  return null;
};

class AssetBoundary extends Component<{ children: ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <Html center><span className="rounded bg-slate-900 p-2 text-xs text-amber-200">{this.props.label}: model niet beschikbaar</span></Html> : this.props.children;
  }
}

function Model({ name, item, selected }: { name: string; item: PlacedItem; selected: boolean }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/demo/${name}.glb`);
  const { object, offset, scale, materials } = useMemo(() => {
    const object = scene.clone(true);
    const materials: THREE.Material[] = [];
    object.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = node.receiveShadow = true;
      const copy = (original: THREE.Material) => {
        const material = original.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 0.85;
          if (selected) { material.emissive.set('#12698c'); material.emissiveIntensity = 0.22; }
        }
        materials.push(material);
        return material;
      };
      node.material = Array.isArray(node.material) ? node.material.map(copy) : copy(node.material);
    });
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    const scale = Math.min(...item.size.map((v, i) => v / Math.max(size.getComponent(i), 0.001)));
    return { object, scale, offset: centre.multiplyScalar(-1), materials };
  }, [scene, selected, item.size[0], item.size[1], item.size[2]]);
  useEffect(() => () => materials.forEach(m => m.dispose()), [materials]);
  return <group scale={scale} position={[0, name === 'reel' ? 0 : -item.size[1] / 2 + new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()).y * scale / 2, 0]}><primitive object={object} position={offset} dispose={null} /></group>;
}

export default function GeneratedEquipment({ item, selected, onSelect }: {
  item: PlacedItem; selected: boolean; onSelect: () => void;
}) {
  const name = generatedModelFor(item.productId)!;
  return <group position={item.position} onClick={e => { e.stopPropagation(); onSelect(); }}>
    <AssetBoundary label={name}>
      <Suspense fallback={<Html center><span className="text-xs text-slate-200">Model laden…</span></Html>}>
        <Model name={name} item={item} selected={selected} />
      </Suspense>
    </AssetBoundary>
  </group>;
}
