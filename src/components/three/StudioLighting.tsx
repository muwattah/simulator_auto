import { Environment, Lightformer } from '@react-three/drei';

/** Local softboxes: no remote HDRI, no imagery baked into the installation. */
export default function StudioLighting({ light = false, floorY = -0.64, room = true }: {
  light?: boolean; floorY?: number; room?: boolean;
}) {
  return <>
    <color attach="background" args={[light ? '#aeb3b6' : '#10161e']} />
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={5} position={[0, 6, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 3, 1]} />
      <Lightformer intensity={3} position={[-4, 2.5, -1]} rotation={[0, Math.PI / 2, 0]} scale={[2, 5, 1]} />
      <Lightformer intensity={4} position={[4, 3, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[1.2, 5, 1]} />
      <Lightformer intensity={3} position={[0, 3, 6]} rotation={[0, Math.PI, 0]} scale={[5, 2, 1]} />
      <Lightformer intensity={5} position={[-1, 3, -6]} scale={[5, 3, 1]} />
    </Environment>
    <hemisphereLight intensity={0.65} color="#ecf2ff" groundColor={light ? '#777e84' : '#192330'} />
    <ambientLight intensity={0.18} />
    <directionalLight position={[-3, 6, -4]} intensity={2.8} castShadow
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.00025}
      shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
    <directionalLight position={[4, 4, -1]} intensity={1.4} color="#d9eaff" />
    <directionalLight position={[0, 4, 6]} intensity={1.8} color="#fff0df" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={light ? '#969d9f' : '#090f16'} roughness={0.73} metalness={0.22} />
    </mesh>
    {!light && room && <group>
      <mesh position={[0, floorY + 3, 8]} receiveShadow>
        <boxGeometry args={[24, 6, 0.12]} />
        <meshStandardMaterial color="#141c25" roughness={0.82} />
      </mesh>
      {[-7, -4, 0, 4, 7].map(x => <group key={x} position={[x, floorY + 2.6, 7.9]}>
        <mesh><boxGeometry args={[0.09, 4.5, 0.06]} /><meshStandardMaterial color="#0b1119" /></mesh>
        <mesh position={[0, 0, -0.04]}><boxGeometry args={[0.027, 3.8, 0.012]} />
          <meshStandardMaterial color="#dcecff" emissive="#c7e4ff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
      </group>)}
    </group>}
  </>;
}
