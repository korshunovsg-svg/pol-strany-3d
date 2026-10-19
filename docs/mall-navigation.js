import {ashanSize} from './ashan-layout.js?v=24';
import {omskSize,omskFootprint,omskContains,omskWalls} from './omsk-layout.js?v=24';
export const roomFootprint=[[1.05,0],[15,0],[15,5.5],[0,5.5],[0,4.05],[1.05,4.05]];
export function getRoomFootprint(room){return room.id==='omsk'?omskFootprint:room.id==='ashan'?[[0,0],[ashanSize.length,0],[ashanSize.length,ashanSize.width],[0,ashanSize.width]]:roomFootprint;}
export const mallLayout={hall:{minX:15,maxX:27,minZ:-3,maxZ:8.5,height:5.4},
 bounds:{minX:-.3,maxX:32.8,minZ:-24.1,maxZ:25.3},
 rooms:[
  {id:'crocus',name:'Пол Страны Крокус',city:'КРОКУС',x:0,z:0,rotation:0},
  {id:'omsk',name:'Пол Страны Омск',city:'ОМСК',x:30.5,z:-3-omskSize.length,rotation:-Math.PI/2,...omskSize},
  {id:'ashan',name:'Пол Страны Ашан',city:'АШАН',x:17.5,z:25,rotation:Math.PI/2,length:16.5,width:7,height:5.1}
 ]};
