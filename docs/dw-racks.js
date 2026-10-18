import * as THREE from './vendor/three.module.js';

// Coordinates use the original 15 × 5.5 m room. +Z is the Crownwood wall.
// Two successive central rows from the entrance, each with a back-to-back pair.
export const dwLayout = {
  width: .74, depth: .72, sampleWidth: .68, sampleHeight: .89, sampleCount: 10,
  spineZ: 2.75, rowXs: [14.15, 13.35],
  items: [
    {row: 1, x: 14.15, z: 3.12, rotation: Math.PI, facing: 'Crownwood'},
    {row: 1, x: 14.15, z: 2.38, rotation: 0, facing: 'opposite wall'},
    {row: 2, x: 13.35, z: 3.12, rotation: Math.PI, facing: 'Crownwood'},
    {row: 2, x: 13.35, z: 2.38, rotation: 0, facing: 'opposite wall'},
  ]
};
export const dwObstacles = dwLayout.items.map(p => ({
  kind: 'rect', minX: p.x - .37, maxX: p.x + .37,
  minZ: p.z - .36, maxZ: p.z + .36
}));

function box(parent, w, h, d, x, y, z, material, name) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z); mesh.name = name;
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export function createDWRacks({woodTextures = [], labelTexture = null} = {}) {
  const root = new THREE.Group(); root.name = 'Four DW Flooring central sample stands';
  const base = new THREE.MeshStandardMaterial({color: 0x31271f, roughness: .77});
  const slots = new THREE.MeshStandardMaterial({color: 0x171715, roughness: .87});
  const edge = new THREE.MeshStandardMaterial({color: 0xc2ae87, roughness: .88});
  const metal = new THREE.MeshStandardMaterial({color: 0xbbbcb4, metalness: .7, roughness: .35});
  const label = new THREE.MeshStandardMaterial({map: labelTexture, color: 0xffffff, roughness: .9});
  const woods = woodTextures.length ? woodTextures.map(map => new THREE.MeshStandardMaterial({
    map, color: 0xffffff, roughness: .63, bumpMap: map, bumpScale: .0006
  })) : [new THREE.MeshStandardMaterial({color: 0xb59b72, roughness: .7})];

  dwLayout.items.forEach((spec, rackIndex) => {
    const rack = new THREE.Group(); rack.position.set(spec.x, 0, spec.z); rack.rotation.y = spec.rotation;
    rack.name = `DW Flooring · row ${spec.row} · ${spec.facing}`;
    rack.userData = {type: 'dwRack', row: spec.row, facing: spec.facing, samples: dwLayout.sampleCount};
    root.add(rack);
    // Low dark-brown cassette, with no tall advertising panel, as in the photograph.
    box(rack, .74, .04, .72, 0, .04, 0, base, 'Low dark cassette base');
    for (const x of [-.36, .36]) {
      box(rack, .02, .18, .70, x, .13, 0, base, 'Dark cassette side rail');
      for (const z of [-.29, .29]) box(rack, .042, .02, .065, Math.sign(x)*.335, .012, z, slots, 'Floor foot');
    }
    box(rack, .74, .22, .026, 0, .15, .347, base, 'Low rear cassette support');
    const lip = box(rack, .72, .185, .022, 0, .136, -.335, base, 'Dark front retaining plate');
    lip.rotation.x = -.11;
    for (const x of [-.294, .294]) {
      box(rack, .014, .040, .009, x, .077, -.350, metal, 'Silver retaining bracket');
      box(rack, .014, .008, .022, x, .055, -.344, metal, 'Silver bracket foot');
    }
    for (let i = 0; i < dwLayout.sampleCount; i++) {
      const z = -.29 + i * .063, bottom = .068 + i * .018;
      box(rack, .695, .018, .022, 0, bottom - .008, z, slots, 'Individual sample groove');
      const sample = new THREE.Group(); sample.position.set(0, bottom, z); sample.rotation.x = .065;
      sample.name = `DW flooring sample ${i + 1}`; sample.userData.type = 'dwSample'; rack.add(sample);
      const face = woods[(i + rackIndex * 3) % woods.length];
      box(sample, .68, .89, .012, 0, .445, 0, [edge, edge, edge, edge, edge, face], 'Thin large-format wood sample');
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(.095, .044), label);
      tag.name = 'White sample information card'; tag.position.set(-.274, .858, -.0068);
      tag.rotation.y = Math.PI; tag.castShadow = false; sample.add(tag);
    }
  });
  return root;
}

export function drawDWRacksMap(ctx) {
  for (const p of dwLayout.items) {
    ctx.fillStyle = '#b6a17b'; ctx.fillRect(p.x - .37, p.z - .36, .74, .72);
    ctx.strokeStyle = '#eadcbb'; ctx.lineWidth = .025; ctx.strokeRect(p.x - .37, p.z - .36, .74, .72);
    for (let i = 0; i < 10; i++) {
      const z = p.z - .29 + i * .063;
      ctx.beginPath(); ctx.moveTo(p.x - .32, z); ctx.lineTo(p.x + .32, z); ctx.stroke();
    }
    // A dark front edge makes the opposite-facing pairs legible from above.
    ctx.fillStyle = '#46372c'; ctx.fillRect(p.x - .37, p.z + (p.rotation ? .32 : -.36), .74, .04);
  }
}
