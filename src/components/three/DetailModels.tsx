import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
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
        emissiveIntensity: selected ? 0.18 : 0,
      }),
    [selected, base, metalness, roughness]
  );
}

function pick(e: ThreeEvent<PointerEvent>, onSelect: () => void) {
  e.stopPropagation();
  onSelect();
}

/** White polyethylene water tank with steel securing straps and accessible cap. */
export function TankMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const [w, h, d] = item.size;
  const body = useHighlightMat(selected, '#e7e9e4', 0.03, 0.67);
  const strap = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1d252b', metalness: 0.65, roughness: 0.35 }), []);
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: '#29343f', metalness: 0.4, roughness: 0.48 }), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c6a15b', metalness: 0.85, roughness: 0.28 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh castShadow receiveShadow material={body}>
        <boxGeometry args={[w * 0.92, h * 0.88, d * 0.91]} />
      </mesh>
      <mesh position={[0, h * 0.46, -d * 0.27]} material={cap} castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.043, 18]} />
      </mesh>
      {[-0.34, 0.34].map((z, i) => (
        <group key={i} position={[0, 0, z * d]}>
          <mesh position={[-w * 0.47, 0, 0]} material={strap}><boxGeometry args={[0.038, h * 0.91, 0.06]} /></mesh>
          <mesh position={[w * 0.47, 0, 0]} material={strap}><boxGeometry args={[0.038, h * 0.91, 0.06]} /></mesh>
          <mesh position={[0, h * 0.46, 0]} material={strap}><boxGeometry args={[w * 0.98, 0.032, 0.06]} /></mesh>
        </group>
      ))}
      <mesh position={[w * 0.3, -h * 0.31, -d * 0.47]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
        <cylinderGeometry args={[0.047, 0.047, 0.11, 14]} />
      </mesh>
      <mesh position={[0, h * 0.045, -d * 0.46]}>
        <planeGeometry args={[w * 0.38, h * 0.22]} />
        <meshStandardMaterial color="#c6d4e1" transparent opacity={0.48} />
      </mesh>
      {selected && <mesh><boxGeometry args={[w * 1.1, h * 1.14, d * 1.1]} /><meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.5} /></mesh>}
    </group>
  );
}

export function HoseReelMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const prod = getProduct(item.productId);
  const variant = prod?.visual3D.variant ?? '';
  const isAir = variant.startsWith('air');
  const isPower = variant.startsWith('power');
  const isManual = variant.includes('manual');
  const [w] = item.size;
  const r = Math.max(w * 0.48, 0.14);
  const depth = Math.max(item.size[2], 0.16);
  const discColor = isAir ? '#0f766e' : isPower ? '#a16207' : '#1e40af';
  const hoseColor = isAir ? '#134e4a' : isPower ? '#713f12' : '#1e3a8a';
  const discMat = useHighlightMat(selected, discColor, 0.4, 0.35);
  const hoseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: hoseColor, roughness: 0.65, metalness: 0.08 }), [hoseColor]);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b939e', metalness: 0.6, roughness: 0.35 }), []);
  const hoseThick = isAir || isPower ? 0.02 : 0.028;

  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      {/* side plates */}
      <mesh position={[0, 0, depth / 2]} material={discMat} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.035, 28]} />
      </mesh>
      <mesh position={[0, 0, -depth / 2]} material={discMat} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.035, 28]} />
      </mesh>
      {/* drum */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat} castShadow>
        <cylinderGeometry args={[r * 0.4, r * 0.4, depth * 0.88, 18]} />
      </mesh>
      {/* hose windings */}
      {[0.52, 0.68, 0.82, 0.92].map((f, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} material={hoseMat}>
          <torusGeometry args={[r * f, hoseThick, 8, 28]} />
        </mesh>
      ))}
      {/* axle */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
        <cylinderGeometry args={[0.028, 0.028, depth + 0.1, 10]} />
      </mesh>
      {/* mount bracket */}
      <mesh position={[0, -r * 0.95, 0]} material={frameMat}>
        <boxGeometry args={[r * 0.55, 0.07, depth * 0.85]} />
      </mesh>
      <mesh position={[0, -r * 1.2, 0]} material={frameMat}>
        <boxGeometry args={[r * 1.4, 0.045, 0.045]} />
      </mesh>
      <mesh position={[-r * 0.65, -r * 1.05, 0]} material={frameMat}>
        <boxGeometry args={[0.04, r * 0.35, 0.04]} />
      </mesh>
      <mesh position={[r * 0.65, -r * 1.05, 0]} material={frameMat}>
        <boxGeometry args={[0.04, r * 0.35, 0.04]} />
      </mesh>
      {isManual && (
        <mesh position={[r * 0.95, 0.05, depth / 2 + 0.05]} material={frameMat}>
          <boxGeometry args={[0.1, 0.035, 0.035]} />
        </mesh>
      )}
      {selected && (
        <mesh>
          <sphereGeometry args={[r * 1.25, 14, 14]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function CompressorMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const prod = getProduct(item.productId);
  const dual = (prod?.visual3D.variant ?? '3+3') !== '24';
  const [w, h, d] = item.size;
  const tankMat = useHighlightMat(selected, '#4b5563', 0.55, 0.35);
  const motorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.4, roughness: 0.5 }), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9ca3af', metalness: 0.5, roughness: 0.4 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      {dual ? (
        <>
          <mesh position={[-w * 0.22, -h * 0.12, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
            <cylinderGeometry args={[h * 0.24, h * 0.24, d * 0.9, 18]} />
          </mesh>
          <mesh position={[w * 0.22, -h * 0.12, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
            <cylinderGeometry args={[h * 0.24, h * 0.24, d * 0.9, 18]} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, -h * 0.08, 0]} rotation={[0, 0, Math.PI / 2]} material={tankMat} castShadow>
          <cylinderGeometry args={[h * 0.34, h * 0.34, w * 0.88, 22]} />
        </mesh>
      )}
      <mesh position={[0, h * 0.28, 0]} material={motorMat} castShadow>
        <boxGeometry args={[w * 0.48, h * 0.38, d * 0.58]} />
      </mesh>
      <mesh position={[0, h * 0.12, 0]} material={frameMat}>
        <boxGeometry args={[w * 1.08, 0.06, d * 1.08]} />
      </mesh>
      <mesh position={[-w * 0.52, 0, d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.95, 0.035]} /></mesh>
      <mesh position={[w * 0.52, 0, d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.95, 0.035]} /></mesh>
      <mesh position={[-w * 0.52, 0, -d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.95, 0.035]} /></mesh>
      <mesh position={[w * 0.52, 0, -d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.95, 0.035]} /></mesh>
      {selected && (
        <mesh><boxGeometry args={[w * 1.15, h * 1.15, d * 1.15]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} /></mesh>
      )}
    </group>
  );
}

