import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlacedItem } from '../../types';
import { getProduct } from '../../data/detailingCatalog';

const metal = '#6b7280';
const darkMetal = '#374151';
const blueAccent = '#2563eb';
const tankBlue = '#1e3a5f';

function useHighlightMat(selected: boolean, base: string, metalness = 0.4, roughness = 0.45) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: selected ? '#3b82f6' : base,
        metalness,
        roughness,
        emissive: selected ? '#1d4ed8' : '#000000',
        emissiveIntensity: selected ? 0.15 : 0,
      }),
    [selected, base, metalness, roughness]
  );
}

export function TankMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const [w, h, d] = item.size;
  const body = useHighlightMat(selected, tankBlue, 0.25, 0.55);
  const band = useMemo(() => new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.6, roughness: 0.35 }), []);
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.5, roughness: 0.4 }), []);

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh castShadow receiveShadow material={body}>
        <boxGeometry args={[w * 0.92, h * 0.85, d * 0.92]} />
      </mesh>
      <mesh position={[0, h * 0.38, 0]} castShadow material={body}>
        <cylinderGeometry args={[Math.min(w, d) * 0.42, Math.min(w, d) * 0.45, h * 0.2, 16]} />
      </mesh>
      {[-0.2, 0.15].map((y, i) => (
        <mesh key={i} position={[0, y * h, 0]} material={band}>
          <boxGeometry args={[w * 0.96, 0.03, d * 0.96]} />
        </mesh>
      ))}
      <mesh position={[0, h * 0.52, d * 0.15]} material={cap}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
      </mesh>
      <mesh position={[w * 0.4, -h * 0.25, 0]} rotation={[0, 0, Math.PI / 2]} material={band}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.08, h * 1.08, d * 1.08]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

