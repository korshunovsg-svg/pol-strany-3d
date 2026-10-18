import * as THREE from './vendor/three.module.js';

// The far island in the plan: Classen → Deck → Clix when walking away from the entrance.
// Front is local -Z, towards the wall of Quick-Step cabinets. Alta Step will go behind it.
export const islandLayout={width:.54,depth:.72,z:2.35,items:[
 {brand:'classen',x:7.075,art:0},{brand:'classen',x:6.510,art:1},
 {brand:'classen',x:5.945,art:2},{brand:'classen',x:5.380,art:3},
 {brand:'deck',x:4.815,art:0},{brand:'deck',x:4.250,art:0},
 {brand:'clix',x:3.685,art:0},{brand:'clix',x:3.120,art:1}
]};
export const islandObstacles=islandLayout.items.map(p=>({kind:'rect',minX:p.x-islandLayout.width/2,maxX:p.x+islandLayout.width/2,minZ:1.99,maxZ:2.71}));
const references={
 classen:{size:[736,1600],quads:[
  [[111,295],[216,276],[226,532],[121,527]],
  [[222,273],[358,246],[358,556],[231,538]],
  [[367,244],[551,211],[549,582],[366,559]],
  [[560,209],[735,176],[735,546],[559,552]]
 ]},
 deck:{size:[1600,1200],quads:[[[979,356],[1128,381],[1122,515],[973,490]]]},
 clix:{size:[1600,1200],quads:[
  [[1093,340],[1276,327],[1272,444],[1090,445]],
  [[1287,329],[1538,315],[1530,441],[1282,443]]
 ]}
};
function part(parent,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,m,name){return part(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function graphic(parent,w,h,x,y,z,map,name){const m=new THREE.MeshStandardMaterial({map:map??null,color:0xffffff,roughness:.88});const o=part(parent,new THREE.PlaneGeometry(w,h),m,x,y,z,name);o.rotation.y=Math.PI;o.castShadow=false;return o;}
function referencePanel(parent,brand,art,map,width,height,y){
 const ref=references[brand],q=ref.quads[art],g=new THREE.PlaneGeometry(width,height),uv=g.attributes.uv;
 // Plane vertex order TL, TR, BL, BR, viewed from the front of the display.
 const source=[q[0],q[1],q[3],q[2]];
 for(let i=0;i<4;i++)uv.setXY(i,source[i][0]/ref.size[0],1-source[i][1]/ref.size[1]);
 uv.needsUpdate=true;
 const o=part(parent,g,new THREE.MeshStandardMaterial({map:map??null,color:map?0xffffff:brand==='classen'?0x72a532:0xc9b68d,roughness:.90}),0,y,.307,'Reference promotional artwork');o.rotation.y=Math.PI;o.castShadow=false;
}
function sampleGeometry(width,height,withHandle){
 const s=new THREE.Shape();s.moveTo(-width/2,0);s.lineTo(width/2,0);s.lineTo(width/2,height);s.lineTo(-width/2,height);s.closePath();
 if(withHandle){const hole=new THREE.Path();hole.absellipse(0,height-.066,.072,.018,0,Math.PI*2,true);s.holes.push(hole);}
 const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,steps:1,curveSegments:10});g.translate(0,0,-.006);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+width/2)/width,p.getY(i)/height);uv.needsUpdate=true;return g;
}
function cheekGeometry(){const s=new THREE.Shape();s.moveTo(.35,.06);s.lineTo(-.34,.06);s.lineTo(-.34,.70);s.lineTo(.35,.16);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.020,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-.010,0,0);return g;}
export function createIslandRacks({photoTextures={},headerTextures={},plinthTextures={},labelTextures={},woodTextures=[],herringboneTextures=[],stoneTexture=null}={}){
 const root=new THREE.Group();root.name='Far island: four Classen, two Deck, two Clix';root.userData.islandRow=true;
 const dark=new THREE.MeshStandardMaterial({color:0x262a2c,roughness:.78}),white=new THREE.MeshStandardMaterial({color:0xeaece4,roughness:.77}),edge=new THREE.MeshStandardMaterial({color:0xbdb296,roughness:.88}),slots=new THREE.MeshStandardMaterial({color:0x55594e,roughness:.92});
 const woods=woodTextures.length?woodTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.71})):[new THREE.MeshStandardMaterial({color:0xb6a07a,roughness:.75})];
 const herringbone=herringboneTextures.map(map=>new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.74}));
 const stone=stoneTexture?new THREE.MeshStandardMaterial({map:stoneTexture,color:0xc6c2b8,roughness:.86}):woods[0];
 const geometries={classen:sampleGeometry(.556,1.02,false),deck:sampleGeometry(.55,1.10,true),clix:sampleGeometry(.55,1.10,true)};
 const cheek=cheekGeometry();
 islandLayout.items.forEach((spec,index)=>{
  const brand=spec.brand,count=brand==='classen'?11:10,rack=new THREE.Group();rack.name=`${brand==='classen'?'Classen':brand==='deck'?'Deck':'ClixFloor'} display ${index+1}`;rack.position.set(spec.x,0,islandLayout.z);rack.scale.x=islandLayout.width/.64;rack.userData={type:'islandRack',brand,samples:count,front:'north'};root.add(rack);
  const frame=brand==='classen'?white:dark;
  box(rack,.64,.045,.72,0,.047,0,frame,'Display floor base');
  box(rack,.64,2.245,.026,0,1.165,.333,frame,'Tall display back');
  for(const x of [-.31,.31])part(rack,cheek,frame,x,0,0,'Tapered sample-rack side');
  box(rack,.64,.13,.052,0,.106,-.333,dark,'Dark branded front plinth');
  graphic(rack,.616,.105,0,.106,-.360,plinthTextures[brand],`${brand} base logo`);
  if(brand==='classen'){
   referencePanel(rack,brand,spec.art,photoTextures[brand],.605,.795,1.755);
   graphic(rack,.618,.225,0,2.178,.306,headerTextures[brand],'CLASSEN black top sign');
  }else{
   referencePanel(rack,brand,spec.art,photoTextures[brand],.605,.485,1.7925);
   graphic(rack,.618,.24,0,2.168,.306,headerTextures[brand],`${brand} top sign`);
  }
  for(let i=0;i<count;i++){
   const sample=new THREE.Group();sample.name=`${brand} upright laminate sample ${i+1}`;sample.userData.type='islandSample';sample.position.set(0,.083+i*.022,-.309+i*.055);sample.rotation.x=.105;rack.add(sample);
   let face=woods[(i+index*2)%woods.length];
   if(brand==='classen'&&spec.art===2&&i===0)face=stone;
   if(brand==='classen'&&spec.art===3&&i<3&&herringbone.length)face=herringbone[i%herringbone.length];
   part(sample,geometries[brand],[face,edge],0,0,0,brand==='classen'?'Upright laminate board':'Laminate board with real oval carry slot');
   const tag=graphic(sample,.091,.059,.212,brand==='classen'?.949:1.048,-.0075,labelTextures[brand],'Sample product label');tag.receiveShadow=false;
   if(brand==='classen'){
    const tab=graphic(sample,.043,.070,-.218,1.009,-.008,labelTextures[brand],'Blue Classen sample tab');tab.receiveShadow=false;
   }
   box(rack,.575,.014,.027,0,.076+i*.022,-.309+i*.055,slots,'Individual sample retaining slot');
  }
 });
 return root;
}
export function drawIslandMap(ctx){
 for(const spec of islandLayout.items){ctx.save();ctx.translate(spec.x,0);ctx.scale(islandLayout.width/.64,1);const x=-.32,z=islandLayout.z-.36;ctx.fillStyle=spec.brand==='classen'?'#8da884':spec.brand==='deck'?'#b2a36a':'#8cabb4';ctx.fillRect(x,z,.64,.72);ctx.strokeStyle='#dfe7d3';ctx.lineWidth=.024;ctx.strokeRect(x,z,.64,.72);for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(x+.04,z+.07+i*.076);ctx.lineTo(x+.60,z+.07+i*.076);ctx.stroke();}ctx.fillStyle='#283733';ctx.fillRect(x+.025,z+.665,.59,.035);ctx.restore();}
}
