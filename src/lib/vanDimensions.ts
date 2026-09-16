/** Legacy — use layoutEngine.getCargoSpace */
export function getCargoSpace() { return { length: 2.9, width: 1.7, height: 1.4, isDemo: true }; }
export function inferVisual3D() { return { type: 'none' as const, zone: 'any' as const, isDemoAsset: true }; }
export function mapPositionToZone() { return 'any' as const; }
