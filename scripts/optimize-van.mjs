/** Merge static geometry by material while preserving COMPLETE moving subtrees.
 * Usage: node scripts/optimize-van.mjs original.glb public/models/demo/van.glb
 * No network, generation credits, texture re-encoding or polygon reduction.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Matrix4, Matrix3, Vector3, Quaternion } from 'three';

const source = readFileSync(process.argv[2]);
const doc = JSON.parse(source.subarray(20, 20 + source.readUInt32LE(12)));
const binaryOffset = 20 + source.readUInt32LE(12) + 8;
const binary = source.subarray(binaryOffset);
if (doc.skins?.length || doc.animations?.length) throw new Error('Static unrigged source required');
const transit = process.argv.includes('--transit-canonical');
const kept = new Set([...(transit ? ['Cab_Group','Chassis_Group','CargoFloor_Group','SlidingDoor_right_Group'] : []),'CargoLeftWall_Group', 'CargoRightWall_Group', 'CargoRoof_Group', 'RearDoor_left_Group', 'RearDoor_right_Group']);
const buckets = new Map();
const types = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const formats = { 5126: [4, 'readFloatLE'], 5125: [4, 'readUInt32LE'], 5123: [2, 'readUInt16LE'], 5121: [1, 'readUInt8'] };
function values(index) {
  const a = doc.accessors[index], view = doc.bufferViews[a.bufferView];
  if (a.sparse || a.normalized) throw new Error('Unsupported accessor; do not silently alter it');
  const [bytes, read] = formats[a.componentType];
  const width = types[a.type], stride = view.byteStride ?? width * bytes;
  const offset = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
  return Array.from({ length: a.count * width }, (_, i) => binary[read](offset + Math.floor(i / width) * stride + i % width * bytes));
}
function walk(index, parent, inherited = 'Body') {
  const node = doc.nodes[index];
  // Generated seal was elliptical; the runtime supplies the measured rectangular aperture trim.
  if (transit && node.name === 'Sliding aperture continuous rubber seal') return;
  const world = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(
    new Vector3(...(node.translation ?? [0, 0, 0])),
    new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
    new Vector3(...(node.scale ?? [1, 1, 1])));
  world.premultiply(parent);
  const group = kept.has(node.name) ? node.name : inherited;
  if (node.mesh != null) {
    const materials = buckets.get(group) ?? new Map();
    buckets.set(group, materials);
    for (const primitive of doc.meshes[node.mesh].primitives) {
      if (primitive.mode != null && primitive.mode !== 4) throw new Error('Triangle source required');
      const key = primitive.material ?? 0;
      const chunk = materials.get(key) ?? { positions: [], normals: [], uvs: [], indices: [] };
      materials.set(key, chunk);
      const position = values(primitive.attributes.POSITION);
      const normal = values(primitive.attributes.NORMAL);
      const uv = primitive.attributes.TEXCOORD_0 != null ? values(primitive.attributes.TEXCOORD_0) : Array(position.length / 3 * 2).fill(0);
      const vertexOffset = chunk.positions.length / 3;
      const normalMatrix = new Matrix3().getNormalMatrix(world);
      const v = new Vector3();
      for (let i = 0; i < position.length; i += 3) {
        v.fromArray(position, i).applyMatrix4(world); chunk.positions.push(v.x, v.y, v.z);
        v.fromArray(normal, i).applyMatrix3(normalMatrix).normalize(); chunk.normals.push(v.x, v.y, v.z);
      }
      chunk.uvs.push(...uv);
      const indices = primitive.indices != null ? values(primitive.indices) : Array.from({ length: position.length / 3 }, (_, i) => i);
      for (let i=0;i<indices.length;i+=3) {
        const order = world.determinant() < 0 ? [0,2,1] : [0,1,2];
        for (const k of order) chunk.indices.push(indices[i+k]+vertexOffset);
      }
    }
  }
  for (const child of node.children ?? []) walk(child, world, group);
}
for (const index of doc.scenes[doc.scene ?? 0].nodes) walk(index, transit ? new Matrix4().makeTranslation(0,-.575,1.15) : new Matrix4());

const views = [], accessors = [], chunks = [];
let offset = 0;
function append(buffer, target) {
  const padding = (4 - offset % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); offset += padding; }
  const index = views.length;
  views.push({ buffer: 0, byteOffset: offset, byteLength: buffer.length, ...(target ? { target } : {}) });
  chunks.push(buffer); offset += buffer.length;
  return index;
}
// Keep the original WebP bytes and image ordering; only buffer views change.
for (const image of doc.images ?? []) {
  const view = doc.bufferViews[image.bufferView];
  image.bufferView = append(binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength));
}
function accessor(data, type, componentType = 5126) {
  let array;
  if(componentType===5122) {
    // Four shorts per vertex keep the three-component normal four-byte aligned.
    array=new Int16Array(data.length/3*4);
    for(let i=0;i<data.length;i++)array[Math.floor(i/3)*4+i%3]=Math.round(Math.max(-1,Math.min(1,data[i]))*32767);
  } else array=componentType===5125 ? new Uint32Array(data) : componentType===5123 ? new Uint16Array(data) : new Float32Array(data);
  const entry = { bufferView: append(Buffer.from(array.buffer), componentType === 5125 || componentType === 5123 ? 34963 : 34962),
    componentType, count: data.length / types[type], type };
  if(componentType===5122){entry.normalized=true;views[entry.bufferView].byteStride=8;}
  if (type === 'VEC3' && componentType===5126) {
    entry.min = [0, 1, 2].map(axis => data.reduce((min, v, i) => i % 3 === axis ? Math.min(min, v) : min, Infinity));
    entry.max = [0, 1, 2].map(axis => data.reduce((max, v, i) => i % 3 === axis ? Math.max(max, v) : max, -Infinity));
  }
  accessors.push(entry); return accessors.length - 1;
}
const meshes = [], nodes = [];
for (const [name, materials] of buckets) {
  const primitives = [];
  for (const [material, chunk] of materials) primitives.push({
    attributes: { POSITION: accessor(chunk.positions, 'VEC3'), NORMAL: accessor(chunk.normals, 'VEC3',transit?5122:5126), ...(!transit || doc.images?.length ? {TEXCOORD_0:accessor(chunk.uvs,'VEC2')} : {}) },
    indices: accessor(chunk.indices, 'SCALAR', transit && chunk.positions.length/3<65536 ? 5123 : 5125), material,
  });
  nodes.push({ name, mesh: meshes.length }); meshes.push({ name, primitives });
}
if(transit){
  doc.extensionsUsed=[...new Set([...(doc.extensionsUsed??[]),'KHR_mesh_quantization'])];
  doc.extensionsRequired=[...new Set([...(doc.extensionsRequired??[]),'KHR_mesh_quantization'])];
}
Object.assign(doc, { bufferViews: views, accessors, meshes, nodes,
  scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }], buffers: [{ byteLength: offset }] });
const json = Buffer.from(JSON.stringify(doc));
const jsonPad = Buffer.alloc((4 - json.length % 4) % 4, 0x20);
const bin = Buffer.concat(chunks);
const binPad = Buffer.alloc((4 - bin.length % 4) % 4);
const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + jsonPad.length + 8 + bin.length + binPad.length, 8);
header.writeUInt32LE(json.length + jsonPad.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length + binPad.length); binHeader.writeUInt32LE(0x004e4942, 4);
writeFileSync(process.argv[3], Buffer.concat([header, json, jsonPad, binHeader, bin, binPad]));
console.log(`Preserved ${nodes.length} complete assemblies: ${nodes.map(n => n.name).join(', ')}`);
