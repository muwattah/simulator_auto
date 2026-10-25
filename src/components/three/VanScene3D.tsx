import { useMemo, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSpaceMeters, PlacedItem } from '../../types';
import { ProductMeshSwitcher } from './DetailModels';
import VanBody3D, { type VanViewSettings } from './VanBody3D';

export type CameraPreset = 'overview' | 'left' | 'right' | 'rear' | 'top';

interface Props {
  space: CargoSpaceMeters;
  placements: PlacedItem[];
  liningVariant: string;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
  cameraPreset: CameraPreset;
  /** Studio presentation is an open equipment platform, not an exact van model. */
  presentationMode?: boolean;
  vanSettings?: VanViewSettings;
  /** Receives a synchronous browser JPEG capture function once WebGL is ready. */
  onCaptureReady?: (capture: (() => string | null) | null) => void;
}

/** Texture drawn procedurally, so the simulation has no broken remote asset links. */
function makeCheckerPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#a1aab4';
  ctx.fillRect(0, 0, 256, 256);
  for (let x = -20; x < 280; x += 26) {
    for (let y = -20; y < 280; y += 30) {
      const offset = Math.floor(y / 30) % 2 ? 13 : 0;
      ctx.save();
      ctx.translate(x + offset, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#e3e8ee';
      ctx.fillRect(-9, -2.5, 18, 4);
      ctx.fillStyle = '#66737f';
      ctx.fillRect(-9, 2, 18, 1.5);
      ctx.restore();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function CargoShell({
  space,
  liningVariant,
  presentationMode = false,
}: {
  space: CargoSpaceMeters;
  liningVariant: string;
  presentationMode?: boolean;
}) {
  const { length: L, width: W, height: H } = space;
  const isAlu = liningVariant === 'aluminium';
  const isFabric = liningVariant === 'fabric';
  const treadTexture = useMemo(makeCheckerPlateTexture, []);
  useEffect(() => () => treadTexture.dispose(), [treadTexture]);

  const sideMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: isAlu ? '#aab4bf' : isFabric ? '#323942' : '#b5c0c9',
      metalness: isAlu ? 0.72 : 0.27,
      roughness: 0.48,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }), [isAlu, isFabric],
  );
  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#262d35', roughness: 0.53, metalness: 0.38 }),
    [],
  );
  const backMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#e3e7ed',
      map: treadTexture,
      roughness: 0.38,
      metalness: 0.68,
      side: THREE.DoubleSide,
    }), [treadTexture],
  );

  return (
    <group>
      {/* Steel skid: the configured installation stays visible from the rear. */}
      <mesh position={[0, -0.09, 0]} receiveShadow castShadow material={floorMaterial}>
        <boxGeometry args={[W + 0.18, 0.18, L + 0.16]} />
      </mesh>
      <mesh position={[0, 0.007, 0]} receiveShadow>
        <boxGeometry args={[W, 0.019, L]} />
        <meshStandardMaterial color={isAlu ? '#aeb8bf' : '#414b56'} metalness={0.55} roughness={0.48} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={'platform' + side} position={[side * (W + 0.12) / 2, -0.03, 0]} castShadow>
          <boxGeometry args={[0.055, 0.12, L + 0.18]} />
          <meshStandardMaterial color="#11171d" metalness={0.75} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, -0.03, -L / 2 - 0.085]}>
        <boxGeometry args={[W + 0.12, 0.12, 0.05]} />
        <meshStandardMaterial color="#11171d" metalness={0.8} roughness={0.24} />
      </mesh>

      {/* Rear wall/panel in studio mode; open and ghosted walls in van mode. */}
      <mesh position={[0, H * 0.46, L / 2 - 0.018]} receiveShadow material={backMaterial}>
        <boxGeometry args={[W * 0.9, H * 0.92, 0.035]} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={'upright-' + side} position={[side * W * 0.47, H * 0.5, L / 2 - 0.045]} castShadow>
          <boxGeometry args={[0.058, H, 0.07]} />
          <meshStandardMaterial color="#13191e" metalness={0.75} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, H, L / 2 - 0.05]} castShadow>
        <boxGeometry args={[W, 0.058, 0.07]} />
        <meshStandardMaterial color="#121820" metalness={0.75} roughness={0.34} />
      </mesh>

      {!presentationMode && (
        <>
          {[-1, 1].map(side => (
            <mesh key={'wall-' + side} position={[side * W / 2, H / 2, 0]} material={sideMaterial}>
              <boxGeometry args={[0.028, H, L]} />
            </mesh>
          ))}
          <mesh position={[0, H + 0.015, 0]}>
            <boxGeometry args={[W, 0.028, L]} />
            <meshStandardMaterial color="#9da7b3" transparent opacity={0.09} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          {[-1, 1].map(side => (
            <mesh key={'wheel-' + side} position={[side * (W / 2 - 0.16), 0.20, -L * 0.09]}>
              <boxGeometry args={[0.32, 0.35, 0.65]} />
              <meshStandardMaterial color="#4b5563" metalness={0.25} roughness={0.8} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function CameraController({ preset, space, presentationMode }: {
  preset: CameraPreset; space: CargoSpaceMeters; presentationMode: boolean;
}) {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const { length: L, width: W, height: H } = space;
  useEffect(() => {
    const targets: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
      rear: { pos: [0, H * 0.89, -L * 1.6], look: [0, H * 0.43, -L * 0.03] },
      overview: {
        pos: [W * (presentationMode ? 2.20 : 1.93), H * 1.53, -L * 1.37],
        look: [0, H * 0.40, L * 0.16],
      },
      left: { pos: [-W * 1.65, H * 0.92, -L * 0.38], look: [0, H * 0.40, 0] },
      right: { pos: [W * 1.65, H * 0.92, -L * 0.38], look: [0, H * 0.40, 0] },
      top: { pos: [0.001, H * 2.7, 0], look: [0, 0, 0] },
    };
    const next = targets[preset];
    camera.position.set(...next.pos);
    if (controls) {
      controls.target.set(...next.look);
      controls.update();
    } else camera.lookAt(...next.look);
  }, [preset, L, W, H, camera, controls, presentationMode]);
  return null;
}

function CaptureBridge({ onCaptureReady }: {
  onCaptureReady: (capture: (() => string | null) | null) => void;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const capture = (): string | null => {
      try {
        gl.render(scene, camera);
        const image = gl.domElement.toDataURL('image/jpeg', 0.78);
        return image.startsWith('data:image/jpeg;base64,') ? image : null;
      } catch {
        return null;
      }
    };
    onCaptureReady(capture);
    return () => onCaptureReady(null);
  }, [gl, scene, camera, onCaptureReady]);
  return null;
}

function SceneContent(props: Props) {
  const {
    space, placements, liningVariant, selectedProductId, onSelectProduct,
    cameraPreset, presentationMode = false, onCaptureReady, vanSettings,
  } = props;
  return (
    <>
      <color attach="background" args={[presentationMode ? '#242b33' : '#151c26']} />
      <hemisphereLight intensity={1.35} color="#e6f2ff" groundColor="#344350" />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3.5, 7, -5]} intensity={2.3} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-bias={-0.0002} />
      <directionalLight position={[-5, 3.5, 2.5]} color="#a6d8ff" intensity={1.0} />
      <directionalLight position={[0, 4.2, 6]} color="#ffebd5" intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.195, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#222932" roughness={0.74} metalness={0.04} />
      </mesh>
      <CargoShell space={space} liningVariant={liningVariant} presentationMode={presentationMode} />
      <VanBody3D
        space={space}
        settings={vanSettings ?? {
          body: 'transparent',
          roofVisible: true,
          doorsOpen: true,
        }}
      />
      {placements.map(item => (
        <ProductMeshSwitcher
          key={item.productId}
          item={item}
          selected={selectedProductId === item.productId}
          onSelect={() => onSelectProduct(selectedProductId === item.productId ? null : item.productId)}
        />
      ))}
      <ContactShadows position={[0, -0.18, 0]} opacity={0.42} scale={12} blur={2.3} far={4} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        minDistance={1.2} maxDistance={24} maxPolarAngle={Math.PI * 0.49}
        target={[0, space.height * 0.35, -space.length * 0.1]} />
      <CameraController preset={cameraPreset} space={space} presentationMode={presentationMode} />
      {onCaptureReady && <CaptureBridge onCaptureReady={onCaptureReady} />}
    </>
  );
}

export default function VanScene3D(props: Props) {
  return (
    <Canvas shadows dpr={[1.25, 2]}
      camera={{ position: [0, 1.7, -4], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, preserveDrawingBuffer: Boolean(props.onCaptureReady), powerPreference: 'high-performance' }}
      onPointerMissed={() => props.onSelectProduct(null)}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <Suspense fallback={null}><SceneContent {...props} /></Suspense>
    </Canvas>
  );
}
