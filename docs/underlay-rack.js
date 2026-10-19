import * as THREE from './vendor/three.module.js';
export const crocusUnderlay={x:7.57,z:2.50,width:.40,depth:.40,rotation:-Math.PI/2};
export const underlayObstacles=[{kind:'rect',minX:7.37,maxX:7.77,minZ:2.30,maxZ:2.70}];
export function drawUnderlayMap(ctx){ctx.fillStyle='#b4a8cd';ctx.fillRect(7.37,2.30,.40,.40);ctx.strokeStyle='#e2e6dd';ctx.lineWidth=.02;ctx.strokeRect(7.37,2.30,.40,.40);}
const quads=[[[89,76],[211,54],[226,743],[130,724]],[[213,54],[329,82],[314,720],[226,743]]];
export function createUnderlayRack(texture){
 const root=new THREE.Group();root.name='Photo-reference black underlay sample tower';root.userData={type:'underlayRack',photoReference:true,referenceVersion:25,sides:4};
 const black=new THREE.MeshStandardMaterial({color:0x191d20,roughness:.85}),metal=new THREE.MeshStandardMaterial({color:0x363b3f,roughness:.65,metalness:.3}),photo=new THREE.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.9});
 function box(w,h,d,x,y,z,m,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;}
 box(.46,.055,.46,0,.057,0,black,'Square underlay tower plinth');box(.424,2.12,.424,0,1.145,0,black,'Black four-sided display body');
 for(const x of [-.19,.19])for(const z of [-.19,.19])box(.023,.06,.023,x,.03,z,metal,'Short tower foot');
 for(let side=0;side<4;side++){
  const face=new THREE.Group();face.rotation.y=side*Math.PI/2;root.add(face);const g=new THREE.PlaneGeometry(.421,2.105),uv=g.attributes.uv,q=quads[side%2];
  for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i),[a,b,c,d]=q;uv.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/494,1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/809);}uv.needsUpdate=true;
  const artwork=new THREE.Mesh(g,photo);artwork.rotation.y=Math.PI;artwork.position.set(0,1.145,-.213);artwork.name='Underlay samples, labels and heading from the photograph';face.add(artwork);
  // Separate physical sample cards stand slightly proud of the printed board.
  for(let row=0;row<8;row++)for(let col=0;col<2;col++){
   const x=(col-.5)*.198,y=1.88-row*.133,card=new THREE.Mesh(new THREE.BoxGeometry(.173,.095,.005),black);card.position.set(x,y,-.215);card.name='Raised underlay sample card';face.add(card);
   const cg=new THREE.PlaneGeometry(.169,.091),cu=cg.attributes.uv;
   // Project each raised surface to precisely the same reference pixels as its backing.
   for(let i=0;i<cu.count;i++){const u=.5-(x-(cu.getX(i)-.5)*.169)/.421,v=(y+(cu.getY(i)-.5)*.091-(1.145-2.105/2))/2.105,[a,b,c,d]=q;cu.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/494,1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/809);}
   const front=new THREE.Mesh(cg,photo);front.rotation.y=Math.PI;front.position.set(x,y,-.218);front.name='Individual underlay sample face';face.add(front);
  }
 }
 return root;
}
export function createCrocusUnderlay(texture){const rack=createUnderlayRack(texture);rack.scale.set(.40/.46,1,.40/.46);rack.position.set(crocusUnderlay.x,0,crocusUnderlay.z);rack.rotation.y=crocusUnderlay.rotation;rack.userData.crocusUnderlay=true;return rack;}
