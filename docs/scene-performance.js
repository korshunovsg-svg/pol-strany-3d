import * as THREE from './vendor/three.module.js';
// These showrooms are static. Keep their world transforms and sun shadow map
// until dimensions / roof visibility actually change, instead of rebuilding each frame.
export function createScenePerformance({scene,camera,renderer,maxPixelRatio=Math.min(devicePixelRatio,1.5)}){
 const points=[],spots=[],positions=new Map();scene.traverse(o=>{if(o.isPointLight)points.push(o);if(o.isSpotLight)spots.push(o);});
 let lastEye=new THREE.Vector3(Infinity,Infinity,Infinity),ratio=maxPixelRatio,ema=16,slow=0,fast=0,transforms=0;
 renderer.shadowMap.autoUpdate=false;
 function refresh(){scene.updateMatrixWorld(true);for(const l of [...points,...spots])positions.set(l,l.getWorldPosition(new THREE.Vector3()));lastEye.set(Infinity,Infinity,Infinity);renderer.shadowMap.needsUpdate=true;transforms++;}
 refresh();scene.matrixWorldAutoUpdate=false;
 function updateLights(force=false){if(!force&&lastEye.distanceToSquared(camera.position)<.16)return;lastEye.copy(camera.position);const order=points.slice().sort((a,b)=>positions.get(a).distanceToSquared(camera.position)-positions.get(b).distanceToSquared(camera.position));for(let i=0;i<order.length;i++)order[i].visible=i<8;for(const l of spots)l.visible=positions.get(l).distanceToSquared(camera.position)<100;}
 function sampleFrame(ms,continuous){if(!continuous||ms>120)return false;ema=ema*.94+ms*.06;slow=ema>32?slow+1:0;fast=ema<18?fast+1:0;let next=ratio;if(slow>=40&&ratio>.8){next=Math.max(.8,ratio-.15);slow=0;}else if(fast>=240&&ratio<maxPixelRatio){next=Math.min(maxPixelRatio,ratio+.10);fast=0;}if(next===ratio)return false;ratio=next;renderer.setPixelRatio(ratio);return true;}
 return {refresh,updateLights,sampleFrame,invalidateShadow:()=>renderer.shadowMap.needsUpdate=true,status:()=>({pixelRatio:ratio,pointLightBudget:8,pointLights:points.filter(o=>o.visible).length,transformRefreshes:transforms,staticTransforms:!scene.matrixWorldAutoUpdate,cachedShadows:!renderer.shadowMap.autoUpdate})};
}
