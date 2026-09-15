/**
 * DEMO generic 3D cargo space — geometric assets only.
 * Architecture supports future GLB/GLTF via product.visual3D.modelUrl
 */
import { useMemo, useEffect, Suspense } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { ConfigurationItem, Product, CargoSpaceMeters } from '../../types';
import { products } from '../../data/demoData';
import { getCargoSpace, inferVisual3D } from '../../lib/vanDimensions';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type CameraPreset = 'overview' | 'left' | 'right' | 'rear' | 'top';

interface VanScene3DProps {
  items: ConfigurationItem[];
  vehicleVariantId: string | null;
  selectedProductId: string | null;
  onSelectProduct: (productId: string | null) => void;
  cameraPreset: CameraPreset;
  onPresetApplied?: () => void;
}

function CargoShell({ space }: { space: CargoSpaceMeters }) {
  const { length: L, width: W, height: H } = space;
  const wallT = 0.04;
  const matWall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c5ccd4', roughness: 0.75, metalness: 0.15 }), []);
  const matFloor = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3f3a36', roughness: 0.9, metalness: 0.05 }), []);
  const matCeil = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dce1e6', roughness: 0.8, metalness: 0.05 }), []);
  const matFront = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9aa3ad', roughness: 0.7, metalness: 0.2 }), []);
  const matWheel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5c6570', roughness: 0.85 }), []);
  const archZ = -L * 0.1;
  const archW = 0.35;
  const archH = 0.35;
  const archD = 0.7;
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, L]} />
        <primitive object={matFloor} attach="material" />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, H, L]} />
        <primitive object={matWall} attach="material" />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, H, L]} />
        <primitive object={matWall} attach="material" />
      </mesh>
      <mesh position={[0, H / 2, L / 2]} receiveShadow>
        <boxGeometry args={[W, H, wallT]} />
        <primitive object={matFront} attach="material" />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, L]} />
        <primitive object={matCeil} attach="material" />
      </mesh>
      <mesh position={[-W / 2 + archW / 2 + 0.02, archH / 2, archZ]}>
        <boxGeometry args={[archW, archH, archD]} />
        <primitive object={matWheel} attach="material" />
      </mesh>
      <mesh position={[W / 2 - archW / 2 - 0.02, archH / 2, archZ]}>
        <boxGeometry args={[archW, archH, archD]} />
        <primitive object={matWheel} attach="material" />
      </mesh>
      <mesh position={[0, H / 2, -L / 2]}>
        <boxGeometry args={[W + 0.02, H + 0.02, 0.03]} />
        <meshStandardMaterial color="#6b7280" metalness={0.3} roughness={0.6} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function ProductMesh({
  product, space, selected, onSelect, index,
}: {
  product: Product; space: CargoSpaceMeters; selected: boolean; onSelect: () => void; index: number;
}) {
  const visual = product.visual3D ?? inferVisual3D(product.id, product.categoryId, product.possiblePositions);
  if (visual.type === 'none') return null;
  const { length: L, width: W, height: H } = space;
  const highlight = selected ? '#2563eb' : undefined;
  const mat = useMemo(() => {
    const color = highlight ?? (visual.type === 'floor' ? '#5c4033' : visual.type === 'led' ? '#fef9c3' : visual.type === 'rail' ? '#71717a' : '#8b939e');
    return new THREE.MeshStandardMaterial({
      color, roughness: visual.type === 'led' ? 0.3 : 0.55, metalness: visual.type === 'led' ? 0.1 : 0.35,
      emissive: visual.type === 'led' ? '#fde68a' : '#000000', emissiveIntensity: visual.type === 'led' ? 0.45 : 0,
    });
  }, [visual.type, highlight]);
  let pos: [number, number, number] = [0, 0.3, 0];
  let size: [number, number, number] = [0.4, 0.4, 0.4];
  const w = visual.width ?? 0.45;
  const h = visual.height ?? 1.0;
  const d = visual.depth ?? 1.0;
  switch (visual.zone) {
    case 'floor': pos = [0, 0.02, 0]; size = [W * 0.98, 0.04, L * 0.98]; break;
    case 'leftWall': pos = [-W / 2 + w / 2 + 0.03, h / 2, -L * 0.15 + (index % 3) * 0.15]; size = [w, Math.min(h, H * 0.9), Math.min(d, L * 0.55)]; break;
    case 'rightWall': pos = [W / 2 - w / 2 - 0.03, h / 2, -L * 0.15 + (index % 3) * 0.15]; size = [w, Math.min(h, H * 0.9), Math.min(d, L * 0.55)]; break;
    case 'frontWall': pos = [0, H / 2, L / 2 - 0.06]; size = [W * 0.95, H * 0.95, 0.06]; break;
    case 'ceiling': pos = [0, H - 0.06, -L * 0.1]; size = [w, 0.05, Math.min(d, L * 0.7)]; break;
    case 'roof': pos = [0, H + 0.12, -L * 0.05]; size = [Math.min(w, W * 0.9), h, Math.min(d, L * 0.6)]; break;
    default: pos = [(index % 2 === 0 ? -1 : 1) * 0.25, h / 2, -L * 0.2]; size = [w, h, d];
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); };
  if (visual.type === 'cabinet' || visual.type === 'drawerUnit') {
    const [sw, sh, sd] = size;
    return (
      <group position={pos} onClick={handleClick}>
        <mesh castShadow receiveShadow><boxGeometry args={[sw, sh, sd]} /><primitive object={mat} attach="material" /></mesh>
        {[0.3, 0.55, 0.8].map((t) => (
          <mesh key={t} position={[0, -sh / 2 + sh * t, 0]}><boxGeometry args={[sw * 0.92, 0.02, sd * 0.92]} /><meshStandardMaterial color="#a1a1aa" metalness={0.4} roughness={0.5} /></mesh>
        ))}
        {selected && <mesh><boxGeometry args={[sw * 1.04, sh * 1.04, sd * 1.04]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} /></mesh>}
      </group>
    );
  }
  if (visual.type === 'workbench') {
    const [sw, sh, sd] = size;
    return (
      <group position={pos} onClick={handleClick}>
        <mesh position={[0, sh * 0.35, 0]} castShadow><boxGeometry args={[sw, sh * 0.7, sd]} /><meshStandardMaterial color="#78716c" metalness={0.3} roughness={0.6} /></mesh>
        <mesh position={[0, sh * 0.85, 0]} castShadow><boxGeometry args={[sw * 1.05, 0.06, sd * 1.05]} /><meshStandardMaterial color="#44403c" roughness={0.8} /></mesh>
        {selected && <mesh><boxGeometry args={[sw * 1.1, sh * 1.1, sd * 1.1]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} /></mesh>}
      </group>
    );
  }
  if (visual.type === 'floor') {
    return (<mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick} receiveShadow><planeGeometry args={[size[0], size[2]]} /><primitive object={mat} attach="material" /></mesh>);
  }
  if (visual.type === 'wallPanel') {
    return (<group onClick={handleClick}>
      <mesh position={[-W / 2 + 0.025, H / 2, 0]}><boxGeometry args={[0.03, H * 0.95, L * 0.9]} /><meshStandardMaterial color="#b45309" roughness={0.85} /></mesh>
      <mesh position={[W / 2 - 0.025, H / 2, 0]}><boxGeometry args={[0.03, H * 0.95, L * 0.9]} /><meshStandardMaterial color="#b45309" roughness={0.85} /></mesh>
    </group>);
  }
  if (visual.type === 'partition') {
    return (<mesh position={pos} onClick={handleClick} castShadow><boxGeometry args={size} /><meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} /></mesh>);
  }
  if (visual.type === 'rail') {
    return (<group onClick={handleClick}>
      <mesh position={[-W / 2 + 0.06, 0.35, 0]}><boxGeometry args={[0.04, 0.05, L * 0.85]} /><meshStandardMaterial color="#52525b" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[W / 2 - 0.06, 0.35, 0]}><boxGeometry args={[0.04, 0.05, L * 0.85]} /><meshStandardMaterial color="#52525b" metalness={0.6} roughness={0.35} /></mesh>
    </group>);
  }
  if (visual.type === 'led') {
    return (<group onClick={handleClick}>
      {[-0.25, 0.25].map((x, i) => (<mesh key={i} position={[x, H - 0.05, -L * 0.1]}><boxGeometry args={[0.06, 0.03, L * 0.6]} /><primitive object={mat} attach="material" /></mesh>))}
    </group>);
  }
  return (<mesh position={pos} onClick={handleClick} castShadow><boxGeometry args={size} /><primitive object={mat} attach="material" />
    {selected && <mesh><boxGeometry args={[size[0] * 1.08, size[1] * 1.08, size[2] * 1.08]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.55} /></mesh>}
  </mesh>);
}

