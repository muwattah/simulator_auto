import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CargoSpaceMeters } from '../../types';

/**
 * Original parametric van silhouette, fitted to the estimated cargo dimensions.
 * This is NOT a manufacturer CAD model: brand-specific shape/fitment needs licensed
 * GLB assets and verified vehicle measurements.
 */
export interface VanViewSettings {
  body: 'transparent' | 'solid' | 'hidden';
  roofVisible: boolean;
  doorsOpen: boolean;
}

type Props = {
  space: CargoSpaceMeters;
  settings: VanViewSettings;
};

const paint = '#d4dbe4';
const trim = '#303b48';
const glass = '#9aaebe';

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.16, 32]} />
        <meshStandardMaterial color="#20262d" metalness={0.06} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.086, 0]}>
        <cylinderGeometry args={[0.185, 0.185, 0.008, 24]} />
        <meshStandardMaterial color="#8f9aa6" metalness={0.85} roughness={0.33} />
      </mesh>
      <mesh position={[0, 0.097, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.014, 16]} />
        <meshStandardMaterial color="#56616f" metalness={0.7} roughness={0.42} />
      </mesh>
    </group>
  );
}

function RearDoor({
  side, width, height, depth, open, ghost,
}: {
  side: number; width: number; height: number; depth: number; open: boolean; ghost: boolean;
}) {
  const hinge = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = open ? -side * 1.48 : 0;
    hinge.current.rotation.y = THREE.MathUtils.damp(hinge.current.rotation.y, target, 6, delta);
  });

  return (
    <group position={[side * width / 2, 0, -depth]}>
      <group ref={hinge}>
        <mesh position={[-side * (width / 4), height / 2, -0.015]} castShadow={!ghost}>
          <boxGeometry args={[width / 2 - 0.028, height * 0.95, 0.045]} />
          <meshStandardMaterial color={paint} roughness={0.38} metalness={0.33}
            transparent={ghost} opacity={ghost ? 0.16 : 1} depthWrite={!ghost} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-side * (width / 4), height * 0.76, -0.047]}>
          <boxGeometry args={[width * 0.37, height * 0.22, 0.007]} />
          <meshStandardMaterial color={glass} metalness={0.1} roughness={0.2}
            transparent opacity={ghost ? 0.08 : 0.52} depthWrite={false} />
        </mesh>
        <mesh position={[-side * (width * 0.22), height * 0.43, -0.066]}>
          <boxGeometry args={[0.12, 0.025, 0.035]} />
          <meshStandardMaterial color={trim} metalness={0.38} roughness={0.43} transparent={ghost}
            opacity={ghost ? 0.45 : 1} />
        </mesh>
        <mesh position={[-side * (width * 0.045), height * 0.18, -0.063]}>
          <boxGeometry args={[0.067, height * 0.28, 0.01]} />
          <meshStandardMaterial color="#ab1f2b" emissive="#610e17" emissiveIntensity={0.14} />
        </mesh>
      </group>
    </group>
  );
}

