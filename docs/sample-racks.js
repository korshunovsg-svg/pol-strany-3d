import * as THREE from './vendor/three.module.js';
export const rackLayout={width:.84,height:1.27,depth:.91,z:4.92,sampleCount:6,sampleWidth:.71,sampleHeight:1.04,items:[{x:14.28,collection:'elegance',art:'layers'},{x:13.41,collection:'elegance',art:'icons'},{x:12.54,collection:'urban',art:'layers'},{x:11.67,collection:'urban',art:'icons'},{x:10.80,collection:'urban',art:'layers'}]};
export const rackObstacles=rackLayout.items.map(p=>({kind:'rect',minX:p.x-.42,maxX:p.x+.42,minZ:rackLayout.z-.47,maxZ:rackLayout.z+.44}));
function part(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name=''){return part(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function profile(width,points){const s=new THREE.Shape();points.forEach(([z,y],i)=>i?s.lineTo(-z,y):s.moveTo(-z,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(-width/2,0,0);return g;}
export function createSampleRacks({woodTextures=[],labels={}}={}){
 const row=new THREE.Group();row.name='Five Crownwood sample racks';row.userData.sampleRackRow=true;
 const white=new THREE.MeshStandardMaterial({color:0xf1f1e9,roughness:.60});const core=new THREE.MeshStandardMaterial({color:0xd5c9a7,roughness:.89});const groove=new THREE.MeshStandardMaterial({color:0x888b7f,roughness:.92});
 const colours=[0xb49264,0xc5b490,0x785635,0xab906d,0xd3c09b,0x946d46];
 const faceMaterials=colours.map((color,i)=>new THREE.MeshStandardMaterial({color:woodTextures[i]?0xffffff:color,map:woodTextures[i]??null,bumpMap:woodTextures[i]??null,bumpScale:.0007,roughness:.66}));
 const labelMaterials={};
 for(const collection of ['urban','elegance']){
  labelMaterials[collection]=new THREE.MeshStandardMaterial({map:labels[collection]??null,color:0xf9f9f3,roughness:.94});
 }
 rackLayout.items.forEach((spec,index)=>{
  const rack=new THREE.Group();rack.name=`Crownwood ${spec.collection==='urban'?'Urban':'Элеганс'} · ${index+1}`;rack.userData={type:'sampleRack',collection:spec.collection,samples:rackLayout.sampleCount};rack.position.set(spec.x,0,rackLayout.z);row.add(rack);
  // White carcass, sloped front plinth and two tapered side cheeks.
  box(rack,.84,.05,.89,0,.043,-.01,white,'Floor base');
  part(rack,profile(.84,[[-.47,.018],[-.31,.018],[-.31,.14],[-.47,.065]]),white,0,0,0,'Sloped white front plinth');
  const cheek=profile(.026,[[-.45,.055],[.43,.055],[.43,.77],[-.45,.145]]);
  for(const x of [-.407,.407])part(rack,cheek,white,x,0,0,'Tapered side cheek');
  // Upper advertising board is removed; the low back remains part of the carcass.
  box(rack,.84,1.18,.026,0,.64,.425,white,'Low white back panel');
  // Each sample is a separate thin board; the rear slots step up slightly.
  for(let i=0;i<rackLayout.sampleCount;i++){
   const sample=new THREE.Group();sample.name='Oak sample '+(i+1);sample.userData.type='woodSample';sample.position.set(0,.095+i*.025,-.38+i*.12);sample.rotation.x=.11;rack.add(sample);
   const face=faceMaterials[(i+index*2)%faceMaterials.length];
   box(sample,.71,1.04,.014,0,.52,0,[core,core,core,core,core,face],'Engineered wood sample');
   const tag=part(sample,new THREE.PlaneGeometry(.112,.061),labelMaterials[spec.collection],-.252,.989,-.0083,'Sample information label');tag.rotation.y=Math.PI;tag.castShadow=false;
   const slotZ=-.38+i*.12;box(rack,.735,.014,.025,0,.083+i*.025,slotZ,groove,'Individual sample slot');
  }
 });
 return row;
}
export function drawSampleRacksMap(ctx){
 for(const p of rackLayout.items){ctx.fillStyle=p.collection==='urban'?'#c7b86e':'#b9a565';ctx.fillRect(p.x-.42,rackLayout.z-.47,.84,.91);ctx.strokeStyle='#eee6c4';ctx.lineWidth=.025;ctx.strokeRect(p.x-.42,rackLayout.z-.47,.84,.91);for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(p.x-.35,rackLayout.z-.38+i*.12);ctx.lineTo(p.x+.35,rackLayout.z-.38+i*.12);ctx.stroke();}}
}