function CameraController({ preset, space, onApplied }: { preset: CameraPreset; space: CargoSpaceMeters; onApplied?: () => void }) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const { length: L, width: W, height: H } = space;
  useEffect(() => {
    const targets: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
      overview: { pos: [W * 1.4, H * 1.3, -L * 0.9], look: [0, H * 0.35, 0] },
      left: { pos: [-W * 1.6, H * 0.7, 0], look: [0, H * 0.4, 0] },
      right: { pos: [W * 1.6, H * 0.7, 0], look: [0, H * 0.4, 0] },
      rear: { pos: [0, H * 0.8, -L * 1.4], look: [0, H * 0.4, 0] },
      top: { pos: [0, H * 2.4, 0.01], look: [0, 0, 0] },
    };
    const t = targets[preset];
    camera.position.set(...t.pos);
    if (controls) { controls.target.set(...t.look); controls.update(); }
    else camera.lookAt(...t.look);
    onApplied?.();
  }, [preset, space.length, space.width, space.height]);
  return null;
}

function SceneContent({
  items, space, selectedProductId, onSelectProduct, cameraPreset, onPresetApplied,
}: {
  items: ConfigurationItem[]; space: CargoSpaceMeters; selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void; cameraPreset: CameraPreset; onPresetApplied?: () => void;
}) {
  const productList = useMemo(() => items.map((item) => products.find((p) => p.id === item.productId)).filter((p): p is Product => !!p && p.active), [items]);
  return (
    <>
      <color attach="background" args={['#e8eef4']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 3]} intensity={0.85} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 4, -2]} intensity={0.25} />
      <CargoShell space={space} />
      {productList.map((p, i) => (
        <ProductMesh key={p.id} product={p} space={space} selected={selectedProductId === p.id}
          onSelect={() => onSelectProduct(selectedProductId === p.id ? null : p.id)} index={i} />
      ))}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={12} blur={2.5} far={4} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1.2} maxDistance={12} maxPolarAngle={Math.PI * 0.48} target={[0, space.height * 0.35, 0]} />
      <CameraController preset={cameraPreset} space={space} onApplied={onPresetApplied} />
    </>
  );
}

export default function VanScene3D({ items, vehicleVariantId, selectedProductId, onSelectProduct, cameraPreset, onPresetApplied }: VanScene3DProps) {
  const space = useMemo(() => getCargoSpace(vehicleVariantId), [vehicleVariantId]);
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [2.5, 2, -3.5], fov: 45, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelectProduct(null)}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <Suspense fallback={null}>
        <SceneContent items={items} space={space} selectedProductId={selectedProductId}
          onSelectProduct={onSelectProduct} cameraPreset={cameraPreset} onPresetApplied={onPresetApplied} />
      </Suspense>
    </Canvas>
  );
}
