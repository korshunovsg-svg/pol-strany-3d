export const ashanSize={length:16.5,width:7,height:5.1,entranceMin:2,entranceMax:5};
const row=(count,x,step,z,width,depth,kind,rotation=0,extra={})=>Array.from({length:count},(_,i)=>({kind,x:x+i*step,z,width,depth,rotation,variant:i,...extra}));
export const ashanDisplays=[
 ...row(4,5.72,1.27,.54,1.20,.94,'pvc',Math.PI),
 ...row(5,10.80,1.27,.54,1.20,.94,'laminate',Math.PI),
 {kind:'quickBook',x:2.85,z:.34,width:1.50,depth:.50,rotation:Math.PI,variant:0},
 ...row(2,2.32,.52,2.04,.48,.72,'deckLaminate'),
 ...row(2,3.36,.52,2.04,.48,.72,'clix'),
 ...row(4,2.32,.52,2.70,.48,.60,'deckPolymer',Math.PI),
 ...row(7,2.27,.54,4.38,.50,.64,'deck'),
 ...row(9,2.27,.54,4.97,.50,.54,'alta',Math.PI),
 ...row(4,3.27,.62,6.62,.59,.65,'classen'),
 ...row(5,8.00,.57,2.47,.53,.85,'polarwood'),
 ...row(3,12.07,.77,6.52,.74,.85,'urban'),
 ...row(3,6.19,.57,2.45,.50,.84,'livingTree'),
 ...row(6,7.97,.49,3.345,.46,.85,'woodBee',Math.PI),
 {kind:'alpine',x:11.845,z:2.66,width:.49,depth:.78,rotation:0,variant:0},
 {kind:'prime',x:12.385,z:2.66,width:.49,depth:.78,rotation:0,variant:0},
 ...row(2,12.925,.54,2.66,.49,.78,'aura'),
 ...row(3,14.005,.54,2.66,.49,.78,'islands'),
 ...row(7,11.845,.54,3.46,.49,.78,'crownwoodClassic',Math.PI),
 ...row(4,14.30,.58,6.52,.52,.84,'nord'),
 ...Array.from({length:9},(_,i)=>({kind:'planker',x:.53,z:.37+i*.55,width:.53,depth:.90,rotation:-Math.PI/2,variant:i})),
 {kind:'planker',x:6.09,z:4.31,width:.54,depth:.78,rotation:0,variant:9},
 ...row(5,.37,.55,6.63,.53,.66,'docke'),
 {kind:'quickAccessories',x:4.34,z:.335,width:1.38,depth:.53,rotation:Math.PI,variant:0},
 {kind:'glassCabinet',x:6.515,z:6.725,width:1.07,depth:.47,rotation:0,variant:0},
 {kind:'factoryFloors',x:14.61,z:4.96,width:1.65,depth:.32,rotation:0,variant:0},
 {kind:'underlay',x:6.65,z:4.51,width:.38,depth:.42,rotation:-Math.PI/2,variant:0}
];
export const ashanWorkstation=[
 {kind:'desk',x:10.15,z:5.95,width:2.15,depth:.70,rotation:0},
 {kind:'visitorChair',x:9.38,z:5.15,width:.49,depth:.45,rotation:Math.PI},
 {kind:'visitorChair',x:10.92,z:5.15,width:.49,depth:.45,rotation:Math.PI},
 {kind:'staffChair',x:9.55,z:6.65,width:.52,depth:.48,rotation:0},
 {kind:'staffChair',x:10.75,z:6.65,width:.52,depth:.48,rotation:0}
];
export const ashanReservations=[];
export function displayRect(p){const c=Math.abs(Math.cos(p.rotation??0)),s=Math.abs(Math.sin(p.rotation??0)),w=p.width*c+p.depth*s,d=p.width*s+p.depth*c;return {kind:'rect',minX:p.x-w/2,maxX:p.x+w/2,minZ:p.z-d/2,maxZ:p.z+d/2};}
export const ashanFurnitureObstacles=[...ashanDisplays,...ashanWorkstation].map(displayRect);
export function drawAshanMap(ctx){
 for(const r of ashanReservations){ctx.save();ctx.strokeStyle='#829199';ctx.lineWidth=.028;ctx.setLineDash([.10,.07]);ctx.strokeRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);ctx.restore();}
 for(const p of ashanDisplays){const r=displayRect(p);ctx.fillStyle=['alta','deck','deckPolymer','docke','planker'].includes(p.kind)?'#81a17a':['pvc','laminate','quickBook','classen','clix','deckLaminate','quickAccessories','glassCabinet'].includes(p.kind)?'#90b2b9':'#c9b87e';ctx.fillRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);ctx.strokeStyle='#e1e8cf';ctx.lineWidth=.025;ctx.strokeRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(r.minX+.035,r.minZ+(r.maxZ-r.minZ)*i/7);ctx.lineTo(r.maxX-.035,r.minZ+(r.maxZ-r.minZ)*i/7);ctx.stroke();}}
 for(const p of ashanWorkstation){ctx.fillStyle=p.kind==='desk'?'#9b9d96':p.kind==='visitorChair'?'#d13b43':'#646c6e';ctx.fillRect(p.x-p.width/2,p.z-p.depth/2,p.width,p.depth);}
}
