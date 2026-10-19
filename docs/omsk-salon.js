import * as THREE from './vendor/three.module.js';
import {omskSize,omskFootprint,omskWalls,omskDisplays,omskWorkstation,omskContains} from './omsk-layout.js?v=24';
import {createDisplayFurnishing,batchFurniture} from './ashan-salon.js?v=26';
import {makeWallLettering} from './wall-lettering.js';
import font from './assets/omsk/font.js?v=21';
import {createOmskCrownwoodPanel,placePanelAboveDisplays} from './crownwood-panels.js?v=26';
function mesh(p,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function box(p,w,h,d,x,y,z,m,name){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function psLogo(h){const g=new THREE.Group(),left=makeWallLettering('ПОЛ',h,{font,color:0x32bc25,depth:.008,tracking:.006});g.add(left);const iconX=left.userData.width+h*.17,iconW=h*.9,white=new THREE.MeshStandardMaterial({color:0xf8f8ef}),green=new THREE.MeshStandardMaterial({color:0x32bc25}),red=new THREE.MeshStandardMaterial({color:0xbd3442});box(g,iconW,h,.008,iconX+iconW/2,h/2,0,white,'PS logo white square');box(g,iconW*.55,h*.78,.010,iconX+iconW*.32,h*.59,.008,green,'PS logo green block');box(g,iconW*.35,h*.3,.012,iconX+iconW*.70,h*.18,.010,white,'PS logo white corner');const dot=mesh(g,new THREE.CircleGeometry(h*.16,20),red,iconX+iconW*.77,h*.83,.017,'PS logo red dot');const right=makeWallLettering('СТРАНЫ',h,{font,color:0xf8f8ef,depth:.008,tracking:.006});right.position.x=iconX+iconW+h*.15;g.add(right);g.userData={width:right.position.x+right.userData.width,text:'ПОЛ СТРАНЫ'};return g;}
function letters(p,text,height,x,y,z,rotation,color=0xf7f7ed,width=null){const g=text==='ПОЛ СТРАНЫ'?psLogo(height):makeWallLettering(text,height,{font,color,depth:.008,tracking:.009});if(width)g.scale.x=width/g.userData.width;g.rotation.y=rotation;g.position.set(x,y,z);g.traverse(o=>{if(o.isMesh){for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.emissive=m.color.clone();m.emissiveIntensity=.45;}o.castShadow=false;}});p.add(g);return g;}
function plankFloor(root,woodTextures){
 const m=[0xfffcf4,0xf5f0e4,0xfbf6e9].map(color=>new THREE.MeshStandardMaterial({map:woodTextures[4]??woodTextures[0]??null,color,roughness:.70})),out=m.map(()=>({p:[],uv:[]}));
 const {length:L,width:W,shoulderX:a,shoulderZ:b}=omskSize;
 for(const [x0,x1,z0,z1] of [[0,a,b,W],[a,L,0,W]])for(let row=0;row<Math.ceil((x1-x0)/.19);row++)for(let col=-1;col<Math.ceil((z1-z0)/1.30);col++){
  const x=x0+row*.19,z=z0+col*1.30+(row%3)*.43,xa=x+.001,xb=Math.min(x+.189,x1),za=Math.max(z+.001,z0),zb=Math.min(z+1.299,z1);if(xb<=xa||zb<=za)continue;const q=out[(row+col+30)%3];
  for(const [xx,zz] of [[xa,za],[xa,zb],[xb,zb],[xa,za],[xb,zb],[xb,za]]){q.p.push(xx,.016,zz);q.uv.push((xx-x)/.19,(zz-z)/1.3);}
 }
 out.forEach((b,i)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeVertexNormals();const o=mesh(root,g,m[i],0,0,0,'Omsk light oak plank floor');o.userData.omskFloor=true;o.castShadow=false;});
}
function lounge(kind){
 if(!['sofa','coffeeTable'].includes(kind))return null;const g=new THREE.Group(),dark=new THREE.MeshStandardMaterial({color:0x454c4c,roughness:.98}),wood=new THREE.MeshStandardMaterial({color:0xbba67e,roughness:.8}),metal=new THREE.MeshStandardMaterial({color:0x252c2d,metalness:.5,roughness:.6});
 if(kind==='sofa'){
  box(g,2.04,.30,.78,0,.38,0,dark,'Sofa upholstered base');box(g,1.88,.12,.61,0,.58,-.045,dark,'Sofa seat');
  for(const x of [-1,1])box(g,.13,.44,.84,x,.57,0,dark,'Sofa armrest');
  for(const x of [-.62,0,.62]){const o=box(g,.60,.54,.15,x,.85,.285,dark,'Sofa back cushion');o.rotation.x=-.09;}
  for(const x of [-.86,.86])for(const z of [-.28,.28]){const o=mesh(g,new THREE.CylinderGeometry(.025,.019,.20,10),wood,x,.13,z,'Sofa tapered oak leg');o.rotation.z=x>0?-.12:.12;}
 }else{
  const o=mesh(g,new THREE.CylinderGeometry(.41,.41,.025,40),dark,0,.39,0,'Low round coffee table');o.scale.z=.72;
  for(const x of [-.23,.23])for(const z of [-.13,.13])box(g,.018,.35,.018,x,.20,z,metal,'Coffee table leg');
  box(g,.25,.003,.18,-.06,.407,.0,new THREE.MeshStandardMaterial({color:0xe7e5d9}),'Magazine on the coffee table');
 }
 return g;
}
export function createOmskSalon({sourceModel,woodTextures=[],parquetTextures={},extraTextures={}}){
 const root=new THREE.Group();root.name='Omsk · G-shaped showroom from the original floor plan';root.userData={omskSalon:true,roomId:'omsk'};
 const roof=new THREE.Group(),lights=new THREE.Group(),portal=new THREE.Group();roof.name='Omsk high open-cell ceiling';lights.name='Omsk square LED panels and suspended linear lights';portal.name='Omsk open shopfronts and category signs';root.add(roof,lights,portal);
 const {length:L,width:W,height:H,shoulderX:a,shoulderZ:b}=omskSize;
 const ivory=new THREE.MeshStandardMaterial({color:0xe5e3d8,roughness:.94}),gray=new THREE.MeshStandardMaterial({color:0x42494a,roughness:.86}),grid=new THREE.MeshStandardMaterial({color:0x92968e,metalness:.25,roughness:.70}),dark=new THREE.MeshStandardMaterial({color:0x2f3433,roughness:.91}),glow=new THREE.MeshStandardMaterial({color:0xf4f7ed,emissive:0xf4f9ed,emissiveIntensity:1.8,roughness:.35});
 for(const [x0,x1,z0,z1] of [[0,a,b,W],[a,L,0,W]]){box(root,x1-x0,.08,z1-z0,(x0+x1)/2,-.035,(z0+z1)/2,dark,'Omsk foundation inside the G-shaped footprint');box(roof,x1-x0,.06,z1-z0,(x0+x1)/2,H+.10,(z0+z1)/2,dark,'Dark void above the open-cell ceiling');}
 plankFloor(root,woodTextures);
 const walls=[];
 for(const r of omskWalls){
  const g=new THREE.Group();g.userData={roomId:'omsk',omskWall:true,column:r.column,planId:r.planId,side:'custom'};g.name=r.column?'Full-height column from the PDF':'Omsk wall from the PDF';root.add(g);walls.push(g);
  const w=r.maxX-r.minX,d=r.maxZ-r.minZ,x=(r.minX+r.maxX)/2,z=(r.minZ+r.maxZ)/2;
  if(!r.column){let n=null;if(r.minX<.09&&w<.15)n=[-1,0];else if(r.maxZ>W-.09&&d<.45)n=[0,1];else if(Math.abs(z-b)<.15)n=[0,-1];else if(Math.abs(x-a)<.15&&z<b)n=[-1,0];if(n)g.userData.outward={x,z,n};}
  box(g,w,2.55,d,x,1.275,z,gray,r.column?'Dark lower column cladding':'Dark lower showroom wall');box(g,w,H-2.55,d,x,(H+2.55)/2,z,ivory,r.column?'White upper column to the ceiling':'White high showroom wall');
  if(r.column)box(g,w+.008,.045,d+.008,x,.027,z,ivory,'Column skirting');
 }
 // Low service-zone backdrop and a simple timber PS panel, as in the photographs.
 box(root,.025,2.6,2.6,a+.10,1.3,6.73,new THREE.MeshStandardMaterial({map:woodTextures[3]??null,color:0xd1c2a4,roughness:.87}),'Timber PS workstation backdrop');
 letters(root,'ПОЛ СТРАНЫ',.16,a+.122,2.10,7.68,Math.PI/2,0x40ad39,1.85);
 // Continuous rectangular lattice strips preserve real open cells instead of a flat texture.
 for(let x=.04;x<L;x+=.16){const start=x<a?b:0;box(roof,.008,.065,W-start,x,H-.02,(W+start)/2,grid,'Open-cell ceiling longitudinal strip');}
 for(let z=.04;z<W;z+=.16){const start=z<b?a:0;box(roof,L-start,.065,.008,(L+start)/2,H-.02,z,grid,'Open-cell ceiling cross strip');}
 for(const x of [4.9,9.3,14.2,18.3]){const start=x<a?b:0;box(roof,.24,.35,W-start,x,H-.19,(W+start)/2,ivory,'White structural ceiling beam');}
 for(const z of [4.9,10.85,16.4]){const start=z<b?a:0;box(roof,L-start,.35,.24,(L+start)/2,H-.19,z,ivory,'White structural transverse beam');}
 let panels=0;
 for(let x=1.0;x<L-.4;x+=1.85)for(let z=.90;z<W-.35;z+=1.85){if(!omskContains(x,z))continue;box(lights,.65,.045,.65,x,H-.075,z,ivory,'Square LED panel frame');const o=box(lights,.59,.012,.59,x,H-.105,z,glow,'Square luminous ceiling panel');o.castShadow=false;panels++;}
 for(const [x,z] of [[6.0,9.7],[6.0,14.1],[14.0,2.5],[18.2,2.5],[14.0,7.0],[18.2,7.0],[13.0,12.0],[18.2,12.0],[18.2,15.7]]){const light=new THREE.PointLight(0xf4f2df,16,8.4,1.65);light.position.set(x,H-.55,z);lights.add(light);}
 for(const z of [8.7,13.2])for(const x of [5.5,10.2]){for(const xx of [x-.45,x+.45])box(roof,.005,.40,.005,xx,H-.40,z,grid,'Linear light suspension wire');box(lights,1.20,.045,.08,x,H-.63,z,grid,'Suspended linear light housing');box(lights,1.15,.018,.035,x,H-.66,z,glow,'Suspended linear ceiling tube');}
 batchFurniture(roof,'omskRoof');batchFurniture(lights,'omskLight');
 // Point lights remain visible outside the hidden mesh source groups after batching.
 for(const o of lights.children)if(o.isLight)o.visible=true;
 const signY=3.18,signH=.66;
 box(portal,.16,signH,W,L+.015,signY+signH/2,W/2,gray,'Long charcoal fascia above the open shopfront');
 box(portal,L-a,signH,.16,(L+a)/2,signY+signH/2,-.025,gray,'Return fascia above the second open frontage');
 const words=[['ПАРКЕТ',1.65,2.7],['ПВХ-ПЛИТКА',5.65,3.2],['ПОЛ СТРАНЫ',9.4,2.5],['ЛАМИНАТ',12.7,2.5],['ЛИНОЛЕУМ',15.6,2.5]];
 for(const [text,z,w] of words){const g=letters(portal,text,.36,L+.102,signY+.16,z+w/2,Math.PI/2,text==='ПОЛ СТРАНЫ'?0x48c82e:0xf8f8ef,w);g.userData.omskFacadeSign=true;if(text==='ПОЛ СТРАНЫ'){g.userData.entranceSign=true;letters(portal,'ОМСК',.115,L+.105,signY+.025,z+.32,Math.PI/2,0xf7f5e6,.64);}}
 for(const [text,x,w] of [['ПАРКЕТ',12.1,2.5],['ПОЛ СТРАНЫ',16.1,2.9]]){const g=letters(portal,text,.38,x+w,signY+.14,-.112,Math.PI,text==='ПОЛ СТРАНЫ'?0x48c82e:0xf8f8ef,w);g.userData.omskFacadeSign=true;}
 const furnishing=createDisplayFurnishing({sourceModel,layout:[...omskDisplays,...omskWorkstation],woodTextures,parquetTextures,extraTextures,roomId:'omsk',createCustom:lounge});root.add(furnishing);
 const panel=createOmskCrownwoodPanel(woodTextures[0]);panel.position.set(a+.101,0,2.52);panel.rotation.y=Math.PI/2;placePanelAboveDisplays(panel,furnishing,['urban','nord']);walls.find(w=>w.userData.planId===253).add(panel);
 root.userData.ceilingPanels=panels;return {root,walls,roof,lights,portal,furnishing};
}
