import plan from './assets/omsk/plan-data.js?v=21';
import {displayRect} from './ashan-layout.js?v=24';
export const omskSize={length:plan.length,width:plan.width,height:5.2,shoulderX:plan.shoulderX,shoulderZ:plan.shoulderZ};
export const omskFootprint=[[plan.shoulderX,0],[plan.length,0],[plan.length,plan.width],[0,plan.width],[0,plan.shoulderZ],[plan.shoulderX,plan.shoulderZ]];
// Every colored fixture symbol is occupied; only six new groups have photo references.
const completedKinds={Norland:['norland',-1],Tulesna:['tulesna',1],Skalla:['skalla',1],Evofloor:['evofloor',-1],'My Step':['myStep',1],'Alpine · ламинат':['alpineLaminate',-1],Ultrafloor:['ultrafloor',-1],'Antic Wood':['anticWood',1],Karelia:['karelia',-1],Eppe:['eppe',1],Scheucher:['scheucher',-1],'Alpine · ПВХ':['alpinePVC',-1],'Corkart · пробка':['corkart',1],'Corkart · ПВХ':['corkartPVC',1],'Ковролин':['carpet',-1],'Orac Decor':['orac',0],'Плинтус':['plinth',0],'Подложка':['underlay',0]};
const variants={};
const completed=plan.reservations.map(r=>{
 let [kind,turn]=completedKinds[r.name];
 if(kind==='alpinePVC'&&[198,199,200,201,203,204].includes(r.planId))turn=1;
 if(kind==='eppe'&&r.planId>=184)turn=-1;
 const dx=r.maxX-r.minX,dz=r.maxZ-r.minZ,variant=variants[kind]??0;variants[kind]=variant+1;
 // A 1 mm fitting gap avoids the PDF's rounded adjoining coordinates intersecting.
 return {kind,x:(r.minX+r.maxX)/2,z:(r.minZ+r.maxZ)/2,width:(turn?dz:dx)-.001,depth:(turn?dx:dz)-.001,rotation:turn*Math.PI/2,variant,planId:r.planId,photoVariant:kind==='evofloor'?(r.planId===91?3:variant-1):variant};
});
export const omskDisplays=[...plan.displays.map(({turn,...p})=>({...p,rotation:turn*Math.PI/2})),...completed,
 // The equipment list names one linoleum rack but provides no colored symbol.
 // Place it in the empty continuation of the carpet bank, facing the same aisle.
 {kind:'linoleum',x:3.8658,z:14.90,width:1.10,depth:.45,rotation:-Math.PI/2,variant:0,placement:'carpet-bank continuation'}
];
export const omskWorkstation=plan.workstation.map(({turn,...p})=>({...p,rotation:turn*Math.PI/2}));
export const omskReservations=[];
export const omskWalls=plan.walls;
export const omskColumns=omskWalls.filter(w=>w.column);
export const omskFurnitureObstacles=[...omskDisplays,...omskWorkstation].map(displayRect);
export function omskContains(x,z){return x>=0&&x<=plan.length&&z>=0&&z<=plan.width&&(x>=plan.shoulderX||z>=plan.shoulderZ);}
function mapColor(p){
 if(p.kind==='carpet')return '#c84b54';if(p.kind==='linoleum')return '#37a6d5';if(p.kind==='corkart')return '#d7aa93';
 if(['underlay','orac','plinth','glassCabinet','quickAccessories'].includes(p.kind))return '#b4a8cd';
 if(p.productGroup==='laminate'||['pvc','laminate','quickBook','classen','clix','deckLaminate','myStep','alpineLaminate','ultrafloor'].includes(p.kind))return '#90b2b9';
 if(['alta','deck','deckPolymer','docke','planker','alpinePVC','evofloor','skalla','norland','tulesna','corkartPVC'].includes(p.kind))return '#80a17a';
 return '#c9b87e';
}
export function drawOmskMap(ctx){
 for(const r of omskReservations){ctx.save();ctx.strokeStyle='#829199';ctx.lineWidth=.025;ctx.setLineDash([.09,.07]);ctx.strokeRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);ctx.restore();}
 for(const p of omskDisplays){const r=displayRect(p);ctx.fillStyle=mapColor(p);ctx.fillRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);ctx.strokeStyle='#e1e8cf';ctx.lineWidth=.02;ctx.strokeRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);}
 for(const p of omskWorkstation){const r=displayRect(p);ctx.fillStyle=p.kind==='visitorChair'?'#c83a42':'#737a76';ctx.fillRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);}
 for(const r of omskColumns){ctx.fillStyle='#252b2c';ctx.fillRect(r.minX,r.minZ,r.maxX-r.minX,r.maxZ-r.minZ);}
}
