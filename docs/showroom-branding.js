import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';
import {wallLayout} from './wall-decor.js?v=26';
import fonts from './assets/update27/font.js';
import newFonts from './assets/update28/font.js';
function matte(color){return new THREE.MeshStandardMaterial({color,roughness:.68});}
function box(root,w,h,d,x,y,z,material,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.name=name;o.receiveShadow=true;root.add(o);return o;}
function centeredText(text,height,options){const g=makeWallLettering(text,height,options),b=new THREE.Box3().setFromObject(g);g.position.x=-(b.min.x+b.max.x)/2;g.position.y=-b.min.y;return g;}
export function createQuickStepWallLogo(width=2.5){
 const root=new THREE.Group();root.name='Quick-Step wall logo from the supplied reference';root.userData={quickStepLogo:true,ashanCategory:'Quick-Step',referenceVersion:27};
 const pink=matte(0xbe1761),name=new THREE.Group();name.name='QUICK·STEP';root.add(name);
 const quick=makeWallLettering('QUICK',.36,{font:fonts.bold,color:0xf5f5f1,depth:.014,tracking:.004}),step=makeWallLettering('STEP',.36,{font:fonts.bold,color:0xf5f5f1,depth:.014,tracking:.004});name.add(quick,step);
 const dot=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.016,32),pink);dot.rotation.x=Math.PI/2;dot.position.set(quick.userData.width+.053,.16,.008);dot.name='Magenta dot between QUICK and STEP';name.add(dot);step.position.x=quick.userData.width+.112;
 const b=new THREE.Box3().setFromObject(name);name.position.set(-(b.min.x+b.max.x)/2,.25-b.min.y,.005);
 const slogan=centeredText('FLOOR DESIGNERS',.115,{font:fonts.regular,color:0xf5f5f1,depth:.007,tracking:.031});slogan.scale.x=(b.max.x-b.min.x)*.79/slogan.userData.width;slogan.position.x*=slogan.scale.x;root.add(slogan);
 for(const x of [-.22,0,.22]){const shape=new THREE.Shape();shape.moveTo(x-.13,.69);shape.lineTo(x-.055,.65);shape.lineTo(x+.205,1.00);shape.lineTo(x+.130,1.04);shape.closePath();const bar=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:false}),pink);bar.name='Magenta Quick-Step diagonal emblem stroke';bar.position.set(-.035,.10,0);root.add(bar);}
 const extent=new THREE.Box3().setFromObject(root);root.scale.setScalar(width/(extent.max.x-extent.min.x));return root;
}
// Keep the same two labels, lettering style and proportions as the Crocus wall.
// Local origin is the centre of the label bank at its bottom edge.
export function createParquetHeadings(width=3.9){
 const root=new THREE.Group();root.name='Engineering board and parquet wall headings';root.userData.parquetHeadings=true;const scale=width/3.9;
 for(const spec of wallLayout.inscriptions){const g=makeWallLettering(spec.text,spec.height,{color:0xf7f7f1,depth:.009});g.scale.x=spec.width/g.userData.width;g.position.set(spec.u-1.95,spec.y-2.65,.005);root.add(g);}
 const b=new THREE.Box3().setFromObject(root);for(const g of root.children)g.position.y-=b.min.y;root.scale.setScalar(scale);return root;
}
export function createWallCategorySign(text,width,height=.24){
 const root=new THREE.Group(),letters=centeredText(text,height,{font:newFonts.category,color:0xf7f7f1,depth:.009,tracking:.008}),b=new THREE.Box3().setFromObject(letters);letters.scale.x=width/(b.max.x-b.min.x);letters.position.x*=letters.scale.x;root.add(letters);root.name=text+' wall category';root.userData.categoryText=text;return root;
}
export function createCorkartBrandPanel(reference=null,width=1.55){
 const height=width*1.10/1.55,root=new THREE.Group();root.name='Corkart cork mosaic and green emblem from the reference';root.userData={brandZone:'Corkart',width,height,referenceVersion:28,photoReference:!!reference};
 box(root,width,height,.025,0,height/2,-.010,matte(0x3c3024),'Cork mosaic panel backing');
 const patches=[[240,48,367,112],[375,55,466,115],[470,58,570,112],[737,70,841,125],[846,75,949,125],[957,78,1051,123],[275,146,407,214],[793,148,903,216],[322,228,481,287],[906,251,1033,302],[278,419,416,480],[480,482,597,532],[801,452,954,515],[632,421,764,472]];
 let seed=528;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;},tiles=[],rowHeight=height/9;
 for(let row=0;row<9;row++){let x=-width/2;while(x<width/2-.001){const w=Math.min(width/2-x,(x===-width/2?.12:.20)+rand()*.16),d=.010+rand()*.003;tiles.push({x:x+w/2,y:(row+.5)*rowHeight,w:w-.001,h:rowHeight-.001,d,patch:patches[Math.floor(rand()*patches.length)]});x+=w;}}
 const sides=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),matte(0x796047),tiles.length),dummy=new THREE.Object3D(),positions=[],uvs=[];sides.name='Individual raised cork rectangles';
 for(let i=0;i<tiles.length;i++){const t=tiles[i];dummy.position.set(t.x,t.y,t.d/2+.004);dummy.scale.set(t.w,t.h,t.d);dummy.updateMatrix();sides.setMatrixAt(i,dummy.matrix);const [x0,y0,x1,y1]=t.patch;
  for(const [u,v] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){positions.push(t.x+(u-.5)*t.w,t.y+(v-.5)*t.h,t.d+.0041);uvs.push((x0+u*(x1-x0))/1152,1-(y1-v*(y1-y0))/1536);}
 }
 root.add(sides);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();const front=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:reference,color:reference?0xffffff:0x93764f,roughness:.97}));front.name='Cork texture rectangles sampled from the original photograph';root.add(front);
 // Trace the green two-tree emblem as a single raised shape with an open counter.
 const shape=new THREE.Shape(),unit=.31/160,pt=(x,y)=>[(x-646)*unit,(277-y)*unit];
 shape.moveTo(...pt(571,160));shape.quadraticCurveTo(...pt(571,148),...pt(587,144));shape.lineTo(...pt(616,128));shape.quadraticCurveTo(...pt(625,112),...pt(642,116));shape.quadraticCurveTo(...pt(660,110),...pt(670,127));shape.quadraticCurveTo(...pt(688,130),...pt(711,147));shape.quadraticCurveTo(...pt(723,154),...pt(713,171));shape.lineTo(...pt(658,171));shape.lineTo(...pt(658,200));shape.quadraticCurveTo(...pt(671,185),...pt(683,190));shape.quadraticCurveTo(...pt(694,195),...pt(706,202));shape.quadraticCurveTo(...pt(714,205),...pt(722,211));shape.quadraticCurveTo(...pt(727,222),...pt(712,222));shape.lineTo(...pt(691,222));shape.lineTo(...pt(691,251));shape.quadraticCurveTo(...pt(693,265),...pt(709,269));shape.quadraticCurveTo(...pt(713,275),...pt(701,277));shape.lineTo(...pt(608,277));shape.quadraticCurveTo(...pt(602,273),...pt(606,269));shape.quadraticCurveTo(...pt(627,266),...pt(627,247));shape.lineTo(...pt(627,174));shape.lineTo(...pt(583,174));shape.quadraticCurveTo(...pt(568,173),...pt(571,160));shape.closePath();
 const hole=new THREE.Path();hole.moveTo(...pt(658,223));hole.lineTo(...pt(675,223));hole.lineTo(...pt(675,250));hole.quadraticCurveTo(...pt(675,263),...pt(665,263));hole.quadraticCurveTo(...pt(657,263),...pt(658,249));hole.closePath();shape.holes.push(hole);
 const emblem=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,curveSegments:12}),matte(0x20b42a));emblem.name='Green Corkart tree emblem';emblem.position.set(0,.67,.027);root.add(emblem);
 const label=centeredText('CORKART',.18,{font:newFonts.corkart,color:0xf8f8ef,depth:.010,tracking:.003}),b=new THREE.Box3().setFromObject(label),size=b.getSize(new THREE.Vector3());label.scale.x=.90/size.x;label.position.set(label.position.x*label.scale.x,label.position.y+.43,.027);label.name='Thin white CORKART lettering';root.add(label);
 if(width!==1.55){const factor=width/1.55;emblem.scale.setScalar(factor);emblem.position.y*=factor;label.scale.multiplyScalar(factor);label.position.x*=factor;label.position.y*=factor;}return root;
}
