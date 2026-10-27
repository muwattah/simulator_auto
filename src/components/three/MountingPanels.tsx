import { useEffect, useMemo } from 'react';
import type { PlacedItem } from '../../types';
import { mountingPanels } from '../../lib/doorMounts';
import { makeCheckerPlateTexture } from './surfaceMaterials';

export default function MountingPanels({items,studio}:{items:PlacedItem[];studio:boolean}) {
  const texture=useMemo(makeCheckerPlateTexture,[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <group name="mounting-context">
    {mountingPanels(items,studio).filter(p=>studio || p.zone==='rightSideAccess').map(p=><mesh key={p.productId}
      position={p.position} rotation={[0,p.rotationY??0,0]} castShadow receiveShadow>
      <boxGeometry args={p.size} /><meshStandardMaterial map={texture} color="#89979f" metalness={.8} roughness={.4} />
    </mesh>)}
  </group>;
}