export function GeneratorMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const [w, h, d] = item.size;
  const bodyMat = useHighlightMat(selected, '#334155', 0.3, 0.55);
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.2, roughness: 0.6 }), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.55, roughness: 0.35 }), []);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: blueAccent, metalness: 0.3, roughness: 0.5 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh material={bodyMat} castShadow><boxGeometry args={[w * 0.88, h * 0.68, d * 0.82]} /></mesh>
      <mesh position={[0, h * 0.12, d * 0.42]} material={panelMat}><boxGeometry args={[w * 0.55, h * 0.28, 0.05]} /></mesh>
      <mesh position={[-w * 0.12, h * 0.12, d * 0.46]} material={accentMat}><boxGeometry args={[0.07, 0.07, 0.02]} /></mesh>
      <mesh position={[w * 0.12, h * 0.12, d * 0.46]} material={accentMat}><boxGeometry args={[0.05, 0.05, 0.02]} /></mesh>
      {/* tubular frame */}
      <mesh position={[0, h * 0.42, 0]} material={frameMat}><boxGeometry args={[w * 1.08, 0.04, d * 0.95]} /></mesh>
      <mesh position={[-w * 0.5, 0, -d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.9, 0.035]} /></mesh>
      <mesh position={[w * 0.5, 0, -d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.9, 0.035]} /></mesh>
      <mesh position={[-w * 0.5, 0, d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.9, 0.035]} /></mesh>
      <mesh position={[w * 0.5, 0, d * 0.4]} material={frameMat}><boxGeometry args={[0.035, h * 0.9, 0.035]} /></mesh>
      <mesh position={[w * 0.35, h * 0.28, -d * 0.38]} rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
        <cylinderGeometry args={[0.035, 0.035, 0.14, 8]} />
      </mesh>
      {selected && (
        <mesh><boxGeometry args={[w * 1.12, h * 1.12, d * 1.12]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} /></mesh>
      )}
    </group>
  );
}

