import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSpaceMeters } from '../../types';
import type { VanViewSettings } from './VanBody3D';

/** Original AI model, no brand CAD. Cargo envelope is fitted independently. */
export default function GeneratedVan({ space, settings }: { space: CargoSpaceMeters; settings: VanViewSettings }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/demo/van.glb`);
  const { object, hinges, materials } = useMemo(() => {
    const object = scene.clone(true);
    const materials: THREE.Material[] = [];
    object.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = node.receiveShadow = true;
      const clone = (material: THREE.Material) => {
        const copy = material.clone();
        if (copy instanceof THREE.MeshStandardMaterial) copy.envMapIntensity = 0.85;
        materials.push(copy);
        return copy;
      };
      node.material = Array.isArray(node.material) ? node.material.map(clone) : clone(node.material);
    });
    object.updateMatrixWorld(true);
    const hinges: { pivot: THREE.Group; side: number }[] = [];
    for (const name of ['RearDoor_left_Group', 'RearDoor_right_Group']) {
      const door = object.getObjectByName(name);
      if (!door) continue;
      const bounds = new THREE.Box3().setFromObject(door);
      const side = bounds.getCenter(new THREE.Vector3()).x > 0 ? 1 : -1;
      const pivot = new THREE.Group();
      pivot.name = `hinge-${side}`;
      pivot.position.set(side > 0 ? bounds.max.x : bounds.min.x, 0, bounds.getCenter(new THREE.Vector3()).z);
      object.add(pivot);
      pivot.attach(door);
      hinges.push({ pivot, side });
    }
    return { object, hinges, materials };
  }, [scene]);
  useEffect(() => () => materials.forEach(m => m.dispose()), [materials]);
  useEffect(() => {
    const roof = object.getObjectByName('CargoRoof_Group');
    if (roof) roof.visible = settings.roofVisible;
    for (const name of ['CargoLeftWall_Group', 'CargoRightWall_Group', 'CargoRoof_Group']) {
      object.getObjectByName(name)?.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        const ghost = settings.body === 'transparent';
        for (const mat of Array.isArray(node.material) ? node.material : [node.material]) {
          mat.transparent = ghost; mat.opacity = ghost ? 0.10 : 1;
          mat.depthWrite = !ghost; mat.needsUpdate = true;
        }
        node.castShadow = !ghost;
        // Let clicks reach equipment through translucent panels.
        node.raycast = ghost ? () => {} : THREE.Mesh.prototype.raycast;
      });
    }
  }, [object, settings.body, settings.roofVisible]);
  useFrame(({ invalidate }, dt) => {
    for (const { pivot, side } of hinges) {
      const target = settings.doorsOpen ? -side * 2.9 : 0;
      if (Math.abs(pivot.rotation.y - target) < 0.001) { pivot.rotation.y = target; continue; }
      pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, target, 7, Math.min(dt, 0.2));
      invalidate();
    }
  });
  return <group visible={settings.body !== 'hidden'} scale={[space.width / 1.787, space.height / 2.009, space.length / 3.27]}>
    <primitive object={object} position={[0, -0.62, 1.3425]} dispose={null} />
  </group>;
}