export default function VanBody3D({ space, settings }: Props) {
  const { length: L, width: W, height: H, vehicleCategory } = space;
  const cabLength = vehicleCategory === 'small' ? 0.82 : vehicleCategory === 'large' ? 1.25 : 1.04;
  const trailer = vehicleCategory === 'trailer';
  const outerW = W + 0.22;
  const outerH = H + 0.12;
  const rearZ = -L / 2 - 0.11;
  const cabZ = L / 2 + cabLength / 2 + 0.12;
  const ghost = settings.body === 'transparent';
  const visible = settings.body !== 'hidden';

  // Keep the steel edges visible in ghost view without blocking equipment picking.
  // The translucent shell doesn't write depth; open doors reveal the rear aperture.
  const bodyOpacity = ghost ? 0.105 : 1;
  const sideGlassOpacity = ghost ? 0.06 : 0.58;

  useEffect(() => {
    // Parametric door pivots animate through useFrame; when body is hidden the
    // original product meshes remain untouched.
  }, [settings.doorsOpen]);

  return (
    <group>
      {visible && (
        <>
          {!trailer && (
            <group>
              {/* Full cab silhouette with short sloping hood, windscreen, seats and nose. */}
              <mesh position={[0, outerH * 0.5, cabZ]} castShadow={!ghost}>
                <boxGeometry args={[outerW * 0.94, outerH * 0.88, cabLength * 0.83]} />
                <meshStandardMaterial color={paint} roughness={0.44} metalness={0.18}
                  transparent={ghost} opacity={bodyOpacity} depthWrite={!ghost} />
              </mesh>
              <mesh position={[0, outerH * 0.73, cabZ + cabLength * 0.37]}
                rotation={[-0.24, 0, 0]}>
                <boxGeometry args={[outerW * 0.80, outerH * 0.42, 0.022]} />
                <meshStandardMaterial color={glass} metalness={0.28} roughness={0.13}
                  transparent opacity={sideGlassOpacity} depthWrite={false} />
              </mesh>
              {[-1, 1].map(side => (
                <group key={'cab-' + side}>
                  <mesh position={[side * outerW * 0.475, outerH * 0.72, cabZ]}
                    rotation={[0, side * 0.07, 0]}>
                    <boxGeometry args={[0.015, outerH * 0.35, cabLength * 0.55]} />
                    <meshStandardMaterial color={glass} metalness={0.3} roughness={0.2}
                      transparent opacity={sideGlassOpacity} depthWrite={false} />
                  </mesh>
                  <mesh position={[side * outerW * 0.53, outerH * 0.65, cabZ + cabLength * 0.25]}>
                    <boxGeometry args={[0.18, 0.095, 0.24]} />
                    <meshStandardMaterial color={trim} roughness={0.58} transparent={ghost} opacity={ghost ? 0.4 : 1} />
                  </mesh>
                  <group position={[side * outerW * 0.30, 0.6, cabZ - 0.14]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.43, 0.48, 0.37]} />
                      <meshStandardMaterial color="#515b66" roughness={0.91} />
                    </mesh>
                    <mesh position={[0, 0.29, -0.10]}>
                      <boxGeometry args={[0.42, 0.44, 0.14]} />
                      <meshStandardMaterial color="#515b66" roughness={0.91} />
                    </mesh>
                  </group>
                  <mesh position={[side * outerW * 0.36, outerH * 0.37, cabZ + cabLength * 0.49]}>
                    <boxGeometry args={[outerW * 0.20, 0.115, 0.018]} />
                    <meshStandardMaterial color="#f0eff0" emissive="#d9e5ff" emissiveIntensity={0.18}
                      transparent={ghost} opacity={ghost ? 0.5 : 1} />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, outerH * 0.16, cabZ + cabLength * 0.50]}>
                <boxGeometry args={[outerW * 0.87, 0.18, 0.15]} />
                <meshStandardMaterial color={trim} metalness={0.2} roughness={0.7}
                  transparent={ghost} opacity={ghost ? 0.35 : 1} />
              </mesh>
            </group>
          )}

          {/* Cargo-body translucent shell. */}
          {[-1, 1].map(side => (
            <group key={'cargo-side-' + side}>
              <mesh position={[side * (outerW / 2), outerH * 0.53, 0]}>
                <boxGeometry args={[0.032, outerH * 0.94, L + 0.2]} />
                <meshStandardMaterial color={paint} roughness={0.4} metalness={0.18}
                  transparent={ghost} opacity={bodyOpacity} depthWrite={!ghost} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[side * (outerW / 2), outerH * 0.95, 0]} castShadow={!ghost}>
                <boxGeometry args={[0.047, 0.07, L + 0.16]} />
                <meshStandardMaterial color="#c2ccd4" metalness={0.4} roughness={0.41}
                  transparent={ghost} opacity={ghost ? 0.42 : 1} depthWrite={!ghost} />
              </mesh>
              <mesh position={[side * outerW * 0.49, outerH * 0.13, -L * 0.13]}>
                <boxGeometry args={[0.065, 0.25, L * 0.47]} />
                <meshStandardMaterial color="#495462" roughness={0.73}
                  transparent={ghost} opacity={ghost ? 0.25 : 1} depthWrite={!ghost} />
              </mesh>
            </group>
          ))}
          {settings.roofVisible && (
            <group>
              <mesh position={[0, outerH + 0.01, 0]} castShadow={!ghost}>
                <boxGeometry args={[outerW, 0.075, L + 0.19]} />
                <meshStandardMaterial color={paint} metalness={0.17} roughness={0.42}
                  transparent={ghost} opacity={ghost ? 0.14 : 1} depthWrite={!ghost} />
              </mesh>
              {[-0.28, 0.28].map(x => (
                <mesh key={x} position={[x * outerW, outerH + 0.062, 0]}>
                  <boxGeometry args={[0.045, 0.025, L * 0.91]} />
                  <meshStandardMaterial color="#7d8996" metalness={0.7} roughness={0.32}
                    transparent={ghost} opacity={ghost ? 0.3 : 1} depthWrite={!ghost} />
                </mesh>
              ))}
            </group>
          )}
          {/* Split rear doors: hinges are animated and never obscure contents when open. */}
          <RearDoor side={-1} width={outerW} height={outerH} depth={rearZ}
            open={settings.doorsOpen} ghost={ghost} />
          <RearDoor side={1} width={outerW} height={outerH} depth={rearZ}
            open={settings.doorsOpen} ghost={ghost} />

          {/* Lower sill & red tail lamps. */}
          <mesh position={[0, 0.085, rearZ - 0.08]}>
            <boxGeometry args={[outerW * 0.94, 0.16, 0.12]} />
            <meshStandardMaterial color={trim} roughness={0.66} transparent={ghost} opacity={ghost ? 0.4 : 1} />
          </mesh>
          {!trailer && ([-1, 1].map(side => (
            <group key={'wheel-pair-' + side}>
              <Wheel position={[side * outerW * 0.53, 0.30, -L * 0.17]} />
              <Wheel position={[side * outerW * 0.49, 0.30, cabZ + cabLength * 0.18]} />
            </group>
          )))}
          {trailer && ([-1, 1].map(side => (
            <Wheel key={'trailer-wheel-' + side} position={[side * outerW * 0.56, 0.30, 0]} />
          )))}
        </>
      )}
    </group>
  );
}
