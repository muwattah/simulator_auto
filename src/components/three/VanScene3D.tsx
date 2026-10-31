import MountingPanels from './MountingPanels';
import { makeCheckerPlateTexture } from './surfaceMaterials';
import { isDoorZone, mountingPanels } from '../../lib/doorMounts';
import { useMemo, useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useProgress, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSpaceMeters, PlacedItem } from '../../types';
import { setupBounds } from '../../lib/setupPresentation';
import { ProductMeshSwitcher } from './DetailModels';
import { generatedModelFor } from './GeneratedEquipment';
import GeneratedVan from './GeneratedVan';
import StudioLighting from './StudioLighting';
import type { VanViewSettings } from './VanBody3D';
import { useFrame } from '@react-three/fiber';

export type CameraPreset = 'overview' | 'left' | 'right' | 'rear' | 'top' | 'front';
interface Props {
  space: CargoSpaceMeters;
  placements: PlacedItem[];
  liningVariant: string;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
  cameraPreset: CameraPreset;
  cameraRevision?: number;
  zoomStep?: number;
  presentationMode?: boolean;
  productPreview?: boolean;
  floatValve?: boolean;
  vanSettings?: VanViewSettings;
  onCaptureReady?: (capture: (() => string | null) | null) => void;
}


function Platform({ space, items, studio, lining }: { space: CargoSpaceMeters; items: PlacedItem[]; studio: boolean; lining: string }) {
  const bounds = useMemo(() => setupBounds(items.filter(i=>!isDoorZone(i.zone))), [items]);
  const tread = useMemo(makeCheckerPlateTexture, []);
  useEffect(() => () => tread.dispose(), [tread]);
  const width = studio ? bounds.size[0] + 0.16 : space.width;
  const depth = studio ? bounds.size[2] + 0.16 : space.length;
  const center: [number, number, number] = studio ? [bounds.center[0], -0.045, bounds.center[2]] : [0, -0.022, 0];
  return <group position={center} name={studio ? 'presentation-skid' : 'cargo-lining'}>
    <RoundedBox args={[width, studio ? 0.09 : 0.035, depth]} radius={0.015} smoothness={2} receiveShadow castShadow>
      <meshStandardMaterial color={lining === 'aluminium' ? '#a3adb5' : '#292f35'}
        map={lining === 'aluminium' ? tread : null} roughness={lining === 'aluminium' ? 0.36 : 0.87} metalness={lining === 'aluminium' ? 0.72 : 0.08} />
    </RoundedBox>
    {studio && [-1, 1].map(side => <mesh key={side} position={[side * width / 2, 0, 0]} castShadow>
      <boxGeometry args={[0.025, 0.11, depth]} /><meshStandardMaterial color="#151b20" metalness={0.7} roughness={0.32} />
    </mesh>)}
  </group>;
}

function CameraController({ props }: { props: Props }) {
  const { camera, invalidate, size } = useThree();
  const controls = useThree(s => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const { length: L, width: W, height: H } = props.space;
  const boundsKey = JSON.stringify(props.placements.map(i => [i.position, i.size]));
  useEffect(() => {
    let pos: number[], look: number[];
    if (props.presentationMode || props.productPreview) {
      const b = setupBounds(props.presentationMode ? [...props.placements,...mountingPanels(props.placements,true)] : props.placements);
      const radius = new THREE.Vector3(...b.size).length() / 2;
      const fov = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
      const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * size.width / size.height));
      const distance = Math.max(0.6, radius / Math.sin(fit / 2) * (props.productPreview ? 1.18 : 1.04));
      const direction = new THREE.Vector3(1.15, 0.82, -1.45).normalize().multiplyScalar(distance);
      look = b.center; pos = direction.add(new THREE.Vector3(...look)).toArray();
    } else {
      const presets = {
        rear: { pos: [0, H * 0.75, -L * 2.1], look: [0, H * 0.45, -L * 0.25] },
        overview: { pos: [W * 1.9, H * 1.2, -L * 1.9], look: [0, H * 0.4, 0.25] },
        front: { pos: [W*1.7,H*.9,L*2.8], look:[0,.3,L*.65] },
        left: { pos: [W * 4.4, H, L * 0.4], look: [0, H * 0.4, L * 0.28] },
        right: { pos: [-W*4.4,H*.95,.68], look:[0,.65,.68] },
        top: { pos: [0.001, L * 2.8, L * 0.28], look: [0, 0, L * 0.28] },
      };
      ({ pos, look } = presets[props.cameraPreset]);
      // Portrait viewports need more distance to contain the complete van.
      if (size.width / size.height < 1.3 && props.cameraPreset === 'overview') {
        const target = new THREE.Vector3(...look);
        pos = new THREE.Vector3(...pos).sub(target).multiplyScalar(Math.max(1, 1.3 / (size.width / size.height))).add(target).toArray();
      }
    }
    camera.position.set(pos[0], pos[1], pos[2]);
    if (controls) { controls.target.set(look[0], look[1], look[2]); controls.update(); }
    else camera.lookAt(look[0], look[1], look[2]);
    invalidate();
  }, [props.cameraPreset, props.cameraRevision, props.presentationMode, props.productPreview,
    props.presentationMode || props.productPreview ? boundsKey : '', L, W, H, size.width, size.height, camera, controls, invalidate]);
  return null;
}

