import * as THREE from './vendor/three.module.js';
import defaultFont from './assets/sign-glyphs.js?v=5';
// Real extruded letter outlines. Counters remain open in А, Р, О, Д, etc.
export function makeWallLettering(text,height,{color=0xf2f3ec,depth=.024,tracking=.008,font=defaultFont}={}){
 const group=new THREE.Group(),scale=height/font.capHeight;
 const front=new THREE.MeshStandardMaterial({color,roughness:.58});
 const edge=new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(.82),roughness:.72});
 let cursor=0;
 for(const char of text){
  const glyph=font.glyphs[char];if(!glyph)throw new Error('Missing sign character: '+char);
  const path=new THREE.ShapePath();
  for(const [op,...p] of glyph.commands){
   const args=p.map(v=>v*scale);
   if(op==='m')path.moveTo(args[0]+cursor,args[1]);
   if(op==='l')path.lineTo(args[0]+cursor,args[1]);
   if(op==='q')path.quadraticCurveTo(args[0]+cursor,args[1],args[2]+cursor,args[3]);
   if(op==='b')path.bezierCurveTo(args[0]+cursor,args[1],args[2]+cursor,args[3],args[4]+cursor,args[5]);
   if(op==='z'&&path.currentPath?.curves.length)path.currentPath.closePath();
  }
  path.subPaths=path.subPaths.filter(p=>p.curves.length);
  const shapes=path.toShapes(false);
  if(shapes.length){const geometry=new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0013,bevelSegments:2,curveSegments:8,steps:1});const letter=new THREE.Mesh(geometry,[front,edge]);letter.castShadow=true;letter.receiveShadow=true;group.add(letter);}
  cursor+=glyph.advance*scale+tracking;
 }
 group.name=text;group.userData={text,width:cursor,height};return group;
}
