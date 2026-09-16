import { useMemo, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSpaceMeters, PlacedItem } from '../../types';
import { ProductMeshSwitcher } from './DetailModels';

export type CameraPreset = 'overview' | 'left' | 'right' | 'rear' | 'top';

interface Props {
  space: CargoSpaceMeters;
  placements: PlacedItem[];
  liningVariant: string;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
  cameraPreset: CameraPreset;
}

function CargoShell({ space, liningVariant }: { space: CargoSpaceMeters; liningVariant: string }) {
  const { length: L, width: W, height: H } = space;
  const wallT = 0.04;
  const isAlu = liningVariant === 'aluminium';
  const isFabric = liningVariant === 'fabric';
  const matFloor = useMemo(() => new THREE.MeshStandardMaterial({ color: isAlu ? '#9ca3af' : isFabric ? '#1c1917' : '#3f3a36', roughness: isAlu ? 0.4 : 0.9, metalness: isAlu ? 0.65 : 0.05 }), [isAlu, isFabric]);
  const matWall = useMemo(() => new THREE.MeshStandardMaterial({ color: isAlu ? '#a8b0b8' : isFabric ? '#292524' : '#c5ccd4', roughness: isAlu ? 0.45 : isFabric ? 0.95 : 0.75, metalness: isAlu ? 0.55 : 0.1 }), [isAlu, isFabric]);
  const matCeil = useMemo(() => new THREE.MeshStandardMaterial({ color: isFabric ? '#44403c' : '#dce1e6', roughness: 0.85 }), [isFabric]);
  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: isAlu ? '#94a3b8' : isFabric ? '#1c1917' : '#6b7280', metalness: isAlu ? 0.5 : 0.25, roughness: 0.5, side: THREE.DoubleSide }), [isAlu, isFabric]);

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[W, L]} /><primitive object={matFloor} attach="material" /></mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow><boxGeometry args={[wallT, H, L]} /><primitive object={matWall} attach="material" /></mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow><boxGeometry args={[wallT, H, L]} /><primitive object={matWall} attach="material" /></mesh>
      <mesh position={[0, H / 2, L / 2]} receiveShadow><boxGeometry args={[W, H, wallT]} /><primitive object={matWall} attach="material" /></mesh>
      <mesh position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[W, L]} /><primitive object={matCeil} attach="material" /></mesh>
      <mesh position={[-W / 2 - 0.15, H / 2, -L / 2]} rotation={[0, Math.PI * 0.55, 0]}><boxGeometry args={[W * 0.48, H * 0.95, 0.04]} /><primitive object={doorMat} attach="material" /></mesh>
      <mesh position={[W / 2 + 0.15, H / 2, -L / 2]} rotation={[0, -Math.PI * 0.55, 0]}><boxGeometry args={[W * 0.48, H * 0.95, 0.04]} /><primitive object={doorMat} attach="material" /></mesh>
      <mesh position={[-W / 2 + 0.2, 0.18, -L * 0.1]}><boxGeometry args={[0.35, 0.35, 0.7]} /><meshStandardMaterial color="#5c6570" roughness={0.85} /></mesh>
      <mesh position={[W / 2 - 0.2, 0.18, -L * 0.1]}><boxGeometry args={[0.35, 0.35, 0.7]} /><meshStandardMaterial color="#5c6570" roughness={0.85} /></mesh>
    </group>
  );
}

function CameraController({ preset, space }: { preset: CameraPreset; space: CargoSpaceMeters }) {
  const { camera, controls } = useThree() as { camera: THREE.Camera; controls: { target: THREE.Vector3; update: () => void } | null };
  const { length: L, width: W, height: H } = space;
  useEffect(() => {
    const targets: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
      rear: { pos: [0, H * 0.75, -L * 1.55], look: [0, H * 0.4, -L * 0.1] },
      overview: { pos: [W * 1.35, H * 1.25, -L * 1.0], look: [0, H * 0.35, 0] },
      left: { pos: [-W * 1.55, H * 0.7, -L * 0.2], look: [0, H * 0.4, 0] },
      right: { pos: [W * 1.55, H * 0.7, -L * 0.2], look: [0, H * 0.4, 0] },
      top: { pos: [0, H * 2.5, 0.01], look: [0, 0, 0] },
    };
    const t = targets[preset];
    camera.position.set(...t.pos);
    if (controls) { controls.target.set(...t.look); controls.update(); }
    else if ('lookAt' in camera) (camera as THREE.PerspectiveCamera).lookAt(...t.look);
  }, [preset, space.length, space.width, space.height, camera, controls]);
  return null;
}

function SceneContent(props: Props) {
  const { space, placements, liningVariant, selectedProductId, onSelectProduct, cameraPreset } = props;
  return (
    <>
      <color attach="background" args={['#0f1218']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, -2]} intensity={0.9} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 4, 2]} intensity={0.3} />
      <CargoShell space={space} liningVariant={liningVariant} />
      {placements.map((p) => (
        <ProductMeshSwitcher key={p.productId} item={p} selected={selectedProductId === p.productId} onSelect={() => onSelectProduct(selectedProductId === p.productId ? null : p.productId)} />
      ))}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2.5} far={5} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1.2} maxDistance={14} maxPolarAngle={Math.PI * 0.48} target={[0, space.height * 0.35, -space.length * 0.1]} />
      <CameraController preset={cameraPreset} space={space} />
    </>
  );
}

export default function VanScene3D(props: Props) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.5, -4], fov: 42, near: 0.1, far: 50 }} gl={{ antialias: true, powerPreference: 'high-performance' }} onPointerMissed={() => props.onSelectProduct(null)} style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <Suspense fallback={null}><SceneContent {...props} /></Suspense>
    </Canvas>
  );
}
