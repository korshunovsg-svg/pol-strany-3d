import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';
import font from './assets/mall-font.js';
import {mallLayout,hallWallRects,mallFloorRects} from './mall-navigation.js?v=32';
import {createAshanSalon} from './ashan-salon.js?v=28';
import {createOmskSalon} from './omsk-salon.js?v=30';
import {ashanSize} from './ashan-layout.js?v=24';

function box(parent,w,h,d,x,y,z,m,name=''){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
export function addSalonEntranceSign(portal,city,{length=15,width=5.5,entranceMin=0,entranceMax=width,y=3.26,signWidth=4.95}={}){
 const group=new THREE.Group();group.name=`Пол Страны ${city}`;group.userData.entranceSign=true;
 const prefix=makeWallLettering('ПОЛ СТРАНЫ',.24,{font,color:0xb1de8c,depth:.009,tracking:.007});
 const suffix=makeWallLettering(city.toUpperCase(),.24,{font,color:0xf7f6ed,depth:.009,tracking:.007});
 suffix.position.x=prefix.userData.width+.12;group.add(prefix,suffix);
 const textWidth=suffix.position.x+suffix.userData.width;group.scale.x=signWidth/textWidth;
 group.rotation.y=Math.PI/2;group.position.set(length+.172,y,(entranceMin+entranceMax)/2+signWidth/2);portal.add(group);return group;
}
export function createMall({shellMeshes,roofTemplate,fixtureTemplate,portalTemplate,materials,tileTexture,sourceModel,woodTextures,parquetTextures,extraTextures}){
 const root=new THREE.Group();root.name='Shopping gallery · Omsk and Ashan';
 const hallRoof=new THREE.Group(),hallLights=new THREE.Group(),overviewLabels=new THREE.Group();root.add(hallRoof,hallLights,overviewLabels);
 const roofGroups=[hallRoof],lightGroups=[hallLights],portalGroups=[],wallMeshes=[];
 const pale=new THREE.MeshStandardMaterial({color:0xcdb796,roughness:.9});
 const stone=new THREE.MeshStandardMaterial({color:0xffffff,map:tileTexture,bumpMap:tileTexture,bumpScale:.00015,roughness:.86});
 const dark=new THREE.MeshStandardMaterial({color:0x323c3a,roughness:.72});
 const trim=new THREE.MeshStandardMaterial({color:0x7a806f,metalness:.35,roughness:.46});
 const glow=new THREE.MeshStandardMaterial({color:0xfff8e7,emissive:0xfff1d1,emissiveIntensity:2.4});
 const h=mallLayout.hall;
 for(const r of mallFloorRects){
  const w=r.maxX-r.minX,d=r.maxZ-r.minZ,x=(r.minX+r.maxX)/2,z=(r.minZ+r.maxZ)/2;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(w,d),stone);floor.rotation.x=-Math.PI/2;floor.position.set(x,.012,z);floor.receiveShadow=true;floor.name='Continuous tiled gallery floor';root.add(floor);
  box(root,w+.015,.10,d+.015,x,-.05,z,pale,'Gallery foundation');
  if(r!==h){box(hallRoof,w+.02,.12,d+.02,x,5.46,z,materials.roof,'Omsk approach corridor ceiling');for(let zz=r.minZ+.6;zz<r.maxZ;zz+=2.0)box(hallLights,Math.min(w-.3,1.5),.035,.075,x,5.31,zz,glow,'Omsk approach linear light');}
 }
 for(const spec of hallWallRects){
  // This wall is shared with Crocus: keep it outside the interior and use the
  // showroom finish on its +Z face, while the corridor face remains beige.
  const finish=spec.crocusSharedBoundary?[pale,pale,pale,pale,materials.wall,pale]:pale;
  const w=box(root,spec.maxX-spec.minX,5.4,spec.maxZ-spec.minZ,(spec.minX+spec.maxX)/2,2.7,(spec.minZ+spec.maxZ)/2,finish,'Gallery wall');
  if(spec.crocusSharedBoundary)w.userData.crocusSharedBoundary=true;
  w.userData.mallWall=true;wallMeshes.push(w);
  const cx=w.position.x,cz=w.position.z;
  w.userData.normal=cx>26?[1,0]:cx<16?[-1,0]:cz<0?[0,-1]:[0,1];
  box(root,spec.maxX-spec.minX,.09,spec.maxZ-spec.minZ+.01,cx,.045,cz,dark,'Gallery skirting');
 }
 // Continuous upper walls bridge each open shopfront up to the higher mall ceiling.

 box(hallRoof,7.16,.30,.16,21,5.25,8.5,pale,'Upper Ashan gallery facade');
 box(hallRoof,.16,1.72,11.66,15,4.54,2.75,pale,'Upper Crocus facade');
 box(hallRoof,12.16,.12,11.66,21,5.46,2.75,materials.roof,'High gallery ceiling');
 for(const z of [-2.78,8.28])box(hallRoof,11.65,.10,.16,21,5.28,z,dark,'Recessed ceiling border');
 for(const x of [15.22,26.78])box(hallRoof,.16,.10,11.0,x,5.28,2.75,dark,'Recessed ceiling border');
 for(const x of [18.3,23.7])for(const z of [-.95,2.75,6.45])box(hallLights,3.3,.035,.075,x,5.31,z,glow,'Gallery linear light');
 for(const x of [18.0,24.0])for(const z of [.1,5.4]){const light=new THREE.PointLight(0xfff1db,23,13,1.4);light.position.set(x,4.8,z);hallLights.add(light);}
 // Flush floor inlays lead from Crocus to the two side entrances.
 box(root,5.15,.002,.035,17.65,.017,2.75,trim,'Crocus approach inlay');
 box(root,.035,.002,11.05,20.25,.017,2.75,trim,'Link between side salons');
 // Decorative panels stay on the solid wall; the Omsk corner corridor stays open.
 for(const z of [1.3,4.2,7.1]){
  box(root,.035,3.6,2.54,26.825,2.26,z,materials.wall,'Forward gallery wall panel');
  box(root,.045,.045,2.34,26.80,4.13,z,trim,'Gallery panel cap');
 }
 const rooms=[];
 for(const spec of mallLayout.rooms.slice(1)){
  if(spec.id==='ashan'){
   const salon=createAshanSalon({sourceModel,woodTextures,parquetTextures,extraTextures});salon.root.position.set(spec.x,0,spec.z);salon.root.rotation.y=spec.rotation;root.add(salon.root);
   addSalonEntranceSign(salon.portal,spec.city,{...ashanSize,y:4.10,signWidth:2.80});
   roofGroups.push(salon.roof);lightGroups.push(salon.lights);portalGroups.push(salon.portal);
   rooms.push({root:salon.root,spec,walls:salon.walls});continue;
  }
  if(spec.id==='omsk'){
   const salon=createOmskSalon({sourceModel,woodTextures,parquetTextures,extraTextures});salon.root.position.set(spec.x,0,spec.z);salon.root.rotation.y=spec.rotation;root.add(salon.root);
   roofGroups.push(salon.roof);lightGroups.push(salon.lights);portalGroups.push(salon.portal);
   rooms.push({root:salon.root,spec,walls:salon.walls});continue;
  }

 }
 function label(text,x,z,width){const letters=makeWallLettering(text,.42,{font,color:0x55614e,depth:.002,tracking:.014});letters.scale.x=width/letters.userData.width;letters.rotation.x=-Math.PI/2;letters.position.set(x-width/2,.027,z+.2);overviewLabels.add(letters);}
 label('КРОКУС',6.5,2.75,2.65);label('ОМСК',23,-14,2.25);label('АШАН',20.25,16,2.25);
 function updateView({mode,showCeiling,showLights,cameraBase}){
  for(const roof of roofGroups)roof.visible=showCeiling&&mode==='walk';
  for(const lights of lightGroups)lights.visible=showLights&&mode==='walk';
  for(const portal of portalGroups)portal.visible=mode==='walk';
  overviewLabels.visible=mode!=='walk';
  for(const wall of wallMeshes){const n=wall.userData.normal;wall.visible=mode!=='orbit'||(cameraBase.x-wall.position.x)*n[0]+(cameraBase.z-wall.position.z)*n[1]<=0;}
  for(const room of rooms){
   const c=Math.cos(room.spec.rotation),s=Math.sin(room.spec.rotation),dx=cameraBase.x-room.spec.x,dz=cameraBase.z-room.spec.z;
   const x=c*dx-s*dz,z=s*dx+c*dz;
   const width=room.spec.width??5.5,length=room.spec.length??15,back=room.spec.id==='ashan'?0:1.05;
   for(const wall of room.walls){const out=wall.userData.outward;if(out){wall.visible=mode!=='orbit'||(x-out.x)*out.n[0]+(z-out.z)*out.n[1]<=0;continue;}wall.visible=mode!=='orbit'||!(wall.userData.side==='south'&&z>width||wall.userData.side==='north'&&z<0||wall.userData.side==='back'&&x<back||wall.userData.side==='front'&&x>length);}
  }
 }
 return {root,rooms,updateView};
}
