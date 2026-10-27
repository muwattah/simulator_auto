import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSpaceMeters, PlacedItem } from '../../types';
import type { VanViewSettings } from './VanBody3D';
import { ProductMeshSwitcher } from './DetailModels';
import { REAR_OPEN_ANGLE, type DoorMount } from '../../lib/doorMounts';
import { makeCheckerPlateTexture } from './surfaceMaterials';

interface Props {
  liningVariant: string; space: CargoSpaceMeters; settings: VanViewSettings; mountItems: PlacedItem[];
  selectedProductId: string | null; onSelectProduct: (id: string | null) => void;
}
type Anchor = { object: THREE.Object3D; bindInverse: THREE.Matrix4; side: number; base: THREE.Vector3 };

function MountedPortal({children,anchor}:{children:ReactNode;anchor:Anchor}) { return createPortal(children,anchor.object); }

/** Original reference-based Transit Custom shape approximation; no manufacturer CAD or logos. */
export default function GeneratedVan({ space, settings, liningVariant, mountItems, selectedProductId, onSelectProduct }: Props) {
  const apertureSeal = useMemo(()=>{
    const rounded=(w:number,h:number,r:number)=>{
      const shape=new THREE.Shape();
      shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
      shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
      shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return shape;
    };
    const outer=rounded(1.03,1.30,.075),inner=rounded(1.0,1.27,.06);
    outer.holes.push(new THREE.Path(inner.getPoints(12)));return outer;
  },[]);
  const tread = useMemo(makeCheckerPlateTexture,[]);
  useEffect(()=>()=>tread.dispose(),[tread]);
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/transit-custom/van.glb`);
  const { object, anchors, materials } = useMemo(() => {
    const object = scene.clone(true);
    const materials: THREE.Material[] = [];
    object.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = node.receiveShadow = true;
      const copy = (original: THREE.Material) => {
        const material = /deep gloss/i.test(original.name) && original instanceof THREE.MeshStandardMaterial
          ? new THREE.MeshPhysicalMaterial({name:original.name,color:original.color,map:original.map,metalness:.65,roughness:.32,clearcoat:.8,clearcoatRoughness:.24}) : original.clone();
        if (material instanceof THREE.MeshStandardMaterial) material.envMapIntensity = 1.1;
        materials.push(material);return material;
      };
      node.material = Array.isArray(node.material) ? node.material.map(copy) : copy(node.material);
    });
    object.updateMatrixWorld(true);
    const anchors: Partial<Record<DoorMount | 'slidingDoor', Anchor>> = {};
    for (const [zone, name, side] of [
      ['leftRearDoor','RearDoor_left_Group',1], ['rightRearDoor','RearDoor_right_Group',-1],
    ] as const) {
      const door = object.getObjectByName(name);
      if (!door) continue;
      const bounds = new THREE.Box3().setFromObject(door);
      const pivot = new THREE.Group();pivot.name = 'hinge-' + zone;
      pivot.position.set(side < 0 ? bounds.min.x : bounds.max.x, 0, bounds.getCenter(new THREE.Vector3()).z);
      object.add(pivot);pivot.attach(door);object.updateMatrixWorld(true);
      anchors[zone] = { object:pivot, bindInverse:pivot.matrixWorld.clone().invert(), side, base:pivot.position.clone() };
    }
    const sliding = object.getObjectByName('SlidingDoor_right_Group');
    if (sliding) anchors.slidingDoor = { object:sliding, bindInverse:sliding.matrixWorld.clone().invert(), side:0, base:sliding.position.clone() };
    return { object, anchors, materials };
  }, [scene]);
  useEffect(() => () => materials.forEach(m=>m.dispose()),[materials]);
  useEffect(() => {
    materials.forEach(m=>{m.visible=settings.body !== 'hidden';});
    const roof = object.getObjectByName('CargoRoof_Group');if(roof) roof.visible=settings.roofVisible;
    for (const name of ['CargoLeftWall_Group','CargoRightWall_Group','CargoRoof_Group']) {
      object.getObjectByName(name)?.traverse(node=>{
        if (!(node instanceof THREE.Mesh)) return;
        const ghost=settings.body==='transparent';
        for(const mat of Array.isArray(node.material)?node.material:[node.material]) {
          mat.transparent=ghost;mat.opacity=ghost ? .10 : 1;mat.depthWrite=!ghost;mat.needsUpdate=true;
        }
        node.castShadow=!ghost && settings.body !== 'hidden';node.raycast=ghost?()=>{}:THREE.Mesh.prototype.raycast;
      });
    }
  },[object,settings.body,settings.roofVisible,materials]);
  useFrame(({invalidate},dt)=>{
    let moving=false;
    for(const anchor of Object.values(anchors)) {
      if(anchor.side) {
        const target=settings.doorsOpen ? -anchor.side*REAR_OPEN_ANGLE : 0;
        if(Math.abs(anchor.object.rotation.y-target)>.001) { anchor.object.rotation.y=THREE.MathUtils.damp(anchor.object.rotation.y,target,8,Math.min(dt,.1));moving=true; }
        else anchor.object.rotation.y=target;
      } else {
        const xTarget=anchor.base.x+(settings.sideDoorOpen ? -.22 : 0);
        const zTarget=anchor.base.z+(settings.sideDoorOpen ? -1.08 : 0);
        // First clear the body; then slide. Close in the reverse order.
        const xReady=Math.abs(anchor.object.position.x-xTarget)<.015;
        const zReady=Math.abs(anchor.object.position.z-zTarget)<.015;
        const next=anchor.object.position.clone();
        if(settings.sideDoorOpen || zReady) next.x=THREE.MathUtils.damp(next.x,xTarget,8,Math.min(dt,.1));
        if(!settings.sideDoorOpen || xReady) next.z=THREE.MathUtils.damp(next.z,zTarget,8,Math.min(dt,.1));
        if(next.distanceTo(anchor.object.position)>.00005){anchor.object.position.copy(next);moving=true;}
        else if(xReady && zReady)anchor.object.position.set(xTarget,anchor.base.y,zTarget);
      }
    }
    if(moving) invalidate();

  });
  // Fixed-model geometry is never stretched when the customer's actual van description changes.
  void space;
  return <>
    <primitive object={object} dispose={null} />
    <mesh name="fixed-sliding-aperture-seal" position={[-.99,.65,.705]} rotation={[0,Math.PI/2,0]} visible={settings.body!=='hidden'}>
      <extrudeGeometry args={[apertureSeal,{depth:.014,bevelEnabled:false,curveSegments:12}]} />
      <meshStandardMaterial color="#161e23" roughness={.67} transparent={settings.body==='transparent'} opacity={settings.body==='transparent'?.1:1} />
    </mesh>
    {Object.entries(anchors).map(([zone,anchor])=><MountedPortal key={zone} anchor={anchor}><group matrix={anchor.bindInverse} matrixAutoUpdate={false}>
      {liningVariant === 'aluminium' && <mesh name={'door-lining:'+zone} visible={settings.body !== 'hidden'}
        position={zone === 'slidingDoor' ? [-.86,.67,.68] : [zone==='leftRearDoor'?.35:-.35,.67,-1.235]}
        rotation={[0,zone==='slidingDoor'?-Math.PI/2:0,0]} castShadow receiveShadow>
        <boxGeometry args={[zone==='slidingDoor'?.9:.65,1.14,.009]} />
        <meshStandardMaterial map={tread} color="#aab7be" metalness={.8} roughness={.35} />
      </mesh>}
    </group></MountedPortal>)}
    {mountItems.map(item=>{
      const anchor=anchors[item.zone as DoorMount];if(!anchor)return null;
      return <MountedPortal key={item.productId} anchor={anchor}><group matrix={anchor.bindInverse} matrixAutoUpdate={false}>
        <group name={'product:'+item.productId} userData={{doorMounted:true}} position={item.position} rotation={[0,item.rotationY??0,0]}>
          <ProductMeshSwitcher item={{...item,position:[0,0,0]}} selected={selectedProductId===item.productId}
            onSelect={()=>onSelectProduct(selectedProductId===item.productId?null:item.productId)} />
        </group>
      </group></MountedPortal>;
    })}
  </>;
}
