import * as THREE from './vendor/three.module.js';
import {createPVCRacks} from './pvc-racks.js?v=15';

export const laminateLayout={width:1.20,depth:.86,z:.56,items:[{x:7.68,art:0},{x:6.44,art:1},{x:5.20,art:2},{x:3.96,art:3},{x:2.72,art:4}],
 book:{x:1.40,z:2.90,width:1.70,depth:.60,rotation:-Math.PI/2,samples:11}};
export const laminateObstacles=[...laminateLayout.items.map(p=>({kind:'rect',minX:p.x-.60,maxX:p.x+.60,minZ:.13,maxZ:.99})),{kind:'rect',minX:1.10,maxX:1.70,minZ:2.05,maxZ:3.75}];
const artQuads=[
 [[866,427],[1199,315],[1199,694],[840,683]],
 [[632,479],[857,400],[837,680],[632,673]],
 [[531,515],[625,482],[625,672],[532,667]],
 [[454,550],[525,525],[527,667],[454,664]],
 [[531,515],[625,482],[625,672],[532,667]]
];
function box(parent,w,h,d,x,y,z,material,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function triangle(points,depth,material,z,parent,name){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false}),material);o.position.z=z;o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function leafGeometry(){
 const s=new THREE.Shape();s.moveTo(-.31,0);s.lineTo(.31,0);s.lineTo(.31,1.34);s.lineTo(-.31,1.34);s.closePath();
 const hole=new THREE.Path();hole.absellipse(-.23,1.215,.020,.048,0,Math.PI*2,true);s.holes.push(hole);
 const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,steps:1,curveSegments:12});g.translate(0,0,-.006);
 const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+.31)/.62,pos.getY(i)/1.34);uv.needsUpdate=true;return g;
}
export function createLaminateRacks({photoTexture=null,bookPhotoTexture=null,headerTextures=[],woodTextures=[],labelTexture=null}={}){
 const root=new THREE.Group();root.name='Five laminate cabinets and the corner Quick-Step book display';
 const row=createPVCRacks({photoTexture,headerTextures,woodTextures,labelTexture,layout:laminateLayout,artworkQuads:artQuads,referenceSize:[1200,1600],rackType:'laminateRack',rackWidth:1.20,rootName:'Five white Quick-Step laminate cabinets'});root.add(row);
 const book=new THREE.Group(),p=laminateLayout.book;book.name='Quick-Step vertical book display with triangular roof';book.userData={type:'laminateBookRack',samples:11};book.position.set(p.x,0,p.z);book.rotation.y=p.rotation;book.scale.z=p.depth/.76;root.add(book);
 const dark=new THREE.MeshStandardMaterial({color:0x30383a,roughness:.80});
 const edge=new THREE.MeshStandardMaterial({color:0xc3b69b,roughness:.88});
 const metal=new THREE.MeshStandardMaterial({color:0x747d7a,roughness:.48,metalness:.4});
 const face=woodTextures.length?woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.69})):[new THREE.MeshStandardMaterial({color:0xbfa57b,roughness:.7})];
 const label=new THREE.MeshStandardMaterial({map:labelTexture,color:0xffffff,roughness:.9});
 box(book,1.70,.19,.76,0,.122,0,dark,'Dark book-stand plinth');
 box(book,1.70,1.56,.045,0,.99,.352,dark,'Full back of the vertical display');
 for(const x of [-.817,.817])box(book,.050,1.58,.66,x,1.00,0,dark,'Dark outer upright');
 box(book,1.70,.16,.075,0,1.72,.324,dark,'Header bridge');
 triangle([[-.85,1.79],[0,2.40],[.85,1.79]],.038,dark,.31,book,'Dark triangular roof frame');
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.725,1.83,.302,0,2.325,.302,.725,1.83,.302],3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute([251/1200,1-762/1600,571/1200,1-584/1600,782/1200,1-777/1600],2));geometry.computeVertexNormals();
 const art=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:bookPhotoTexture,color:bookPhotoTexture?0xffffff:0x9b8b67,roughness:.86}));art.name='Triangular reference artwork only';book.add(art);
 const leaf=leafGeometry();
 for(let i=0;i<11;i++){
  const sample=new THREE.Group();sample.name=`Vertical laminate sample leaf ${i+1}`;sample.userData.type='laminateLeaf';sample.position.set(.44-i*.094,.235,-.27+i*.05);sample.rotation.y=-.10;sample.rotation.x=.020;book.add(sample);
  const panel=new THREE.Mesh(leaf,[face[(i+4)%face.length],edge]);panel.castShadow=panel.receiveShadow=true;panel.name='Wood panel with real oval finger hole';sample.add(panel);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(.100,.063),label);tag.rotation.y=Math.PI;tag.position.set(-.216,1.10,-.007);tag.name='Quick-Step sample label';sample.add(tag);
  box(book,.053,.32,.07,.44-i*.094,.376,-.282+i*.05,dark,'Low sample retaining sleeve');
  const hinge=box(book,.013,.42,.027,.44-i*.094-.286,.52,-.248+i*.05,metal,'Small sample hinge');
  if(i===0)box(sample,.30,.019,.025,0,.95,-.020,dark,'Horizontal display handle');
 }
 return root;
}
export function drawLaminateMap(ctx){
 for(const p of laminateLayout.items){ctx.fillStyle='#c2c7b7';ctx.fillRect(p.x-.60,.13,1.20,.86);ctx.strokeStyle='#eff0df';ctx.lineWidth=.035;ctx.strokeRect(p.x-.60,.13,1.20,.86);for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(p.x-.54,.22+i*.12);ctx.lineTo(p.x+.54,.22+i*.12);ctx.stroke();}ctx.fillStyle='#30383a';ctx.fillRect(p.x-.56,.14,1.12,.07);}
 ctx.fillStyle='#4a514c';ctx.fillRect(1.10,2.05,.60,1.70);ctx.strokeStyle='#c1ac7f';ctx.lineWidth=.035;ctx.strokeRect(1.10,2.05,.60,1.70);
 for(let i=0;i<11;i++){ctx.beginPath();ctx.moveTo(1.22+i*.04,3.62-i*.094);ctx.lineTo(1.62+i*.004,3.05-i*.094);ctx.stroke();}
}
