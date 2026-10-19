import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';
import font from './assets/update25/font.js?v=25';
function polygon(points,m,depth=.025){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1});const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,p.getX(i),p.getY(i));return new THREE.Mesh(g,m);}
function woodMaterial(oak,color,rotation=0){const t=oak?.clone();if(t){t.rotation=rotation;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.8,1.1);t.needsUpdate=true;}return new THREE.MeshStandardMaterial({map:t??null,color,roughness:.72});}
function logo(width=1,subtitle=false){
 const root=new THREE.Group(),gold=new THREE.MeshStandardMaterial({color:0xf4bd21,roughness:.45}),white=new THREE.MeshStandardMaterial({color:0xf7f6ec,roughness:.65});root.name='Crownwood single-line solid logo';
 const crown=new THREE.Group();crown.position.set(0,.245,.035);crown.scale.setScalar(.60);root.add(crown);
 for(const [points,m] of [
  [[[-.25,0],[-.25,.21],[-.09,.055],[0,.145],[.09,.055],[.25,.21],[.25,0],[.08,0],[0,.075],[-.08,0]],white],
  [[[-.25,.22],[-.09,.075],[0,.165],[.09,.075],[.25,.22],[.25,.30],[.09,.16],[0,.25],[-.09,.16],[-.25,.30]],gold],
  [[[0,.51],[.095,.415],[0,.32],[-.095,.415]],gold]
 ])crown.add(polygon(points,m,.013));
 const text=new THREE.Group();root.add(text);let x=0;
 for(const [part,color] of [['CRO',0xf7f6ed],['WN',0xf4bd21],['WOOD',0xf7f6ed]]){const l=makeWallLettering(part,.125,{font,color,depth:.010,tracking:.002});l.position.set(x,.14,.055);x+=l.userData.width;text.add(l);}text.position.x=-x/2;
 if(subtitle){const s=makeWallLettering('ИНЖЕНЕРНАЯ ДОСКА',.048,{font,color:0xf7f6ed,depth:.005,tracking:.002});s.scale.x=x/s.userData.width;s.position.set(-x/2,.035,.055);root.add(s);}
 const bb=new THREE.Box3().setFromObject(root),size=bb.getSize(new THREE.Vector3());root.scale.setScalar(width/size.x);return root;
}
export function createOmskCrownwoodPanel(oak){
 const root=new THREE.Group();root.name='Omsk geometric hexagonal Crownwood wall panel';root.userData={crownwoodWallPanel:true,panelStyle:'omsk-hexagons',referenceVersion:26};
 const r=.34,dx=r*1.5,dy=Math.sqrt(3)*r;
 const cells=[[-2,0],[-2,1],[-1,-1],[-1,0],[-1,1],[0,0],[0,1],[1,-1],[1,0],[1,1],[2,0],[2,1]];
 const mats=[woodMaterial(oak,0xc1a787,Math.PI/3),woodMaterial(oak,0xb59c79,-Math.PI/3),woodMaterial(oak,0xc8b092,Math.PI/2)];
 cells.forEach(([c,row],i)=>{const cx=c*dx,cy=row*dy+(Math.abs(c)%2?dy/2:0);const points=Array.from({length:6},(_,j)=>[cx+(r-.003)*Math.cos(j*Math.PI/3),cy+(r-.003)*Math.sin(j*Math.PI/3)]);const o=polygon(points,mats[i%3],.035);o.name='Separate hexagonal oak tile';o.userData.hexTile=true;root.add(o);
  // Three grain directions meet at the centre of every hexagon.
  for(let j=0;j<3;j++){const a=points[j*2],b=points[(j*2+1)%6],c=points[(j*2+2)%6],piece=polygon([[cx,cy],a,b,c],mats[j],.002);piece.position.z=.036;piece.name='Directional oak grain sector';root.add(piece);}
 });
 const b=new THREE.Box3().setFromObject(root),size=b.getSize(new THREE.Vector3()),centre=b.getCenter(new THREE.Vector3());for(const child of root.children){child.position.x-=centre.x;child.position.y-=b.min.y;}
 const brand=logo(1.20);brand.position.set(0,size.y*.35,.07);root.add(brand);return root;
}
export function createAshanCrownwoodPanels(oak,reference=null){
 const root=new THREE.Group();root.name='Ashan three separate Crownwood decorative panels';root.userData={crownwoodWallPanel:true,panelStyle:'ashan-three-elements',referenceVersion:25,elementCount:3,centralWidth:1};
 const mats=[woodMaterial(oak,0xa17d4e,Math.PI/4),woodMaterial(oak,0xd7bb89,0),woodMaterial(oak,0xb99257,Math.PI/2)];
 function artwork(points,rect,fallback){const m=reference?[new THREE.MeshStandardMaterial({map:reference,color:0xffffff,roughness:.8}),fallback]:fallback,o=polygon(points,m,.025);if(reference){const p=o.geometry.attributes.position,u=o.geometry.attributes.uv,[x0,y0,x1,y1]=rect,bb=new THREE.Box3().setFromObject(o),w=bb.max.x-bb.min.x,h=bb.max.y-bb.min.y;for(let i=0;i<u.count;i++)u.setXY(i,(x0+(p.getX(i)-bb.min.x)/w*(x1-x0))/1004,1-(y1-(p.getY(i)-bb.min.y)/h*(y1-y0))/679);}return o;}
 const left=new THREE.Group();left.name='Left dark geometric oak element';left.userData.panelElement='left';left.position.x=-1.24;root.add(left);
 const silhouette=[[80,260],[101,224],[140,224],[162,188],[216,188],[238,224],[275,224],[297,260],[275,300],[297,335],[274,375],[238,375],[216,411],[162,411],[140,375],[101,375],[80,335],[103,300]].map(([x,y])=>[(x-188.5)/217*.735,(411-y)/223*.76]);
 left.add(artwork(silhouette,[80,188,297,411],mats[0]));
 const middle=new THREE.Group();middle.name='Central one metre Crownwood logo panel';middle.userData.panelElement='middle';root.add(middle);
 const outline=[[-.50,.08],[-.375,0],[-.25,.08],[-.125,0],[0,.08],[.125,0],[.25,.08],[.375,0],[.50,.08],[.50,.78],[.375,.86],[.25,.78],[.125,.86],[0,.78],[-.125,.86],[-.25,.78],[-.375,.86],[-.50,.78]];
 middle.add(polygon(outline.map(([x,y])=>[x,y*.76/.86]),mats[1],.035));const brand=logo(.80,true);brand.position.set(0,.15,.044);middle.add(brand);
 const right=new THREE.Group();right.name='Right vertical-grain zigzag oak panel';right.userData.panelElement='right';right.position.x=1.24;root.add(right);
 const points=[[-.36,0],[.36,0],[.27,.14],[.36,.28],[.27,.42],[.36,.56],[.27,.70],[.36,.86],[-.36,.86],[-.27,.70],[-.36,.56],[-.27,.42],[-.36,.28],[-.27,.14]];right.add(artwork(points.map(([x,y])=>[x,y*.76/.86]),[680,188,895,411],mats[2]));return root;
}
export function placePanelAboveDisplays(panel,furnishing,kinds,gap=.07){
 const fixtures=furnishing.children.filter(o=>kinds.includes(o.userData.kind));let top=0;
 for(const f of fixtures)top=Math.max(top,new THREE.Box3().setFromObject(f).max.y);
 const bb=new THREE.Box3().setFromObject(panel);panel.position.y+=top+gap-bb.min.y;panel.userData.standTop=top;panel.userData.gap=gap;return panel;
}
export function createAshanCategorySign(text,width){const g=makeWallLettering(text,.24,{font,color:0xf7f7f1,depth:.009,tracking:.008});g.scale.x=width/g.userData.width;g.userData.ashanCategory=text;g.traverse(o=>{if(o.isMesh){o.castShadow=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.emissive=new THREE.Color(0xffffff);m.emissiveIntensity=.12;}}});return g;}
