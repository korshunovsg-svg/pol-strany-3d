import * as THREE from './vendor/three.module.js';
// Compact consultation area leaves the main route open around the far island.
// Local dimensions follow the reference photo; the desktop is deliberately empty.
export const workstationLayout={bay:{minX:7.1,maxX:10.1},desk:{x:9.05,z:4.50,width:2.02,depth:.70,height:.78},visitorSeats:[{x:8.55,z:3.85},{x:9.55,z:3.85}],staffSeats:[{x:8.55,z:5.17},{x:9.55,z:5.17}]};
const d=workstationLayout.desk;
export const workstationObstacles=[{kind:'rect',minX:d.x-d.width/2,maxX:d.x+d.width/2,minZ:d.z-d.depth/2,maxZ:d.z+d.depth/2},...workstationLayout.visitorSeats.map(p=>({kind:'circle',...p,radius:.295})),...workstationLayout.staffSeats.map(p=>({kind:'circle',...p,radius:.31}))];
function mesh(parent,geometry,material,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,material,name=''){return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z,name);}
function roundedGeometry(width,height,depth,radius=.04,bevel=.006){
 const x=-width/2,y=-height/2,w=width,h=height,r=Math.min(radius,w/2-.001,h/2-.001),s=new THREE.Shape();
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1,curveSegments:10});g.translate(0,0,-depth/2);return g;
}
function rounded(parent,w,h,d,x,y,z,material,r=.04){return mesh(parent,roundedGeometry(w,h,d,r),material,x,y,z);}
function link(parent,start,end,r1,r2,material){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),v=b.clone().sub(a);const o=mesh(parent,new THREE.CylinderGeometry(r2,r1,v.length(),14),material);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function seam(parent,points,material,radius=.0009){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,4,false),material);}
export function createWorkstation({surfaceTexture,oak}={}){
 const root=new THREE.Group();root.name='Consultation desk and four chairs';root.userData.workstation=true;
 const topTex=surfaceTexture?.clone();if(topTex){topTex.repeat.set(8,3);topTex.needsUpdate=true;}
 const m={top:new THREE.MeshStandardMaterial({color:0xb9bbb6,bumpMap:topTex??null,bumpScale:.001,roughness:.90}),front:new THREE.MeshStandardMaterial({color:0x82786b,bumpMap:topTex??null,bumpScale:.001,roughness:.93}),edge:new THREE.MeshStandardMaterial({color:0x51423a,roughness:.82}),red:new THREE.MeshPhysicalMaterial({color:0xd71c27,roughness:.49,clearcoat:.13,clearcoatRoughness:.5}),redSeam:new THREE.MeshStandardMaterial({color:0x921c24,roughness:.95}),black:new THREE.MeshStandardMaterial({color:0x202326,roughness:.62}),blackSeam:new THREE.MeshStandardMaterial({color:0x101416,roughness:.87}),metal:new THREE.MeshStandardMaterial({color:0x5e656a,metalness:.75,roughness:.38}),frame:new THREE.MeshStandardMaterial({color:0x202526,metalness:.25,roughness:.68}),wood:new THREE.MeshStandardMaterial({color:0xc6a779,roughness:.67}),rubber:new THREE.MeshStandardMaterial({color:0x171b1d,roughness:.93})};
 const d=workstationLayout.desk,desk=new THREE.Group();desk.name='Empty grey consultation desk';desk.userData.type='desk';desk.position.set(d.x,0,d.z);root.add(desk);
 // Concrete-look top, dark thin edge band, full front modesty panel and two end panels.
 box(desk,d.width,.032,d.depth,0,d.height-.016,0,m.top,'Bare desktop');
 box(desk,d.width,.012,.014,0,d.height-.038,-d.depth/2+.007,m.edge,'Dark front edge');
 box(desk,d.width-.11,.672,.030,0,.410,-d.depth/2+.060,m.front,'Full front panel');
 for(const x of [-d.width/2+.064,d.width/2-.064]){box(desk,.030,.682,d.depth-.10,x,.405,.014,m.front,'Desk end support');for(const z of [-.27,.27])box(desk,.05,.045,.05,x,.040,z,m.frame,'Adjustable desk foot');}
 box(desk,.024,.61,.57,0,.43,.044,m.front,'Central support');
 box(desk,d.width-.16,.035,.035,0,.70,d.depth/2-.025,m.edge,'Rear top brace');
 function visitorChair(){
  const g=new THREE.Group();g.userData.type='visitorChair';g.name='Red upholstered visitor chair';
  const seat=mesh(g,roundedGeometry(.53,.46,.044,.105,.009),m.red,0,.447,0,'Red seat cushion');seat.rotation.x=-Math.PI/2;
  const shell=new THREE.Shape();shell.moveTo(-.23,-.195);shell.quadraticCurveTo(-.29,-.07,-.26,.04);shell.quadraticCurveTo(-.25,.20,-.10,.215);shell.quadraticCurveTo(0,.24,.10,.215);shell.quadraticCurveTo(.25,.20,.26,.04);shell.quadraticCurveTo(.29,-.07,.23,-.195);shell.quadraticCurveTo(0,-.22,-.23,-.195);
  const backGeo=new THREE.ExtrudeGeometry(shell,{depth:.047,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:4,curveSegments:16,steps:1});backGeo.translate(0,0,-.0235);const a=backGeo.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);a.setZ(i,z-.10*(x/.26)**2+.10*y);}
  backGeo.computeVertexNormals();const back=mesh(g,backGeo,m.red,0,.657,.198,'Curved red backrest');
  const frontZ=(x,y)=>.198-.10*(x/.26)**2+.10*(y-.657)-.030;
  const bp=(x,y)=>[x,y,frontZ(x,y)];
  seam(g,[bp(-.205,.78),bp(0,.645),bp(.205,.50)],m.redSeam);
  seam(g,[bp(.205,.78),bp(0,.645),bp(-.205,.50)],m.redSeam);
  seam(g,[bp(0,.827),bp(0,.645),bp(0,.48)],m.redSeam,.0007);
  for(const points of [[[-.20,.470,-.15],[0,.470,0],[.20,.470,.15]],[[.20,.470,-.15],[0,.470,0],[-.20,.470,.15]],[[-.25,.470,0],[0,.470,0],[.25,.470,0]]])seam(g,points,m.redSeam,.0008);
  // Four splayed light timber legs and the discreet dark metal underside.
  for(const x of [-1,1])for(const z of [-1,1]){link(g,[x*.235,.026,z*.214],[x*.157,.415,z*.138],.013,.021,m.wood);mesh(g,new THREE.SphereGeometry(.014,12,8),m.rubber,x*.235,.023,z*.214,'Floor protector');}
  for(const z of [-.14,.14])link(g,[-.16,.395,z],[.16,.395,z],.009,.009,m.frame);
  for(const x of [-.16,.16])link(g,[x,.395,-.14],[x,.395,.14],.009,.009,m.frame);
  link(g,[-.16,.375,-.14],[.16,.375,.14],.004,.004,m.frame);link(g,[.16,.375,-.14],[-.16,.375,.14],.004,.004,m.frame);
  return g;
 }
 function officeChair(){
  const g=new THREE.Group();g.userData.type='staffChair';g.name='Black ribbed office chair';
  const seat=mesh(g,roundedGeometry(.50,.48,.072,.065,.012),m.black,0,.485,0,'Black padded seat');seat.rotation.x=-Math.PI/2;
  const backGeo=roundedGeometry(.47,.61,.065,.045,.007),a=backGeo.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);const bulge=.006*(1-Math.cos((y+.305)*Math.PI*18));a.setZ(i,z+y*.12-.016*(x/.235)**2-bulge);}
  backGeo.computeVertexNormals();mesh(g,backGeo,m.black,0,.855,.205,'Tall ribbed backrest');
  for(let i=0;i<9;i++){const y=.586+i*.062,z=.205+(y-.855)*.12-.040;seam(g,[[-.20,y,z-.010],[0,y,z],[.20,y,z-.010]],m.blackSeam,.0010);}
  rounded(g,.055,.48,.040,0,.72,.262,m.frame,.016);
  for(const x of [-.302,.302]){
   const arm=mesh(g,roundedGeometry(.068,.34,.045,.028,.005),m.black,x,.675,.002,'Padded armrest');arm.rotation.x=-Math.PI/2;
   link(g,[x,.646,.100],[x,.515,.115],.014,.014,m.metal);link(g,[x,.515,.115],[Math.sign(x)*.21,.485,.115],.013,.013,m.metal);
  }
  mesh(g,new THREE.CylinderGeometry(.035,.040,.24,20),m.frame,0,.30,0,'Gas lift sleeve');mesh(g,new THREE.CylinderGeometry(.019,.019,.10,20),m.metal,0,.447,0,'Height adjustment column');
  mesh(g,new THREE.CylinderGeometry(.065,.075,.065,20),m.frame,0,.170,0,'Five-star hub');
  for(let i=0;i<5;i++){
   const angle=i/5*Math.PI*2,dx=Math.cos(angle),dz=Math.sin(angle);link(g,[dx*.04,.177,dz*.04],[dx*.29,.085,dz*.29],.015,.012,m.metal);
   mesh(g,new THREE.CylinderGeometry(.009,.009,.028,10),m.frame,dx*.29,.068,dz*.29,'Caster swivel');
   for(const side of [-.012,.012]){const wheel=mesh(g,new THREE.CylinderGeometry(.029,.029,.015,16),m.rubber,dx*.29+side,.035,dz*.29,'Twin caster wheel');wheel.rotation.z=Math.PI/2;}
  }
  return g;
 }
 for(const p of workstationLayout.visitorSeats){const chair=visitorChair();chair.position.set(p.x,0,p.z);chair.rotation.y=Math.PI;chair.scale.set(.88,1,.88);root.add(chair);}
 for(const p of workstationLayout.staffSeats){const chair=officeChair();chair.position.set(p.x,0,p.z);chair.scale.set(.82,1,.82);root.add(chair);}
 root.userData.layout=workstationLayout;return root;
}
export function resolveWorkstationCollision(x,z,previous={x,z},radius=.18,extraObstacles=[]){
 const obstacles=[...workstationObstacles,...extraObstacles];
 for(let pass=0;pass<3;pass++)for(const o of obstacles){
  if(o.kind==='rect'){
   const left=o.minX-radius,right=o.maxX+radius,front=o.minZ-radius,back=o.maxZ+radius;
   if(x>left&&x<right&&z>front&&z<back){
    if(previous.x<=left)x=left;else if(previous.x>=right)x=right;else if(previous.z<=front)z=front;else if(previous.z>=back)z=back;
    else{const distances=[x-left,right-x,z-front,back-z],i=distances.indexOf(Math.min(...distances));if(i===0)x=left;if(i===1)x=right;if(i===2)z=front;if(i===3)z=back;}
   }
  }else{
   let dx=x-o.x,dz=z-o.z,length=Math.hypot(dx,dz),limit=o.radius+radius;
   if(length<limit){if(length<1e-7){dx=previous.x-o.x;dz=previous.z-o.z;length=Math.hypot(dx,dz);if(length<1e-7){dx=0;dz=-1;length=1;}}x=o.x+dx/length*limit;z=o.z+dz/length*limit;}
  }
 }
 // The strip behind the staff chairs is narrower than walking clearance.
 // Reject a move that would push the visitor through the wall while separating obstacles.
 const free=(a,b)=>b>=.22&&b<=5.28&&obstacles.every(o=>o.kind==='rect'?!(a>o.minX-radius&&a<o.maxX+radius&&b>o.minZ-radius&&b<o.maxZ+radius):Math.hypot(a-o.x,b-o.z)>=o.radius+radius-1e-8);
 if(z<.22||z>5.28||!free(x,z)){
  if(free(previous.x,previous.z))return [previous.x,previous.z];
  for(let r=.10;r<2;r+=.10)for(let i=0;i<32;i++){const a=x+Math.cos(i/32*Math.PI*2)*r,b=z+Math.sin(i/32*Math.PI*2)*r;if(free(a,b))return [a,b];}
 }
 return [x,z];
}
export function drawWorkstationMap(ctx){
 const d=workstationLayout.desk;ctx.fillStyle='#a2a69c';ctx.fillRect(d.x-d.width/2,d.z-d.depth/2,d.width,d.depth);ctx.strokeStyle='#c4cabe';ctx.lineWidth=.04;ctx.strokeRect(d.x-d.width/2,d.z-d.depth/2,d.width,d.depth);
 for(const p of workstationLayout.visitorSeats){ctx.beginPath();ctx.ellipse(p.x,p.z,.22,.24,0,0,Math.PI*2);ctx.fillStyle='#e33b45';ctx.fill();}
 for(const p of workstationLayout.staffSeats){ctx.beginPath();ctx.ellipse(p.x,p.z,.24,.25,0,0,Math.PI*2);ctx.fillStyle='#626c69';ctx.fill();ctx.strokeStyle='#96a197';ctx.stroke();}
}
