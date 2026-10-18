import * as THREE from './vendor/three.module.js';
import { makeWallLettering } from './wall-lettering.js?v=5';
import {makePolStranyLogo} from './pol-strany-logo.js?v=5';
// Layout in metres along the left wall, measured relative to the reference's
// panel edges and overhead structural bays. Absolute scale awaits site measurements.
export const wallLayout={entryX:14.8,wallZ:5.5,mainPanel:{u:0,width:3.9,bottom:1.4,height:1.05,rows:7,rowHeight:.15},brandPanel:{u:4.7,width:3.0,height:3.1},beamX:[14.85,10.1,7.1],inscriptions:[{text:'ИНЖЕНЕРНАЯ ДОСКА',u:.22,width:2.40,height:.20,y:2.65},{text:'ПАРКЕТ',u:3.01,width:.84,height:.17,y:2.66}]};
function slab(parent,w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export function createWallDecor({leftWall,oak}){
 const root=new THREE.Group();root.name='Reference left-wall composition';root.rotation.y=Math.PI;root.position.set(wallLayout.entryX-leftWall.position.x,-leftWall.position.y,wallLayout.wallZ-.006-leftWall.position.z);leftWall.add(root);
 const edge=new THREE.MeshStandardMaterial({color:0x8d6840,roughness:.82});
 // The large horizontal oak panel is independent of the vertical brand cladding.
 const p=wallLayout.mainPanel;slab(root,p.width+.026,p.height+.026,.028,p.width/2,p.bottom+p.height/2,.016,edge);
 let seed=840;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const rowHeight=p.rowHeight;
 for(let row=0;row<p.rows;row++){
  let u=0;const offset=row%3;
  while(u<p.width-.001){const bw=Math.min(p.width-u,u===0?[.83,1.23,1.57][offset]:1.3+rand()*.45),t=oak.clone();t.needsUpdate=true;t.rotation=0;t.repeat.set(bw/2,.12);t.offset.set(rand()*.5,(row%8)/8);const m=new THREE.MeshStandardMaterial({map:t,color:new THREE.Color().setHSL(.105,.36,.64+(rand()-.5)*.06),roughness:.63});const board=slab(root,bw-.0015,rowHeight-.001,.034,u+bw/2,p.bottom+(row+.5)*rowHeight,.04,m);board.userData.oakRow=row;u+=bw;}
 }
 for(const spec of wallLayout.inscriptions){const letters=makeWallLettering(spec.text,spec.height);letters.scale.x=spec.width/letters.userData.width;letters.position.set(spec.u,spec.y,.015);root.add(letters);}
 // Sharp solid geometry replaces the low-resolution photo patches for Crownwood.
 const crown=makeCrownwood();crown.position.set(1.95,0,.067);root.add(crown);
 const brand=wallLayout.brandPanel;
 for(let col=0;col<15;col++){
  const t=oak.clone();t.needsUpdate=true;t.rotation=Math.PI/2;t.repeat.set(1.2,.16);t.offset.set(rand(),rand());const m=new THREE.MeshStandardMaterial({map:t,color:0xd0c0a4,roughness:.72});slab(root,brand.width/15-.001,brand.height,.035,brand.u+(col+.5)*brand.width/15,brand.height/2,.025,m);
 }
 const ps=makePolStranyLogo();ps.position.set(brand.u+1.55-.75,1.59,.065);root.add(ps);
 // Two detailed moss frames, with raised cushions and fine branching filaments.
 for(const u of [.53,3.3]){const frame=makeMossFrame(rand);frame.position.set(u,1.94,.066);root.add(frame);}
 root.userData.layout=wallLayout;return root;
}

function polygonMesh(points,material,depth=.015){
 const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0013,bevelSegments:2,steps:1});
 const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;return mesh;
}
function makeCrownwood(){
 const group=new THREE.Group();group.name='Crownwood — solid lettering and emblem';
 const gold=new THREE.MeshStandardMaterial({color:0xfbc222,roughness:.42,metalness:.14});
 const orange=new THREE.MeshStandardMaterial({color:0xe19b0b,roughness:.55});
 const white=new THREE.MeshStandardMaterial({color:0xf7f7ee,roughness:.58});
 const crown=new THREE.Group();crown.name='Crownwood emblem';
 // Angular three-point emblem and central diamond, constructed as extruded contours.
 const scale=.54;const add=(points,material,z=0)=>{const mesh=polygonMesh(points.map(([x,y])=>[(x-.5)*scale,y*scale]),material);mesh.position.z=z;crown.add(mesh);};
 add([[.02,.05],[.02,.47],[.30,.17]],white);
 add([[.34,.05],[.55,.28],[.76,.05]],white);
 add([[.79,.05],[.98,.05],[.98,.47]],white);
 add([[.02,.58],[.30,.29],[.44,.46],[.49,.37],[.30,.12],[.02,.42]],gold,.006);
 add([[.58,.39],[.76,.20],[.98,.58],[.98,.41],[.77,.10],[.50,.35]],gold,.006);
 add([[.51,.88],[.68,.68],[.49,.45],[.32,.65]],gold,.010);
 add([[.51,.76],[.58,.68],[.50,.58],[.42,.67]],orange,.027);
 crown.position.y=1.89;group.add(crown);
 for(const [text,color,height,width,baseline] of [['CROWN',0xf9c72a,.125,.60,1.68],['WOOD',0xf8f7ed,.125,.52,1.49]]){
  const letters=makeWallLettering(text,height,{color,depth:.016,tracking:.0015});
  const bounds=new THREE.Box3().setFromObject(letters);const extent=bounds.max.x-bounds.min.x;
  letters.scale.x=width/extent;letters.position.set(-(bounds.min.x+bounds.max.x)*letters.scale.x/2,baseline,.006);group.add(letters);
 }
 group.userData.solidBrand=true;return group;
}
function makeMossFrame(rand){
 const group=new THREE.Group();group.name='Living moss relief';
 const timber=new THREE.MeshStandardMaterial({color:0xb3955d,roughness:.78}),backing=new THREE.MeshStandardMaterial({color:0x183c18,roughness:1});
 // Narrow timber surround and a recessed, dark, dense moss bed.
 slab(group,.44,.022,.055,0,.254,.01,timber);slab(group,.44,.022,.055,0,-.254,.01,timber);slab(group,.022,.49,.055,-.209,0,.01,timber);slab(group,.022,.49,.055,.209,0,.01,timber);slab(group,.394,.485,.018,0,0,.012,backing);
 const cushionCount=240,tipCount=5200,twigCount=2200;
 const cushions=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),cushionCount);
 const tips=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),tipCount);
 const twigs=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,4),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),twigCount);
 cushions.name='Irregular moss cushions';tips.name='Fine moss shoots';twigs.name='Branching moss filaments';
 const dummy=new THREE.Object3D(),centres=[],colour=new THREE.Color(),up=new THREE.Vector3(0,1,0);
 for(let i=0;i<cushionCount;i++){
  const cx=(rand()-.5)*.348,cy=(rand()-.5)*.446,r=.012+rand()*.012,h=.010+rand()*.014,cz=.032+h*.35;
  centres.push({x:cx,y:cy,r,h,z:cz,tone:rand()});dummy.position.set(cx,cy,cz);dummy.rotation.set(rand()*.2,rand()*.2,rand()*6.28);dummy.scale.set(r*(.85+rand()*.3),r*(.8+rand()*.45),h);dummy.updateMatrix();cushions.setMatrixAt(i,dummy.matrix);cushions.setColorAt(i,colour.setHSL(.275+rand()*.07,.67,.10+rand()*.10));
 }
 for(let i=0;i<tipCount;i++){
  const c=centres[i%cushionCount],angle=rand()*Math.PI*2,r=Math.sqrt(rand())*.94,dx=Math.cos(angle)*r,dy=Math.sin(angle)*r;
  const z=c.z+c.h*Math.sqrt(Math.max(0,1-r*r))+.001+rand()*.004,tip=.0011+rand()*.0014;
  dummy.position.set(c.x+dx*c.r,c.y+dy*c.r,z);dummy.rotation.set(rand()*3,rand()*3,rand()*6.28);dummy.scale.set(tip,tip*(1+rand()*.8),tip);dummy.updateMatrix();tips.setMatrixAt(i,dummy.matrix);tips.setColorAt(i,colour.setHSL(.25+rand()*.10,.62+rand()*.18,.13+rand()*.17));
 }
 for(let i=0;i<twigCount;i++){
  const c=centres[i%cushionCount],angle=rand()*Math.PI*2,rad=Math.sqrt(rand())*.82,dx=Math.cos(angle)*rad,dy=Math.sin(angle)*rad;
  const start=new THREE.Vector3(c.x+dx*c.r,c.y+dy*c.r,c.z+c.h*Math.sqrt(Math.max(0,1-rad*rad))-.002);
  const direction=new THREE.Vector3((rand()-.5)*.5,(rand()-.5)*.5,.7+rand()*.4).normalize(),length=.004+rand()*.008;
  dummy.position.copy(start).addScaledVector(direction,length*.5);dummy.quaternion.setFromUnitVectors(up,direction);dummy.scale.set(.00035+rand()*.00025,length,.0004);dummy.updateMatrix();twigs.setMatrixAt(i,dummy.matrix);twigs.setColorAt(i,colour.setHSL(.27+rand()*.08,.63,.12+rand()*.14));
 }
 for(const mesh of [cushions,tips,twigs]){mesh.castShadow=mesh===cushions;mesh.receiveShadow=true;group.add(mesh);}
 group.userData.proceduralMoss=true;return group;
}

