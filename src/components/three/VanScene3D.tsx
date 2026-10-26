import GeneratedVan from './GeneratedVan';
import { useMemo, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Lightformer, useProgress } from '@react-three/drei';
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
  cameraRevision?: number;
  zoomStep?: number;
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

function CameraController({ preset, space, presentationMode, revision = 0 }: {
  preset: CameraPreset; space: CargoSpaceMeters; presentationMode: boolean; revision?: number;
}) {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const { length: L, width: W, height: H } = space;
  useEffect(() => {
    const targets: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
      rear: { pos: [0, H * 0.7, -L * 1.4], look: [0, H * 0.34, -L * 0.25] },
      overview: {
        pos: [W * (presentationMode ? 2.5 : 2.05), H * 1.32, -L * 1.3],
        look: [0, H * 0.41, L * 0.12],
      },
      left: { pos: [-W * 3.8, H * 1.0, L * 0.28], look: [0, H * 0.40, L * 0.28] },
      right: { pos: [W * 3.8, H * 1.0, L * 0.28], look: [0, H * 0.40, L * 0.28] },
      top: { pos: [0.001, L * 2.8, L * 0.28], look: [0, 0, L * 0.28] },
    };
    const next = targets[preset];
    camera.position.set(...next.pos);
    if (controls) {
      controls.target.set(...next.look);
      controls.update();
    } else camera.lookAt(...next.look);
  }, [preset, L, W, H, camera, controls, presentationMode, revision]);
  return null;
}

function ZoomController({ step = 0 }: { step?: number }) {
  const { camera, invalidate } = useThree();
  const controls = useThree(s => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const previous = useRef(step);
  useEffect(() => {
    const delta = step - previous.current;
    previous.current = step;
    if (!controls || !delta) return;
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(offset.length() * Math.pow(0.82, delta), 1.2, 24);
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update(); invalidate();
  }, [step, camera, controls, invalidate]);
  return null;
}

function CaptureBridge({ onCaptureReady }: {
  onCaptureReady: (capture: (() => string | null) | null) => void;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const capture = (): string | null => {
      try {
        if (useProgress.getState().active || useProgress.getState().errors.length) return null;
        gl.render(scene, camera);
        const image = gl.domElement.toDataURL('image/jpeg', 0.92);
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

function RendererMetrics() {
  const { gl, camera, invalidate } = useThree();
  const controls = useThree(s => s.controls) as { autoRotate: boolean; update: () => void } | null;
  const enabled = import.meta.env.DEV && new URLSearchParams(location.search).has('qa');
  useEffect(() => {
    if (!enabled || !controls) return;
    const start = () => {
      const target = window as unknown as { __rs3d?: { frames: number[] } };
      if (target.__rs3d) target.__rs3d.frames = [];
      controls.autoRotate = true; controls.update(); invalidate();
    };
    const stop = () => { controls.autoRotate = false; };
    window.addEventListener('rs-profile-start', start);
    window.addEventListener('rs-profile-stop', stop);
    return () => { window.removeEventListener('rs-profile-start', start); window.removeEventListener('rs-profile-stop', stop); };
  }, [enabled, controls, invalidate]);
  useFrame((_, delta) => {
    if (!enabled) return;
    const target = window as unknown as { __rs3d?: { frames: number[]; calls: number; triangles: number; camera: number[]; programs: number } };
    target.__rs3d ??= { frames: [], calls: 0, triangles: 0, camera: [], programs: 0 };
    const m = target.__rs3d;
    m.frames.push(delta * 1000);
    if (m.frames.length > 1800) m.frames.shift();
    m.calls = gl.info.render.calls;
    m.triangles = gl.info.render.triangles;
    m.programs = gl.info.programs?.length ?? 0;
    m.camera = camera.position.toArray();
  });
  return null;
}

function SceneContent(props: Props) {
  const loading = useProgress(s => s.active);
  const {
    space, placements, liningVariant, selectedProductId, onSelectProduct,
    cameraPreset, presentationMode = false, onCaptureReady, vanSettings,
  } = props;
  return (
    <>
      <RendererMetrics />
      <color attach="background" args={[presentationMode ? '#242b33' : '#151c26']} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={3} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 4, 1]} />
        <Lightformer intensity={2} position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer intensity={2} position={[4, 3, -4]} rotation={[0, -Math.PI / 4, 0]} scale={[3, 5, 1]} />
      </Environment>
      <hemisphereLight intensity={1.35} color="#e6f2ff" groundColor="#344350" />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3.5, 7, -5]} intensity={2.3} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-bias={-0.0002} />
      <directionalLight position={[-5, 3.5, 2.5]} color="#a6d8ff" intensity={1.0} />
      <directionalLight position={[0, 4.2, 6]} color="#ffebd5" intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.64, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#222932" roughness={0.74} metalness={0.04} />
      </mesh>
      <CargoShell space={space} liningVariant={liningVariant} presentationMode={presentationMode} />
      {space.vehicleCategory === 'trailer' ? <VanBody3D
        space={space}
        settings={vanSettings ?? {
          body: 'transparent',
          roofVisible: true,
          doorsOpen: true,
        }}
      /> : <Suspense fallback={null}><GeneratedVan space={space} settings={vanSettings ?? { body: 'transparent', roofVisible: true, doorsOpen: true }} /></Suspense>}
      {placements.map(item => (
        <ProductMeshSwitcher
          key={item.productId}
          item={item}
          selected={selectedProductId === item.productId}
          onSelect={() => onSelectProduct(selectedProductId === item.productId ? null : item.productId)}
        />
      ))}
      <ContactShadows key={placements.map(i => i.productId).join() + loading} frames={1} position={[0, -0.63, 0]} opacity={0.42} scale={12} blur={2.3} far={4} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        minDistance={1.2} maxDistance={24} maxPolarAngle={Math.PI * 0.49}
        />
      <CameraController preset={cameraPreset} space={space} presentationMode={presentationMode} revision={props.cameraRevision} />
      <ZoomController step={props.zoomStep} />
      {onCaptureReady && <CaptureBridge onCaptureReady={onCaptureReady} />}
    </>
  );
}

export default function VanScene3D(props: Props) {
  return (
    <Canvas shadows frameloop="demand" dpr={[1, 1.5]}
      camera={{ position: [0, 1.7, -4], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, preserveDrawingBuffer: Boolean(props.onCaptureReady), powerPreference: 'high-performance' }}
      onPointerMissed={() => props.onSelectProduct(null)}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <Suspense fallback={null}><SceneContent {...props} /></Suspense>
    </Canvas>
  );
}