function ZoomController({ step = 0 }: { step?: number }) {
  const { camera, invalidate } = useThree();
  const controls = useThree(s => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const previous = useRef(step);
  useEffect(() => {
    const delta = step - previous.current; previous.current = step;
    if (!controls || !delta) return;
    const offset = camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).add(offset.setLength(THREE.MathUtils.clamp(offset.length() * Math.pow(0.82, delta), 0.4, 24)));
    controls.update(); invalidate();
  }, [step, camera, controls, invalidate]);
  return null;
}

function CaptureBridge({ ready, items }: { ready: NonNullable<Props['onCaptureReady']>; items: PlacedItem[] }) {
  const { gl, scene, camera } = useThree();
  const ids = items.map(i => i.productId).join();
  useEffect(() => {
    const capture = () => {
      if (useProgress.getState().active || items.some(item => !scene.getObjectByName('product:' + item.productId))) return null;
      for (const item of items) if (generatedModelFor(item.productId) && !scene.getObjectByName('asset:' + item.productId)) return null;
      try { gl.render(scene, camera); return gl.domElement.toDataURL('image/jpeg', 0.92); }
      catch { return null; }
    };
    ready(capture); return () => ready(null);
  }, [gl, scene, camera, ready, ids]);
  return null;
}

function RendererMetrics() {
  const { gl, camera, invalidate, scene } = useThree();
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
    const doorPositions: Record<string,number[]>={};
    scene.traverse(node=>{if(node.userData.doorMounted)doorPositions[node.name.replace('product:','')]=node.getWorldPosition(new THREE.Vector3()).toArray();});
    (window as unknown as {__rsDoorMounts:Record<string,number[]>}).__rsDoorMounts=doorPositions;
    const sliding=scene.getObjectByName('SlidingDoor_right_Group');
    if(sliding)(window as unknown as {__rsSlidingDoor:number[]}).__rsSlidingDoor=sliding.getWorldPosition(new THREE.Vector3()).toArray();
  });
  return null;
}

