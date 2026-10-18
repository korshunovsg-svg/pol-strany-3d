import * as THREE from './vendor/three.module.js';

export const pvcLayout={width:1.10,depth:.86,height:2.15,z:.56,shelfCount:18,
 items:[{x:12.29,art:3},{x:11.15,art:2},{x:10.01,art:1},{x:8.87,art:0}]};
export const pvcObstacles=pvcLayout.items.map(p=>({kind:'rect',minX:p.x-.55,maxX:p.x+.55,minZ:.13,maxZ:.99}));
// Artwork uses the original photograph as a texture. UV quadrilaterals select only
// the four printed illustrations; surrounding products and pillars are excluded.
const artQuads=[
 [[139,346],[303,332],[306,452],[144,455]],
 [[308,331],[499,314],[501,454],[312,455]],
 [[511,318],[755,300],[754,457],[505,457]],
 [[767,299],[1079,275],[1072,459],[763,458]]
];
function mesh(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name=''){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
export function createPVCRacks({photoTexture=null,headerTextures=[],woodTextures=[],stoneTextures=[],labelTexture=null,layout=pvcLayout,artworkQuads=artQuads,referenceSize=[1600,1200],rackType='pvcRack',rackWidth=1.10,rootName='Four Quick-Step Vinyl wall displays after Polarwood'}={}){
 const root=new THREE.Group();root.name=rootName;
 const white=new THREE.MeshStandardMaterial({color:0xf0f0e9,roughness:.70});
 const black=new THREE.MeshStandardMaterial({color:0x1b201e,roughness:.85});
 const metal=new THREE.MeshStandardMaterial({color:0xb2b8b2,roughness:.48,metalness:.35});
 const core=new THREE.MeshStandardMaterial({color:0x696b60,roughness:.8});
 const photo=new THREE.MeshStandardMaterial({map:photoTexture,color:photoTexture?0xffffff:0x9b9c8c,roughness:.85});
 const headers=Array.from({length:Math.max(4,headerTextures.length)},(_,i)=>new THREE.MeshStandardMaterial({map:headerTextures[i]??null,color:headerTextures[i]?0xffffff:0x111f64,roughness:.86}));
 const label=new THREE.MeshStandardMaterial({map:labelTexture,color:0xffffff,roughness:.95});
 const woods=woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.75}));
 const stones=stoneTextures.map((map,i)=>new THREE.MeshStandardMaterial({map,color:i===0?0xc2bfb3:0xffffff,roughness:.85}));
 const fallback=new THREE.MeshStandardMaterial({color:0xa99a7b,roughness:.8});
 layout.items.forEach((p,index)=>{
  const rack=new THREE.Group();rack.name=`Quick-Step ${rackType==='pvcRack'?'Vinyl':'Laminate'} display ${index+1}`;
  rack.userData={type:rackType,shelves:18,art:p.art,facing:'Crownwood wall'};rack.position.set(p.x,0,layout.z);rack.rotation.y=Math.PI;rack.scale.x=rackWidth/1.10;root.add(rack);
  box(rack,1.10,.045,.86,0,.040,0,white,'White floor plinth');
  for(const x of [-.535,.535])box(rack,.026,1.435,.84,x,.772,0,white,'White side frame');
  box(rack,1.07,1.43,.025,0,.775,.411,black,'Dark back of sample cabinet');
  box(rack,1.10,.65,.026,0,1.825,.411,white,'High white printed back panel');
  const ledge=box(rack,1.10,.025,.84,0,1.474,0,white,'Sloped top display ledge');ledge.rotation.x=-.12;
  const artGeometry=new THREE.PlaneGeometry(1.064,.448),uv=artGeometry.attributes.uv,q=artworkQuads[p.art];
  for(const [i,corner] of [q[0],q[1],q[3],q[2]].entries())uv.setXY(i,corner[0]/referenceSize[0],1-corner[1]/referenceSize[1]);
  uv.needsUpdate=true;
  const artwork=mesh(rack,artGeometry,photo,0,1.789,.394,'Printed reference illustration');artwork.rotation.y=Math.PI;artwork.castShadow=false;
  const band=mesh(rack,new THREE.PlaneGeometry(1.064,.115),headers[p.art],0,2.073,.393,'Crisp blue Quick-Step Vinyl header');band.rotation.y=Math.PI;band.castShadow=false;
  for(let i=0;i<18;i++){
   const tray=new THREE.Group();tray.position.set(0,.111+i*.073,-.021);tray.rotation.x=-.045;
   tray.name=`Horizontal ${rackType==='pvcRack'?'vinyl':'laminate'} sample tray ${i+1}`;tray.userData.type=rackType==='pvcRack'?'pvcTray':'laminateTray';rack.add(tray);
   box(tray,1.044,.012,.76,0,0,0,white,'Thin white tray');
   box(tray,1.015,.004,.73,0,-.009,.005,black,'Shadow below tray');
   let surface;
   if((i+index)%5===0&&stones.length)surface=stones[(i+index)%stones.length];
   else surface=woods.length?woods[(i+index*2)%woods.length]:fallback;
   box(tray,.995,.007,.686,0,.010,.014,[core,core,surface,core,core,core],'PVC wood or stone sample board');
   box(tray,1.044,.019,.012,0,.004,-.385,white,'White front tray lip');
   box(tray,.15,.009,.012,0,.003,-.393,metal,'Small tray handle');
   const card=mesh(tray,new THREE.PlaneGeometry(.108,.037),label,-.393,.016,-.333,'Small sample information label');card.rotation.x=-Math.PI/2;card.castShadow=false;
  }
 });return root;
}
export function drawPVCMap(ctx){
 for(const p of pvcLayout.items){ctx.fillStyle='#bac7bf';ctx.fillRect(p.x-.55,.13,1.10,.86);ctx.strokeStyle='#f0f1de';ctx.lineWidth=.035;ctx.strokeRect(p.x-.55,.13,1.10,.86);for(let i=0;i<6;i++){const z=.22+i*.12;ctx.beginPath();ctx.moveTo(p.x-.49,z);ctx.lineTo(p.x+.49,z);ctx.stroke();}ctx.fillStyle='#293a7c';ctx.fillRect(p.x-.52,.14,1.04,.07);}
}
