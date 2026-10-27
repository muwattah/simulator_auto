import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const buffer=readFileSync(new URL('../public/models/transit-custom/van.glb',import.meta.url));
assert.equal(buffer.toString('utf8',0,4),'glTF');assert.equal(buffer.readUInt32LE(8),buffer.length);
const doc=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)));
const names=['Cab_Group','Chassis_Group','CargoFloor_Group','CargoLeftWall_Group','CargoRightWall_Group','CargoRoof_Group','RearDoor_left_Group','RearDoor_right_Group','SlidingDoor_right_Group'];
for(const name of names) {
  const node=doc.nodes.find(n=>n.name===name);assert(node && node.mesh!=null,'complete assembly '+name);
  assert(doc.meshes[node.mesh].primitives.every(p=>doc.accessors[p.indices].count>0));
  for(const p of doc.meshes[node.mesh].primitives) {
    assert.equal(doc.accessors[p.attributes.POSITION].componentType,5126,'position precision is unchanged');
    const normal=doc.accessors[p.attributes.NORMAL];assert.equal(normal.componentType,5122);assert.equal(normal.normalized,true);
    assert.equal(doc.bufferViews[normal.bufferView].byteStride,8);assert.equal(doc.accessors[p.indices].componentType,5123);
  }
}
function bounds(name) {
  const node=doc.nodes.find(n=>n.name===name);
  const positions=doc.meshes[node.mesh].primitives.map(p=>doc.accessors[p.attributes.POSITION]);
  return {min:[0,1,2].map(a=>Math.min(...positions.map(p=>p.min[a]))),max:[0,1,2].map(a=>Math.max(...positions.map(p=>p.max[a])))};
}
assert(bounds('RearDoor_left_Group').min[0]>0,'left door belongs to the vehicle left, seen from behind');
assert(bounds('RearDoor_right_Group').max[0]<0);
assert(bounds('SlidingDoor_right_Group').max[0]<0,'side door stays on the correct side');
const floor=bounds('CargoFloor_Group');assert(Math.abs(floor.max[0]-floor.min[0]-1.777)<.001);
const triangles=doc.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+doc.accessors[p.indices].count/3,0);
assert.equal(triangles,189988,'complete moving subtrees retained; only the incorrect elliptical seal replaced');
console.log('Transit GLB integrity, handedness, cargo width and nine complete assemblies passed.');