// The same seven oak courses, solid Crownwood emblem and living moss relief
// used in Crocus, resized as a wall-mounted panel above other showrooms' racks.
// Local origin: bottom centre; decorative face points along +Z.
export function createCrownwoodWallPanel({oak,width=3.9,height=1.2}){
 const root=new THREE.Group();root.name='Crownwood decorative oak and moss wall panel';root.userData={crownwoodWallPanel:true,crocusAnalogue:true,rows:7};
 const timber=new THREE.MeshStandardMaterial({color:0xa38350,roughness:.8});
 slab(root,width+.025,height+.025,.028,0,height/2,0,timber);
 let seed=2718;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let row=0;row<7;row++){
  let u=-width/2;
  while(u<width/2-.001){const w=Math.min(width/2-u,u===-width/2?[.72,1.21,1.53][row%3]:1.1+rand()*.45),t=oak?.clone();if(t){t.repeat.set(w/2,.12);t.offset.set(rand()*.5,(row%7)/8);t.needsUpdate=true;}
   const m=new THREE.MeshStandardMaterial({map:t??null,color:new THREE.Color().setHSL(.105,.34,.64+(rand()-.5)*.05),roughness:.67});const o=slab(root,w-.002,height/7-.002,.034,u+w/2,(row+.5)*height/7,.028,m);o.userData.oakRow=row;u+=w;
  }
 }
 const brand=makeCrownwood(),bb=new THREE.Box3().setFromObject(brand),size=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),s=Math.min(height*.79/size.y,width*.27/size.x);brand.scale.setScalar(s);brand.position.set(-c.x*s,height/2-c.y*s,.06);root.add(brand);
 for(const x of [-width*.355,width*.355]){const moss=makeMossFrame(rand);moss.scale.setScalar(Math.min(1.3,height*.64/.53));moss.position.set(x,height/2,.065);root.add(moss);}
 return root;
}
