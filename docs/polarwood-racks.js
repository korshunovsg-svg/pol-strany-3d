import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';
import font from './assets/polarwood/font.js';

// Only the three Polarwood modules inside the north wall of the current plan.
export const polarwoodLayout={width:.60,depth:.90,z:.57,sampleCount:9,sampleWidth:.55,sampleHeight:1.14,items:[{x:14.46},{x:13.82},{x:13.18}]};
export const polarwoodObstacles=polarwoodLayout.items.map(p=>({kind:'rect',minX:p.x-.30,maxX:p.x+.30,minZ:.12,maxZ:1.02}));
function mesh(parent,g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function plaqueGeometry(){
 const s=new THREE.Shape(),w=.49,h=.16,r=.016,x=-w/2,y=-h/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(s,{depth:.023,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,steps:1,curveSegments:5});g.translate(0,0,-.0115);return g;
}
export function createPolarwoodRacks({woodTextures=[],labelTexture=null}={}){
 const root=new THREE.Group();root.name='Three Polarwood stands opposite Crownwood';
 const pale=new THREE.MeshStandardMaterial({color:0xcebd9f,roughness:.8});
 const edge=new THREE.MeshStandardMaterial({color:0xbbab8a,roughness:.9});
 const groove=new THREE.MeshStandardMaterial({color:0x4d4538,roughness:.9});
 const label=new THREE.MeshStandardMaterial({map:labelTexture,color:0xffffff,roughness:.9});
 const woods=woodTextures.length?woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,bumpMap:map,bumpScale:.0006,roughness:.66})):[new THREE.MeshStandardMaterial({color:0xbda478,roughness:.7})];
 polarwoodLayout.items.forEach((p,index)=>{
  const rack=new THREE.Group();rack.position.set(p.x,0,polarwoodLayout.z);rack.rotation.y=Math.PI;
  rack.name=`Polarwood ${index+1}`;rack.userData={type:'polarwoodRack',samples:9,facing:'Crownwood wall'};root.add(rack);
  box(rack,.60,.038,.90,0,.035,0,pale,'Light timber floor base');
  for(const x of [-.282,.282]){
   box(rack,.032,.16,.87,x,.13,0,pale,'Timber cassette side rail');
   box(rack,.035,.215,.037,x,.128,-.413,pale,'Light rounded front stop post');
  }
  box(rack,.58,.20,.025,0,.15,.431,pale,'Low rear brace');
  mesh(rack,plaqueGeometry(),pale,0,.128,-.422,'Rounded Polarwood front plaque');
  const logo=makeWallLettering('POLARWOOD',.031,{font,color:0x89785b,depth:.0008,tracking:.001});
  const width=logo.userData.width;logo.scale.x=.384/width;logo.rotation.y=Math.PI;logo.position.set(.192,.116,-.436);rack.add(logo);
  for(let i=0;i<9;i++){
   const bottom=.064+i*.016,z=-.345+i*.083;
   box(rack,.56,.016,.026,0,bottom-.008,z,groove,'Sample slot');
   const sample=new THREE.Group();sample.position.set(0,bottom,z);sample.rotation.x=.064;
   sample.name=`Polarwood sample ${i+1}`;sample.userData.type='polarwoodSample';rack.add(sample);
   const face=woods[(i+index*3)%woods.length];
   box(sample,.55,1.14,.013,0,.57,0,[edge,edge,edge,edge,edge,face],'Large upright parquet sample');
   const tag=new THREE.Mesh(new THREE.PlaneGeometry(.083,.047),label);tag.rotation.y=Math.PI;
   tag.position.set(-.220,1.102,-.0072);tag.name='White and red sample label';sample.add(tag);
  }
 });
 return root;
}
export function drawPolarwoodMap(ctx){
 for(const p of polarwoodLayout.items){
  ctx.fillStyle='#d6c9a3';ctx.fillRect(p.x-.30,.12,.60,.90);ctx.strokeStyle='#f2e9ca';ctx.lineWidth=.025;ctx.strokeRect(p.x-.30,.12,.60,.90);
  for(let i=0;i<9;i++){const z=.915-i*.083;ctx.beginPath();ctx.moveTo(p.x-.27,z);ctx.lineTo(p.x+.27,z);ctx.stroke();}
  ctx.fillStyle='#a89c7d';ctx.fillRect(p.x-.25,.97,.50,.04);
 }
}
