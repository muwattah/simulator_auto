import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { PlacedItem } from '../../types';

type Props = { item: PlacedItem; selected: boolean; onSelect: () => void };
const rubber = '#171c20';
function Hose({ points, radius = 0.015, color = rubber }: { points: number[][]; radius?: number; color?: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3().fromArray(p))), [JSON.stringify(points)]);
  return <mesh castShadow><tubeGeometry args={[curve, 36, radius, 8, false]} /><meshStandardMaterial color={color} roughness={0.72} /></mesh>;
}
function Dial({ position, radius = 0.03 }: { position: [number, number, number]; radius?: number }) {
  return <group position={position} rotation={[Math.PI / 2, 0, 0]}>
    <mesh><cylinderGeometry args={[radius, radius, 0.016, 24]} /><meshStandardMaterial color="#b8c1c4" metalness={0.9} roughness={0.2} /></mesh>
    <mesh position={[0, 0.009, 0]}><cylinderGeometry args={[radius * 0.82, radius * 0.82, 0.003, 24]} /><meshStandardMaterial color="#eef0e7" /></mesh>
    <mesh position={[0, 0.012, 0]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.003, 0.003, radius * 1.25]} /><meshStandardMaterial color="#c72920" /></mesh>
  </group>;
}
function Housing({ size, color, position = [0, 0, 0] }: { size: [number, number, number]; color: string; position?: [number, number, number] }) {
  return <RoundedBox args={size} radius={Math.min(...size) * 0.12} smoothness={3} position={position} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.34} metalness={0.36} />
  </RoundedBox>;
}

