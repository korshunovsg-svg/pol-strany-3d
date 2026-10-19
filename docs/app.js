import * as THREE from './vendor/three.module.js';
import { createWallDecor } from './wall-decor.js?v=26';
import {createWorkstation,workstationObstacles,drawWorkstationMap} from './workstation.js?v=17';
import {createSampleRacks,rackObstacles,drawSampleRacksMap} from './sample-racks.js?v=9';
import {createDWRacks,dwObstacles,drawDWRacksMap} from './dw-racks.js?v=10';
import {createPolarwoodRacks,polarwoodObstacles,drawPolarwoodMap} from './polarwood-racks.js?v=9';
import {createHarmonyRacks,harmonyObstacles,drawHarmonyMap} from './harmony-racks.js?v=10';
import {createMall,addSalonEntranceSign} from './mall-shell.js?v=28';
import {mallLayout,mallFloorRects,roomFootprint,getRoomFootprint,roomToWorld,mallLocation,containsMallFloor,createMallNavigation,mallMapMetrics,worldToMallMap,mallMapToWorld,transformRoomRect} from './mall-navigation.js?v=24';
import {omskSize,omskColumns,omskWalls,omskFurnitureObstacles,drawOmskMap} from './omsk-layout.js?v=24';
import {ashanFurnitureObstacles,drawAshanMap} from './ashan-layout.js?v=24';
import {createPVCRacks,pvcObstacles,drawPVCMap} from './pvc-racks.js?v=15';
import {createLaminateRacks,laminateObstacles,drawLaminateMap} from './laminate-racks.js?v=17';
import {createIslandRacks,islandObstacles,drawIslandMap} from './island-racks.js?v=17';
import {createSPCRacks,spcObstacles,drawSPCMap} from './spc-racks.js?v=23';
import {createCrocusUnderlay,underlayObstacles,drawUnderlayMap} from './underlay-rack.js?v=25';
import {batchFurniture} from './ashan-salon.js?v=28';
import {createScenePerformance} from './scene-performance.js?v=25';
const $=id=>document.getElementById(id);
const BASE={length:15,width:5.5,height:3.1,notch:1.05,notchEnd:4.05};
const omskSpec=mallLayout.rooms.find(r=>r.id==='omsk');
const ashanSpec=mallLayout.rooms.find(r=>r.id==='ashan');
const mallNavigation=createMallNavigation({furnitureObstacles:[...workstationObstacles,...rackObstacles,...dwObstacles,...polarwoodObstacles,...harmonyObstacles,...pvcObstacles,...laminateObstacles,...islandObstacles,...spcObstacles,...underlayObstacles,...omskFurnitureObstacles.map(o=>transformRoomRect(omskSpec,o)),...ashanFurnitureObstacles.map(o=>transformRoomRect(ashanSpec,o))]});
let dims={...BASE},mode='walk',yaw=Math.PI/2,pitch=0,orbitAngle=1.0,orbitPhi=.72,orbitRadius=18,planZoom=1,last=0,drag=null,renderDirty=true,lastRender=0,renderedFrames=0,showCeiling=true,showLights=true;
const keys=new Set(),pos=new THREE.Vector3(14.75,1.65,2.75),target=new THREE.Vector3(7.5,.2,2.75);
const scene=new THREE.Scene();scene.background=new THREE.Color('#9fa9a6');
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.045,500);camera.rotation.order='YXZ';
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;
const hemi=new THREE.HemisphereLight(0xe9f2ff,0x9a8065,2.0);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4de,2.4);sun.position.set(35,40,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:.5,far:120});sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;scene.add(sun);sun.target.position.set(13.5,0,2.75);scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xf4f8ff,1.1);fill.position.set(-4,6,-2);scene.add(fill);
const model=new THREE.Group();scene.add(model);const roof=new THREE.Group(),fixtures=new THREE.Group(),portal=new THREE.Group();model.add(roof,fixtures,portal);
const loader=new THREE.TextureLoader();
const oak=loader.load('assets/oak.jpg'),plaster=loader.load('assets/plaster.jpg');
for(const t of [oak,plaster]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
oak.repeat.set(7.5,3.4);oak.rotation=Math.PI/7;plaster.repeat.set(6,2);
const mat={wall:new THREE.MeshStandardMaterial({color:0xa7aaa7,map:plaster,roughness:.98}),white:new THREE.MeshStandardMaterial({color:0xe4e7df,roughness:.86}),floor:new THREE.MeshStandardMaterial({map:oak,roughness:.66}),beam:new THREE.MeshStandardMaterial({color:0x33383a,roughness:.72}),roof:new THREE.MeshStandardMaterial({color:0xc6ccc7,roughness:.9}),metal:new THREE.MeshStandardMaterial({color:0xa6ada9,metalness:.55,roughness:.58}),trim:new THREE.MeshStandardMaterial({color:0x333738,roughness:.8}),green:new THREE.MeshStandardMaterial({color:0x4ba52a,roughness:.72}),light:new THREE.MeshStandardMaterial({color:0xfff7e9,emissive:0xffebc9,emissiveIntensity:2.1,roughness:.4}),outside:new THREE.MeshStandardMaterial({color:0xb2b6af,roughness:.98})};
function box(w,h,d,x,y,z,m=mat.wall,parent=model){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
const H=BASE.height,L=BASE.length,W=BASE.width;
// The blue/green/yellow items in the source are displays, not walls. Only the black contour is used.
const footprint=[[1.05,0],[L,0],[L,W],[0,W],[0,4.05],[1.05,4.05]];
const shape=new THREE.Shape();footprint.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
const fg=new THREE.ShapeGeometry(shape);fg.rotateX(-Math.PI/2);
// ShapeGeometry has shape-space UVs: normalize before the metre-scale texture repeat.
const uv=fg.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)/L,uv.getY(i)/W);}uv.needsUpdate=true;
const floor=new THREE.Mesh(fg,mat.floor);floor.receiveShadow=true;floor.position.y=.012;model.add(floor);
box(L+.20,.14,W+.20,7.5,-.10,W/2,mat.white);
const walls=[];
function wall(w,d,x,z,side){const m=box(w,H,d,x,H/2,z);m.userData.side=side;walls.push(m);box(w,.065,d+.015,x,.04,z,mat.trim).userData.wallTrim=true;return m;}
wall(L-1.05+.18,.16,(L+1.05)/2,-.08,'north');wall(L+.18,.16,L/2,W+.08,'south');wall(.16,4.05+.16,.97,2.025-.04,'back');wall(1.05+.16,.16,.525,3.97,'back');wall(.16,W-4.05+.16,-.08,(W+4.05)/2,'back');
// The first two structural bays follow the wall composition in the supplied photo.
const leftWall=walls.find(w=>w.userData.side==='south');
createWallDecor({leftWall,oak});
model.add(createWorkstation({surfaceTexture:plaster,oak}));
const rackLabels={};
for(const collection of ['urban','elegance']){
 const label=loader.load(`assets/racks/label-${collection}.svg`);label.colorSpace=THREE.SRGBColorSpace;label.anisotropy=8;rackLabels[collection]=label;
}
const sampleWoods=Array.from({length:6},(_,i)=>{const t=loader.load(`assets/racks/oak-${i}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;});
model.add(createSampleRacks({labels:rackLabels,woodTextures:sampleWoods}));
const dwWoods=Array.from({length:10},(_,i)=>{const t=loader.load(`assets/dw/wood-${i}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;});
const dwLabel=loader.load('assets/dw/label.svg');dwLabel.colorSpace=THREE.SRGBColorSpace;dwLabel.anisotropy=8;
model.add(createDWRacks({woodTextures:dwWoods,labelTexture:dwLabel}));
const polarWoods=Array.from({length:9},(_,i)=>{const t=loader.load(`assets/polarwood/wood-${i}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;});
const polarLabel=loader.load('assets/polarwood/label.svg');polarLabel.colorSpace=THREE.SRGBColorSpace;polarLabel.anisotropy=8;
model.add(createPolarwoodRacks({woodTextures:polarWoods,labelTexture:polarLabel}));
const harmonyWoods={},harmonyLabel=loader.load('assets/harmony/label.svg');harmonyLabel.colorSpace=THREE.SRGBColorSpace;harmonyLabel.anisotropy=8;
for(const pattern of ['plank','herringbone'])harmonyWoods[pattern]=Array.from({length:6},(_,i)=>{const t=loader.load(`assets/harmony/${pattern}-${i}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;});
model.add(createHarmonyRacks({woodTextures:harmonyWoods.plank,herringboneTextures:harmonyWoods.herringbone,labelTexture:harmonyLabel}));
const pvcPhoto=loader.load('assets/pvc/reference.jpg'),pvcLabel=loader.load('assets/pvc/label.svg');
const pvcHeaders=Array.from({length:4},(_,i)=>loader.load(`assets/pvc/header-${i}.svg`));
for(const t of [pvcPhoto,pvcLabel,...pvcHeaders]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
const pvcMarble=loader.load('assets/mall-marble.jpg');pvcMarble.colorSpace=THREE.SRGBColorSpace;pvcMarble.anisotropy=8;
const pvcStone=loader.load('assets/plaster.jpg');pvcStone.colorSpace=THREE.SRGBColorSpace;pvcStone.anisotropy=8;
model.add(createPVCRacks({photoTexture:pvcPhoto,headerTextures:pvcHeaders,woodTextures:sampleWoods,stoneTextures:[pvcStone,pvcMarble],labelTexture:pvcLabel}));
const laminatePhoto=loader.load('assets/laminate/wall-reference.jpg'),bookPhoto=loader.load('assets/laminate/book-reference.jpg'),laminateLabel=loader.load('assets/laminate/label.svg');
const laminateHeaders=Array.from({length:5},(_,i)=>loader.load(`assets/laminate/header-${i}.svg`));
for(const t of [laminatePhoto,bookPhoto,laminateLabel,...laminateHeaders]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
model.add(createLaminateRacks({photoTexture:laminatePhoto,bookPhotoTexture:bookPhoto,headerTextures:laminateHeaders,woodTextures:sampleWoods,labelTexture:laminateLabel}));
const islandPhotos={},islandHeaders={},islandPlinths={},islandLabels={};
for(const brand of ['classen','deck','clix']){
 for(const [target,file] of [[islandPhotos,'reference.jpg'],[islandHeaders,'header.svg'],[islandPlinths,'plinth.svg'],[islandLabels,'label.svg']]){
  const t=loader.load(`assets/island/${brand}-${file}`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;target[brand]=t;
 }
}
model.add(createIslandRacks({photoTextures:islandPhotos,headerTextures:islandHeaders,plinthTextures:islandPlinths,labelTextures:islandLabels,woodTextures:sampleWoods,herringboneTextures:harmonyWoods.herringbone,stoneTexture:pvcStone}));
const spcPhotos={},spcHeaders={},spcPlinths={},spcLabels={};
for(const brand of ['alta','deck']){
 for(const [target,file] of [[spcPhotos,'reference.jpg'],[spcHeaders,'header.svg'],[spcPlinths,'plinth.svg'],[spcLabels,'label.svg']]){
  const t=loader.load(`assets/spc/${brand}-${file}`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;target[brand]=t;
 }
}
spcPhotos.polymer=loader.load('assets/spc/polymer-reference-v23.jpg');spcPhotos.polymer.colorSpace=THREE.SRGBColorSpace;spcPhotos.polymer.anisotropy=8;
model.add(createSPCRacks({photoTextures:spcPhotos,headerTextures:spcHeaders,plinthTextures:spcPlinths,labelTextures:spcLabels,woodTextures:sampleWoods,herringboneTextures:harmonyWoods.herringbone,stoneTextures:[pvcStone,pvcMarble]}));
// The square at the lower left of the new plan is retained as a fixed pier.
box(.45,H,.45,.225,H/2,W-.225,mat.white);
for(const z of [-.06,W+.06]){box(L+.12,.24,.22,L/2,H+.12,z,mat.white,roof);}
box(.22,.24,W+0.2,1.04,H+.12,W/2,mat.white,roof);
// Exposed roof deck, joists and narrow ribs inferred from the reference photographs.
box(L+.25,.10,W+.4,L/2,H+.77,W/2,mat.roof,roof);
for(let x=.3;x<L;x+=.16){box(.035,.08,W+.1,x,H+.68,W/2,mat.white,roof);}
for(const x of [1.1,4.1,7.1,10.1,14.85]){box(.16,.28,W+.22,x,H+.48,W/2,mat.white,roof);}
for(let x=2.4;x<L;x+=3.25){box(.18,.19,W-.1,x,H-.095,W/2,mat.beam,roof);for(const z of [.38,W-.38]){box(.1,.04,.4,x,H-.212,z,mat.light,fixtures);const p=new THREE.PointLight(0xffefd9,7,5,1.7);p.position.set(x,H-.3,z);fixtures.add(p);}}
for(const z of [1.15,3.9]){box(L-.7,.04,.025,(L+.7)/2,H+.29,z,mat.metal,roof);for(let x=2;x<L;x+=3){box(.72,.035,.055,x,H+.26,z,mat.light,fixtures);box(.007,.4,.007,x,H+.49,z,mat.metal,roof);}}
// Longitudinal canopy and recessed lights over the reference wall sections.
box(L,.12,.35,L/2,H-.035,W-.09,mat.beam,roof);
for(const x of [14.05,12.8,11.35,9.8,8.5,7.45]){
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.068,.068,.018,24),mat.metal);rim.position.set(x,H-.105,W-.235);fixtures.add(rim);
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.049,.049,.02,24),mat.light);lens.position.set(x,H-.109,W-.235);fixtures.add(lens);
}
for(const x of [13.4,11.4,8.7]){const light=new THREE.SpotLight(0xffedcf,12,5,.80,.8,1.5);light.position.set(x,H-.14,W-.26);light.target.position.set(x,1.7,W);fixtures.add(light,light.target);}
// White perimeter band, charcoal lintel and open entrance: there is no invented door wall.
box(.22,H,.22,L,H/2,-.02,mat.white,portal);box(.22,H,.22,L,H/2,W+.02,mat.white,portal);box(.25,.58,W+.35,L,H+.29,W/2,mat.white,portal);box(.265,.16,W+.2,L+.005,H+.45,W/2,mat.green,portal);
box(.035,.47,W+.10,L+.145,H+.27,W/2,mat.trim,portal);
addSalonEntranceSign(portal,'Крокус');
// Soft contact shading at the base of the walls, without baked product shadows.
const aoCanvas=document.createElement('canvas');aoCanvas.width=8;aoCanvas.height=128;const ag=aoCanvas.getContext('2d'),gradient=ag.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(13,18,15,.30)');gradient.addColorStop(1,'rgba(13,18,15,0)');ag.fillStyle=gradient;ag.fillRect(0,0,8,128);const aoTex=new THREE.CanvasTexture(aoCanvas),aoMat=new THREE.MeshBasicMaterial({map:aoTex,transparent:true,depthWrite:false,side:THREE.DoubleSide});
for(const [z,rot] of [[0,Math.PI/2],[W,-Math.PI/2]]){const a=new THREE.Mesh(new THREE.PlaneGeometry(L-1.05,.36),aoMat);a.rotation.x=-Math.PI/2;a.rotation.z=rot<0?Math.PI:0;a.position.set((L+1.05)/2,.018,z+(z===0?.18:-.18));model.add(a);}
// New rooms clone architectural meshes only: displays and wall branding remain in Crocus.
const tileTexture=loader.load('assets/mall-marble.jpg');tileTexture.wrapS=tileTexture.wrapT=THREE.RepeatWrapping;tileTexture.repeat.set(10,11.5/1.2);tileTexture.colorSpace=THREE.SRGBColorSpace;tileTexture.anisotropy=8;
const shellMeshes=model.children.filter(o=>o.isMesh&&o.position.y>=0&&!o.material.transparent);
const parquetTextures={photoTextures:{},nameTextures:{},herringboneTextures:harmonyWoods.herringbone};
for(const kind of ['islands','aura','prime'])parquetTextures.photoTextures[kind]=loader.load(`assets/parquet/${kind}-reference.jpg`);
for(const kind of ['islands','aura','prime','crownwoodClassic','alpine','livingTree','woodBee','nord','factoryFloors'])parquetTextures.nameTextures[kind]=loader.load(`assets/parquet/name-${kind}.svg`);
parquetTextures.labelTexture=loader.load('assets/parquet/product-label.svg');
for(const t of [...Object.values(parquetTextures.photoTextures),...Object.values(parquetTextures.nameTextures),parquetTextures.labelTexture]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
const extraTextures={photoTextures:{},brandTextures:{},labelTexture:loader.load('assets/ashan-extra/product-label.svg')};
extraTextures.underlayReference=loader.load('assets/update25/underlay-reference.png');extraTextures.underlayReference.colorSpace=THREE.SRGBColorSpace;extraTextures.underlayReference.anisotropy=4;
extraTextures.ashanPanelReference=loader.load('assets/update25/ashan-panels-reference.png');extraTextures.ashanPanelReference.colorSpace=THREE.SRGBColorSpace;extraTextures.ashanPanelReference.anisotropy=4;
extraTextures.corkartPanelReference=loader.load('assets/update28/corkart-reference.jpg');extraTextures.corkartPanelReference.colorSpace=THREE.SRGBColorSpace;extraTextures.corkartPanelReference.anisotropy=4;
model.add(createCrocusUnderlay(extraTextures.underlayReference));
extraTextures.remainingPhotos={};extraTextures.remainingLabels={};
for(const kind of ['alpinePVC','evofloor','skalla','norland','karelia','carpet'])extraTextures.remainingPhotos[kind]=loader.load(`assets/remaining/${kind}-reference.jpg`);
for(const kind of ['alpinePVC','evofloor','skalla','norland','karelia','carpet','tulesna','myStep','alpineLaminate','ultrafloor','anticWood','eppe','scheucher','corkart','corkartPVC','orac','plinth','underlay','linoleum'])extraTextures.remainingLabels[kind]=loader.load(`assets/remaining/name-${kind}.svg`);
for(const t of [...Object.values(extraTextures.remainingPhotos),...Object.values(extraTextures.remainingLabels)]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
for(const kind of ['docke','planker','quickAccessories'])extraTextures.photoTextures[kind]=loader.load(`assets/ashan-extra/${kind}-reference${kind==='docke'?'-v23':''}.jpg`);
for(const kind of ['docke','planker','quickAccessories'])extraTextures.brandTextures[kind]=loader.load(`assets/ashan-extra/${kind}-brand.svg`);
for(const t of [...Object.values(extraTextures.photoTextures),...Object.values(extraTextures.brandTextures),extraTextures.labelTexture]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
const mall=createMall({shellMeshes,roofTemplate:roof,fixtureTemplate:fixtures,portalTemplate:portal,materials:mat,tileTexture,sourceModel:model,woodTextures:sampleWoods,parquetTextures,extraTextures});model.add(mall.root);
// Crocus previously submitted thousands of tiny sample parts individually.
// Merge static surfaces after the other salons have cloned their prototypes.
const crocusFurniture=new THREE.Group();crocusFurniture.name='Crocus static display batches';
for(const child of [...model.children])if(child.isGroup&&![roof,fixtures,portal,mall.root].includes(child))crocusFurniture.add(child);
model.add(crocusFurniture);batchFurniture(crocusFurniture,'crocus');batchFurniture(roof,'crocusRoof');batchFurniture(fixtures,'crocusLight');
for(const child of fixtures.children)if(child.isLight)child.visible=true;
const scenePerformance=createScenePerformance({scene,camera,renderer});
function requestRender(){renderDirty=true;}
function collision(x,z){const sx=dims.length/L,sz=dims.width/W;const result=mallNavigation.resolveMove(x/sx,z/sz,{x:pos.x/sx,z:pos.z/sz});return [result[0]*sx,result[1]*sz];}
function overviewSize(){const b=mallLayout.bounds;return {x:(b.maxX-b.minX)*dims.length/L,z:(b.maxZ-b.minZ)*dims.width/W};}
function overviewCenter(){const b=mallLayout.bounds;return new THREE.Vector3((b.minX+b.maxX)/2*dims.length/L,.2,(b.minZ+b.maxZ)/2*dims.width/W);}
function fitOrbit(){
 const sx=dims.length/L,sy=dims.height/H,sz=dims.width/W,tan=Math.tan(48*Math.PI/360),c=overviewCenter();
 const direction=new THREE.Vector3(Math.sin(orbitAngle)*Math.cos(orbitPhi),Math.sin(orbitPhi),Math.cos(orbitAngle)*Math.cos(orbitPhi));
 const right=new THREE.Vector3(Math.cos(orbitAngle),0,-Math.sin(orbitAngle)),up=direction.clone().cross(right),points=[];
 for(const room of mallLayout.rooms)for(const [x,z] of getRoomFootprint(room)){const p=roomToWorld(room,x,z);for(const y of [0,room.height??4.0])points.push(new THREE.Vector3(p.x*sx,y*sy,p.z*sz));}
 for(const x of [15,27])for(const z of [-3,8.5])for(const y of [0,5.52])points.push(new THREE.Vector3(x*sx,y*sy,z*sz));
 return Math.max(...points.map(p=>{const v=p.sub(c),depth=v.dot(direction);return Math.max(depth+Math.abs(v.dot(right))/(tan*camera.aspect),depth+Math.abs(v.dot(up))/tan);}))*1.10;
}
function updateCamera(){
 if(mode==='walk'){camera.fov=64;camera.position.copy(pos);camera.rotation.set(pitch,yaw,0,'YXZ');}
 else {
  const c=target;camera.fov=mode==='plan'?43:48;
  if(mode==='plan'){const size=overviewSize(),tan=Math.tan(43*Math.PI/360),height=Math.max(size.x/(2*tan),size.z/(2*tan*camera.aspect))*1.10;camera.position.set(c.x,c.y+height*planZoom,c.z+.001);camera.up.set(1,0,0);}
  else {camera.up.set(0,1,0);camera.position.set(c.x+Math.sin(orbitAngle)*Math.cos(orbitPhi)*orbitRadius,c.y+Math.sin(orbitPhi)*orbitRadius,c.z+Math.cos(orbitAngle)*Math.cos(orbitPhi)*orbitRadius);}
  camera.lookAt(c);
 }
 camera.updateProjectionMatrix();renderer.shadowMap.enabled=mode==='walk';roof.visible=showCeiling&&mode==='walk';fixtures.visible=showLights&&mode==='walk';portal.visible=mode==='walk';
 for(const w of walls)w.visible=mode!=='orbit'||!(w.userData.side==='south'&&camera.position.z>dims.width||w.userData.side==='north'&&camera.position.z<0||w.userData.side==='back'&&camera.position.x<1.05*dims.length/L);
 mall.updateView({mode,showCeiling,showLights,cameraBase:{x:camera.position.x*L/dims.length,z:camera.position.z*W/dims.width}});
}
function setMode(m){
 const previousMode=mode;mode=m;drag=null;camera.up.set(0,1,0);document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
 $('crosshair').style.display=m==='walk'?'block':'none';$('viewText').textContent=m==='walk'?'Высота взгляда · 1,65 м':m==='orbit'?'Три салона и общий холл':'План трёх салонов';
 $('instructions').innerHTML=m==='walk'?'<strong>Прогулка между салонами</strong><span>Зажмите мышь — осмотреться · через холл — Омск и Ашан</span><div class="keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><em>или стрелки — ходить</em><kbd>Shift</kbd><em>быстрее</em></div>':m==='orbit'?'<strong>Свободный обзор 3D</strong><span>Левая кнопка — вращение · правая или Shift + левая — сдвиг</span><span>Колесо — масштаб · двойной щелчок — центр вращения · ↺ — показать всё</span>':'<strong>Свободный вид сверху</strong><span>Перетаскивайте план · колесо — масштаб к курсору</span><span>Двойной щелчок — центр просмотра · ↺ — показать всё</span>';
 if(m!=='walk'&&previousMode==='walk')resetOverview();
 $('resetButton').title=m==='walk'?'Вернуться ко входу Крокуса':'Показать все салоны';
 $('resetButton').setAttribute('aria-label',$('resetButton').title);
 scenePerformance.invalidateShadow();requestRender();
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
function resetOverview(){target.copy(overviewCenter());orbitAngle=1.0;orbitPhi=.72;orbitRadius=fitOrbit();planZoom=1;requestRender();}
function reset(){pos.set(dims.length-.25,1.65,dims.width/2);yaw=Math.PI/2;pitch=0;keys.clear();setMode('walk');}
$('resetButton').onclick=()=>{if(mode==='walk')reset();else resetOverview();};
for(const [b,p] of [['settingsButton','settings'],['referenceButton','references']])$(b).onclick=()=>{const open=$(p).hidden;$('settings').hidden=true;$('references').hidden=true;$(p).hidden=!open;keys.clear();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).hidden=true);
function applySizes(){const oldL=dims.length,oldW=dims.width;for(const id of ['length','width','height']){dims[id]=Number($(id).value);$(id+'Value').textContent=dims[id].toLocaleString('ru-RU')+' м';}model.scale.set(dims.length/L,dims.height/H,dims.width/W);oak.repeat.set(dims.length/2,dims.width/1.62);pos.x*=dims.length/oldL;pos.z*=dims.width/oldW;target.copy(overviewCenter());const [x,z]=collision(pos.x,pos.z);pos.x=x;pos.z=z;orbitRadius=fitOrbit();planZoom=1;scenePerformance.refresh();requestRender();}
for(const id of ['length','width','height'])$(id).oninput=applySizes;
$('defaultSizes').onclick=()=>{for(const id of ['length','width','height'])$(id).value=BASE[id];applySizes();reset();};
$('ceiling').onchange=e=>{showCeiling=e.target.checked;scenePerformance.invalidateShadow();requestRender();};$('lighting').onchange=e=>{showLights=e.target.checked;scenePerformance.updateLights(true);requestRender();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){$('fullscreen').title='Полноэкранный режим недоступен в этом окне';}};
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;const map={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright',ShiftLeft:'shift',ShiftRight:'shift'};if(map[e.code]){keys.add(map[e.code]);e.preventDefault();}if(e.code==='Escape'){$('settings').hidden=true;$('references').hidden=true;}});
window.addEventListener('keyup',e=>{const map={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright',ShiftLeft:'shift',ShiftRight:'shift'};keys.delete(map[e.code]);});
window.addEventListener('blur',()=>{keys.clear();drag=null;});document.addEventListener('visibilitychange',()=>keys.clear());
const canvas=$('scene'),ground=new THREE.Plane(new THREE.Vector3(0,1,0),-.2),raycaster=new THREE.Raycaster();
function groundAt(x,y){const r=canvas.getBoundingClientRect();camera.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);const p=raycaster.ray.intersectPlane(ground,new THREE.Vector3());return p&&p.distanceTo(camera.position)<1000?p:null;}
function clampTarget(){const b=mallLayout.bounds,sx=dims.length/L,sz=dims.width/W;target.x=THREE.MathUtils.clamp(target.x,(b.minX-20)*sx,(b.maxX+20)*sx);target.z=THREE.MathUtils.clamp(target.z,(b.minZ-20)*sz,(b.maxZ+20)*sz);}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(mode!=='walk')e.preventDefault();drag={x:e.clientX,y:e.clientY,action:mode==='plan'||e.button===1||e.button===2||e.shiftKey?'pan':'rotate'};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(mode==='walk'){yaw-=dx*.0035;pitch=THREE.MathUtils.clamp(pitch-dy*.003,-1.12,1.12);}
 else if(drag.action==='pan'){const a=groundAt(drag.x,drag.y),b=groundAt(e.clientX,e.clientY);if(a&&b){target.add(a.sub(b));clampTarget();}}
 else{orbitAngle-=dx*.006;orbitPhi=THREE.MathUtils.clamp(orbitPhi+dy*.004,.15,1.4);}
 drag.x=e.clientX;drag.y=e.clientY;updateCamera();requestRender();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
canvas.addEventListener('dblclick',e=>{if(mode==='walk')return;const p=groundAt(e.clientX,e.clientY);if(p){target.copy(p);clampTarget();requestRender();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='walk'){const step=-Math.sign(e.deltaY)*.45,[x,z]=collision(pos.x-Math.sin(yaw)*step,pos.z-Math.cos(yaw)*step);pos.x=x;pos.z=z;requestRender();return;}
 const r=canvas.getBoundingClientRect(),x=e.clientX??r.left+r.width/2,y=e.clientY??r.top+r.height/2,before=groundAt(x,y),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?r.height:1),factor=Math.exp(THREE.MathUtils.clamp(delta,-800,800)*.0015);
 if(mode==='orbit')orbitRadius=THREE.MathUtils.clamp(orbitRadius*factor,2,250);else planZoom=THREE.MathUtils.clamp(planZoom*factor,.035,4);
 updateCamera();const after=groundAt(x,y);if(before&&after){target.add(before.sub(after));clampTarget();}requestRender();
},{passive:false});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>keys.delete(b.dataset.key));}
const mini=$('minimap'),ctx=mini.getContext('2d'),mapBase=document.createElement('canvas');mapBase.width=mini.width;mapBase.height=mini.height;
function buildMapBase(){const ctx=mapBase.getContext('2d');
 ctx.clearRect(0,0,mini.width,mini.height);const {s,ox,oy}=mallMapMetrics(mini.width,mini.height),b=mallLayout.bounds;
 ctx.save();ctx.transform(0,-s,s,0,ox-s*b.minZ,oy+s*b.maxX);
 ctx.fillStyle='#656d60';for(const h of mallFloorRects)ctx.fillRect(h.minX,h.minZ,h.maxX-h.minX,h.maxZ-h.minZ);
 for(const room of mallLayout.rooms){
  const fp=getRoomFootprint(room);ctx.save();ctx.translate(room.x,room.z);ctx.rotate(-room.rotation);ctx.fillStyle=room.id==='crocus'?'#394c3c':room.id==='ashan'?'#36414b':'#46534a';ctx.beginPath();fp.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));ctx.closePath();ctx.fill();
  ctx.strokeStyle='#a3b4a4';ctx.lineWidth=.12;ctx.beginPath();
  if(room.id==='omsk'){for(const r of omskWalls){ctx.strokeRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);}ctx.setLineDash([.12,.12]);ctx.moveTo(omskSize.shoulderX,0);ctx.lineTo(omskSize.length,0);ctx.lineTo(omskSize.length,omskSize.width);}
  else if(room.id==='ashan'){ctx.moveTo(16.5,2);for(const [x,z] of [[16.5,0],[0,0],[0,7],[16.5,7],[16.5,5]])ctx.lineTo(x,z);ctx.stroke();ctx.setLineDash([.12,.12]);ctx.beginPath();ctx.moveTo(16.5,2);ctx.lineTo(16.5,5);}
  else{ctx.moveTo(15,0);for(const [x,z] of [roomFootprint[0],roomFootprint[5],roomFootprint[4],roomFootprint[3],roomFootprint[2]])ctx.lineTo(x,z);ctx.stroke();ctx.fillStyle='#a8afa0';ctx.fillRect(0,5.05,.45,.45);ctx.setLineDash([.12,.12]);ctx.beginPath();ctx.moveTo(15,.1);ctx.lineTo(15,5.4);}
  ctx.strokeStyle='#c1ed94';ctx.stroke();ctx.setLineDash([]);
  if(room.id==='crocus'){drawWorkstationMap(ctx);drawSampleRacksMap(ctx);drawDWRacksMap(ctx);drawPolarwoodMap(ctx);drawHarmonyMap(ctx);drawPVCMap(ctx);drawLaminateMap(ctx);drawIslandMap(ctx);drawSPCMap(ctx);drawUnderlayMap(ctx);}
  if(room.id==='ashan')drawAshanMap(ctx);
  if(room.id==='omsk')drawOmskMap(ctx);
  ctx.restore();
 }
 ctx.restore();
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 12px Arial';
 for(const room of mallLayout.rooms){const p=roomToWorld(room,(room.length??14)/2,(room.width??5.5)/2),screen=worldToMallMap(p.x,p.z,mini.width,mini.height);ctx.fillStyle='#dae8d8';ctx.fillText(room.city,screen.x,screen.y);}
 const center=worldToMallMap(24.8,2.75,mini.width,mini.height);ctx.fillStyle='#c3cfb9';ctx.font='10px Arial';ctx.fillText('ХОЛЛ',center.x,center.y);
}
buildMapBase();
function drawMap(){
 ctx.clearRect(0,0,mini.width,mini.height);ctx.drawImage(mapBase,0,0);const {s,ox,oy}=mallMapMetrics(mini.width,mini.height),b=mallLayout.bounds;ctx.save();ctx.transform(0,-s,s,0,ox-s*b.minZ,oy+s*b.maxX);
 const x=pos.x*L/dims.length,z=pos.z*W/dims.width;ctx.translate(x,z);ctx.rotate(-yaw);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,1.3,-Math.PI/2-.5,-Math.PI/2+.5);ctx.closePath();ctx.fillStyle='#b9ee833d';ctx.fill();ctx.beginPath();ctx.arc(0,0,.22,0,Math.PI*2);ctx.fillStyle='#c0fb8e';ctx.fill();ctx.strokeStyle='#1c281b';ctx.lineWidth=.07;ctx.stroke();ctx.restore();
}
mini.addEventListener('pointerdown',e=>{const r=mini.getBoundingClientRect(),p=mallMapToWorld((e.clientX-r.left)*mini.width/r.width,(e.clientY-r.top)*mini.height/r.height,mini.width,mini.height);if(!containsMallFloor(p.x,p.z))return;const [x,z]=collision(p.x*dims.length/L,p.z*dims.width/W);pos.x=x;pos.z=z;setMode('walk');});
function tick(t){requestAnimationFrame(tick);const delta=t-last,dt=Math.min(delta/1000,.10)||0;last=t;if(document.hidden)return;let moved=false;
 if(mode==='walk'){
  let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),right=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
  if(forward||right){const n=Math.hypot(forward,right),speed=(keys.has('shift')?3.8:1.85)*dt;forward/=n;right/=n;const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed,steps=Math.max(1,Math.ceil(speed/.07));for(let i=0;i<steps;i++){const [x,z]=collision(pos.x+dx/steps,pos.z+dz/steps);moved=moved||x!==pos.x||z!==pos.z;pos.set(x,1.65,z);}}
 }
 if(!renderDirty&&!moved)return;
 const location=mode==='walk'?mallLocation(pos.x*L/dims.length,pos.z*W/dims.width):mode==='orbit'?'Галерея салонов':'План трёх салонов';if($('locationText').textContent!==location)$('locationText').textContent=location;
 updateCamera();scenePerformance.updateLights();scenePerformance.sampleFrame(delta,t-lastRender<120);drawMap();renderer.render(scene,camera);renderedFrames++;lastRender=t;renderDirty=false;
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);requestRender();});
THREE.DefaultLoadingManager.onProgress=()=>requestRender();
THREE.DefaultLoadingManager.onLoad=()=>{requestRender();$('loading').classList.add('hide');setTimeout(()=>$('loading').hidden=true,700);};
THREE.DefaultLoadingManager.onError=url=>{requestRender();console.warn('Texture unavailable:',url);$('loading').classList.add('hide');};
// The canvas and all controls work without a mouse lock, including embedded browsers.
setTimeout(()=>{$('loading').classList.add('hide');},4500);requestAnimationFrame(tick);
setMode('walk');
// A direct review link opens the new salon while the ordinary URL still opens Crocus.
if(window.location?.hash==='#ashan'){
 const entry=roomToWorld(ashanSpec,15.6,1.5);pos.set(entry.x,1.65,entry.z);yaw=Math.PI;pitch=0;
}
if(window.location?.hash==='#omsk'){const entry=roomToWorld(omskSpec,omskSize.length-1.2,6.4);pos.set(entry.x,1.65,entry.z);yaw=0;pitch=0;}
// Expose only non-sensitive model metadata for future refinement and offline inspection.
window.salonModel={footprint,base:BASE,mallLayout,getDimensions:()=>({...dims}),getPosition:()=>pos.toArray(),getLocation:()=>mallLocation(pos.x*L/dims.length,pos.z*W/dims.width),setMode,getOverview:()=>({target:target.toArray(),radius:orbitRadius,planZoom,angle:orbitAngle}),getPerformance:()=>({...scenePerformance.status(),renderedFrames})};
