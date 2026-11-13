(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const activities = ['wander', 'rest', 'dig', 'chase', 'balloon', 'edge', 'sniff', 'stretch', 'shake'];
  const durations = { wander: 6.5, rest: 5, dig: 5, chase: 12, balloon: 11, edge: 3.6, sniff: 5.5, stretch: 4, shake: 2.8 };
  const weights = [4, 2, 1.4, 2, 2.2, 0.45, 3, 1.6, 1];
  // Per-pet state keeps random decisions reproducible without a global timer
  // or consuming randomness during rendering, pause, or theme changes.
  function random(pet) {
    let value=pet.randomState;
    value^=value<<13;value^=value>>>17;value^=value<<5;
    pet.randomState=value>>>0;
    return pet.randomState/4294967296;
  }
  function chooseActivity(pet) {
    const choices=weights.map((weight,index)=>index===pet.activity?0:weight*(index===pet.previousActivity ? .25 : 1));
    let roll=random(pet)*choices.reduce((sum,weight)=>sum+weight,0);
    let next=choices.length-1;
    for(let index=0;index<choices.length;index++)if((roll-=choices[index])<0){next=index;break;}
    pet.previousActivity=pet.activity;pet.activity=next;pet.cycle+=1;
    pet.activityDuration=durations[activities[next]]*(.85+random(pet)*.3);
    pet.direction=random(pet)<.5?-1:1;
    pet.clock=0;pet.edgeReady=false;
    if(pet.toy)pet.toy.stage='exiting';
  }
  function layout(width, height) {
    const scale = width < 768 ? 0.82 : 1.04;
    const pad = Math.min(width / 2, 88 * scale);
    // This is a virtual ground plane inside the carousel backdrop, not a strip below it.
    const near = Math.max(110 * scale, height * 0.84);
    const far = Math.min(near, Math.max(110 * scale, height * 0.6));
    return { scale, left: pad, right: Math.max(pad, width - pad), far, near };
  }
  // Ground-plane destination, never an airborne position.
  function pose(width, height, time) {
    const ground = layout(width, height);
    return { centerX: mix(ground.left, ground.right, 0.5 + Math.sin(time * 0.23) * 0.44),
      centerY: mix(ground.far, ground.near, 0.5 + Math.sin(time * 0.17) * 0.35), scale: ground.scale };
  }
  // Body 0..15, head 16..27, ears 28..35, four legs 36..51, tail 52..57, face 58..63.
  const dogPoints = [
    [-40,-39],[-32,-50],[-17,-54],[0,-53],[17,-50],[28,-41],[30,-27],[20,-19],
    [0,-17],[-18,-18],[-35,-23],[-43,-31],[-24,-37],[-9,-35],[8,-34],[19,-29],
    [24,-64],[28,-79],[40,-87],[53,-85],[64,-76],[65,-64],[76,-59],[78,-49],
    [65,-43],[49,-42],[34,-46],[24,-54],
    [29,-77],[20,-71],[19,-57],[24,-44],[34,-73],[29,-64],[29,-53],[34,-45],
    [-29,-24],[-33,-15],[-32,-2],[-25,0], [16,-24],[11,-14],[14,-2],[21,0],
    [-39,-24],[-42,-13],[-41,-2],[-34,0], [27,-25],[30,-13],[30,-2],[37,0],
    [-40,-37],[-51,-43],[-61,-53],[-66,-65],[-62,-73],[-55,-70],
    [53,-68],[68,-56],[63,-47],[68,-46],[57,-54],[46,-60]
  ];
  function createPet(options={}) {
    const seed=Number.isFinite(options.seed)?options.seed:Math.floor(Math.random()*4294967296);
    const pet={ x: null, y: null, vx: 0, vy: 0, age: 0, clock: 0, activity: -1, cycle: 0,
      randomState:(seed>>>0)||0x9e3779b9,previousActivity:-1,activityDuration:0,direction:1,
      greeting:'nuzzle',greetingClock:0,greetingDuration:0,
      settled: 0, notice: 0, inside: false, state: 'playing', facing: 1, gait: 0,
      stride: 0, lie: 0, dig: 0, lift: 0, jump: 0, rear: 0, crouch: 0, jumpStage: 'grounded', headDrop: 0, tilt: 0,
      sniff:0,stretch:0,shake:0,edgeReady: false, toy: null, nextToyId: 0, headHits: 0 };
    chooseActivity(pet);
    return pet;
  }
  function spawnToy(pet,type,width,height,ground) {
    const s=ground.scale,direction=pet.direction;
    pet.toy={id:++pet.nextToyId,type,stage:'entering',age:0,phase:pet.cycle*1.7,
      x:type==='butterfly'?(direction>0?-38*s:width+38*s):mix(ground.left,ground.right,pet.cycle%2?.35:.65),
      y:type==='butterfly'?Math.max(30*s,mix(ground.far,ground.near,.45)-95*s):-72*s,
      vx:type==='butterfly'?direction*85*s:0,vy:type==='balloon'?70*s:0,
      direction,anchorX:mix(ground.left,ground.right,pet.cycle%2?.35:.65),hitCycle:-1,squash:0};
  }
  function advanceToy(pet,width,height,ground,dt) {
    const toy=pet.toy;
    if(!toy||dt===0)return;
    const s=ground.scale;
    toy.age+=dt;
    toy.squash*=Math.exp(-dt*9);
    const blend=1-Math.exp(-dt*3.5);
    if(toy.type==='butterfly') {
      const destinationY=Math.max(28*s,mix(ground.far,ground.near,.45)-95*s);
      const entered=toy.x>30*s&&toy.x<width-30*s;
      if(toy.stage==='entering'&&entered)toy.stage='playing';
      if(toy.stage!=='exiting'&&toy.age>2&& (toy.direction>0?toy.x>width-65*s:toy.x<65*s))toy.stage='exiting';
      const desiredX=toy.direction*(toy.stage==='exiting'?115*s:Math.max(48*s,width/12));
      const desiredY=toy.stage==='exiting'?-22*s:(destinationY+Math.sin(toy.age*2.4+toy.phase)*23*s-toy.y)*2;
      toy.vx=mix(toy.vx,desiredX,blend);toy.vy=mix(toy.vy,desiredY,blend);
    } else if(toy.stage==='exiting') {
      toy.vx=mix(toy.vx,Math.sin(toy.age*.7+toy.phase)*12*s,blend);
      toy.vy=mix(toy.vy,-115*s,1-Math.exp(-dt*2.3));
    } else {
      const targetY=ground.far-127*s;
      toy.vx=mix(toy.vx,(toy.anchorX+Math.sin(toy.age*.9)*12*s-toy.x)*1.4,blend);
      if(toy.stage==='entering') {
        toy.vy=mix(toy.vy,Math.min(85*s,Math.max(8*s,(targetY-toy.y)*1.6)),blend);
        if(toy.y>=targetY-5*s)toy.stage='playing';
      } else {
        // Low drag preserves a high elastic arc. A soft lower catch keeps a
        // missed balloon at nose height without clamping or teleporting it.
        const below=Math.max(0,toy.y-targetY);
        toy.vy+=(150*s+(targetY-toy.y)*.35-toy.vy*.35-below*14
          -(below>0?Math.max(0,toy.vy)*5:0))*dt;
      }
    }
    toy.x+=toy.vx*dt;toy.y+=toy.vy*dt;
    // Include the full wing span / balloon string before removing the entity.
    if(toy.stage==='exiting'&&(toy.type==='butterfly'
      ?toy.direction>0?toy.x>width+34*s:toy.x<-34*s
      :toy.y+56*s<0))pet.toy=null;
  }
  function stepPet(pet, width, height, time, elapsed, pointer) {
    const ground = layout(width, height), s = ground.scale;
    const dt = clamp(elapsed, 0, 0.1);
    const clampX = x => clamp(x, ground.left, ground.right);
    const clampY = y => clamp(y, ground.far, ground.near);
    const inside = !!pointer?.inside;
    if (pet.x === null) { pet.x = mix(ground.left, ground.right, 0.67); pet.y = mix(ground.far, ground.near, 0.55); }
    pet.x = clampX(pet.x); pet.y = clampY(pet.y);
    const oldX = pet.x, oldY = pet.y;
    let action, targetX = pet.x, targetY = pet.y;
    let lie = 0, dig = 0, lift = 0, jump = 0, rear = 0, crouch = 0, jumpStage = 'grounded', headDrop = 0;
    let sniff=0,stretch=0,shake=0;
    let maxSpeed = 76 * s;
    if (dt > 0) {
      pet.age += dt;
      if (inside && !pet.inside) { pet.notice = 0.32; pet.settled = 0; pet.greetingClock=0;pet.greetingDuration=0;if(pet.toy)pet.toy.stage='exiting'; }
      if (!inside && pet.inside) { chooseActivity(pet);pet.settled = 0; }
      pet.inside = inside;
    }
    const t = pet.age;
    advanceToy(pet,width,height,ground,dt);
    if (inside) {
      // The dog looks up at the real cursor but runs along its projection on the ground.
      targetX = clampX(pointer.x + (pointer.x < width / 2 ? 62 : -62) * s);
      targetY = clampY(mix(ground.far, ground.near, clamp(pointer.y / Math.max(height, 1), 0, 1)));
      if (dt > 0) {
        pet.notice = Math.max(0, pet.notice - dt);
        pet.settled = Math.hypot(targetX - pet.x, targetY - pet.y) < 16 * s && pet.notice===0 ? pet.settled + dt : 0;
      }
      pet.state = pet.notice > 0 ? 'noticing' : pet.settled > 0.35 ? 'cute' : 'approaching';
      if(pet.state==='cute'&&dt>0) {
        pet.greetingClock+=dt;
        if(pet.greetingClock>=pet.greetingDuration) {
          const choices=['nuzzle','paw','tilt'].filter(name=>name!==pet.greeting);
          pet.greeting=choices[Math.floor(random(pet)*choices.length)];
          pet.greetingDuration=1.8+random(pet)*2;pet.greetingClock=0;
        }
      }
      action = pet.state === 'noticing' ? 'look' : pet.state === 'cute' ? pet.greeting : 'run';
      maxSpeed = pet.notice > 0 ? 0 : 190 * s;
      if (pet.state === 'cute') { targetX += Math.sin(t * 3.2) * 3 * s; maxSpeed = 22 * s; }
    } else {
      pet.state = 'playing';
      let activity = activities[pet.activity];
      const direction = pet.direction;
      if (activity === 'wander') {
        const destination = pose(width,height,t + pet.cycle * 12 + 8);
        targetX = destination.centerX; targetY = destination.centerY; action = 'walk';
      } else if (activity === 'rest') { lie = 1; headDrop = 0.7; action = 'rest'; maxSpeed = 0; }
      else if (activity === 'dig') { dig = 1; headDrop = 1; action = 'dig'; maxSpeed = 0; }
      else if(activity==='sniff') {
        const destination=pose(width,height,t*.5+pet.cycle*8);
        targetX=destination.centerX;targetY=destination.centerY;
        sniff=1;headDrop=1.35+Math.sin(t*4)*.06;action='sniff';maxSpeed=24*s;
      } else if(activity==='stretch') {
        stretch=Math.sin(Math.PI*clamp(pet.clock/pet.activityDuration,0,1));
        headDrop=stretch*.65;action='stretch';maxSpeed=0;
      } else if(activity==='shake') {shake=Math.sin(Math.PI*clamp(pet.clock/pet.activityDuration,0,1));action='shake';maxSpeed=0;}
      else if (activity === 'chase') {
        if(!pet.toy && pet.clock===0 && dt>0)spawnToy(pet,'butterfly',width,height,ground);
        const butterfly=pet.toy?.type==='butterfly'?pet.toy:null;
        if(butterfly && butterfly.stage!=='exiting') {
          targetX=clampX(butterfly.x-pet.facing*30*s);targetY=mix(ground.far,ground.near,.5);
          maxSpeed=130*s;action='chase';
        } else if (pet.toy) {
          action='watch';maxSpeed=0;
          // Stop tracking once it leaves, while the butterfly continues to fly.
          if(pet.clock>1 && dt>0)pet.clock=pet.activityDuration;
        } else { action='waiting'; maxSpeed=0; }
      } else if (activity === 'edge') {
        targetX = direction > 0 ? ground.right : ground.left;
        targetY = mix(ground.far,ground.near,0.65);
        pet.edgeReady = Math.hypot(targetX-pet.x,targetY-pet.y)<9*s;
        action = pet.edgeReady ? 'pee' : 'edge-walk';
        if (pet.edgeReady) { lift = 1; maxSpeed = 0; }
      } else if (activity === 'balloon') {
        if(!pet.toy && pet.clock===0 && dt>0)spawnToy(pet,'balloon',width,height,ground);
        const ball=pet.toy?.type==='balloon'?pet.toy:null;
        action='balloon-walk';
        if(pet.toy && !ball) { action='waiting'; maxSpeed=0; }
        if(ball && ball.stage!=='exiting') {
          // Rearing moves the crown almost above the hips, rather than far ahead.
          // The crown is about 30 local pixels ahead of the hips when facing
          // right while rearing, so stop with the rising crown below the ball.
          targetX=clampX(ball.x-30*s);targetY=ground.far;
          const ready=Math.hypot(targetX-pet.x,targetY-pet.y)<12*s && ball.stage==='playing';
          if(ready || pet.jump>0.5 || pet.rear>0.25) {
            pet.facing=1;action='balloon';maxSpeed=0;
            const phase=pet.clock%2.5;
            if(phase<.32) {crouch=Math.sin(phase/.32*Math.PI);jumpStage='crouch';}
            else if(phase<.57) {rear=(phase-.32)/.25;jumpStage='push-off';}
            else if(phase<1.37) {
              const progress=(phase-.57)/.8;
              jump=Math.sin(progress*Math.PI)*24;
              rear=.85+Math.sin(progress*Math.PI)*.15;jumpStage='airborne';
            } else if(phase<1.75) {
              rear=.85*(1-(phase-1.37)/.38);
              crouch=Math.sin((phase-1.37)/.38*Math.PI)*.65;jumpStage='landing';
            }
          }
        } else { maxSpeed=0; }
      }
      // Start the full crouch/push-off sequence only after reaching the ball.
      const clockRuns = activity !== 'edge' && activity !== 'balloon' || activity === 'edge' && pet.edgeReady || activity === 'balloon' && action==='balloon';
      if (dt>0 && clockRuns) pet.clock += dt;
      const activityDone=pet.clock>=pet.activityDuration && (activity!=='balloon' ||
        (pet.jump<1 && pet.rear<0.1 && pet.clock%2.5>1.75));
      if (activityDone && dt>0) {
        chooseActivity(pet);
      }
    }
    const stationary = maxSpeed===0 || pet.state==='noticing';
    const dx=targetX-pet.x, dy=targetY-pet.y, distance=Math.hypot(dx,dy);
    const speed=stationary ? 0 : Math.min(maxSpeed,distance*(inside?3.5:2.2));
    if (dt>0) {
      const smoothing=1-Math.exp(-dt*(stationary?18:7));
      pet.vx=mix(pet.vx,distance?dx/distance*speed:0,smoothing);
      pet.vy=mix(pet.vy,distance?dy/distance*speed:0,smoothing);
      pet.x=clampX(pet.x+pet.vx*dt); pet.y=clampY(pet.y+pet.vy*dt);
      if (Math.abs(pet.vx)>7*s && !stationary && pet.state!=='cute')pet.facing=pet.vx>0?1:-1;
      if (pet.state==='cute')pet.facing=pointer.x>=pet.x?1:-1;
      if (action==='pee')pet.facing=pet.direction;
      if (action==='balloon')pet.facing=1;
      const moved=Math.hypot(pet.x-oldX,pet.y-oldY);
      pet.gait += moved/(42*s)*TAU;
      pet.stride=mix(pet.stride,stationary?0:clamp(Math.hypot(pet.vx,pet.vy)/(70*s),0,1),1-Math.exp(-dt*12));
      const blend=1-Math.exp(-dt*7);
      pet.lie=mix(pet.lie,lie,blend);pet.dig=mix(pet.dig,dig,blend);pet.lift=mix(pet.lift,lift,blend);
      pet.headDrop=mix(pet.headDrop,headDrop,blend);
      pet.sniff=mix(pet.sniff,sniff,blend);pet.stretch=mix(pet.stretch,stretch,blend);pet.shake=mix(pet.shake,shake,blend);
      pet.tilt=mix(pet.tilt,action==='tilt'?.22:0,blend);
      pet.jump=mix(pet.jump,jump,1-Math.exp(-dt*18));
      pet.rear=mix(pet.rear,rear,1-Math.exp(-dt*16));pet.crouch=mix(pet.crouch,crouch,1-Math.exp(-dt*16));pet.jumpStage=jumpStage;
      if (inside && pet.notice>0) {pet.vx=0;pet.vy=0;}
    }
    const activeToy=pet.toy?{...pet.toy,flap:Math.sin(pet.toy.age*20),hit:pet.toy.vy<0}:null;
    const trackToy=!inside && activeToy?.stage!=='exiting' && (action==='chase'||action==='balloon'||action==='balloon-walk')?activeToy:null;
    const lookX = inside ? pointer.x : trackToy?.x ?? pet.x+pet.facing*90*s;
    const lookY = inside ? pointer.y : trackToy?.y ?? pet.y-60*s;
    const look = clamp(Math.atan2(lookY-(pet.y-65*s),Math.abs(lookX-pet.x)+30),-1,0.8);
    const cute = pet.state==='cute';
    const result = { x:pet.x,y:pet.y,groundY:pet.y,scale:s,state:pet.state,action,
      facing:pet.facing,gait:pet.gait,stride:pet.stride,lie:pet.lie,dig:pet.dig,lift:pet.lift,
      jump:pet.jump,rear:pet.rear,crouch:pet.crouch,jumpStage:pet.jumpStage,headDrop:pet.headDrop,look,
      sniff:pet.sniff,stretch:pet.stretch,shake:pet.shake,tilt:pet.tilt,
      gazeX:clamp((lookX-pet.x)/(100*s),-1,1),
      wag: Math.sin(t*(cute?14:action==='chase'?10:5))*(cute?0.65:0.3),
      nuzzle:cute&&action==='nuzzle'?Math.sin(t*4)*0.16:0,
      paw:cute&&action==='paw'?(Math.sin(t*5)+1)*6:0,
      blink:pet.lie>0.85 || t%4.7<0.15,
      breath:Math.sin(t*2.3),time:t,toy:activeToy,headHits:pet.headHits,
      bounds:{left:ground.left,right:ground.right,far:ground.far,near:ground.near} };
    result.geometry = geometry(result);
    // Test the same skull particles that are drawn, including head turn and jump.
    // An inflated ellipse accounts for each particle's small rendered radius.
    if(dt>0 && action==='balloon' && pet.toy?.type==='balloon' && pet.toy.stage==='playing' && pet.rear>.5 && pet.jumpStage==='airborne') {
      const ball=pet.toy,cycle=Math.floor(pet.clock/2.5);
      const touches=result.geometry.points.slice(16,28).some(([x,y])=>{
        const dx=(pet.x+x*s*pet.facing-ball.x)/(18*s);
        const dy=(pet.y+y*s-ball.y)/(22*s);
        return dx*dx+dy*dy<=1;
      });
      if(touches && ball.hitCycle!==cycle) {
        // More upward impulse with room to arc below the top edge. The same
        // ellipse contact drives both the rebound and a brief elastic squash.
        ball.vy=-Math.min(310*s,Math.sqrt(2*180*s*Math.max(80*s,ball.y-28*s)));
        ball.hitCycle=cycle;ball.squash=1;pet.headHits+=1;
        result.headHits=pet.headHits;result.toy={...result.toy,vy:ball.vy,squash:1,hit:true};
      }
    }
    return result;
  }
  function geometry(p) {
    const stretch=p.stretch||0,shake=p.shake||0;
    const points=dogPoints.map(point=>point.slice());
    const bob=-Math.abs(Math.sin(p.gait*2))*p.stride*1.8;
    const bodyDrop=p.lie*22;
    // Rotate the torso around the hips before takeoff, rather than lifting
    // four straight legs together. Crouching compresses the planted legs.
    const rearAngle=-p.rear*0.38,cosRear=Math.cos(rearAngle),sinRear=Math.sin(rearAngle);
    const jumpRise = x => p.jump * (0.22 + clamp((x + 40) / 120, 0, 1) * 0.5);
    const bodyPoint=(x,y)=>{
      const dx=x+32,dy=y+20;
      return [-32+dx*cosRear-dy*sinRear,-20+dx*sinRear+dy*cosRear+bodyDrop+p.crouch*7+bob-jumpRise(x)
        +stretch*(clamp((x+35)/70,0,1)*25-4)+Math.sin(p.time*19+x*.06)*shake*2];
    };
    for(let i=0;i<36;i++)points[i]=bodyPoint(...points[i]);
    // The head rotates around the neck, not the entire dog or planted feet.
    const headAngle=p.look*0.3+p.nuzzle+p.headDrop*0.8+(p.tilt||0)+Math.sin(p.time*20)*shake*.16;
    const neck=bodyPoint(28,-48);
    const turnHead=point=>{
      const x=point[0]-neck[0],y=point[1]-neck[1];
      return [neck[0]+x*Math.cos(headAngle)-y*Math.sin(headAngle),neck[1]+x*Math.sin(headAngle)+y*Math.cos(headAngle)];
    };
    for(let i=16;i<36;i++) {
      points[i]=turnHead(points[i]);
    }
    const feet=[];
    for(let leg=0;leg<4;leg++) {
      const start=36+leg*4,offset=[0,Math.PI,Math.PI,0][leg];
      const phase=((p.gait+offset)%TAU)/TAU;
      const swingPhase=clamp((phase-0.62)/0.38,0,1);
      // During stance the local foot travels backward as the body advances.
      // The return stroke lifts the paw; gait advances by distance, not wall time.
      const swing=(phase<0.62?13-42*phase:-13+26*(0.5-Math.cos(swingPhase*Math.PI)/2))*p.stride;
      const lift=(phase<0.62?0:Math.sin(swingPhase*Math.PI)*12)*p.stride;
      const raised=leg===2?p.lift*23:0;
      const digging=leg===3?p.dig*Math.max(0,Math.sin(p.time*15))*18:0;
      const forepaw=leg===3?p.paw:0;
      for(let j=0;j<4;j++) {
        let x=dogPoints[start+j][0],y=dogPoints[start+j][1];
        const weight=j/3;
        x += swing*weight + (leg>=1&&leg%2===1?p.lie*18:-p.lie*8)*weight;
        y += bodyDrop*(1-weight)-lift*weight-raised*weight-digging*weight-forepaw*weight;
        if (p.jump > 0) {
          const isFront = leg === 1 || leg === 3;
          // Hind feet remain the contact points; front paws fold upward.
          y -= isFront ? p.jump * 0.72 * weight : 0;
          x += isFront ? p.jump * 0.16 * weight : 0;
        }
        const isFront=leg===1||leg===3;
        x+=stretch*(isFront?22:-5)*weight;
        y+=stretch*(isFront?19:-4)*(1-weight);
        if(isFront) {
          // Forelegs follow the shoulders and bend toward the chest.
          const dx=x+32,dy=y+20;
          x=-32+dx*cosRear-dy*sinRear+p.rear*9*weight;
          y=-20+dx*sinRear+dy*cosRear-p.rear*10*weight
            +(p.crouch*7-jumpRise(dogPoints[start][0]))*(1-weight);
        } else {
          // The hip moves but the rear paw contact stays at ground level.
          const hip=bodyPoint(dogPoints[start][0],dogPoints[start][1]);
          x+=(hip[0]-dogPoints[start][0])*(1-weight);
          y+=(hip[1]-dogPoints[start][1]-bodyDrop)*(1-weight);
        }
        if(raised)x-=p.lift*9*weight;
        if(digging)x+=p.dig*Math.cos(p.time*15)*12*weight;
        points[start+j]=[x,y];
      }
      feet.push({x:points[start+3][0],y:points[start+3][1],planted:lift<0.1&&raised<0.1&&digging<0.1&&forepaw<0.1&&(leg===0||leg===2||(p.jump<0.3&&p.rear<0.05))});
    }
    for(let i=52;i<58;i++) {
      const x=dogPoints[i][0]+40,y=dogPoints[i][1]+37;
      points[i]=bodyPoint(-40+x*Math.cos(p.wag)-y*Math.sin(p.wag),-37+x*Math.sin(p.wag)+y*Math.cos(p.wag));
    }
    // Face features use the same neck transform as the skull, plus a subtle eye glance.
    for(let i=58;i<64;i++) {
      points[i]=turnHead(bodyPoint(...dogPoints[i]));
      if(i===58)points[i][0]+=p.gazeX*1.7*p.facing;
      if(i===59)points[i][0]+=Math.sin(p.time*12)*(p.sniff||0)*1.2;
    }
    return {points,feet,head:{x:points[18][0],y:points[18][1]},headAngle:headAngle+rearAngle,bob,
      collar:[bodyPoint(30,-40),bodyPoint(41,-36),bodyPoint(37,-34)]};
  }
  const api={pose,dogPoints,createPet,stepPet,geometry,activities,layout};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PrismaraMotion=api;
})(typeof window!=='undefined'?window:globalThis);