/** Dimensioned visual approximations, shared by product cards and configured equipment. */
export function WorkshopVacuum({ item, onSelect }: Props) {
  const [w, h, d] = item.size;
  const r = Math.min(w, d) * (item.productId.includes('reel') ? 0.24 : 0.34);
  return <group position={item.position} onClick={e => { e.stopPropagation(); onSelect(); }}>
    <mesh position={[0, -h * 0.02, 0]} castShadow><cylinderGeometry args={[r, r * 0.96, h * 0.58, 40]} /><meshStandardMaterial color="#ccd4d6" metalness={0.94} roughness={0.2} /></mesh>
    {[-0.31, 0.27].map(y => <mesh key={y} position={[0, h * y, 0]}><cylinderGeometry args={[r * 1.035, r * 1.035, 0.018, 40]} /><meshStandardMaterial color={rubber} roughness={0.6} /></mesh>)}
    <Housing size={[r * 2, h * 0.19, r * 1.85]} color={rubber} position={[0, h * 0.35, 0]} />
    <Housing size={[r * 1.05, 0.035, 0.045]} color={rubber} position={[0, h * 0.47, 0]} />
    {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}${z}`} position={[x * r, -h * 0.43, z * r * 0.8]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[h * 0.06, h * 0.06, 0.04, 16]} /><meshStandardMaterial color={rubber} roughness={0.8} />
    </mesh>))}
    {[-1, 1].map(x => <Housing key={x} size={[0.025, h * 0.12, 0.035]} color="#c5ced2" position={[x * r, h * 0.24, 0]} />)}
    <mesh position={[0, h * 0.14, -r]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.05, 24]} /><meshStandardMaterial color={rubber} /></mesh>
    <Hose radius={0.023} points={[[0,h*.14,-r],[w*.42,-h*.14,-d*.32],[w*.35,-h*.4,d*.25],[-w*.3,-h*.4,d*.3],[-w*.37,-h*.2,-d*.24]]} />
    <Housing size={[0.045, 0.025, 0.035]} color="#d53229" position={[r * 0.6, h * 0.44, 0]} />
    {item.productId.includes('reel') && <group position={[w * 0.24, h * 0.08, d * 0.24]}>
      <mesh rotation={[Math.PI / 2,0,0]}><cylinderGeometry args={[Math.min(h*.26,w*.21),Math.min(h*.26,w*.21),d*.22,32]} /><meshStandardMaterial color={rubber} roughness={0.7} /></mesh>
      {[-1,1].map(s => <mesh key={s} position={[0,0,s*d*.13]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[Math.min(h*.3,w*.24),Math.min(h*.3,w*.24),.018,32]} /><meshStandardMaterial color="#68767c" metalness={.8} roughness={.3} /></mesh>)}
    </group>}
  </group>;
}

export function WorkshopCompressor({ item, onSelect }: Props) {
  const [w,h,d] = item.size;
  const dual = !item.productId.startsWith('compressor_24');
  return <group position={item.position} onClick={e => { e.stopPropagation(); onSelect(); }}>
    {(dual ? [-1, 1] : [0]).map(x => <group key={x} position={[x*w*.23,-h*.18,0]} rotation={[Math.PI/2,0,0]}>
      <mesh castShadow><capsuleGeometry args={[Math.min(w*(dual ? .19 : .35),h*.25),d*.55,8,24]} /><meshStandardMaterial color="#454e52" metalness={.68} roughness={.3} /></mesh>
    </group>)}
    <Housing size={[w*.83,.035,d*.8]} color="#252f33" position={[0,-h*.02,0]} />
    {[-1,1].map(x => <group key={x} position={[x*w*.22,h*.16,0]}>
      <Housing size={[w*.32,h*.35,d*.42]} color="#242c31" />
      {Array.from({length:7},(_,i)=><mesh key={i} position={[0,h*(-.12+i*.04),0]} castShadow><boxGeometry args={[w*.35,.009,d*.46]} /><meshStandardMaterial color="#a3afb4" metalness={.82} roughness={.32} /></mesh>)}
    </group>)}
    <Housing size={[w*.76,.03,.035]} color="#89979e" position={[0,h*.43,d*.2]} />
    {[-1,1].map(x=><Housing key={x} size={[.025,h*.36,.035]} color="#89979e" position={[x*w*.36,h*.25,d*.2]} />)}
    <Dial position={[-w*.15,h*.14,-d*.32]} radius={Math.min(.035,w*.08)} />
    <Dial position={[w*.05,h*.14,-d*.32]} radius={Math.min(.03,w*.07)} />
    <Housing size={[w*.18,h*.13,d*.14]} color="#c42c26" position={[w*.29,h*.06,-d*.31]} />
    <Hose radius={.008} color="#b5904f" points={[[-w*.24,h*.15,0],[-w*.35,h*.05,-d*.32],[w*.24,-h*.08,-d*.32],[w*.24,-h*.2,0]]} />
    {[-1,1].flatMap(x=>[-1,1].map(z=><Housing key={`${x}${z}`} size={[.06,.045,.07]} color={rubber} position={[x*w*.34,-h*.46,z*d*.34]} />))}
  </group>;
}

export function CableReel({ item, onSelect }: Props) {
  const [w,h,d] = item.size;
  return <group position={item.position} onClick={e=>{e.stopPropagation();onSelect();}}>
    <Housing size={[w*.92,h*.88,d*.82]} color="#b7c1c6" />
    <mesh rotation={[Math.PI/2,0,0]} position={[0,0,-d*.42]}><cylinderGeometry args={[w*.36,w*.36,.03,40]} /><meshStandardMaterial color="#20272c" roughness={.5} /></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,0,-d*.445]}><cylinderGeometry args={[w*.2,w*.2,.035,32]} /><meshStandardMaterial color="#d4dcdf" metalness={.5} roughness={.32} /></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,0,-d*.47]}><cylinderGeometry args={[w*.09,w*.09,.012,24]} /><meshStandardMaterial color="#c32c26" /></mesh>
    <Housing size={[w*.3,.025,d*.6]} color="#354149" position={[0,h*.47,0]} />
    <Hose radius={.009} points={[[w*.35,-h*.1,0],[w*.44,-h*.36,0],[w*.24,-h*.46,-d*.15]]} />
    <Housing size={[.025,.045,.03]} color={rubber} position={[w*.24,-h*.44,-d*.15]} />
  </group>;
}

export function ProductSet({ item, onSelect }: Props) {
  const [w,h,d] = item.size;
  const machine = ['steamer','extractor'].includes(item.productId);
  const tools = item.productId === 'set_tools' || item.productId === 'set_tools_products';
  const products = item.productId !== 'set_tools';
  return <group position={item.position} onClick={e=>{e.stopPropagation();onSelect();}}>
    <Housing size={[w*.94,h*.72,d*.94]} color={machine ? '#346d92' : '#252d34'} position={[0,-h*.1,0]} />
    <Housing size={[w*.5,.03,.04]} color="#a3b0b7" position={[0,h*.42,0]} />
    {machine ? <>
      <Dial position={[-w*.2,h*.15,-d*.48]} />
      <Hose radius={.018} points={[[w*.24,0,-d*.4],[w*.46,-h*.2,-d*.45],[0,-h*.42,-d*.45],[-w*.42,-h*.3,0],[-w*.3,h*.25,0]]} />
      {[-1,1].map(x=><mesh key={x} position={[x*w*.36,-h*.39,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[h*.095,h*.095,.035,20]} /><meshStandardMaterial color={rubber} /></mesh>)}
    </> : <>
      {products && (tools ? [-.32,-.1] : [-.32,-.1,.12,.34]).map((x,i)=><group key={i} position={[x*w,h*.17,0]}>
      <mesh castShadow><cylinderGeometry args={[w*.07,w*.085,h*.36,16]} /><meshStandardMaterial color={['#e6edf0','#46b7cb','#d6b648','#edede7'][i]} roughness={.35} /></mesh>
      <Housing size={[w*.08,h*.075,.025]} color={rubber} position={[0,h*.22,0]} />
      <Housing size={[w*.13,.018,.025]} color={rubber} position={[w*.025,h*.26,0]} />
      </group>)}
      {tools && <group position={[w*(products ? .24 : 0),h*.35,0]}>
        <Housing size={[w*.18,h*.16,d*.7]} color="#b22625" />
        <Housing size={[w*.16,h*.1,d*.4]} color={rubber} position={[0,h*.02,d*.12]} />
        <mesh position={[0,-h*.08,-d*.22]}><cylinderGeometry args={[w*.13,w*.13,.025,28]} /><meshStandardMaterial color="#e4b934" roughness={.85} /></mesh>
        <Housing size={[w*.07,h*.16,.025]} color={rubber} position={[w*.12,0,0]} />
        <Hose radius={.005} points={[[0,0,d*.32],[w*.2,-h*.03,d*.35],[w*.2,-h*.12,-d*.3],[-w*.1,-h*.12,-d*.3]]} />
        {[-1,1].map(x=><group key={x} position={[x*w*.26,-h*.06,0]}>
          <Housing size={[w*.035,h*.06,d*.55]} color="#c62d2d" />
          <Housing size={[w*.07,h*.11,d*.15]} color="#b1a48b" position={[0,h*.04,-d*.2]} />
        </group>)}
      </group>}
    </>}
  </group>;
}

export function LiningSample({ item }: Props) {
  return <Housing size={[.7,.035,.55]} color={item.productId === 'lining_aluminium' ? '#9baab3' : '#333c42'} position={[0,.0175,0]} />;
}
