import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';

const rows=[{x:12.55,pattern:'herringbone'},{x:11.75,pattern:'plank'},{x:10.95,pattern:'plank'}];
export const harmonyLayout={width:.74,depth:.72,sampleCount:9,sampleWidth:.68,sampleHeight:1.12,spineZ:2.75,
 items:rows.flatMap((p,i)=>[
  {...p,row:i+3,z:3.12,rotation:Math.PI,facing:'Crownwood'},
  {...p,row:i+3,z:2.38,rotation:0,facing:'opposite wall'}])};
export const harmonyObstacles=harmonyLayout.items.map(p=>({kind:'rect',minX:p.x-.37,maxX:p.x+.37,minZ:p.z-.36,maxZ:p.z+.36}));
function box(parent,w,h,d,x,y,z,m,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;parent.add(o);return o;}
function brand(){
 const g=new THREE.Group();g.name='White Crownwood front emblem and lettering';
 const letters=makeWallLettering('CROWNWOOD',.031,{color:0xf3efdb,depth:.001,tracking:.001});
 letters.scale.x=.49/letters.userData.width;letters.position.set(-.245,.111,0);g.add(letters);
 const ink=new THREE.MeshStandardMaterial({color:0xf3efdb,roughness:.78});
 const polygon=points=>{const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.001,bevelEnabled:false}),ink);g.add(o);};
 polygon([[-.086,.164],[-.086,.189],[-.036,.154],[-.004,.183],[.040,.153],[.086,.191],[.086,.164],[.040,.128],[-.004,.159],[-.036,.129]]);
 polygon([[0,.230],[.027,.207],[0,.179],[-.027,.204]]);
 return g;
}
export function createHarmonyRacks({woodTextures=[],herringboneTextures=[],labelTexture=null}={}){
 const root=new THREE.Group();root.name='Six Crownwood Harmony central stands';
 const dark=new THREE.MeshStandardMaterial({color:0x30251b,roughness:.8});
 const core=new THREE.MeshStandardMaterial({color:0xbfae86,roughness:.9});
 const groove=new THREE.MeshStandardMaterial({color:0x191814,roughness:.9});
 const clip=new THREE.MeshStandardMaterial({color:0xe2dbc2,roughness:.7});
 const label=new THREE.MeshStandardMaterial({map:labelTexture,color:0xffffff,roughness:.9});
 const materials=maps=>maps.length?maps.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,bumpMap:map,bumpScale:.0006,roughness:.64})):[new THREE.MeshStandardMaterial({color:0xc1a06a,roughness:.7})];
 const plank=materials(woodTextures),herring=materials(herringboneTextures);
 harmonyLayout.items.forEach((p,index)=>{
  const rack=new THREE.Group();rack.position.set(p.x,0,p.z);rack.rotation.y=p.rotation;
  rack.name=`Crownwood Гармония · row ${p.row} · ${p.facing}`;
  rack.userData={type:'harmonyRack',samples:9,row:p.row,facing:p.facing,pattern:p.pattern};root.add(rack);
  box(rack,.74,.035,.72,0,.038,0,dark,'Low dark cassette base');
  for(const x of [-.359,.359])box(rack,.020,.14,.70,x,.108,0,dark,'Low side rail');
  box(rack,.74,.20,.023,0,.14,.348,dark,'Low cassette back');
  box(rack,.70,.215,.022,0,.142,-.334,dark,'Dark front plaque');
  for(const x of [-.282,.282]){
   box(rack,.011,.055,.008,x,.071,-.352,clip,'Pale retaining bracket');
   box(rack,.011,.007,.018,x,.044,-.347,clip,'Retaining bracket foot');
  }
  const logo=brand();logo.rotation.y=Math.PI;logo.position.z=-.350;rack.add(logo);
  for(let i=0;i<9;i++){
   const bottom=.065+i*.016,z=-.29+i*.071;
   box(rack,.69,.014,.021,0,bottom-.008,z,groove,'Individual board groove');
   const sample=new THREE.Group();sample.position.set(0,bottom,z);sample.rotation.x=.065;
   sample.name=`Crownwood Harmony sample ${i+1}`;sample.userData.type='harmonySample';rack.add(sample);
   const palette=p.pattern==='herringbone'?herring:plank;
   const face=palette[(i+index*2)%palette.length];
   box(sample,.68,1.12,.013,0,.56,0,[core,core,core,core,core,face],'Large Crownwood parquet sample');
   const tag=new THREE.Mesh(new THREE.PlaneGeometry(.108,.059),label);tag.rotation.y=Math.PI;tag.position.set(-.271,1.076,-.0072);tag.name='White sample information card';sample.add(tag);
  }
 });return root;
}
export function drawHarmonyMap(ctx){
 for(const p of harmonyLayout.items){
  ctx.fillStyle=p.pattern==='herringbone'?'#b4a276':'#c6b287';ctx.fillRect(p.x-.37,p.z-.36,.74,.72);
  ctx.strokeStyle='#eee0b8';ctx.lineWidth=.025;ctx.strokeRect(p.x-.37,p.z-.36,.74,.72);
  for(let i=0;i<9;i++){const z=p.z-.29+i*.071;ctx.beginPath();ctx.moveTo(p.x-.33,z);ctx.lineTo(p.x+.33,z);ctx.stroke();}
  ctx.fillStyle='#3c3023';ctx.fillRect(p.x-.35,p.z+(p.rotation?.32:-.36),.70,.04);
 }
}
