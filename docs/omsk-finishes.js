import * as THREE from './vendor/three.module.js';
import {makeWallLettering} from './wall-lettering.js';
import {createPolStranyWallPanel,wallLayout} from './wall-decor.js?v=26';
import font from './assets/update29/font.js';
const material=color=>new THREE.MeshStandardMaterial({color,roughness:.84});
function box(parent,w,h,d,x,y,z,m,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.receiveShadow=true;parent.add(o);return o;}
function photo(parent,w,h,x,y,z,map,quad,size,name){const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<4;i++){const q=quad[[0,1,3,2][i]];uv.setXY(i,q[0]/size[0],1-q[1]/size[1]);}const o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:map??null,color:0xffffff,roughness:.88}));o.position.set(x,y,z);o.name=name;parent.add(o);return o;}
export function createOmskClassenPanels(reference){
 const root=new THREE.Group();root.name='Four separate Classen information squares';root.userData.classenWallPanels=true;
 const quads=[[[52,133],[726,133],[726,581],[43,581]],[[821,136],[1482,145],[1487,583],[821,581]],[[44,630],[726,631],[726,1086],[42,1082]],[[820,632],[1484,636],[1487,1080],[820,1084]]],titles=['Класс ламината','Многообразие дизайнов','Фаска','Влагостойкость до 72 часов'];
 for(let i=0;i<4;i++){
  const square=new THREE.Group();square.name=titles[i];square.userData={classenSquare:i+1};square.position.set(i%2===0?-.525:.525,i<2?1.05:0,0);root.add(square);
  box(square,.95,.95,.018,0,.475,0,material(0xf2f0e8),'Separate square Classen panel');
  // Preserve the reference image proportions inside each individual square.
  photo(square,.923,.614,0,.475,.010,reference,quads[i],[1536,1152],'Classen reference image '+(i+1));
 }
 return root;
}
export function createOmskConsultationBackdrop(oak,desk,wallEnd){
 const root=createPolStranyWallPanel({oak}),width=wallLayout.brandPanel.width,centre=Math.min(desk.z,wallEnd-width/2);root.position.set(11.52602,0,centre+width/2);root.rotation.y=Math.PI/2;root.userData.omskConsultationBackdrop=true;return root;
}
const names={tulesna:'TULESNA',ultrafloor:'ULTRAFLOOR',anticWood:'AnticWood',evofloor:'EVOFLOOR',alpineLaminate:'ALPINE',alpinePVC:'ALPINE FLOOR',myStep:'MY STEP',planker:'PLANKER',alta:'ALTA STEP',deck:'DECK',deckPolymer:'DECK POLYMER',karelia:'KARELIA'};
export function createOmskHeaderReverses(furnishing,layout,anticReference,{laminatePoster=null,vinylPoster=null,woodTextures=[]}={}){
 const root=new THREE.Group();root.name='Finished reverse faces of back-to-back display headers';
 const anticFaces=[],fixtures=furnishing.children.filter(o=>o.userData.omskFixture),heights=fixtures.map(o=>new THREE.Box3().setFromObject(o).max.y);
 for(let i=0;i<layout.length;i++){
  const a=layout[i];if(heights[i]<1.85)continue;const nx=-Math.sin(a.rotation??0),nz=-Math.cos(a.rotation??0),candidates=[];
  for(let j=0;j<layout.length;j++){
   if(i===j||heights[i]-heights[j]<.25)continue;const b=layout[j],dx=b.x-a.x,dz=b.z-a.z,back=dx*nx+dz*nz,side=Math.abs(dx*nz-dz*nx),gap=-back-(a.depth+b.depth)/2;
   if(Math.cos((a.rotation??0)-(b.rotation??0))<-.99&&gap>=-.04&&gap<.10&&side<(a.width+b.width)/2-.04)candidates.push({j,side,overlap:(a.width+b.width)/2-side});
  }
  if(!candidates.length)continue;candidates.sort((a,b)=>b.overlap-a.overlap);const j=candidates[0].j,b=layout[j],bottom=heights[j]+.025,top=heights[i]-.014,h=top-bottom,w=a.width-.012;
  const face=new THREE.Group();face.name='Reverse header facing '+(names[b.kind]??b.kind);face.userData={finishedHeaderReverse:true,sourceIndex:i,recipientIndex:j,recipientKind:b.kind,brand:names[b.kind]??b.kind};face.position.set(a.x-nx*(a.depth/2+.0015),bottom,a.z-nz*(a.depth/2+.0015));face.rotation.y=a.rotation??0;root.add(face);
  if(b.kind==='anticWood'){
   box(face,w,h,.007,0,h/2,0,material(0x626762),'Neutral backing for the continuous AnticWood brand area');anticFaces.push(face);
  }else{
   const isLaminate=b.kind==='ultrafloor'||b.kind==='alpineLaminate'||b.kind==='myStep',image=isLaminate?laminatePoster:vinylPoster,ink=isLaminate?0x243b4d:0x315b4e,headerH=Math.min(.16,h*.24),footerH=h>.6?.115:0;
   box(face,w,h,.007,0,h/2,0,material(0xece9df),'Light framed printed promotional panel');
   const target=(w-.014)/(h-.014),source=2/3,u=target<source?target/source:1,v=target>source?source/target:1;
   photo(face,w-.014,h-.014,0,h/2,.0045,image,[[(1-u)/2,(1-v)/2],[(1+u)/2,(1-v)/2],[(1+u)/2,(1+v)/2],[(1-u)/2,(1+v)/2]],[1,1],'Full colour flooring interior promotional photograph');
   box(face,w-.014,headerH,.002,0,h-headerH/2-.007,.006,material(0xf3f1e8),'Light brand title band');box(face,w-.014,.010,.003,0,h-headerH-.007,.007,material(ink),'Brand colour divider');
   const label=makeWallLettering(names[b.kind]??b.kind,Math.min(.11,headerH*.47),{font,color:ink,depth:.002,tracking:.002}),bb=new THREE.Box3().setFromObject(label),size=bb.getSize(new THREE.Vector3()),scale=Math.min(1,(w-.065)/size.x);label.scale.setScalar(scale);label.position.set(-(bb.min.x+bb.max.x)*scale/2,h-headerH/2-size.y*scale/2,.008);face.add(label);
   if(footerH){box(face,w-.014,footerH,.002,0,footerH/2+.007,.006,material(0xf0ede3),'Flooring sample swatch footer');for(let k=0;k<3;k++){const swatch=new THREE.MeshStandardMaterial({map:woodTextures[k]??null,color:[0xc4b091,0xa28c6d,0xd9d2c2][k],roughness:.8});box(face,(w-.07)/3,.065,.003,(k-1)*(w-.04)/3,footerH/2+.007,.009,swatch,'Floor finish colour swatch');}}
   face.userData.promotionalArtwork=true;face.userData.artworkType=isLaminate?'laminate-interior':'vinyl-interior';
  }

 }
 if(anticFaces.length){
  // One legible reference plaque spans the complete receiving AnticWood bank.
  const first=anticFaces[0],rotation=first.rotation.y,tx=Math.cos(rotation),tz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation),bank=layout.filter(o=>o.kind==='anticWood'),min=Math.min(...bank.map(o=>o.x*tx+o.z*tz-o.width/2)),max=Math.max(...bank.map(o=>o.x*tx+o.z*tz+o.width/2)),w=max-min-.015,h=w/4.2,center=(min+max)/2,anchor=first.position.x*tx+first.position.z*tz;
  const sign=new THREE.Group();sign.name='One shared AnticWood reference plaque';sign.userData={commonAnticSign:true,anticReference:true,width:w,height:h,standCount:bank.length};sign.position.set(first.position.x+tx*(center-anchor)+nx*.010,2.08,first.position.z+tz*(center-anchor)+nz*.010);sign.rotation.y=rotation;root.add(sign);
  box(sign,w+.028,h+.028,.012,0,0,0,material(0x454b47),'Shared AnticWood plaque frame');photo(sign,w,h,0,0,.007,anticReference,[[635,50],[1511,50],[1510,259],[635,259]],[1536,638],'One wide AnticWood sign from the reference photograph');
 }

 return root;
}
