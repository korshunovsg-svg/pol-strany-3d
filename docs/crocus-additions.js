import * as THREE from './vendor/three.module.js';
import {createParquetStand} from './ashan-parquet.js?v=21';
import {createQuickStepWallLogo,createWallCategorySign} from './showroom-branding.js?v=28';
// The two Factory Floors modules opposite the consultation desk in the plan.
// The left-hand aisle remains over one metre wide beside the underlay tower.
export const factoryLayout=[{x:9.14,z:2.20,width:.68,depth:.42},{x:9.85,z:2.20,width:.68,depth:.42}];
export const factoryObstacles=factoryLayout.map(p=>({kind:'rect',minX:p.x-p.width/2,maxX:p.x+p.width/2,minZ:p.z-p.depth/2,maxZ:p.z+p.depth/2}));
export function createCrocusFactoryStands(woodTextures,parquetTextures){
 const root=new THREE.Group();root.name='Two Factory Floors parquet modules opposite the Crocus desk';
 factoryLayout.forEach((p,i)=>{
  const stand=createParquetStand('factoryFloors',{woodTextures,...parquetTextures,compactFactory:true},i),b=new THREE.Box3().setFromObject(stand),size=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3()),fixture=new THREE.Group();stand.position.set(-c.x,0,-c.z);fixture.add(stand);fixture.scale.set(p.width/size.x,1,p.depth/size.z);fixture.rotation.y=Math.PI;fixture.position.set(p.x,0,p.z);fixture.userData={crocusFactoryRack:true,kind:'factoryFloors',index:i};root.add(fixture);
 });return root;
}
export function addCrocusQuickStepSigns(root,northWall){
 const group=new THREE.Group();group.name='Crocus Quick-Step wall signage';root.add(group);
 for(const [text,width,x,y] of [['ЛАМИНАТ',2.1,4.9,2.64],['Quick-Step',1.5,8.3,2.43],['ПВХ-ПЛИТКА',2.4,11.5,2.64]]){
  const sign=text==='Quick-Step'?createQuickStepWallLogo(width):createWallCategorySign(text,width,.19);delete sign.userData.ashanCategory;sign.userData.crocusCategory=text;sign.position.set(x,y,.015);group.add(sign);
 }
 root.updateMatrixWorld(true);northWall.attach(group);return group;
}
export function drawFactoryMap(ctx){for(const p of factoryLayout){ctx.fillStyle='#b6aa7d';ctx.fillRect(p.x-p.width/2,p.z-p.depth/2,p.width,p.depth);ctx.strokeStyle='#eee6c4';ctx.lineWidth=.025;ctx.strokeRect(p.x-p.width/2,p.z-p.depth/2,p.width,p.depth);for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(p.x-p.width/2+.035+i*.065,p.z-p.depth/2+.03);ctx.lineTo(p.x-p.width/2+.035+i*.065,p.z+p.depth/2-.03);ctx.stroke();}}}