export function HoseReelMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  const variant = prod?.visual3D.variant ?? '';
  const isAir = variant.startsWith('air');
  const isPower = variant.startsWith('power');
  const isManual = variant.includes('manual');
  const [w] = item.size;
  const r = w * 0.45;
  const depth = Math.max(item.size[2], 0.14);
  const discColor = isAir ? '#0f766e' : isPower ? '#a16207' : '#1e40af';
  const hoseColor = isAir ? '#134e4a' : isPower ? '#713f12' : '#1e3a8a';
  const discMat = useHighlightMat(selected, discColor, 0.35, 0.4);
  const hoseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: hoseColor, roughness: 0.7, metalness: 0.1 }),
    [hoseColor]
  );
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: metal, metalness: 0.55, roughness: 0.4 }),
    []
  );

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh position={[0, 0, depth / 2]} material={discMat} castShadow>
        <cylinderGeometry args={[r, r, 0.03, 24]} />
      </mesh>
      <mesh position={[0, 0, -depth / 2]} material={discMat} castShadow>
        <cylinderGeometry args={[r, r, 0.03, 24]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat} castShadow>
        <cylinderGeometry args={[r * 0.45, r * 0.45, depth * 0.9, 16]} />
      </mesh>
      {[0.55, 0.7, 0.85].map((f, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} material={hoseMat}>
          <torusGeometry args={[r * f, isAir || isPower ? 0.018 : 0.025, 8, 24]} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
        <cylinderGeometry args={[0.025, 0.025, depth + 0.08, 8]} />
      </mesh>
      <mesh position={[0, -r * 0.9, 0]} material={frameMat}>
        <boxGeometry args={[r * 0.5, 0.06, depth * 0.8]} />
      </mesh>
      <mesh position={[0, -r * 1.15, 0]} material={frameMat}>
        <boxGeometry args={[r * 1.3, 0.04, 0.04]} />
      </mesh>
      {isManual && (
        <mesh position={[r * 0.9, 0, depth / 2 + 0.04]} material={frameMat}>
          <boxGeometry args={[0.08, 0.04, 0.04]} />
        </mesh>
      )}
      <mesh position={[0, r * 0.15, depth / 2 + 0.02]} material={discMat}>
        <torusGeometry args={[r * 0.2, 0.012, 6, 16]} />
      </mesh>
      {selected && (
        <mesh>
          <sphereGeometry args={[r * 1.2, 12, 12]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function CompressorMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  const variant = prod?.visual3D.variant ?? '3+3';
  const dual = variant !== '24';
  const [w, h, d] = item.size;
  const tankMat = useHighlightMat(selected, '#4b5563', 0.55, 0.35);
  const motorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.4, roughness: 0.5 }),
    []
  );
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9ca3af', metalness: 0.5, roughness: 0.4 }),
    []
  );

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {dual ? (
        <>
          <mesh position={[-w * 0.22, -h * 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
            <cylinderGeometry args={[h * 0.22, h * 0.22, d * 0.85, 16]} />
          </mesh>
          <mesh position={[w * 0.22, -h * 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
            <cylinderGeometry args={[h * 0.22, h * 0.22, d * 0.85, 16]} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, -h * 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
          <cylinderGeometry args={[h * 0.32, h * 0.32, w * 0.85, 20]} />
        </mesh>
      )}
      <mesh position={[0, h * 0.25, 0]} material={motorMat} castShadow>
        <boxGeometry args={[w * 0.45, h * 0.35, d * 0.55]} />
      </mesh>
      <mesh position={[0, h * 0.15, 0]} material={frameMat}>
        <boxGeometry args={[w * 1.05, h * 0.08, d * 1.05]} />
      </mesh>
      <mesh position={[-w * 0.5, 0, 0]} material={frameMat}>
        <boxGeometry args={[0.03, h * 0.9, 0.03]} />
      </mesh>
      <mesh position={[w * 0.5, 0, 0]} material={frameMat}>
        <boxGeometry args={[0.03, h * 0.9, 0.03]} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.12, h * 1.12, d * 1.12]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function GeneratorMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const [w, h, d] = item.size;
  const bodyMat = useHighlightMat(selected, '#334155', 0.3, 0.55);
  const panelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.2, roughness: 0.6 }),
    []
  );
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.5, roughness: 0.4 }),
    []
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: blueAccent, metalness: 0.3, roughness: 0.5 }),
    []
  );

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh material={bodyMat} castShadow>
        <boxGeometry args={[w * 0.9, h * 0.7, d * 0.85]} />
      </mesh>
      <mesh position={[0, h * 0.15, d * 0.4]} material={panelMat}>
        <boxGeometry args={[w * 0.5, h * 0.25, 0.04]} />
      </mesh>
      <mesh position={[-w * 0.1, h * 0.15, d * 0.43]} material={accentMat}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
      </mesh>
      <mesh position={[0, h * 0.4, 0]} material={frameMat}>
        <boxGeometry args={[w * 1.05, 0.04, d * 0.9]} />
      </mesh>
      <mesh position={[-w * 0.48, 0, 0]} material={frameMat}>
        <boxGeometry args={[0.03, h * 0.85, 0.03]} />
      </mesh>
      <mesh position={[w * 0.48, 0, 0]} material={frameMat}>
        <boxGeometry args={[0.03, h * 0.85, 0.03]} />
      </mesh>
      <mesh position={[w * 0.35, h * 0.25, -d * 0.35]} rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.1, h * 1.1, d * 1.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function VacuumMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  const withReel = prod?.visual3D.variant === 'reel-18';
  const [w, h, d] = item.size;
  const bodyMat = useHighlightMat(selected, '#475569', 0.25, 0.55);
  const reelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.3, roughness: 0.5 }),
    []
  );
  const hoseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }),
    []
  );

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh position={[withReel ? -w * 0.15 : 0, 0, 0]} material={bodyMat} castShadow>
        <cylinderGeometry args={[w * 0.28, w * 0.3, h * 0.7, 16]} />
      </mesh>
      <mesh position={[withReel ? -w * 0.15 : 0, h * 0.4, 0]} material={bodyMat}>
        <cylinderGeometry args={[w * 0.2, w * 0.28, h * 0.15, 12]} />
      </mesh>
      {withReel && (
        <>
          <mesh position={[w * 0.22, h * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={reelMat} castShadow>
            <cylinderGeometry args={[h * 0.28, h * 0.28, d * 0.35, 20]} />
          </mesh>
          <mesh position={[w * 0.22, h * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={hoseMat}>
            <torusGeometry args={[h * 0.32, 0.035, 8, 20]} />
          </mesh>
        </>
      )}
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.1, h * 1.1, d * 1.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function PressureWasherMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  const petrol = prod?.visual3D.variant === 'petrol';
  const [w, h, d] = item.size;
  const bodyMat = useHighlightMat(selected, petrol ? '#b45309' : '#1d4ed8', 0.3, 0.5);
  const wheelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.8 }),
    []
  );

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh material={bodyMat} castShadow>
        <boxGeometry args={[w * 0.85, h * 0.55, d * 0.7]} />
      </mesh>
      <mesh position={[0, h * 0.35, 0]} material={bodyMat}>
        <boxGeometry args={[w * 0.5, h * 0.25, d * 0.4]} />
      </mesh>
      <mesh position={[-w * 0.3, -h * 0.3, d * 0.25]} rotation={[Math.PI / 2, 0, 0]} material={wheelMat}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
      </mesh>
      <mesh position={[w * 0.3, -h * 0.3, d * 0.25]} rotation={[Math.PI / 2, 0, 0]} material={wheelMat}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.1, h * 1.1, d * 1.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function FrameMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  const variant = prod?.visual3D.variant ?? 'basic';
  const [w, h, d] = item.size;
  const mat = useHighlightMat(selected, '#9ca3af', 0.6, 0.35);
  const shelfMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6b7280', metalness: 0.45, roughness: 0.4 }),
    []
  );
  const toolboxMat = useHighlightMat(selected, '#b45309', 0.3, 0.5);

  const hasShelf = ['full', 'standard'].includes(variant);
  const hasStorage = ['full', 'tank_storage', 'toolbox'].includes(variant);
  const hasToolbox = variant === 'toolbox';

  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {[-1, 1].map((side) =>
        [0, 1].map((z) => (
          <mesh
            key={`${side}-${z}`}
            position={[side * w * 0.45, h * 0.05, -d * 0.3 + z * d * 0.5]}
            material={mat}
            castShadow
          >
            <boxGeometry args={[0.04, h * 0.95, 0.04]} />
          </mesh>
        ))
      )}
      {[0.1, 0.45, 0.85].map((yf, i) => (
        <mesh key={i} position={[0, -h * 0.4 + yf * h, -d * 0.05]} material={mat}>
          <boxGeometry args={[w * 0.92, 0.035, 0.035]} />
        </mesh>
      ))}
      <mesh position={[-w * 0.45, h * 0.3, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.03, d * 0.7]} />
      </mesh>
      <mesh position={[w * 0.45, h * 0.3, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.03, d * 0.7]} />
      </mesh>
      {hasShelf && (
        <mesh position={[0, h * 0.15, 0.05]} material={shelfMat} receiveShadow>
          <boxGeometry args={[w * 0.85, 0.025, d * 0.55]} />
        </mesh>
      )}
      {hasStorage && (
        <mesh position={[w * 0.25, -h * 0.15, 0.08]} material={shelfMat}>
          <boxGeometry args={[w * 0.35, h * 0.35, d * 0.4]} />
        </mesh>
      )}
      {hasToolbox && (
        <mesh position={[-w * 0.25, -h * 0.2, 0.1]} material={toolboxMat}>
          <boxGeometry args={[w * 0.3, h * 0.25, d * 0.35]} />
        </mesh>
      )}
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.05, h * 1.05, d * 1.2]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

