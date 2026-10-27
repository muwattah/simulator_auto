# Reference-based van visualisation

Original AI-generated asset, created using Thrixel Architect Plus and the customer's reference photograph. No manufacturer CAD or logos. This is an approximate Transit Custom-inspired visualisation, not an exact Ford model or certified fitment data.

- Thrixel job: `167da395-2f24-4b24-b6d7-9a2ec8a0e4e1`
- Creation date: 2026-10-27
- Metered cost: 80 cubes; no paid follow-up pass.
- Delivered model: 189,988 triangles; nine complete assemblies.
- Local processing: material merging, floor origin translation `[0,-0.575,1.15]`, replacement of an incorrect elliptical aperture seal with a runtime rounded rectangular seal.
- Vehicle front is +Z, floor centre is the origin. Vehicle-left is +X when viewed from behind; sliding door is on -X.
- The original editable source can be downloaded by its owner through the official Thrixel CLI, then processed with `node scripts/optimize-van.mjs source.glb public/models/transit-custom/van.glb --transit-canonical`.

Full validation and limitations: `docs/transit-custom-doors.md`.

Delivery optimisation: unused UV buffers removed (the model has no embedded textures); normals stored as normalized 16-bit values with four-byte alignment. Vertex positions, dimensions and all triangles remain unchanged; index values use lossless 16-bit storage. This avoids an oversized GitHub connector upload and reduces download size.
