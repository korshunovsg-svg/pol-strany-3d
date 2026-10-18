import * as THREE from './vendor/three.module.js';
export const remainingNames={alpinePVC:'Alpine Floor · ПВХ',evofloor:'Evofloor · ПВХ',skalla:'Skalla · ПВХ',norland:'Norland · ПВХ',karelia:'Karelia · паркет',carpet:'Ковролин',tulesna:'Tulesna · ПВХ',myStep:'My Step · ламинат',alpineLaminate:'Alpine · ламинат',ultrafloor:'Ultrafloor · ламинат',anticWood:'Antic Wood · паркет',eppe:'Eppe · паркет',scheucher:'Scheucher · паркет',corkart:'Corkart · пробка',corkartPVC:'Corkart · ПВХ',orac:'Orac Decor',plinth:'Плинтус',underlay:'Подложка',linoleum:'Линолеум'};
export const referenceKinds=['alpinePVC','evofloor','skalla','norland','karelia','carpet'];
const references={
 alpinePVC:{size:[1600,1200],headers:[[[42,74],[583,177],[584,538],[43,541]],[[584,178],[874,267],[860,537],[584,538]],[[42,74],[583,177],[584,538],[43,541]],[[875,273],[968,295],[966,538],[866,538]]],board:[[190,792],[450,775],[489,1192],[177,1195]]},
 evofloor:{size:[1600,1200],headers:[[[912,420],[991,414],[990,531],[911,531]],[[995,414],[1090,407],[1090,532],[994,532]],[[1096,408],[1221,399],[1216,535],[1094,533]],[[1236,601],[1474,623],[1453,771],[1233,736]]],board:[[925,728],[1054,749],[1003,1007],[892,966]]},
 skalla:{size:[960,1280],headers:[[[277,264],[395,245],[398,431],[279,423]],[[398,242],[548,215],[546,443],[401,431]],[[551,215],[766,185],[760,450],[549,444]],[[772,182],[959,158],[959,472],[766,450]]],board:[[550,775],[794,831],[743,1240],[509,1106]]},
 norland:{size:[1600,1200],headers:[[[387,171],[625,209],[614,531],[392,516]],[[626,209],[830,231],[817,538],[617,527]],[[831,232],[1010,253],[1000,545],[819,538]],[[1012,254],[1188,275],[1171,551],[1003,546]],[[1190,276],[1322,286],[1312,557],[1174,552]]],board:[[404,734],[634,718],[643,1094],[403,1137]]},
 karelia:{size:[960,1280],headers:[[[310,343],[417,330],[421,575],[317,568]],[[509,317],[641,303],[643,554],[512,558]],[[675,308],[864,294],[864,548],[675,548]]],board:[[542,710],[839,746],[820,1160],[531,1112]]}
};
const mat=(color,roughness=.83,map=null)=>new THREE.MeshStandardMaterial({color,roughness,map});
function mesh(p,g,m,x=0,y=0,z=0,name=''){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function box(p,w,h,d,x,y,z,m,name){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z,name);}
function graphic(p,w,h,x,y,z,map,color=0xffffff,name=''){const o=mesh(p,new THREE.PlaneGeometry(w,h),mat(color,.87,map),x,y,z,name);o.rotation.y=Math.PI;o.material.alphaTest=.12;o.castShadow=false;return o;}
function remap(g,quad,size,flip=false){const uvs=g.attributes.uv;for(let i=0;i<uvs.count;i++){const u=flip?1-uvs.getX(i):uvs.getX(i),v=uvs.getY(i),[a,b,c,d]=quad;uvs.setXY(i,((a[0]*(1-u)+b[0]*u)*v+(d[0]*(1-u)+c[0]*u)*(1-v))/size[0],1-((a[1]*(1-u)+b[1]*u)*v+(d[1]*(1-u)+c[1]*u)*(1-v))/size[1]);}uvs.needsUpdate=true;return g;}
function photo(p,w,h,x,y,z,map,q,size,name){const o=graphic(p,w,h,x,y,z,map,0xffffff,name);remap(o.geometry,q,size);return o;}
function roundPath(s,x,y,w,h,r,clockwise=false){
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;
}
function sampleGeometry(w,h,{handle=false,pointed=false}={}){
 const s=new THREE.Shape();if(pointed){s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(0,h+.28);s.lineTo(-w/2,h);s.closePath();}else roundPath(s,-w/2,0,w,h,.010);
 if(handle){const hole=roundPath(new THREE.Path(),-.09,h-.092,.18,.045,.020);s.holes.push(hole);}
 const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:6});g.translate(0,0,-.006);const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/(h+(pointed?.28:0)));u.needsUpdate=true;return g;
}
function woodenPlaque(root,kind,w,z,names,wood){box(root,w,.135,.025,0,.15,z,wood,'Wooden lower name plaque');graphic(root,w-.02,.12,0,.15,z-.013,names[kind],0x342d24,'Name on the wooden lower plaque');root.userData.woodenNamePlaque=true;}
export function createRemainingRack(kind,{woodTextures=[],herringboneTextures=[],remainingPhotos={},remainingLabels={},labelTexture=null}={},variant=0){
 if(!remainingNames[kind])return null;
 const root=new THREE.Group();root.name=remainingNames[kind];root.userData={type:'completedRack',collection:kind,photoReference:referenceKinds.includes(kind),standard:!referenceKinds.includes(kind),referenceVersion:24};
 const dark=mat(0x252c31),white=mat(0xe7e6df),edge=mat(0xc8b998),wood=mat(0xd1ba90,.8,woodTextures[0]??null),navy=mat(0x172b45),turquoise=mat(0x24b8c9),gray=mat(0x758080);
 const tones=[0xeee8d9,0xc5ad8d,0xb7b4aa,0x897869,0xd7cbb4,0x6e6a62,0xe9e7df,0xae906b,0xc4b5a2,0x787b79];
 const woods=woodTextures.length?woodTextures.map((map,i)=>mat(tones[i%tones.length],.75,map)):[wood],herringbone=herringboneTextures.length?herringboneTextures.map((map,i)=>mat(tones[(i+1)%tones.length],.78,map)):woods;
 const photoMap=remainingPhotos[kind],ref=references[kind];
 if(ref){
  const fan=kind==='evofloor'&&variant===3,pointed=kind==='norland'&&variant===3||kind==='alpinePVC'&&variant>=11;
  const handle=kind==='skalla'||kind==='evofloor'&&!fan,width=fan?1.10:.65,depth=fan?.65:.84,height=kind==='karelia'?1.20:pointed?1.02:1.10,count=10;
  const caseMat=kind==='evofloor'?white:dark,brandMat=kind==='alpinePVC'?turquoise:kind==='evofloor'?white:navy;
  box(root,width,.045,depth,0,.065,0,caseMat,'Low sample cassette base');
  for(const x of [-width/2+.018,width/2-.018]){
   box(root,.028,.20,depth,x,.18,0,caseMat,'Raised cassette side cheek');
   box(root,.025,fan?1.95:2.40,.035,x,fan?1.06:1.27,depth/2-.025,caseMat,'Tall promotional back support');
  }
  const top=fan?2.04:2.49,hh=fan?.61:kind==='karelia'?.98:.90;
  box(root,width,hh,.025,0,top-hh/2,depth/2-.022,caseMat,'Full height promotional header');
  photo(root,width-.012,hh-.012,0,top-hh/2,depth/2-.036,photoMap,ref.headers[variant%ref.headers.length],ref.size,'Promotional artwork from the original photograph');
  if(!fan){
   const plaque=box(root,width-.025,.16,.025,0,.17,-depth/2+.012,brandMat,'Branded front cassette plaque');plaque.rotation.x=.16;
   graphic(root,width-.04,.115,0,.174,-depth/2-.006,remainingLabels[kind],kind==='evofloor'?0x202f3c:0xf8f8ef,'Brand on the front plinth');
  }else woodenPlaque(root,kind,.65,-depth/2,remainingLabels,wood);
  const g=sampleGeometry(fan?.47:.575,height,{handle,pointed});
  for(let i=0;i<count;i++){
   const sample=new THREE.Group();sample.name=kind+' individual sample';sample.userData={type:'completedSample',carryOpening:handle,pointed};
   sample.position.set(fan?-.27+i*.060:0,.10+i*(fan?.009:kind==='karelia'?.035:.043),-depth/2+.08+i*(fan?.041:.068));sample.rotation.x=.05;if(fan)sample.rotation.y=.22;root.add(sample);
   const usePhoto=i===0&&!fan&&!pointed&&!handle;let geometry=g,face=pointed||fan?herringbone[(i+variant)%herringbone.length]:woods[(i+variant*2)%woods.length];
   if(usePhoto){geometry=remap(g.clone(),ref.board,ref.size,true);face=mat(0xffffff,.78,photoMap);}
   mesh(sample,geometry,[face,edge],0,0,0,handle?'Sample board with rounded carry opening':pointed?'Pointed herringbone sample board':'Upright flooring sample board');
   if(!usePhoto)graphic(sample,.074,.10,-(fan?.17:.237),height-.078,-.0068,labelTexture,0xffffff,'Right hand product card');
   box(root,fan?.50:.60,.012,.023,sample.position.x,.09+i*(fan?.009:kind==='karelia'?.035:.043),sample.position.z,caseMat,'Individual cassette sample slot');
  }
  root.userData.samples=count;root.userData.carryOpenings=handle;root.userData.pointed=pointed;root.userData.fan=fan;return root;
 }
 if(kind==='carpet'){
  const w=.90,d=.45,H=2.45;
  box(root,w,.045,d,0,.05,0,white,'White carpet shelving plinth');box(root,w,H-.13,.020,0,H/2,.215,white,'White carpet shelving back');
  for(const x of [-.437,0,.437])box(root,.025,H-.15,d,x,H/2,0,white,'White vertical carpet bay divider');
  box(root,w,.25,.026,0,H-.12,-.204,dark,'Patterned carpet header');
  photo(root,w-.012,.24,0,H-.12,-.219,photoMap,[[227,431],[720,519],[720,574],[227,542]],[960,1280],'Carpet header from the supplied photograph');
  const colors=[0xb5a081,0xc7bca6,0x737571,0xd8d0b8,0xc8c2ad,0xb5a295,0xe2dbca,0xc3b5aa,0xb8c1b7,0xd7b5ae,0xd6bf7c,0x909677];
  for(let bay=0;bay<2;bay++)for(let i=0;i<12;i++){
   const x=bay? .218:-.218,y=.14+i*.171,cloth=mat(colors[(i+bay*4+variant*3)%colors.length],1);
   box(root,.40,.012,.40,x,y-.025,0,white,'Thin carpet support shelf');
   box(root,.35,.12,.30,x,y+.036,.015,cloth,'Folded carpet sample with fabric pile');
   const fold=mesh(root,new THREE.CylinderGeometry(.070,.070,.35,12),cloth,x,y+.036,-.137,'Rounded folded carpet edge');fold.rotation.z=Math.PI/2;
   // Individual photo strips keep the real pile / woven surface visible on the fold.
   const strip=i%4,q=[[[349,636],[389,636],[389,666],[349,666]],[[448,612],[478,612],[478,633],[448,633]],[[540,677],[561,677],[561,700],[540,700]],[[578,849],[605,849],[605,879],[578,879]]][strip];
   photo(root,.34,.115,x,y+.036,-.207,photoMap,q,[960,1280],'Real carpet pile from the reference');
   graphic(root,.047,.032,x+.17,y-.020,-.224,labelTexture,0xffffff,'Small carpet shelf price tag');
  }
  root.userData.samples=24;root.userData.bays=2;return root;
 }
 if(kind==='underlay'){
  box(root,.42,.04,.38,0,.05,0,dark,'Underlay roll stand base');box(root,.42,1.35,.025,0,.73,.17,gray,'Underlay stand back');
  for(let i=0;i<4;i++){
   const x=(i%2-.5)*.185,z=i<2?-.092:.084,h=[.86,1.12,1.27,1.02][i],m=mat([0xb3c4b3,0xc6bc9d,0x6e8b76,0xb6c8cd][i]);
   mesh(root,new THREE.CylinderGeometry(.076,.076,h,18),m,x,.073+h/2,z,'Vertical underlay sample roll');mesh(root,new THREE.CylinderGeometry(.027,.027,.008,16),dark,x,.078+h,z,'Visible hollow roll core');graphic(root,.085,.18,x,.55,z-.077,labelTexture,0xffffff,'Underlay roll product label');
  }
  woodenPlaque(root,kind,.40,-.19,remainingLabels,wood);root.userData.samples=4;return root;
 }
 if(kind==='orac'||kind==='plinth'){
  // A compact square base occupies the diamond-shaped plan bay without protruding.
  const tower=new THREE.Group();tower.rotation.y=Math.PI/4;root.add(tower);
  box(tower,.58,.06,.58,0,.06,0,dark,'Square rotating moulding pedestal');box(tower,.40,1.90,.40,0,1.03,0,dark,'Four sided accessory display core');
  for(let face=0;face<4;face++){
   const side=new THREE.Group();side.rotation.y=face*Math.PI/2;tower.add(side);
   for(let i=0;i<5;i++){
    const x=-.155+i*.077,h=kind==='orac'?1.25:1.45,m=i%3===0?wood:white;
    box(side,.046,h,.028,x,.22+h/2,-.218,m,kind==='orac'?'Decorative wall moulding sample':'Skirting board sample');box(side,.058,.018,.04,x,.22+h,-.224,m,'Profiled sample cap');box(side,.009,h,.043,x-.018,.22+h/2,-.228,m,'Raised moulding bead');
   }
   box(side,.47,.13,.025,0,.14,-.233,wood,'Wooden lower name plaque');graphic(side,.45,.115,0,.14,-.247,remainingLabels[kind],0x342d24,'Name on the wooden lower plaque');
  }
  root.userData.woodenNamePlaque=true;root.userData.samples=20;return root;
 }
 if(kind==='linoleum'){
  box(root,1.10,.07,.45,0,.065,0,gray,'Multibrand linoleum rack base');
  for(const x of [-.53,.53])box(root,.025,1.94,.42,x,1.04,0,white,'Linoleum rack side frame');
  for(let i=0;i<9;i++){
   const y=.23+i*.19,m=woods[(i+2)%woods.length];
   const roll=mesh(root,new THREE.CylinderGeometry(.07,.07,1.02,16),m,0,y,-.02,'Horizontal linoleum roll sample');roll.rotation.z=Math.PI/2;
   box(root,.99,.008,.19,0,y-.053,-.10,m,'Unrolled linoleum sample edge');graphic(root,.085,.055,-.45,y,-.183,labelTexture,0xffffff,'Linoleum roll product label');
  }
  woodenPlaque(root,kind,1.05,-.228,remainingLabels,wood);root.userData.samples=9;return root;
 }
 // Unphotographed brands use a restrained standard cassette, with a legible
 // engraved timber name plaque and ten individual removable sample boards.
 box(root,.64,.045,.77,0,.055,0,dark,'Standard sample cassette base');
 for(const x of [-.305,.305])box(root,.025,.20,.76,x,.15,0,dark,'Standard cassette side rail');
 woodenPlaque(root,kind,.59,-.379,remainingLabels,wood);
 const cork=kind==='corkart',g=sampleGeometry(.565,cork?.88:1.12);
 for(let i=0;i<10;i++){
  const sample=new THREE.Group();sample.position.set(0,.09+i*.033,-.30+i*.065);sample.rotation.x=.055;sample.name='Standard removable '+kind+' sample';root.add(sample);
  mesh(sample,g,[woods[(i+variant*2)%woods.length],edge],0,0,0,'Separate standard sample board');graphic(sample,.077,.061,-.228,cork?.82:1.06,-.0068,labelTexture,0xffffff,'Standard sample product label');
 }
 root.userData.samples=10;return root;
}
