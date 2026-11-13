'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const pageRoot = path.join(root, 'pages');
const files = fs.readdirSync(pageRoot).filter(name => name.endsWith('.html'));
const { works } = require('../content/showcase.cjs');
const workContent = require('../content/work.cjs');
function verifyWorkLinks(source, expected) {
  const anchors = [...source.matchAll(/<a data-showcase-link\b[^>]*>/g)].map(match=>match[0]);
  assert.equal(anchors.length, expected * 3, 'each work has preview, title and visit links');
  for (const anchor of anchors) {
    assert(/target="_blank"/.test(anchor),'showcase opens a new tab');
    const rel = anchor.match(/rel="([^"]+)"/)[1].split(/\s+/);
    for (const token of ['nofollow','noopener','noreferrer']) assert(rel.includes(token), `missing ${token}`);
    assert(/href="https:\/\//.test(anchor),'showcase uses HTTPS');
  }
}
const showcasePage = fs.readFileSync(path.join(pageRoot,'showcase.html'),'utf8');
verifyWorkLinks(showcasePage,works.length);
assert.equal(showcasePage.includes('data-showcase-empty'), works.length===0,'honest showcase empty state');
const workPage = fs.readFileSync(path.join(pageRoot,'work.html'),'utf8');
verifyWorkLinks(workPage,Math.min(2,works.length));
assert(workPage.includes(`mailto:${workContent.contact.email}`));
assert(workPage.includes(`data-copy-contact="${workContent.contact.wechat}"`));
// Exercise populated rendering without adding unconfirmed works to generated pages.
const vm = require('vm');
const generator = path.join(__dirname,'build-pages.cjs');
const fixturePages = {};
vm.runInNewContext(fs.readFileSync(generator,'utf8'),{
  __dirname, URL, process:{argv:[]}, console:{log(){}},
  require(id) {
    if(id==='fs') return {...fs,writeFileSync(file,source){fixturePages[path.basename(file)]=source;}};
    if(id==='../content/showcase.cjs') return {works:[{id:'verification-only',url:'https://example.org/portfolio?one=1&two=2',preview:'fixture.webp',title:'Test & verification',category:'Website',summary:'Test rendering only',tags:['JquanUI'],role:'Design & build'}]};
    return require(id);
  }
},{filename:generator});
verifyWorkLinks(fixturePages['showcase.html'],1);
verifyWorkLinks(fixturePages['work.html'],1);
assert(fixturePages['showcase.html'].includes('one=1&amp;two=2'),'external query attributes are escaped');
let links = 0;
for (const name of files) {
  const source = fs.readFileSync(path.join(pageRoot, name), 'utf8');
  assert(!/<style\b|\sstyle=/i.test(source), `${name}: page CSS or inline style`);
  assert(!/tailwind/i.test(source), `${name}: Tailwind dependency`);
  assert.equal(source.includes('data-pet="dog"'),name==='index.html',`${name}: pet is limited to home hero`);
  const configOffset = source.indexOf('prismara-jquan.config.js');
  assert(configOffset >= 0 && configOffset < source.indexOf('JquanUI@Core.js'), `${name}: config load order`);
  const themeOffset = source.indexOf('prismara-theme.js');
  assert(themeOffset>configOffset && themeOffset<source.indexOf('JquanUI@Core.js'),`${name}: appearance initialized before Core`);
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,`${name}: duplicate IDs`);
  for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(url)) continue;
    const [pathname, hash] = url.split('#');
    const file = pathname ? path.resolve(pageRoot, decodeURIComponent(pathname.split('?')[0])) : path.join(pageRoot,name);
    assert(fs.existsSync(file),`${name}: missing local asset/link ${url}`);
    if (hash && file.endsWith('.html')) {
      const target = fs.readFileSync(file,'utf8');
      assert(target.includes(`id="${hash}"`),`${name}: missing fragment ${url}`);
    }
    links += 1;
  }
}
const { createPet, stepPet, dogPoints, layout, geometry, activities } = require('./prismara-motion.js');
assert.equal(dogPoints.length,64,'puppy particle count');
const neutral=stepPet(createPet(),768,700,0,0,null);
const crouched=geometry({...neutral,crouch:1,rear:0,jump:0});
const reared=geometry({...neutral,crouch:0,rear:1,jump:0});
assert(crouched.points[0][1]>neutral.geometry.points[0][1]+6,'preparation visibly lowers the torso');
assert(reared.points[4][1]<neutral.geometry.points[4][1]-12,'push-off raises shoulders before airborne translation');
for(const leg of [0,2]) {
  assert.equal(crouched.feet[leg].y,0,'crouch keeps rear contact on the ground');
  assert.equal(reared.feet[leg].y,0,'rearing keeps rear contact on the ground');
}
assert(reared.feet[1].y<-20&&reared.feet[3].y<-20,'rearing folds both forepaws upward');
const mustPlay=['walk','rest','dig','chase','balloon','pee','sniff','stretch','shake'];
function decisions(seed) {
  const pet=createPet({seed}),choices=[pet.activity],lengths=[pet.activityDuration];let cycle=pet.cycle;
  for(let frame=0;frame<18000;frame++) {
    stepPet(pet,768,700,0,1/30,null);
    if(pet.cycle!==cycle) {choices.push(pet.activity);lengths.push(pet.activityDuration);cycle=pet.cycle;}
  }
  assert(choices.length>30,'random behavior keeps making progress');
  assert(choices.every((choice,index)=>index===0||choice!==choices[index-1]),'never immediately repeat an activity');
  assert(choices.some((choice,index)=>index>0&&choice!==(choices[index-1]+1)%activities.length),'scheduler does not rotate through the activity array');
  assert(new Set(lengths.map(value=>value.toFixed(3))).size>20,'activity durations vary');
  return choices;
}
assert.deepEqual(decisions(42),decisions(42),'fixed seed reproduces random choices for regression');
assert.notDeepEqual(decisions(42),decisions(43),'different seeds produce different behavior sequences');
for(const [width,height] of [[390,900],[768,700],[1280,650]]) {
  const seen=new Map();let movingFeet=false,flight=false,headHits=0;
  // Exercise every behavior explicitly: random coverage must never depend on
  // luck or alter the production scheduler to enforce a round-robin sequence.
  for(const activity of [null,...activities]) {
  const pet=createPet({seed:42});
  if(activity) {pet.activity=activities.indexOf(activity);pet.activityDuration=activity==='balloon'?16:8;pet.clock=0;}
  let previous=stepPet(pet,width,height,0,0,null);
  for(let frame=1;frame<=900;frame++) {
    const next=stepPet(pet,width,height,frame/30,1/30,null);
    const bounds=layout(width,height);
    assert(next.x>=bounds.left && next.x<=bounds.right && next.y>=bounds.far && next.y<=bounds.near,'ground plane bounds');
    assert(Math.hypot(next.x-previous.x,next.y-previous.y)<8,'autonomous pet does not teleport');
    assert.equal(next.geometry.feet.length,4,'four independent feet');
    if(next.stride>0.5 && next.geometry.feet.some(foot=>foot.planted) && next.geometry.feet.some(foot=>!foot.planted))movingFeet=true;
    if(next.action==='pee')assert(Math.min(next.x-bounds.left,bounds.right-next.x)<10*next.scale,'walk to edge before lifting leg');
    if(next.action==='rest' && next.lie>0.9)assert(next.geometry.points[0][1]>dogPoints[0][1]+18,'rest lowers torso');
    if(next.action==='dig' && next.dig>0.9)assert(next.headDrop>0.9,'digging lowers the head');
    if(next.jump>10) {assert.equal(next.action,'balloon');assert(next.rear>.4,'balloon jump uses a rear supported half stand');assert.equal(next.jumpStage,'airborne');assert(next.geometry.feet.slice(0,4).some(foot=>foot.planted),'hind foot remains the contact point during takeoff');flight=true;}
    if(next.headHits>previous.headHits) {
      assert.equal(next.jumpStage,'airborne','the dog must jump before heading the balloon');
      const skull=next.geometry.points.slice(16,28).map(([x,y])=>[next.x+x*next.scale*next.facing,next.y+y*next.scale]);
      const xs=skull.map(p=>p[0]),ys=skull.map(p=>p[1]),toy=next.toy;
      assert(Math.max(...xs)>=toy.x-18*next.scale && Math.min(...xs)<=toy.x+18*next.scale && Math.max(...ys)>=toy.y-22*next.scale && Math.min(...ys)<=toy.y+22*next.scale,'counted head hit overlaps the drawn balloon');
    }
    assert(next.geometry.points.every(point=>point.every(Number.isFinite)),'finite pose');
    if(next.action==='balloon'&&!seen.has('balloon'))assert.equal(next.jumpStage,'crouch','first jump starts with preparation after arrival');
    const posed=next.action==='sniff'?next.sniff>.9:next.action==='stretch'?next.stretch>.8:next.action==='shake'?next.shake>.8:true;
    if(posed&&(!seen.has(next.action) || next.action==='balloon'&&next.jump>20))seen.set(next.action,{pet:JSON.parse(JSON.stringify(pet)),pose:next});
    previous=next;
  }
  headHits+=pet.headHits;
  }
  mustPlay.forEach(action=>assert(seen.has(action),`autonomous ${action} at ${width}`));
  assert(movingFeet,'moving dog has both planted and swinging feet');
  assert(flight && headHits>=2,'head actually bumps balloon more than once');
  const stretchPose=seen.get('stretch').pose;
  assert(stretchPose.geometry.points[4][1]>dogPoints[4][1]+10,'stretch lowers the front shoulders');
  assert(stretchPose.geometry.feet[3].x>dogPoints[51][0]+10,'stretch reaches the forepaw forward');
  assert(seen.get('sniff').pose.geometry.points[59][1]>-25,'sniff brings the actual nose close to the ground');
  const bouncy=createPet({seed:42});bouncy.activity=activities.indexOf('balloon');bouncy.activityDuration=20;
  let contactY=null,apex=Infinity,arcComplete=false;
  for(let frame=0;frame<900;frame++) {
    const pose=stepPet(bouncy,width,height,0,1/30,null);
    if(contactY===null&&pose.headHits>0) {
      contactY=pose.toy.y;
      assert.equal(pose.toy.squash,1,'actual collision compresses the balloon');
      assert(pose.toy.vy<-190*pose.scale,'elastic contact has a strong upward impulse');
    }
    if(contactY!==null&&pose.toy?.type==='balloon') {
      apex=Math.min(apex,pose.toy.y);
      if(pose.toy.vy>=0) {arcComplete=true;break;}
    }
  }
  assert(arcComplete&&contactY-apex>90*layout(width,height).scale,'balloon rises over 90 local pixels after a head contact');
  for(const action of mustPlay) {
    const subject=JSON.parse(JSON.stringify(seen.get(action).pet));
    const frozen=JSON.parse(JSON.stringify(subject));
    stepPet(subject,width,height,0,0,null);
    assert.deepEqual(subject,frozen,`${action}: zero delta preserves model`);
    const pointer={inside:true,x:width*0.12,y:height*0.15};
    const notice=stepPet(subject,width,height,0,1/30,pointer);
    assert.equal(notice.state,'noticing',`${action}: cursor interrupts immediately`);
    if (notice.toy) {
      assert.equal(notice.toy.id,subject.toy?.id,'pointer keeps the same toy instance');
      assert.equal(notice.toy.stage,'exiting','pointer interrupts by sending the toy out');
    }
    assert(notice.look<0,'head looks up at high cursor');
    for(let frame=0;frame<300;frame++)stepPet(subject,width,height,0,1/30,pointer);
    const greeting=stepPet(subject,width,height,0,1/30,pointer);
    assert.equal(greeting.state,'cute',`${action}: runs over and greets`);
    assert.equal(greeting.facing,pointer.x>=greeting.x?1:-1,'nuzzling faces the cursor instead of flipping with sway');
    assert(greeting.lie<0.01 && greeting.dig<0.01 && greeting.lift<0.01 && greeting.jump<0.01 && greeting.sniff<.01 && greeting.stretch<.01 && greeting.shake<.01,'prior play pose releases');
    assert(greeting.y>=layout(width,height).far,'cursor never lifts dog off ground');
    const leave=stepPet(subject,width,height,0,1/30,null);
    assert.equal(leave.state,'playing');
    assert(Math.hypot(leave.x-greeting.x,leave.y-greeting.y)<8,'leaving preserves position');
  }
  const edge=createPet();let prior=stepPet(edge,width,height,0,0,null);
  for(let frame=0;frame<1800;frame++) {
    const pointer=frame%600<300?{inside:true,x:frame%1200<600?0:width,y:frame%900<450?0:height}:null;
    const next=stepPet(edge,width,height,0,1/30,pointer);
    assert(next.x>=layout(width,height).left && next.x<=layout(width,height).right,'edge target bounds');
    assert(Math.hypot(next.x-prior.x,next.y-prior.y)<8,'edge target continuity');
    prior=next;
  }
}
// A toy has a visible entry/play/exit lifecycle and is not replaced mid-flight.
const toyPet=createPet({seed:42});let butterflyEntry=null,butterflyExit=null,balloonEntry=null,balloonExit=null,priorToy=null;
for(let frame=0;frame<18000;frame++) {
  const snapshot=stepPet(toyPet,768,700,frame/30,1/30,null);
  const toy=snapshot.toy;
  if(priorToy && priorToy.id!==toy?.id) {
    assert.equal(priorToy.stage,'exiting','only departing toys can be removed');
    const s=snapshot.scale;
    // One frame before removal, the trailing geometry must already be outside
    // or within a single frame of its boundary. Catch premature replacement.
    assert(priorToy.type==='butterfly'
      ?priorToy.direction>0?priorToy.x>768+34*s-6:priorToy.x<-34*s+6
      :priorToy.y+56*s<6,'toy remains visible until the full shape leaves');
  }
  if(priorToy && toy && priorToy.id===toy.id)assert(Math.hypot(toy.x-priorToy.x,toy.y-priorToy.y)<12,'toy trajectory is continuous');
  if(snapshot.toy?.type==='butterfly'&&!butterflyEntry) butterflyEntry={id:snapshot.toy.id,x:snapshot.toy.x,stage:snapshot.toy.stage};
  if(snapshot.toy?.type==='butterfly'&&snapshot.toy.stage==='exiting'&&!butterflyExit) butterflyExit={id:snapshot.toy.id,x:snapshot.toy.x};
  if(snapshot.toy?.type==='balloon'&&!balloonEntry) balloonEntry={id:snapshot.toy.id,y:snapshot.toy.y,stage:snapshot.toy.stage};
  if(snapshot.toy?.type==='balloon'&&snapshot.toy.stage==='exiting'&&!balloonExit) balloonExit={id:snapshot.toy.id,y:snapshot.toy.y};
  priorToy=toy;
}
assert(butterflyEntry && (butterflyEntry.x<0||butterflyEntry.x>768) && butterflyEntry.stage==='entering','butterfly enters from outside');
assert(butterflyExit && butterflyExit.id===butterflyEntry.id,'butterfly exits as the same instance');
assert(balloonEntry && balloonEntry.y<0 && balloonEntry.stage==='entering','balloon enters from above');
assert(balloonExit && balloonExit.id===balloonEntry.id,'balloon exits as the same instance');
const resizedPet=createPet();stepPet(resizedPet,1280,650,0,0,null);
const resizedPose=stepPet(resizedPet,390,900,0,0,null);
assert(resizedPose.x>=layout(390,900).left && resizedPose.x<=layout(390,900).right,'resize clamps width');
assert(resizedPose.y>=layout(390,900).far && resizedPose.y<=layout(390,900).near,'resize clamps floor');
const jsFiles = ['jquan.config.cjs','design-system/tokens/prismara-jquan.config.js',...fs.readdirSync(path.join(root,'content')).filter(file=>file.endsWith('.cjs')).map(file=>`content/${file}`),...fs.readdirSync(__dirname).filter(file=>/\.(?:js|cjs)$/.test(file)).map(file=>`scripts/${file}`)];
for (const file of jsFiles) execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});
execFileSync(process.execPath,[path.join(__dirname,'build-pages.cjs'),'--check'],{stdio:'pipe'});
console.log(`Prismara verification passed: ${files.length} pages, ${links} local links/assets, generated page consistency, ${jsFiles.length} syntax checks`);
