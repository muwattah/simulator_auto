import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { PlacedItem } from '../../types';
import { getProduct } from '../../data/detailingCatalog';

/** Original dimensioned rack visualisations based on the customer's installation photos. */
export default function DoorRack({ item, onSelect }: { item: PlacedItem; onSelect: () => void }) {
  const [w,h,d] = item.size;
  const variant = getProduct(item.productId)?.visual3D.variant;
  const shelf = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w/2,-d/2);shape.lineTo(w/2,-d/2);shape.lineTo(w/2,d/2);shape.lineTo(-w/2,d/2);shape.closePath();
    for (let i=0;i<4;i++) { const hole = new THREE.Path();hole.absarc((i-1.5)*w*.23,0,Math.min(w*.085,d*.32),0,Math.PI*2,true);shape.holes.push(hole); }
    return shape;
  },[w,d]);
  return <group position={item.position} onClick={e=>{e.stopPropagation();onSelect();}}>
    <mesh position={[0,-h*.1,d*.43]} castShadow receiveShadow><boxGeometry args={[w,h*.72,.012]} /><meshStandardMaterial color="#26312f" metalness={.75} roughness={.34} /></mesh>
    <mesh position={[0,-h*.23,0]} rotation={[Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shelf,{depth:.012,bevelEnabled:false,curveSegments:20}]} /><meshStandardMaterial color="#7cba36" metalness={.55} roughness={.32} /></mesh>
    <mesh position={[0,-h*.43,0]} castShadow><boxGeometry args={[w,.014,d]} /><meshStandardMaterial color="#26312f" metalness={.75} roughness={.34} /></mesh>
    <mesh position={[0,-h*.22,-d*.45]} castShadow><boxGeometry args={[w,.035,.012]} /><meshStandardMaterial color="#7cba36" metalness={.55} roughness={.32} /></mesh>
    {[-1,1].flatMap(x=>[-1,1].map(y=><mesh key={`${x}${y}`} position={[x*w*.44,y*h*.25,d*.44+.009]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.006,.006,.01,6]} /><meshStandardMaterial color="#b9c6ca" metalness={.9} roughness={.2} /></mesh>))}
    {variant === 'gun' ? <group>
      <RoundedBox args={[w*.2,h*.35,.035]} radius={.012} smoothness={2} position={[-w*.08,-h*.02,-d*.12]} rotation={[0,0,-.25]} castShadow><meshStandardMaterial color="#263536" roughness={.55} /></RoundedBox>
      <RoundedBox args={[w*.5,.045,.035]} radius={.012} smoothness={2} position={[w*.02,h*.15,-d*.12]} castShadow><meshStandardMaterial color="#303c3d" roughness={.5} /></RoundedBox>
      <mesh position={[w*.28,h*.15,-d*.12]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.012,.012,w*.16,16]} /><meshStandardMaterial color="#bda05e" metalness={.8} roughness={.25} /></mesh>
      <mesh position={[w*.36,h*.28,-d*.12]}><cylinderGeometry args={[.007,.007,h*.26,12]} /><meshStandardMaterial color="#c5d1d5" metalness={.9} roughness={.2} /></mesh>
      <mesh position={[w*.02,-h*.02,-d*.12]} rotation={[0,0,-.15]}><torusGeometry args={[w*.08,.006,8,16,Math.PI*1.7]} /><meshStandardMaterial color="#8aca37" roughness={.6} /></mesh>
    </group> : Array.from({length:4},(_,i)=><group key={i} position={[(i-1.5)*w*.23,0,-d*.04]}>
      <mesh castShadow><cylinderGeometry args={[w*.055,w*.065,h*.58,24]} /><meshStandardMaterial color={variant === 'brush' ? '#99a8aa' : '#e6ede7'} metalness={variant === 'brush' ? .65 : .02} roughness={.32} /></mesh>
      <mesh position={[0,-h*.03,0]}><cylinderGeometry args={[w*.066,w*.066,h*.26,24]} /><meshStandardMaterial color={['#5dc2bd','#76b841','#becad0','#bc4d6a'][i]} roughness={.42} /></mesh>
      <mesh position={[0,h*.32,0]}><cylinderGeometry args={[w*.027,w*.027,h*.09,16]} /><meshStandardMaterial color={variant === 'brush' ? '#252e31' : '#f0f3ef'} roughness={.48} /></mesh>
      {variant !== 'brush' && <group position={[0,h*.39,0]}>
        <RoundedBox args={[w*.09,h*.055,.025]} radius={.004} smoothness={2} position={[0,0,-.012]}><meshStandardMaterial color={i%2 ? '#f0f3ef' : '#9bc851'} roughness={.48} /></RoundedBox>
        <mesh position={[0,-h*.055,-.022]} rotation={[.25,0,0]}><boxGeometry args={[.008,h*.09,.01]} /><meshStandardMaterial color="#dbe3db" /></mesh>
      </group>}
    </group>)}
  </group>;
}