export function roomToWorld(room,x,z){const c=Math.cos(room.rotation),s=Math.sin(room.rotation);return {x:room.x+c*x+s*z,z:room.z-s*x+c*z};}
export function worldToRoom(room,x,z){const dx=x-room.x,dz=z-room.z,c=Math.cos(room.rotation),s=Math.sin(room.rotation);return {x:c*dx-s*dz,z:s*dx+c*dz};}
export function roomContains(room,x,z){const p=worldToRoom(room,x,z);return room.id==='omsk'?omskContains(p.x,p.z):room.id==='ashan'?p.x>=0&&p.x<=ashanSize.length&&p.z>=0&&p.z<=ashanSize.width:p.x>=0&&p.x<=15&&p.z>=0&&p.z<=5.5&&(p.x>=1.05||p.z>=4.05);}
export function containsMallFloor(x,z){const h=mallLayout.hall;return mallFloorRects.some(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ)||mallLayout.rooms.some(r=>roomContains(r,x,z));}
export function mallLocation(x,z){const room=mallLayout.rooms.find(r=>roomContains(r,x,z));return room?.name??'Общий холл';}
export const roomWallRects=[
 {minX:.96,maxX:15.09,minZ:-.16,maxZ:0},
 {minX:-.09,maxX:15.09,minZ:5.5,maxZ:5.66},
 {minX:.89,maxX:1.05,minZ:-.12,maxZ:4.09},
 {minX:-.08,maxX:1.13,minZ:3.89,maxZ:4.05},
 {minX:-.16,maxX:0,minZ:3.97,maxZ:5.58},
 {minX:0,maxX:.45,minZ:5.05,maxZ:5.5},
 {minX:14.89,maxX:15.11,minZ:-.13,maxZ:.09},
 {minX:14.89,maxX:15.11,minZ:5.41,maxZ:5.63}
];
// Added mall strips follow both open faces of Omsk and join the original shared hall.
export const mallFloorRects=[mallLayout.hall,{minX:12,maxX:15,minZ:-3,maxZ:0},{minX:27,maxX:32.5,minZ:-3,maxZ:0},{minX:30.5,maxX:32.5,minZ:-12.4,maxZ:-3}];
export const hallWallRects=[
 {minX:14.92,maxX:15.08,minZ:5.5,maxZ:8.58},
 {minX:26.92,maxX:27.08,minZ:0,maxZ:8.58},
 {minX:14.92,maxX:17.5,minZ:8.42,maxZ:8.58},
 {minX:24.5,maxX:27.08,minZ:8.42,maxZ:8.58},
 // Stop the corridor return outside Crocus; its end must not protrude through
 // the gray showroom wall or cover the ПВХ-ПЛИТКА lettering.
 {minX:11.92,maxX:12.08,minZ:-3.08,maxZ:-.16},
 {minX:12,maxX:15,minZ:-.16,maxZ:0,crocusSharedBoundary:true},
 {minX:32.42,maxX:32.58,minZ:-12.48,maxZ:.08},
 {minX:27,maxX:32.58,minZ:-.08,maxZ:.08},
 {minX:30.42,maxX:32.58,minZ:-12.48,maxZ:-12.32}
];
export function getRoomWallRects(room){
 if(room.id==='omsk')return omskWalls;
 if(room.id!=='ashan')return roomWallRects;
 const {length:L,width:W,entranceMin:a,entranceMax:b}=ashanSize;
 return [{minX:-.16,maxX:L+.16,minZ:-.16,maxZ:0},{minX:-.16,maxX:L+.16,minZ:W,maxZ:W+.16},{minX:-.16,maxX:0,minZ:0,maxZ:W},
 {minX:L,maxX:L+.16,minZ:0,maxZ:a},{minX:L,maxX:L+.16,minZ:b,maxZ:W}];
}
export function transformRoomRect(room,o){const corners=[[o.minX,o.minZ],[o.minX,o.maxZ],[o.maxX,o.minZ],[o.maxX,o.maxZ]].map(([x,z])=>roomToWorld(room,x,z));return {kind:'rect',minX:Math.min(...corners.map(p=>p.x)),maxX:Math.max(...corners.map(p=>p.x)),minZ:Math.min(...corners.map(p=>p.z)),maxZ:Math.max(...corners.map(p=>p.z)),clearance:.22};}
export function createMallNavigation({furnitureObstacles=[]}={}){
 const obstacles=[...mallLayout.rooms.flatMap(r=>getRoomWallRects(r).map(o=>transformRoomRect(r,o))),...hallWallRects.map(o=>({...o,kind:'rect',clearance:.22})),...furnitureObstacles.map(o=>({...o,clearance:.18}))];
 const free=(x,z)=>containsMallFloor(x,z)&&obstacles.every(o=>o.kind==='rect'?
  !(x>o.minX-o.clearance+1e-8&&x<o.maxX+o.clearance-1e-8&&z>o.minZ-o.clearance+1e-8&&z<o.maxZ+o.clearance-1e-8):Math.hypot(x-o.x,z-o.z)>=o.radius+o.clearance-1e-8);
 function resolveMove(x,z,previous={x,z}){
  for(let pass=0;pass<6;pass++)for(const o of obstacles){
   if(o.kind==='rect'){
    const left=o.minX-o.clearance,right=o.maxX+o.clearance,front=o.minZ-o.clearance,back=o.maxZ+o.clearance;
    if(x>left&&x<right&&z>front&&z<back){
     if(previous.x<=left)x=left;else if(previous.x>=right)x=right;else if(previous.z<=front)z=front;else if(previous.z>=back)z=back;
     else {const ds=[x-left,right-x,z-front,back-z],i=ds.indexOf(Math.min(...ds));if(i===0)x=left;if(i===1)x=right;if(i===2)z=front;if(i===3)z=back;}
    }
   }else{
    let dx=x-o.x,dz=z-o.z,d=Math.hypot(dx,dz),limit=o.radius+o.clearance;
    if(d<limit){if(d<1e-8){dx=previous.x-o.x;dz=previous.z-o.z;d=Math.hypot(dx,dz);if(d<1e-8){dx=0;dz=-1;d=1;}}x=o.x+dx/d*limit;z=o.z+dz/d*limit;}
   }
  }
  if(free(x,z))return [x,z];
  if(free(previous.x,previous.z))return [previous.x,previous.z];
  for(let r=.10;r<3;r+=.10)for(let i=0;i<48;i++){const a=x+Math.cos(i/48*Math.PI*2)*r,b=z+Math.sin(i/48*Math.PI*2)*r;if(free(a,b))return [a,b];}
  return [14.75,2.75];
 }
 return {resolveMove,isWalkable:free,obstacles};
}
export function mallMapMetrics(width=420,height=280){const b=mallLayout.bounds,s=Math.min((width-28)/(b.maxZ-b.minZ),(height-28)/(b.maxX-b.minX));return {s,ox:(width-(b.maxZ-b.minZ)*s)/2,oy:(height-(b.maxX-b.minX)*s)/2};}
export function worldToMallMap(x,z,width=420,height=280){const {s,ox,oy}=mallMapMetrics(width,height),b=mallLayout.bounds;return {x:ox+(z-b.minZ)*s,y:oy+(b.maxX-x)*s};}
export function mallMapToWorld(x,y,width=420,height=280){const {s,ox,oy}=mallMapMetrics(width,height),b=mallLayout.bounds;return {x:b.maxX-(y-oy)/s,z:b.minZ+(x-ox)/s};}
