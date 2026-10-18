import * as THREE from './vendor/three.module.js';

export const parquetNames={islands:'Crownwood Острова',aura:'Crownwood Аура',prime:'Crownwood Прайм',crownwoodClassic:'Crownwood',alpine:'Alpine',livingTree:'Living Tree',woodBee:'Wood Bee',nord:'Crownwood Норд',factoryFloors:'Фабрика полов'};
const referenceBoards={
 islands:{size:[1920,1440],quads:[[[255,800],[690,790],[700,1190],[270,1270]],[[900,770],[1200,750],[1195,1150],[905,1200]],[[1360,760],[1680,735],[1660,1120],[1360,1180]]]},
 aura:{size:[1440,1920],quads:[[[415,1050],[1025,1035],[1000,1650],[455,1685]]]},
 prime:{size:[1440,1920],quads:[[[435,900],[1060,880],[1010,1570],[470,1590]]]}
};
function mesh(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function boardGeometry(width,height,aura=false){
 const s=new THREE.Shape(),r=.008,x=-width/2;
 s.moveTo(x+r,0);s.lineTo(x+width-r,0);s.quadraticCurveTo(x+width,0,x+width,r);s.lineTo(x+width,height-r);s.quadraticCurveTo(x+width,height,x+width-r,height);s.lineTo(x+r,height);s.quadraticCurveTo(x,height,x,height-r);s.lineTo(x,r);s.quadraticCurveTo(x,0,x+r,0);s.closePath();
 if(aura){const hole=new THREE.Path();hole.moveTo(-.145,height-.045);hole.lineTo(.145,height-.045);hole.lineTo(0,height-.205);hole.closePath();s.holes.push(hole);}
 const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:6});g.translate(0,0,-.006);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+width/2)/width,p.getY(i)/height);uv.needsUpdate=true;return g;
}
function photoGeometry(base,ref,variant){
 const g=base.clone(),uv=g.attributes.uv,q=ref.quads[variant%ref.quads.length];
 for(let i=0;i<uv.count;i++){
  const u=uv.getX(i),v=uv.getY(i),x=(q[0][0]*(1-u)+q[1][0]*u)*v+(q[3][0]*(1-u)+q[2][0]*u)*(1-v),y=(q[0][1]*(1-u)+q[1][1]*u)*v+(q[3][1]*(1-u)+q[2][1]*u)*(1-v);
  uv.setXY(i,x/ref.size[0],1-y/ref.size[1]);
 }uv.needsUpdate=true;return g;
}
function graphic(parent,w,h,x,y,z,map,color=0xffffff,name=''){
 const m=new THREE.MeshStandardMaterial({map:map??null,color,roughness:.9,alphaTest:.15});const o=mesh(parent,new THREE.PlaneGeometry(w,h),m,x,y,z,name);o.rotation.y=Math.PI;o.castShadow=false;return o;
}
export function createParquetStand(kind,{woodTextures=[],photoTextures={},nameTextures={},labelTexture=null,compactFactory=false}={},variant=0){
 if(!parquetNames[kind])return null;
 const root=new THREE.Group();root.name=parquetNames[kind];root.userData={type:'parquetRack',collection:kind,photoReference:!!referenceBoards[kind],standard:!referenceBoards[kind]};
 const dark=new THREE.MeshStandardMaterial({color:0x252b2b,roughness:.83}),edge=new THREE.MeshStandardMaterial({color:0xb7a582,roughness:.90}),ply=new THREE.MeshStandardMaterial({color:0xcbb996,roughness:.87}),wood=new THREE.MeshStandardMaterial({map:woodTextures[0]??null,color:0xd2bc96,roughness:.78});
 const woods=woodTextures.length?woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.70})):[new THREE.MeshStandardMaterial({color:0xb79c70,roughness:.75})];
 const factory=kind==='factoryFloors'&&!compactFactory,width=factory?1.70:.64,depth=factory?.36:.84,height=kind==='islands'?1.20:1.16,count=kind==='factoryFloors'||kind==='islands'?12:kind==='prime'?11:10;
 box(root,width,.035,depth,0,.039,0,dark,'Low parquet cassette base');
 for(const x of [-width/2+.025,width/2-.025]){
  box(root,.028,.15,depth-.018,x,.117,0,dark,'Dark parquet cassette side rail');
  box(root,.035,.21,.032,x,.128,-depth/2+.025,kind==='prime'?ply:dark,'Front cassette retaining post');
 }
 const photoBase=kind==='aura'||kind==='islands',plaqueWood=!photoBase;
 const plaqueWidth=factory?.94:.53,plaqueZ=-depth/2+.023;
 const plaque=box(root,plaqueWidth,.17,.028,0,.128,plaqueZ,plaqueWood?wood:dark,plaqueWood?'Wooden engraved name plaque':'Dark collection name plaque');plaque.userData.namePlaque=true;
 graphic(root,plaqueWidth-.025,.145,0,.128,plaqueZ-.0148,nameTextures[kind],plaqueWood?0x2e2c25:0xe6dcc5,'Collection name on the lower plaque');
 root.userData.woodenNamePlaque=plaqueWood;root.userData.samples=factory?12:count;
 if(factory){
  const geometry=boardGeometry(.55,1.16);
  for(let i=0;i<12;i++){
   const sample=new THREE.Group();sample.position.set(-.51+i*.093,.071,-.04+i*.006);sample.rotation.set(.04,.30,0);sample.userData.type='parquetSample';sample.name='Standard wide-bank parquet sample';root.add(sample);
   mesh(sample,geometry,[woods[(i+variant)%woods.length],edge],0,0,0,'Separate oak sample');
   graphic(sample,.08,.055,-.216,1.11,-.0068,labelTexture,0xffffff,'Small product label');
  }
  return root;
 }
 const geometry=boardGeometry(.568,height,kind==='aura'),ref=referenceBoards[kind],photo=ref&&photoTextures[kind]?new THREE.MeshStandardMaterial({map:photoTextures[kind],color:0xffffff,roughness:.72}):null;
 for(let i=0;i<count;i++){
  const sample=new THREE.Group();sample.userData.type='parquetSample';sample.name=`${parquetNames[kind]} sample ${i+1}`;sample.position.set(0,.065+i*.018,-.31+i*(.635/(count-1)));sample.rotation.x=.060;root.add(sample);
  const usePhoto=photo&&(i===0||kind==='islands'&&i<3||kind==='aura'&&i%3===0),face=usePhoto?photo:woods[(variant*2+i)%woods.length];
  const g=usePhoto?photoGeometry(geometry,ref,variant+i):geometry;
  const panel=mesh(sample,g,[face,kind==='prime'?ply:edge],0,0,0,kind==='aura'?'Aura board with a real V-shaped carry opening':'Large upright parquet sample');panel.userData.auraHandle=kind==='aura';
  const x=kind==='prime'?-.204:.204;
  graphic(sample,.112,.071,x,height-.057,-.0069,labelTexture,0xffffff,'White parquet product card');
  box(root,.59,.012,.023,0,.060+i*.018,-.31+i*(.635/(count-1)),dark,'Individual parquet sample slot');
 }
 return root;
}
