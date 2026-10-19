import * as THREE from './vendor/three.module.js';
import {ashanSize,ashanDisplays,ashanWorkstation} from './ashan-layout.js?v=24';
import {createExtraRack,extraRackNames} from './ashan-extra-racks.js?v=23';
import {createParquetStand,parquetNames} from './ashan-parquet.js?v=21';
import {createRemainingRack,remainingNames} from './remaining-racks.js?v=24';
import {createAshanCrownwoodPanels,placePanelAboveDisplays,createAshanCategorySign} from './crownwood-panels.js?v=26';
import {createPolStranyWallPanel,wallLayout} from './wall-decor.js?v=26';
import {createUnderlayRack} from './underlay-rack.js?v=25';

function mesh(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function pipe(parent,a,b,r,m,name){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const o=mesh(parent,new THREE.CylinderGeometry(r,r,v.length(),10),m,0,0,0,name);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function clip(poly,axis,limit,inside){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=inside(a[axis],limit),bb=inside(b[axis],limit);if(aa)out.push(a);if(aa!==bb){const t=(limit-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,k)=>v+t*(b[k]-v)));}}return out;}
function oakFloor(root,textures){
 const materials=textures.slice(0,4).map((_,i)=>new THREE.MeshStandardMaterial({map:textures[0],color:[0xc4ad93,0xc1a68c,0xc8b196,0xbfa48b][i],roughness:.72}));
 const buffers=materials.map(()=>({p:[],uv:[]})),angle=Math.PI/7,c=Math.cos(angle),s=Math.sin(angle),length=1.34,width=.195;
 const {length:L,width:W}=ashanSize;
 for(let row=-45;row<45;row++)for(let col=-18;col<25;col++){
  const a=col*length+(row%2)*length*.5,b=row*width,coords=[[a+.001,b+.001],[a+length-.001,b+.001],[a+length-.001,b+width-.001],[a+.001,b+width-.001]];
  let poly=coords.map(([u,v])=>[c*u-s*v+L/2,s*u+c*v+W/2,(u-a)/length,(v-b)/width]);
  for(const [axis,limit,inside] of [[0,0,(x,v)=>x>=v],[0,L,(x,v)=>x<=v],[1,0,(x,v)=>x>=v],[1,W,(x,v)=>x<=v]]){poly=clip(poly,axis,limit,inside);if(!poly.length)break;}
  if(poly.length<3)continue;const target=buffers[((row*31+col*7)%materials.length+materials.length)%materials.length];
  for(let i=1;i<poly.length-1;i++)for(const p of [poly[0],poly[i+1],poly[i]]){target.p.push(p[0],.017,p[1]);target.uv.push(p[3],p[2]);}
 }
 buffers.forEach((b,i)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeVertexNormals();const floor=mesh(root,g,materials[i],0,0,0,'Warm diagonal oak plank floor');floor.userData.ashanFloor=true;floor.castShadow=false;});
}
function select(source,kind){
 const found=[];source.traverse(o=>{const d=o.userData;if(kind==='dw'&&d.type==='dwRack'||kind==='pvc'&&d.type==='pvcRack'||kind==='laminate'&&d.type==='laminateRack'||kind==='quickBook'&&d.type==='laminateBookRack'||kind==='classen'&&d.type==='islandRack'&&d.brand==='classen'||kind==='deckLaminate'&&d.type==='islandRack'&&d.brand==='deck'||kind==='clix'&&d.type==='islandRack'&&d.brand==='clix'||kind==='alta'&&d.type==='altaRack'||kind==='deck'&&d.type==='deckWallRack'&&d.collection==='deck'||kind==='deckPolymer'&&d.type==='deckWallRack'&&d.collection==='polymer'||kind==='polarwood'&&d.type==='polarwoodRack'||kind==='urban'&&d.type==='sampleRack'&&d.collection==='urban'||['desk','visitorChair','staffChair'].includes(kind)&&d.type===kind)found.push(o);});return found;
}
export function batchFurniture(root,roomId='ashan'){
 // Static sample displays share materials. Merge their render surfaces while retaining
 // the original fixture groups for dimensions, map correspondence and later edits.
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),batches=new Map(),materialKeys=new Map();
 const materialKey=m=>{if(!materialKeys.has(m.uuid))materialKeys.set(m.uuid,JSON.stringify([m.type,m.color?.getHex(),m.map?.uuid,m.bumpMap?.uuid,m.bumpScale,m.normalMap?.uuid,m.normalScale?.toArray(),m.roughness,m.metalness,m.emissive?.getHex(),m.emissiveIntensity,m.clearcoat,m.clearcoatRoughness,m.transparent,m.opacity,m.side,m.alphaTest,m.depthWrite,m.depthTest,m.vertexColors]));return materialKeys.get(m.uuid);};
 root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,index=g.index,transform=inverse.clone().multiply(o.matrixWorld),normalMatrix=new THREE.Matrix3().getNormalMatrix(transform),groups=Array.isArray(o.material)?g.groups:[{start:0,count:index?index.count:p.count,materialIndex:0}];
  for(const group of groups){const material=Array.isArray(o.material)?o.material[group.materialIndex]:o.material,key=materialKey(material)+':'+o.castShadow;if(!batches.has(key))batches.set(key,{material,castShadow:o.castShadow,p:[],n:[],uv:[]});const out=batches.get(key);
   for(let j=group.start;j<group.start+group.count;j++){const i=index?index.getX(j):j,v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform),normal=n?new THREE.Vector3().fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix):new THREE.Vector3(0,1,0);out.p.push(v.x,v.y,v.z);out.n.push(normal.x,normal.y,normal.z);out.uv.push(uv?.getX(i)??0,uv?.getY(i)??0);}
  }
 });
 for(const fixture of root.children)fixture.visible=false;
 const render=new THREE.Group();render.name=roomId+' batched surfaces';render.userData[roomId+'Batched']=true;
 for(const b of batches.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));const o=mesh(render,g,b.material,0,0,0,'Static sample display surfaces');o.castShadow=b.castShadow;}
 root.add(render);
}
export function createAshanSalon({sourceModel,woodTextures=[],parquetTextures={},extraTextures={}}){
 const root=new THREE.Group();root.name='Ashan · independent 16.5 × 7 m showroom';root.userData={roomId:'ashan',ashanSalon:true};
 const {length:L,width:W,height:H,entranceMin:a,entranceMax:b}=ashanSize;
 const roof=new THREE.Group(),lights=new THREE.Group(),portal=new THREE.Group();roof.name='Ashan open industrial ceiling';lights.name='Ashan suspended lighting';root.add(roof,lights,portal);
 const wall=new THREE.MeshStandardMaterial({color:0x303744,roughness:.96}),black=new THREE.MeshStandardMaterial({color:0x11171e,roughness:.88}),steel=new THREE.MeshStandardMaterial({color:0x323b42,metalness:.55,roughness:.55}),green=new THREE.MeshStandardMaterial({color:0x355e52,roughness:.8}),silver=new THREE.MeshStandardMaterial({color:0x797e81,metalness:.62,roughness:.5}),glow=new THREE.MeshStandardMaterial({color:0xe6f3ff,emissive:0xd5e9ff,emissiveIntensity:2.1,roughness:.4});
 box(root,L+.24,.10,W+.24,L/2,-.045,W/2,black,'Ashan foundation');
 const floorBase=mesh(root,new THREE.PlaneGeometry(L,W),black,L/2,.014,W/2,'Dark hairline plank joints');floorBase.rotation.x=-Math.PI/2;floorBase.castShadow=false;
 oakFloor(root,woodTextures);
 const walls=[];
 for(const spec of [
  [L+.32,H,.16,L/2,H/2,-.08,'north'],[L+.32,H,.16,L/2,H/2,W+.08,'south'],[.16,H,W,-.08,H/2,W/2,'back'],
  [.16,H,a,L+.08,H/2,a/2,'front'],[.16,H,W-b,L+.08,H/2,(W+b)/2,'front']
 ]){const [w,h,d,x,y,z,side]=spec,o=box(root,w,h,d,x,y,z,wall,'Blank dark showroom wall');o.userData={side,roomId:'ashan',blankWall:true};walls.push(o);box(root,w,.075,d+.012,x,.046,z,black,'Dark skirting');}
 box(portal,.19,1.38,b-a,L+.075,H-.69,(a+b)/2,wall,'High blank lintel above the entrance');
 for(const z of [a,b])box(portal,.23,3.72,.12,L+.04,1.86,z,black,'Dark entry jamb');
 box(portal,.21,.18,b-a+.16,L+.04,3.70,(a+b)/2,black,'Entry shutter housing');
 // High black structure, cable trays, exposed pipes and pendant suspension wires.
 box(roof,L+.24,.10,W+.24,L/2,H+.06,W/2,black,'Black open roof deck');
 for(let x=.40;x<L;x+=2.65)box(roof,.14,.22,W,x,H-.13,W/2,steel,'Exposed dark cross beam');
 for(const z of [1.10,3.5,5.9]){
  box(roof,L-.18,.09,.13,L/2,H-.24,z,steel,'Cable tray');
  for(let x=.6;x<L;x+=.55)box(roof,.025,.03,.22,x,H-.20,z,silver,'Cable tray cross rung');
  pipe(roof,[.1,H-.40,z+.34],[L-.1,H-.40,z+.34],.018,green,'Exposed green pipe');
  for(let x=1.1;x<L;x+=2.6){
   for(const dx of [-.48,.48])pipe(roof,[x+dx,H-.22,z],[x+dx,H-.80,z],.006,silver,'Pendant suspension wire');
   box(lights,1.24,.055,.13,x,H-.82,z,silver,'Linear light housing');
   for(const dz of [-.037,.037])box(lights,1.18,.024,.027,x,H-.852,z+dz,glow,'Cool white linear tube');
  }
 }
 for(const z of [.70,W-.70]){
  box(roof,L-.55,.045,.045,L/2,H-1.06,z,black,'Wall display spotlight track');
  for(let x=1.1;x<L;x+=2.2){const body=mesh(lights,new THREE.CylinderGeometry(.065,.058,.16,16),black,x,H-1.20,z,'Angled black track spotlight');body.rotation.z=.35;
   const lens=mesh(lights,new THREE.CircleGeometry(.047,16),glow,x,H-1.28,z,'Spotlight lens');lens.rotation.x=-Math.PI/2;
  }
 }
 for(const z of [1.10,3.5,5.9])for(const x of [3.0,7.7,12.5]){const light=new THREE.PointLight(0xf2f4ff,22,7.0,1.55);light.position.set(x,H-1.0,z);lights.add(light);}
 for(const x of [2.5,7.0,11.5,15.0]){const d=mesh(roof,new THREE.CylinderGeometry(.26,.26,.012,32),silver,x,H-1.28,3.5,'Suspended circular service plate');pipe(roof,[x,H-.15,3.5],[x,H-1.28,3.5],.005,silver,'Service plate suspension');}
 const furnishing=createDisplayFurnishing({sourceModel,layout:[...ashanDisplays,...ashanWorkstation],woodTextures,parquetTextures,extraTextures});root.add(furnishing);
 const panel=createAshanCrownwoodPanels(woodTextures[0],extraTextures.ashanPanelReference);panel.position.set(13.985,0,W-.015);panel.rotation.y=Math.PI;placePanelAboveDisplays(panel,furnishing,['urban','nord']);root.add(panel);
 const crownWall=walls.find(w=>w.userData.side==='south');crownWall.userData.blankWall=false;crownWall.userData.crownwoodWall=true;crownWall.name='Dark showroom wall with three Crownwood decorative elements';root.updateMatrixWorld(true);crownWall.attach(panel);
 // Same timber backdrop and logo as Crocus, centred behind the consultation desk.
 // Its 3.1 m height is independent of Ashan's 5.1 m industrial ceiling.
 const desk=ashanWorkstation.find(o=>o.kind==='desk'),backdrop=createPolStranyWallPanel({oak:woodTextures[0]});backdrop.position.set(desk.x+wallLayout.brandPanel.width/2,0,W-.006);backdrop.rotation.y=Math.PI;root.add(backdrop);root.updateMatrixWorld(true);crownWall.attach(backdrop);
 // Category signs follow the actual wall banks: laminate / Quick-Step vinyl
 // share the long north wall; SPC Planker occupies the back wall.
 for(const [text,w,x,y,z,rotation,side] of [['ЛАМИНАТ',2.65,12.2,3.0,.015,0,'north'],['Quick-Step',2.50,6.05,3.0,.015,0,'north'],['SPC',1.40,.015,2.90,3.5,Math.PI/2,'back']]){
  const sign=createAshanCategorySign(text,w);sign.position.set(x,y,z);sign.rotation.y=rotation;root.add(sign);const wall=walls.find(o=>o.userData.side===side);wall.userData.blankWall=false;root.updateMatrixWorld(true);wall.attach(sign);
 }
 return {root,walls,roof,lights,portal,furnishing};
}
export function createDisplayFurnishing({sourceModel,layout,woodTextures=[],parquetTextures={},extraTextures={},roomId='ashan',createCustom=null}){
 const furnishing=new THREE.Group();furnishing.name=roomId+' displays placed by the supplied plan';
 const cache=new Map();
 for(const [i,spec] of layout.entries()){
  let clone=createCustom?.(spec.kind,spec);
  if(!clone){
  if(spec.kind==='underlay'&&roomId==='ashan'&&extraTextures.underlayReference)clone=createUnderlayRack(extraTextures.underlayReference);
  else if(remainingNames[spec.kind])clone=createRemainingRack(spec.kind,{woodTextures,herringboneTextures:parquetTextures.herringboneTextures,...extraTextures},spec.photoVariant??spec.variant??0);
  else if(extraRackNames[spec.kind])clone=createExtraRack(spec.kind,{woodTextures,herringboneTextures:parquetTextures.herringboneTextures,...extraTextures},spec.variant??0);
  else if(parquetNames[spec.kind])clone=createParquetStand(spec.kind,{woodTextures,...parquetTextures,compactFactory:roomId==='omsk'},spec.variant??0);
  else {
   if(!cache.has(spec.kind))cache.set(spec.kind,select(sourceModel,spec.kind));const candidates=cache.get(spec.kind);
   if(!candidates.length)throw new Error('Missing existing display '+spec.kind);
   clone=candidates[(spec.variant??i)%candidates.length].clone(true);
   if(spec.kind==='polarwood'&&spec.variant===4&&parquetTextures.herringboneTextures?.length){
    const surface=new THREE.MeshStandardMaterial({map:parquetTextures.herringboneTextures[0],color:0xe8ddc7,roughness:.73});
    clone.traverse(o=>{if(o.name==='Large upright parquet sample'){o.material=[...o.material];o.material[5]=surface;}if(o.name==='Rounded Polarwood front plaque')o.material=new THREE.MeshStandardMaterial({color:0x69a6bb,roughness:.85});});
   }
  }
  }
  clone.position.set(0,0,0);clone.rotation.set(0,0,0);clone.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(clone),size=bb.getSize(new THREE.Vector3()),center=bb.getCenter(new THREE.Vector3());
  const wrapper=new THREE.Group();wrapper.name=`${roomId} ${spec.kind} ${i+1}`;wrapper.userData={[roomId+'Fixture']:true,kind:spec.kind,index:i};
  clone.position.x-=center.x;clone.position.z-=center.z;wrapper.add(clone);wrapper.scale.set(spec.width/size.x,1,spec.depth/size.z);wrapper.rotation.y=spec.rotation??0;wrapper.position.set(spec.x,0,spec.z);furnishing.add(wrapper);
 }
 batchFurniture(furnishing,roomId);return furnishing;
}