function SceneContent(props: Props) {
  const loading = useProgress(s => s.active);
  const studio = Boolean(props.presentationMode), product = Boolean(props.productPreview);
  const floor = studio ? -0.10 : product ? -0.012 : -0.575;
  return <>
    {!studio && !product && <RendererMetrics />}
    <StudioLighting light={studio} floorY={floor} room={!product} />
    {!product && <Platform space={props.space} items={props.placements} studio={studio} lining={props.liningVariant} />}
    {!studio && !product && <Suspense fallback={null}>
      <GeneratedVan space={props.space} settings={props.vanSettings ?? { body: 'solid', roofVisible: true, doorsOpen: true, sideDoorOpen:true }}
        liningVariant={props.liningVariant} mountItems={props.placements.filter(item => isDoorZone(item.zone) && item.zone !== 'rightSideAccess')} selectedProductId={props.selectedProductId} onSelectProduct={props.onSelectProduct} />
    </Suspense>}
    {!product && <MountingPanels items={props.placements} studio={studio} />}
    <group name="configured-equipment">
      {props.placements.filter(item => studio || product || (!isDoorZone(item.zone) || item.zone === 'rightSideAccess')).map(item => <group key={item.productId} name={'product:' + item.productId} userData={{doorMounted:isDoorZone(item.zone)}} rotation={[0,item.rotationY ?? 0,0]} position={item.position}>
        <ProductMeshSwitcher item={{...item,position:[0,0,0]}} selected={props.selectedProductId === item.productId}
          onSelect={() => props.onSelectProduct(props.selectedProductId === item.productId ? null : item.productId)} />
        {props.floatValve && item.productId.startsWith('tank_') && <group position={[item.size[0] * .48, item.size[1] * .3, 0]}>
          <mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.022,.022,.07,16]} /><meshStandardMaterial color="#b8964e" metalness={.85} roughness={.28} /></mesh>
          <mesh position={[.045,0,0]}><boxGeometry args={[.015,.065,.015]} /><meshStandardMaterial color="#b8964e" metalness={.85} roughness={.28} /></mesh>
          <mesh position={[.045,.035,0]}><boxGeometry args={[.06,.012,.018]} /><meshStandardMaterial color="#bc3025" /></mesh>
        </group>}
      </group>)}
    </group>
    <ContactShadows key={props.placements.map(i => i.productId).join() + loading} frames={1}
      position={[0, floor + 0.002, 0]} opacity={studio ? 0.58 : 0.42} scale={12} blur={2.2} far={4} resolution={256} />
    <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={product ? 0.25 : 1.2} maxDistance={24} maxPolarAngle={Math.PI * 0.49} />
    <CameraController props={props} /><ZoomController step={props.zoomStep} />
    {props.onCaptureReady && <CaptureBridge ready={props.onCaptureReady} items={props.placements} />}
  </>;
}
/**
 * Chrome on iOS and Safari share WebKit but can have different GPU budgets and
 * renderer recovery behaviour. Reduce framebuffer pressure on Chrome/iPhone,
 * and offer an explicit retry when WebGL drops its context.
 */
const iosChrome = typeof navigator !== 'undefined' &&
  /(?:CriOS|FxiOS|EdgiOS)/.test(navigator.userAgent) &&
  /(?:iPhone|iPad|iPod)/.test(navigator.userAgent);

export default function VanScene3D(props: Props) {
  const [restart, setRestart] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => { cleanup.current?.(); cleanup.current = null; }, []);

  const restartRenderer = () => {
    cleanup.current?.();
    cleanup.current = null;
    setContextLost(false);
    setRestart(value => value + 1);
  };
  const simple = iosChrome || contextLost;
  return <div className="relative w-full h-full">
    {contextLost && <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[var(--bg-secondary)]/95 p-5 text-center">
      <p className="text-sm text-[var(--text-primary)]">De 3D-weergave is onderbroken door de browser.</p>
      <button type="button" className="btn-primary" onClick={restartRenderer}>3D opnieuw laden</button>
    </div>}
    <Canvas key={restart} shadows={!simple} frameloop="demand" dpr={simple || props.presentationMode || props.productPreview ? 1 : [1, 1.5]}
      camera={{ position: [0, 1.7, -5], fov: 40, near: 0.05, far: 80 }}
      gl={{ antialias: !simple, preserveDrawingBuffer: Boolean(props.onCaptureReady),
        powerPreference: simple ? 'default' : 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => {
        cleanup.current?.();
        const canvas = gl.domElement;
        const lost = (event: Event) => {
          event.preventDefault();
          setContextLost(true);
          props.onCaptureReady?.(null);
        };
        const restored = () => {
          setContextLost(false);
          gl.setSize(canvas.clientWidth, canvas.clientHeight, false);
          gl.getContext().viewport(0, 0, canvas.width, canvas.height);
        };
        canvas.addEventListener('webglcontextlost', lost);
        canvas.addEventListener('webglcontextrestored', restored);
        cleanup.current = () => {
          canvas.removeEventListener('webglcontextlost', lost);
          canvas.removeEventListener('webglcontextrestored', restored);
        };
      }}
      onPointerMissed={() => props.onSelectProduct(null)}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <Suspense fallback={null}><SceneContent {...props} /></Suspense>
    </Canvas>
  </div>;
}