export function VacuumMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const prod = getProduct(item.productId);
  const withReel = prod?.visual3D.variant === 'reel-18';
  const [w, h, d] = item.size;
  const bodyMat = useHighlightMat(selected, '#475569', 0.25, 0.55);
  const reelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.3, roughness: 0.5 }), []);
  const hoseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.75 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh position={[withReel ? -w * 0.18 : 0, 0, 0]} material={bodyMat} castShadow>
        <cylinderGeometry args={[w * 0.3, w * 0.32, h * 0.72, 18]} />
      </mesh>
      <mesh position={[withReel ? -w * 0.18 : 0, h * 0.42, 0]} material={bodyMat}>
        <cylinderGeometry args={[w * 0.22, w * 0.3, h * 0.16, 14]} />
      </mesh>
      {withReel && (
        <>
          <mesh position={[w * 0.25, h * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={reelMat} castShadow>
            <cylinderGeometry args={[h * 0.32, h * 0.32, d * 0.4, 22]} />
          </mesh>
          {[0.85, 1.0, 1.12].map((f, i) => (
            <mesh key={i} position={[w * 0.25, h * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={hoseMat}>
              <torusGeometry args={[h * 0.32 * f * 0.9, 0.04, 8, 22]} />
            </mesh>
          ))}
        </>
      )}
      {selected && (
        <mesh><boxGeometry args={[w * 1.15, h * 1.15, d * 1.15]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} /></mesh>
      )}
    </group>
  );
}

/** Compact yellow machine with a visible pump, grill and hoses. */
export function PressureWasherMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const prod = getProduct(item.productId);
  const petrol = prod?.visual3D.variant === 'petrol';
  const [w, h, d] = item.size;
  const body = useHighlightMat(selected, petrol ? '#d97706' : '#eab308', 0.25, 0.45);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#18222b', metalness: 0.42, roughness: 0.43 }), []);
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b7c4ce', metalness: 0.85, roughness: 0.24 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh material={body} castShadow><boxGeometry args={[w * 0.94, h * 0.7, d * 0.85]} /></mesh>
      <mesh position={[-w * 0.33, h * 0.1, -d * 0.435]} material={dark}>
        <cylinderGeometry args={[h * 0.16, h * 0.16, 0.037, 24]} />
      </mesh>
      <mesh position={[-w * 0.33, h * 0.1, -d * 0.455]} material={chrome}>
        <cylinderGeometry args={[h * 0.078, h * 0.078, 0.045, 18]} />
      </mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[w * 0.16 + i * w * 0.115, -h * 0.06, -d * 0.435]} material={dark}>
          <boxGeometry args={[w * 0.05, h * 0.38, 0.018]} />
        </mesh>
      ))}
      <mesh position={[0, h * 0.4, 0]} material={dark}>
        <boxGeometry args={[w * 0.48, h * 0.085, d * 0.58]} />
      </mesh>
      <mesh position={[-w * 0.25, -h * 0.32, 0]} material={dark}>
        <boxGeometry args={[w * 0.17, h * 0.11, d * 0.96]} />
      </mesh>
      <mesh position={[w * 0.25, -h * 0.32, 0]} material={dark}>
        <boxGeometry args={[w * 0.17, h * 0.11, d * 0.96]} />
      </mesh>
      {selected && <mesh><boxGeometry args={[w * 1.12, h * 1.16, d * 1.12]} /><meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.5} /></mesh>}
    </group>
  );
}

/** Powder-coated steel rack with a metallic tread-plate back and storage shelf. */
export function FrameMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const prod = getProduct(item.productId);
  const variant = prod?.visual3D.variant ?? 'basic';
  const [w, h, d] = item.size;
  const steel = useHighlightMat(selected, '#171d23', 0.76, 0.34);
  const panel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9ca8b3', metalness: 0.66, roughness: 0.33 }), []);
  const shelf = useMemo(() => new THREE.MeshStandardMaterial({ color: '#394652', metalness: 0.6, roughness: 0.4 }), []);
  const hasShelf = ['full', 'standard'].includes(variant);
  const hasStorage = ['full', 'tank_storage', 'toolbox'].includes(variant);
  const hasToolbox = variant === 'toolbox';
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh position={[0, 0, d * 0.35]} material={panel} castShadow>
        <boxGeometry args={[w * 0.90, h * 0.93, 0.025]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <mesh key={'tread-' + i} position={[0, -h * 0.4 + i * h * 0.11, d * 0.35 + 0.021]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[w * 0.73, 0.008, 0.007]} />
          <meshStandardMaterial color="#d3dae1" metalness={0.78} roughness={0.26} />
        </mesh>
      ))}
      {[-1, 1].map(side => (
        <group key={'side-' + side}>
          <mesh position={[side * w * 0.48, 0, 0]} material={steel} castShadow>
            <boxGeometry args={[0.052, h * 1.07, d * 1.12]} />
          </mesh>
          <mesh position={[side * w * 0.48, h * 0.52, 0]} material={steel}>
            <boxGeometry args={[0.06, 0.056, d * 1.17]} />
          </mesh>
        </group>
      ))}
      {[-0.48, 0.50].map((y, i) => (
        <mesh key={i} position={[0, y * h, 0]} material={steel} castShadow>
          <boxGeometry args={[w * 1.04, 0.06, d * 1.13]} />
        </mesh>
      ))}
      {hasShelf && (
        <mesh position={[0, -h * 0.18, -d * 0.12]} material={shelf} receiveShadow castShadow>
          <boxGeometry args={[w * 0.86, 0.035, d * 0.8]} />
        </mesh>
      )}
      {hasStorage && (
        <mesh position={[w * 0.27, -h * 0.25, 0.02]} material={shelf} castShadow>
          <boxGeometry args={[w * 0.3, h * 0.31, d * 0.38]} />
        </mesh>
      )}
      {hasToolbox && (
        <mesh position={[-w * 0.28, -h * 0.26, 0.02]} castShadow>
          <boxGeometry args={[w * 0.28, h * 0.26, d * 0.4]} />
          <meshStandardMaterial color="#d5a145" roughness={0.43} metalness={0.3} />
        </mesh>
      )}
      {selected && <mesh><boxGeometry args={[w * 1.10, h * 1.12, d * 1.25]} /><meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.40} /></mesh>}
    </group>
  );
}