export function BottleHolderMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const [w, h, d] = item.size;
  const mat = useHighlightMat(selected, '#64748b', 0.4, 0.45);
  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh material={mat}>
        <boxGeometry args={[w, h * 0.08, d]} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <mesh key={i} position={[x * w, h * 0.25, 0]} material={mat}>
          <cylinderGeometry args={[0.03, 0.03, h * 0.5, 8]} />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.1, h * 1.1, d * 1.2]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function BucketHolderMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const r = item.size[0] * 0.4;
  const mat = useHighlightMat(selected, '#78716c', 0.35, 0.5);
  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[r, 0.025, 8, 20]} />
      </mesh>
      <mesh position={[0, -r * 0.6, 0]} material={mat}>
        <boxGeometry args={[0.04, r * 0.8, 0.04]} />
      </mesh>
      {selected && (
        <mesh>
          <sphereGeometry args={[r * 1.3, 12, 12]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

export function SetMesh({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const [w, h, d] = item.size;
  const mat = useHighlightMat(selected, '#57534e', 0.2, 0.6);
  return (
    <group position={item.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh material={mat} castShadow>
        <boxGeometry args={[w, h * 0.6, d]} />
      </mesh>
      <mesh position={[0, h * 0.35, 0]} material={mat}>
        <boxGeometry args={[w * 0.9, h * 0.15, d * 0.9]} />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[w * 1.1, h * 1.1, d * 1.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function AnimatedGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((_, dt) => {
    if (!ref.current || reduced) return;
    const s = ref.current.scale.x;
    if (s < 1) {
      const next = Math.min(1, s + dt * 4);
      ref.current.scale.setScalar(next);
    }
  });
  return (
    <group ref={ref} scale={reduced ? 1 : 0.01}>
      {children}
    </group>
  );
}

export function ProductMeshSwitcher({
  item,
  selected,
  onSelect,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const prod = getProduct(item.productId);
  if (!prod) return null;
  const type = prod.visual3D.type;
  const props = { item, selected, onSelect };

  let mesh: React.ReactNode = null;
  switch (type) {
    case 'tank':
      mesh = <TankMesh {...props} />;
      break;
    case 'hoseReel':
      mesh = <HoseReelMesh {...props} />;
      break;
    case 'compressor':
      mesh = <CompressorMesh {...props} />;
      break;
    case 'generator':
      mesh = <GeneratorMesh {...props} />;
      break;
    case 'vacuum':
      mesh = <VacuumMesh {...props} />;
      break;
    case 'pressureWasher':
      mesh = <PressureWasherMesh {...props} />;
      break;
    case 'frame':
      mesh = <FrameMesh {...props} />;
      break;
    case 'bottleHolder':
      mesh = <BottleHolderMesh {...props} />;
      break;
    case 'bucketHolder':
      mesh = <BucketHolderMesh {...props} />;
      break;
    case 'set':
      mesh = <SetMesh {...props} />;
      break;
    default:
      return null;
  }
  return <AnimatedGroup key={item.productId}>{mesh}</AnimatedGroup>;
}
