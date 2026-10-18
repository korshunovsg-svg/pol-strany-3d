import * as THREE from './vendor/three.module.js';

export const spcLayout={
 alta:{width:.49,depth:.54,z:2.98,items:Array.from({length:9},(_,i)=>({x:7.095-i*.50,art:i%4}))},
 deck:{width:.50,depth:.68,z:5.11,items:Array.from({length:11},(_,i)=>({x:1.70+i*.51,art:i%4,collection:i<4?'polymer':'deck'}))}
};
export const spcObstacles=Object.values(spcLayout).flatMap(row=>row.items.map(p=>({kind:'rect',minX:p.x-row.width/2,maxX:p.x+row.width/2,minZ:row.z-row.depth/2,maxZ:row.z+row.depth/2})));
const photoQuads={
 alta:[
  [[0,423],[254,430],[253,629],[0,668]],
  [[257,428],[496,443],[496,594],[255,628]],
  [[499,443],[707,452],[706,578],[499,593]],
  [[713,453],[786,458],[786,568],[711,578]]
 ],
 polymer:[
  [[122,1],[469,1],[489,373],[180,374]],
  [[474,1],[812,1],[808,373],[491,373]],
  [[815,1],[1144,1],[1105,369],[812,373]],
  [[1147,1],[1458,1],[1398,363],[1108,370]]
 ],
 deck:[
  [[238,393],[349,375],[348,581],[238,590]],
  [[354,375],[495,357],[495,589],[353,581]],
  [[500,357],[684,333],[686,594],[500,589]],
  [[690,332],[936,300],[936,602],[692,595]]
 ]
};
function mesh(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function graphic(parent,w,h,y,z,map,name){const o=mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:map??null,color:map?0xffffff:0x313b34,roughness:.88}),0,y,z,name);o.rotation.y=Math.PI;o.castShadow=false;return o;}
function artwork(parent,brand,art,map){
 const polymer=brand==='polymer',g=new THREE.PlaneGeometry(.592,polymer?.82:.70),uv=g.attributes.uv,q=photoQuads[brand][art],size=polymer?[1536,1152]:[960,1280];
 [q[0],q[1],q[3],q[2]].forEach((p,i)=>uv.setXY(i,p[0]/size[0],1-p[1]/size[1]));uv.needsUpdate=true;
 const o=mesh(parent,g,new THREE.MeshStandardMaterial({map:map??null,color:map?0xffffff:0x68844a,roughness:.89}),0,polymer?1.85:1.795,.290,'Reference artwork from the supplied SPC display');o.rotation.y=Math.PI;o.castShadow=false;
}
function sampleGeometry(roof=false){
 const s=new THREE.Shape();s.moveTo(-.272,0);s.lineTo(.272,0);s.lineTo(.272,roof?.823:1.095);if(roof)s.lineTo(0,1.095);s.lineTo(-.272,roof?.823:1.095);s.closePath();
 const hole=new THREE.Path();hole.absellipse(roof?-.11:0,roof?.865:1.025,.069,.017,0,Math.PI*2,true,roof?Math.PI/4:0);s.holes.push(hole);
 const g=new THREE.ExtrudeGeometry(s,{depth:.011,bevelEnabled:false,curveSegments:10});g.translate(0,0,-.0055);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+.272)/.544,p.getY(i)/1.095);uv.needsUpdate=true;return g;
}
function cheekGeometry(){const s=new THREE.Shape();s.moveTo(.31,.04);s.lineTo(-.30,.04);s.lineTo(-.30,.64);s.lineTo(.31,.145);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.02,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-.01,0,0);return g;}
const polymerBoardQuads={0:[[155,720],[344,719],[338,1042],[170,1046]],2:[[840,733],[1077,731],[1086,1043],[838,1044]],3:[[1228,713],[1414,710],[1430,1035],[1222,1039]]};
function polymerBoardGeometry(base,art){const g=base.clone(),uv=g.attributes.uv,[a,b,c,d]=polymerBoardQuads[art];for(let i=0;i<uv.count;i++){const u=1-uv.getX(i),v=uv.getY(i);uv.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/1536,1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/1152);}return g;}
export function createSPCRacks({photoTextures={},headerTextures={},plinthTextures={},labelTextures={},woodTextures=[],herringboneTextures=[],stoneTextures=[]}={}){
 const root=new THREE.Group();root.name='Alta Step island and Deck / Deck Polymer wall row';
 const dark=new THREE.MeshStandardMaterial({color:0x242a29,roughness:.81}),edge=new THREE.MeshStandardMaterial({color:0xbab8a6,roughness:.91}),slot=new THREE.MeshStandardMaterial({color:0x4e544c,roughness:.9});
 const woods=woodTextures.length?woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.72})):[new THREE.MeshStandardMaterial({color:0xb9a682,roughness:.75})];
 const herrings=herringboneTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.76}));
 const stones=stoneTextures.map((map,i)=>new THREE.MeshStandardMaterial({map,color:i===0?0xd4d0c5:0xffffff,roughness:.84}));
 const sample=sampleGeometry(),roofSample=sampleGeometry(true),cheek=cheekGeometry();
 for(const [brand,row] of Object.entries(spcLayout))row.items.forEach((spec,index)=>{
  const polymer=brand==='deck'&&spec.collection==='polymer',roof=polymer&&spec.art===1;
  const rack=new THREE.Group();rack.name=brand==='alta'?`Alta Step ${index+1}`:`Deck ${spec.collection==='polymer'?'Polymer':'SPC'} ${index+1}`;
  rack.userData={type:brand==='alta'?'altaRack':'deckWallRack',brand,collection:spec.collection??'spc',samples:10};if(polymer){rack.userData.referenceVersion=23;rack.userData.sampleShape=roof?'pointed':'rectangular';}rack.position.set(spec.x,0,row.z);rack.rotation.y=brand==='alta'?Math.PI:0;rack.scale.set(row.width/.62,1,row.depth/.64);root.add(rack);
  box(rack,.62,.045,.64,0,.044,0,dark,'Dark SPC rack base');
  box(rack,.62,2.22,.025,0,1.155,.3075,dark,'SPC display tall back');
  for(const x of [-.30,.30])mesh(rack,cheek,dark,x,0,0,'Sloped dark SPC side cheek');
  box(rack,.62,.13,.055,0,.102,-.291,dark,'Branded front plinth');
  const plinth=graphic(rack,.604,.108,.102,-.319,polymer?photoTextures.polymer:plinthTextures[brand],`${brand} front logo`);
  if(polymer){const q=[[[124,1103],[465,1101],[468,1151],[113,1151]],[[474,1101],[811,1097],[815,1151],[472,1151]],[[819,1088],[1197,1081],[1199,1151],[819,1151]],[[1208,1068],[1535,1060],[1535,1151],[1205,1151]]][spec.art];const uv=plinth.geometry.attributes.uv;[q[0],q[1],q[3],q[2]].forEach((p,i)=>uv.setXY(i,p[0]/1536,1-p[1]/1152));uv.needsUpdate=true;}
  artwork(rack,polymer?'polymer':brand,spec.art,polymer?photoTextures.polymer:photoTextures[brand]);
  if(!polymer)graphic(rack,.596,.20,2.16,.289,headerTextures[brand],`${brand} upper logo`);
  for(let i=0;i<10;i++){
   const board=new THREE.Group();board.name=`${brand} SPC sample ${i+1}`;board.userData.type='spcSample';board.position.set(0,.079+i*.021,-.267+i*.046);board.rotation.x=.115;rack.add(board);
   let face=woods[(index+i*2)%woods.length];
   if(stones.length&&(i+index)%4===0)face=stones[(i+index)%stones.length];
   if(herrings.length&&(roof||index%5===0&&i===0))face=herrings[roof?(i%2?0:Math.min(5,herrings.length-1)):index%herrings.length];
   const usePhoto=polymer&&!roof&&i===0&&photoTextures.polymer;
   const panelGeometry=usePhoto?polymerBoardGeometry(sample,spec.art):roof?roofSample:sample;
   if(usePhoto)face=new THREE.MeshStandardMaterial({map:photoTextures.polymer,color:0xffffff,roughness:.84});
   mesh(board,panelGeometry,[face,edge],0,0,0,'SPC sample with real oval carry handle');
   const tag=graphic(board,.092,.134,roof?.72:.987,-.0065,labelTextures[brand],'SPC product label');tag.position.x=polymer?-.210:.210;tag.receiveShadow=false;
   box(rack,.564,.014,.025,0,.073+i*.021,-.267+i*.046,slot,'SPC sample retaining slot');
  }
 });
 return root;
}
export function drawSPCMap(ctx){
 for(const [brand,row] of Object.entries(spcLayout))for(const spec of row.items){
  const x=spec.x-row.width/2,z=row.z-row.depth/2;ctx.fillStyle=brand==='alta'?'#78a85e':spec.collection==='polymer'?'#77a38c':'#9ab476';ctx.fillRect(x,z,row.width,row.depth);ctx.strokeStyle='#e0e9cb';ctx.lineWidth=.025;ctx.strokeRect(x,z,row.width,row.depth);
  for(let i=0;i<8;i++){const a=z+.07+i*(row.depth-.14)/7;ctx.beginPath();ctx.moveTo(x+.035,a);ctx.lineTo(x+row.width-.035,a);ctx.stroke();}
  ctx.fillStyle='#26342d';ctx.fillRect(x+.02,brand==='alta'?z+.015:z+row.depth-.05,row.width-.04,.035);
 }
}