export function BottleHolderMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const [w, h, d] = item.size;
  const mat = useHighlightMat(selected, '#64748b', 0.45, 0.4);
  const bottle = useMemo(() => new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.4, transparent: true, opacity: 0.85 }), []);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh material={mat} position={[0, -h * 0.35, 0]}><boxGeometry args={[w, 0.06, d]} /></mesh>
      <mesh material={mat} position={[0, h * 0.1, -d * 0.3]}><boxGeometry args={[w, h * 0.7, 0.04]} /></mesh>
      {[-0.32, -0.1, 0.12, 0.34].map((x, i) => (
        <mesh key={i} position={[x * w, 0, 0]} material={bottle}>
          <cylinderGeometry args={[0.035, 0.04, h * 0.55, 10]} />
        </mesh>
      ))}
      {selected && (
        <mesh><boxGeometry args={[w * 1.15, h * 1.15, d * 1.3]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} /></mesh>
      )}
    </group>
  );
}

export function BucketHolderMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const r = Math.max(item.size[0] * 0.42, 0.12);
  const mat = useHighlightMat(selected, '#78716c', 0.4, 0.45);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[r, 0.03, 10, 24]} />
      </mesh>
      <mesh position={[0, -r * 0.55, 0]} material={mat}>
        <boxGeometry args={[0.05, r * 0.9, 0.05]} />
      </mesh>
      <mesh position={[0, -r * 1.05, 0]} material={mat}>
        <boxGeometry args={[r * 0.8, 0.04, 0.04]} />
      </mesh>
      {selected && (
        <mesh><sphereGeometry args={[r * 1.4, 12, 12]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} /></mesh>
      )}
    </group>
  );
}

export function SetMesh({ item, selected, onSelect }: { item: PlacedItem; selected: boolean; onSelect: () => void }) {
  const [w, h, d] = item.size;
  const mat = useHighlightMat(selected, '#57534e', 0.2, 0.6);
  return (
    <group position={item.position} onPointerDown={(e) => pick(e, onSelect)}>
      <mesh material={mat} castShadow><boxGeometry args={[w, h * 0.6, d]} /></mesh>
      <mesh position={[0, h * 0.35, 0]} material={mat}><boxGeometry args={[w * 0.9, h * 0.15, d * 0.9]} /></mesh>
      {selected && (
        <mesh><boxGeometry args={[w * 1.12, h * 1.12, d * 1.12]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.45} /></mesh>
      )}
    </group>
  );
}

/** Subtle scale-in ~250–350ms */
export function AnimatedGroup({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((_, dt) => {
    if (!ref.current || reduced) return;
    const s = ref.current.scale.x;
    if (s < 1) ref.current.scale.setScalar(Math.min(1, s + dt * 3.5));
  });
  return (
    <group ref={ref} scale={reduced ? 1 : 0.75}>
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
  let mesh: ReactNode = null;
  switch (type) {
    case 'tank': mesh = <TankMesh {...props} />; break;
    case 'hoseReel': mesh = <HoseReelMesh {...props} />; break;
    case 'compressor': mesh = <CompressorMesh {...props} />; break;
    case 'generator': mesh = <GeneratorMesh {...props} />; break;
    case 'vacuum': mesh = <VacuumMesh {...props} />; break;
    case 'pressureWasher': mesh = <PressureWasherMesh {...props} />; break;
    case 'frame': mesh = <FrameMesh {...props} />; break;
    case 'bottleHolder': mesh = <BottleHolderMesh {...props} />; break;
    case 'bucketHolder': mesh = <BucketHolderMesh {...props} />; break;
    case 'set': mesh = <SetMesh {...props} />; break;
    default: return null;
  }
  return <AnimatedGroup key={item.productId}>{mesh}</AnimatedGroup>;
}
