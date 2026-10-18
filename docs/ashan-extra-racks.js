import * as THREE from './vendor/three.module.js';
export const extraRackNames={docke:'Döcke Tavola',planker:'Planker',quickAccessories:'Quick-Step · аксессуары',glassCabinet:'Витрина'};
function mesh(p,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function box(p,w,h,d,x,y,z,m,name){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function cylinder(p,r,h,x,y,z,m,name,r2=r){return mesh(p,new THREE.CylinderGeometry(r2,r,h,20),m,x,y,z,name);}
function line(p,a,b,r,m,name){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=cylinder(p,r,v.length(),0,0,0,m,name);o.position.copy(new THREE.Vector3(...a)).add(new THREE.Vector3(...b)).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function graphic(p,w,h,x,y,z,map,name){const o=mesh(p,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.85,alphaTest:.12}),x,y,z,name);o.rotation.y=Math.PI;o.castShadow=false;return o;}
function photoPlane(p,w,h,x,y,z,map,quad,size,name){const o=graphic(p,w,h,x,y,z,map,name),uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);const a=quad[0],b=quad[1],c=quad[2],d=quad[3];uv.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/size[0],1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/size[1]);}uv.needsUpdate=true;return o;}
function sampleGeometry(roof=false,height=1.12){const w=.59,h=height,s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);if(roof)s.lineTo(0,h+.28);s.lineTo(-w/2,h);s.closePath();if(roof){const hole=new THREE.Path();hole.absellipse(0,h-.035,.095,.018,0,Math.PI*2,true);s.holes.push(hole);}const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:12});g.translate(0,0,-.006);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/(h+(roof?.28:0)));return g;}
const dockeHeaders=[[[185,3],[574,3],[578,555],[236,555]],[[582,9],[951,9],[928,552],[582,555]]];
const dockeBoards=[[[197,837],[439,838],[438,1308],[174,1304]],[[619,840],[882,841],[883,1314],[612,1311]]];
function photoSample(base,quad,size=[960,1280]){const g=base.clone(),uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const u=1-uv.getX(i),v=uv.getY(i),[a,b,c,d]=quad;uv.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/size[0],1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/size[1]);}return g;}
export function createExtraRack(kind,{woodTextures=[],herringboneTextures=[],photoTextures={},brandTextures={},labelTexture=null}={},variant=0){
 const root=new THREE.Group();root.name=extraRackNames[kind];root.userData={type:'ashanExtraRack',collection:kind,photoReference:true};
 const mat=(color,roughness=.75,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const dark=mat(0x252b30),white=mat(0xe6e6df),silver=mat(0xa2a9aa,.38,.65),blue=mat(0x183462),red=mat(0xaf2937),yellow=mat(0xf2be1e),green=mat(0x93c7a6),edge=mat(0xb5a68c),black=mat(0x282c2e);
 if(kind==='docke'||kind==='planker'){
  const roof=kind==='planker',depth=.84,count=roof?9:10;
  if(!roof)root.userData.referenceVersion=23;
  box(root,.66,.05,depth,0,.06,0,dark,'Dark sample cassette base');
  for(const x of [-.315,.315]){box(root,.025,.20,depth,x,.155,0,dark,'Cassette side rail');box(root,.025,roof?2.15:2.45,.035,x,roof?1.12:1.265,.38,dark,'Header support');}
  box(root,.66,roof?.80:.95,.025,0,roof?1.83:2.03,.39,dark,'Tall promotional header');
  photoPlane(root,.65,roof?.79:.94,0,roof?1.83:2.03,.376,photoTextures[kind],roof?[[669,365],[826,357],[816,605],[668,626]]:dockeHeaders[variant%2],roof?[960,1280]:[1152,1536],'Promotional artwork from the supplied photo');
  const plaque=new THREE.Group();plaque.position.set(0,.16,-.418);if(!roof)plaque.rotation.x=.30;root.add(plaque);box(plaque,.64,roof?.15:.18,.03,0,0,0,roof?blue:dark,'Branded lower front plaque');if(roof)graphic(plaque,.63,.145,0,0,-.016,brandTextures[kind],'Brand name on front plaque');else photoPlane(plaque,.63,.17,0,0,-.016,photoTextures.docke,variant%2?[[585,1360],[1008,1358],[1031,1492],[584,1495]]:[[146,1355],[579,1360],[580,1494],[126,1489]],[1152,1536],'Brand name on front plaque');
  const woods=woodTextures.map(map=>new THREE.MeshStandardMaterial({map,roughness:.74,color:0xe4d8c2}));
  const herringbone=herringboneTextures.map(map=>new THREE.MeshStandardMaterial({map,roughness:.75,color:0xe3ceb1}));
  const g=sampleGeometry(roof,roof?1.12:1.08);
  for(let i=0;i<count;i++){
   const sample=new THREE.Group();sample.name=roof?'House-shaped Planker sample':'Rectangular Docke Tavola sample';sample.userData={type:'extraSample',roofShape:roof};sample.position.set(0,.08+i*(roof?.021:.043),-.32+i*.067);sample.rotation.x=roof?.035:.055;root.add(sample);
   const m=roof&&herringbone.length?herringbone[(i+variant)%herringbone.length]:woods[(i+variant*2)%woods.length]??edge;
   const usePhoto=!roof&&i===0;const panel=mesh(sample,usePhoto?photoSample(g,dockeBoards[variant%2],[1152,1536]):g,[usePhoto?new THREE.MeshStandardMaterial({map:photoTextures.docke,roughness:.74}):m,edge],0,0,0,roof?'Pointed sample with oval carry opening':'SPC sample panel');panel.userData.plankerHandle=roof;
   graphic(sample,.072,.105,-.237,roof?1.035:1.005,-.0069,labelTexture,'Small product card');
   box(root,.60,.015,.025,0,.076+i*(roof?.021:.043),-.32+i*.067,dark,'Individual sample slot');
  }
  root.userData.samples=count;return root;
 }
 function productLabel(p,w,h,x,y,z){graphic(p,w,h,x,y,z,labelTexture,'Product label');}
 function bottle(p,x,y,z,color=white){box(p,.09,.23,.08,x,y+.115,z,color,'Cleaning bottle');cylinder(p,.022,.055,x,y+.257,z,white,'Bottle neck');cylinder(p,.025,.018,x,y+.29,z,blue,'Bottle cap');productLabel(p,.069,.12,x,y+.12,z-.041);}
 function bucket(p,x,y,z,r=.10,lid=white){cylinder(p,r,.20,x,y+.10,z,white,'Adhesive bucket',r*1.08);cylinder(p,r*1.10,.025,x,y+.212,z,lid,'Bucket lid');box(p,r*1.5,.10,.005,x,y+.095,z-r*.95,blue,'Blue bucket label');}
 if(kind==='quickAccessories'){
  box(root,1.32,.045,.54,0,.052,0,white,'Accessories base');box(root,1.32,2.18,.025,0,1.14,.258,white,'White accessories back panel');
  for(const x of [-.65,.65])box(root,.026,1.62,.54,x,.86,0,white,'White accessories side panel');
  box(root,1.34,.04,.55,0,1.64,0,white,'Accessories brochure shelf');
  box(root,1.34,.25,.03,0,2.16,.24,blue,'Blue Quick-Step accessories header');graphic(root,1.32,.22,0,2.16,.223,brandTextures.quickAccessories,'Quick-Step accessories brand');
  photoPlane(root,1.31,.39,0,1.835,.239,photoTextures.quickAccessories,[[581,238],[1241,179],[1206,406],[585,408]],[1600,1200],'Printed accessories interior backdrop');
  for(const [i,x,color,height] of [[0,-.50,white,1.13],[1,-.31,white,1.16],[2,-.10,green,1.23],[3,.08,red,1.45]]){
   const z=i===3?.10:-.04;cylinder(root,.081,height,x,.075+height/2,z,color,'Standing underlay roll');cylinder(root,.025,.009,x,.08+height,z,dark,'Underlay roll core');productLabel(root,.10,.25,x,.71,z-.082);
  }
  box(root,.40,.035,.40,.40,.36,.01,white,'Small lower accessory shelf');bucket(root,.20,.077,-.16,.12);bucket(root,.49,.077,-.15,.092);
  box(root,.13,.64,.14,.26,.72,.13,blue,'Blue Quick-Step accessory carton');productLabel(root,.09,.18,.26,.75,.058);
  for(let i=0;i<5;i++){const coil=mesh(root,new THREE.TorusGeometry(.125+i*.004,.012,7,28),silver,.44,.395+i*.012,.0,'Coiled accessory hose');coil.rotation.x=Math.PI/2;}
  for(const [x,y] of [[.28,1.35],[.52,1.35],[.52,1.03]]){line(root,[x,y,.245],[x,y,.13],.004,silver,'Accessory display hook');box(root,.105,.22,.012,x,y-.055,.12,blue,'Hanging accessory pack');productLabel(root,.086,.072,x,y+.012,.112);}
  for(const y of [.40,.85,1.25]){line(root,[.66,y,.17],[.70,y,-.15],.004,silver,'Wire side holder');line(root,[.70,y,-.15],[.58,y,-.23],.004,silver,'Wire side holder');}
  return root;
 }
 if(kind==='glassCabinet'){
  const glass=new THREE.MeshStandardMaterial({color:0xa9c8d0,transparent:true,opacity:.12,roughness:.10,metalness:.15,depthWrite:false,side:THREE.DoubleSide});
  const glow=new THREE.MeshStandardMaterial({color:0xffdf9e,emissive:0xffcc7a,emissiveIntensity:2,roughness:.4});
  box(root,1.06,.16,.48,0,.10,0,dark,'Gray cabinet plinth');box(root,1.06,.035,.48,0,2.14,0,silver,'Cabinet top frame');
  for(const x of [-.51,.51])for(const z of [-.225,.225])box(root,.025,1.99,.025,x,1.15,z,silver,'Aluminum cabinet upright');
  for(const y of [.20,.60,1.0,1.40,1.83,2.12]){box(root,1.02,.014,.45,0,y,0,y===.20?dark:glass,'Glass display shelf');for(const z of [-.227,.227])box(root,1.04,.015,.018,0,y,z,silver,'Shelf edge frame');}
  for(const x of [-.51,.51]){const pane=box(root,.008,1.91,.43,x,1.16,0,glass,'Glass cabinet side');pane.castShadow=false;}
  const back=box(root,1,1.91,.006,0,1.16,.228,glass,'Glass cabinet rear panel');back.castShadow=false;
  for(const x of [-.255,.255]){const pane=box(root,.493,1.91,.006,x,1.16,-.23,glass,'Full-height sliding glass door');pane.castShadow=false;box(root,.009,.13,.025,x<0?-.025:.025,1.07,-.25,silver,'Glass door handle');}
  box(root,.013,1.87,.013,.483,1.16,.18,glow,'Warm vertical cabinet LED strip');
  for(const x of [-.31,.31]){cylinder(root,.036,.012,x,2.112,0,silver,'Cabinet ceiling spot');cylinder(root,.025,.006,x,2.103,0,glow,'Warm cabinet spotlight');}
  for(let i=0;i<4;i++)for(let j=0;j<2;j++){const tape=cylinder(root,.053,.055,-.41+i*.113,1.86+j*.059,.015,yellow,'Yellow tape roll');cylinder(root,.023,.003,-.41+i*.113,1.889+j*.059,.015,dark,'Tape roll core');}
  for(const x of [.11,.25,.39])bottle(root,x,1.84,.0);
  for(let i=0;i<7;i++){const x=-.42+i*.136;box(root,.115,.13,.025,x,1.49,.035,white,'Packaged tape and fitting');const ring=mesh(root,new THREE.TorusGeometry(.034,.012,8,20),i%2?edge:silver,x,1.47,.015,'Packaged fitting ring');ring.rotation.y=Math.PI;productLabel(root,.094,.044,x,1.53,.021);}
  for(let i=0;i<6;i++){const x=-.40+i*.15;box(root,.10,.025,.14,x,1.025,-.02,i%2?red:blue,'Utility knife and tool pack');line(root,[x-.03,1.045,-.05],[x+.03,1.045,.0],.012,black,'Utility knife handle');}
  for(const x of [-.29,-.13]){box(root,.095,.11,.055,x,1.12,.08,black,'Tape measure');box(root,.06,.04,.008,x,1.12,.048,red,'Tape measure red grip');}
  for(const x of [-.37,-.14,.10]){box(root,.17,.22,.12,x,.725,.05,x<-.2?green:blue,'Floor care product box');productLabel(root,.13,.15,x,.735,-.011);}
  bottle(root,.35,.61,-.08);bucket(root,-.08,.214,-.02,.12,red);bucket(root,.29,.214,.02,.115,red);bottle(root,.29,.45,.02);box(root,.14,.33,.17,-.37,.38,.0,blue,'Tall cleaning kit carton');
  root.traverse(o=>{if(o.isMesh&&o.material.transparent)o.castShadow=false;});
  return root;
 }
 throw new Error('Unknown Ashan reference stand '+kind);
}
