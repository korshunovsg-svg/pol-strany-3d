import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js?v=5';
import {lightFont} from './assets/sign-glyphs.js?v=5';
// Hand-redrawn outlines and proportions from the supplied frontal photograph.
// Coordinate system: a 325 × 244 reference rectangle covering only the sign.
export const logoSpec={referenceWidth:325,referenceHeight:244,width:1.50,depth:.024,tagline:'напольные покрытия'};
export function makePolStranyLogo(){
 const root=new THREE.Group();root.name='Пол Страны — redrawn solid logo';root.userData.vectorLogo=true;
 const unit=logoSpec.width/logoSpec.referenceWidth;
 const green=new THREE.MeshPhysicalMaterial({color:0x008642,roughness:.26,metalness:.05,clearcoat:.65,clearcoatRoughness:.22});
 const white=new THREE.MeshPhysicalMaterial({color:0xf2f2ec,roughness:.34,clearcoat:.35,clearcoatRoughness:.25});
 const red=new THREE.MeshPhysicalMaterial({color:0xbb2034,roughness:.24,clearcoat:.75,clearcoatRoughness:.18});
 const point=(x,y)=>[x*unit,(244-y)*unit];
 function path(commands,hole=false){const shape=hole?new THREE.Path():new THREE.Shape();for(const [op,...p] of commands){
  if(op==='m')shape.moveTo(...point(p[0],p[1]));
  if(op==='l')shape.lineTo(...point(p[0],p[1]));
  if(op==='q')shape.quadraticCurveTo(...point(p[0],p[1]),...point(p[2],p[3]));
  if(op==='z')shape.closePath();
 }return shape;}
 function rounded(x,y,w,h,r=1,hole=false){return path([['m',x+r,y],['l',x+w-r,y],['q',x+w,y,x+w,y+r],['l',x+w,y+h-r],['q',x+w,y+h,x+w-r,y+h],['l',x+r,y+h],['q',x,y+h,x,y+h-r],['l',x,y+r],['q',x,y,x+r,y],['z']],hole);}
 function mesh(shape,name,material=white,parent=root,depth=logoSpec.depth){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.0013,bevelSize:.0008,bevelSegments:3,curveSegments:14,steps:1});const m=new THREE.Mesh(g,material);m.name=name;m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function offset(commands,x,y){return commands.map(([op,...p])=>[op,...p.map((v,i)=>v+(i%2?y:x))]);}
 const top=new THREE.Group();top.name='ПОЛ';root.add(top);
 mesh(path([['m',0,0],['l',59,0],['l',59,108],['l',40,108],['l',40,17],['l',20,17],['l',20,108],['l',0,108],['z']]),'П',green,top);
 const o=rounded(73,0,59,108,13);o.holes.push(rounded(92,17,21,73,2,true));mesh(o,'О',green,top);
 mesh(path([['m',141,108],['l',161,0],['l',181,0],['l',198,108],['l',179,108],['l',171,52],['l',160,108],['z']]),'Л',green,top);
 const icon=new THREE.Group();icon.name='Flooring tile emblem';root.add(icon);
 mesh(rounded(221,0,33,73,1),'White vertical tile',white,icon);
 mesh(rounded(221,75,33,33,1),'White corner tile',white,icon);
 mesh(rounded(256,75,67,33,1),'White horizontal tile',white,icon);
 mesh(rounded(256,0,33,73,1),'Green vertical tile',green,icon);
 mesh(rounded(291,38,32,35,1),'Green square tile',green,icon);
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(17*unit,17*unit,.026,64),red);disc.rotation.x=Math.PI/2;disc.position.set(309*unit,(244-18)*unit,.016);disc.name='Red circle';disc.castShadow=disc.receiveShadow=true;icon.add(disc);
 const bottom=new THREE.Group();bottom.name='СТРАНЫ';root.add(bottom);const y=124;
 const c=[['m',43,22],['l',29,22],['l',29,13],['l',14,13],['l',14,68],['l',29,68],['l',29,59],['l',43,59],['l',43,70],['q',43,82,31,82],['l',12,82],['q',0,82,0,70],['l',0,12],['q',0,0,12,0],['l',31,0],['q',43,0,43,12],['z']];
 mesh(path(offset(c,5,y)),'С',white,bottom);
 mesh(path(offset([['m',0,0],['l',45,0],['l',45,13],['l',30,13],['l',30,82],['l',15,82],['l',15,13],['l',0,13],['z']],55,y)),'Т',white,bottom);
 const p=path(offset([['m',0,0],['l',31,0],['q',43,0,43,12],['l',43,40],['q',43,53,31,53],['l',14,53],['l',14,82],['l',0,82],['z']],106,y));p.holes.push(rounded(120,y+13,15,26,1,true));mesh(p,'Р',white,bottom);
 // The distinctive lower-case shaped 'а' is part of the original wordmark.
 const a=path(offset([['m',0,22],['l',0,12],['q',0,0,12,0],['l',32,0],['q',44,0,44,12],['l',44,82],['l',12,82],['q',0,82,0,70],['l',0,46],['q',0,34,12,34],['l',30,34],['l',30,13],['l',14,13],['l',14,22],['z']],153,y));a.holes.push(rounded(167,y+47,16,22,1,true));mesh(a,'а',white,bottom);
 mesh(path(offset([['m',0,0],['l',14,0],['l',14,33],['l',30,33],['l',30,0],['l',44,0],['l',44,82],['l',30,82],['l',30,47],['l',14,47],['l',14,82],['l',0,82],['z']],205,y)),'Н',white,bottom);
 const yi=new THREE.Group();yi.name='Ы';bottom.add(yi);
 const ya=path(offset([['m',0,0],['l',14,0],['l',14,34],['l',29,34],['q',43,34,43,47],['l',43,69],['q',43,82,29,82],['l',0,82],['z']],258,y));ya.holes.push(rounded(272,y+48,15,21,1,true));mesh(ya,'Ы bowl',white,yi);mesh(rounded(307,y,15,82,0.5),'Ы stem',white,yi);
 const tagline=makeWallLettering(logoSpec.tagline,.096,{font:lightFont,color:0xf4f3e9,depth:.007,tracking:.0002});
 const bounds=new THREE.Box3().setFromObject(tagline),width=bounds.max.x-bounds.min.x;tagline.scale.x=1.45/width;tagline.position.set(.029-bounds.min.x*tagline.scale.x,-bounds.min.y+.002,.003);tagline.name='Напольные покрытия';root.add(tagline);
 return root;
}
