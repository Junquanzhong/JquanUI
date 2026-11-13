(function (root) {
  'use strict';
  const TAU=Math.PI*2;
  function draw(context,p,palette) {
    const {fur,tail,detail,toy:accent,earth}=palette;
    const s=p.scale,t=p.time,points=p.geometry.points;
    const line=(items,color,alpha=0.3,width=1.1,close=false)=>{
      context.strokeStyle=color;context.globalAlpha=alpha;context.lineWidth=width;
      context.beginPath();items.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));
      if(close)context.closePath();context.stroke();
    };
    const dot=(x,y,r,color,alpha=0.8)=>{context.fillStyle=color;context.globalAlpha=alpha;context.beginPath();context.arc(x,y,r,0,TAU);context.fill();};
    context.save();
    // The shadow stays on the ground while only the dog rises to head the balloon.
    context.translate(p.x,p.groundY);
    context.fillStyle=detail;context.globalAlpha=p.jump>3?0.08:0.12;
    context.beginPath();context.ellipse(0,3*s,(p.lie>0.5?66:54)*s,(p.jump>3?3:5)*s,0,0,TAU);context.fill();
    context.scale(s*p.facing,s);
    // Short contact marks give the four separate feet a shared floor.
    p.geometry.feet.forEach(foot=>{if(foot.planted)line([[foot.x-5,2],[foot.x+3,2]],detail,0.17,1);});
    for(const leg of [0,1])line(points.slice(36+leg*4,40+leg*4),tail,0.43,2);
    line(points.slice(0,12),fur,0.32,1.2,true);
    line(points.slice(16,28),fur,0.46,1.3,true);
    line(points.slice(28,32),tail,0.5,1.7);
    line(points.slice(32,36),tail,0.3,1.2);
    line(points.slice(52,58),tail,0.48,1.8);
    for(const leg of [2,3])line(points.slice(36+leg*4,40+leg*4),fur,0.65,2.1);
    points.forEach(([x,y],index)=>{
      if(index>=58)return;
      const far=index>=36&&index<44;
      context.save();context.translate(x,y);context.rotate(Math.PI/4);
      const radius=index>=36&&index<52?2.4:index>=52?2.5:2.6+index%3*0.32;
      context.fillStyle=index>=52||index>=28&&index<36?tail:fur;
      context.globalAlpha=far?0.43:0.76+index%3*0.08;
      context.fillRect(-radius,-radius,radius*2,radius*2);context.restore();
    });
    const eye=points[58],nose=points[59];
    context.fillStyle=detail;context.globalAlpha=0.98;
    context.beginPath();context.ellipse(eye[0],eye[1],p.blink?3.1:2.8,p.blink?0.9:3.8,p.geometry.headAngle,0,TAU);context.fill();
    if(!p.blink)dot(eye[0]+0.7,eye[1]-1.1,0.8,accent,0.9);
    dot(nose[0],nose[1],3.4,detail,0.98);
    line([points[60],points[61]],detail,0.9,1.4);
    dot(points[62][0],points[62][1],1.3,detail,0.35);
    if(p.sniff>.4) {
      // Small breath strokes originate at the moving nose, not a fixed label.
      const breath=(Math.sin(t*7)+1)*.5;
      line([[nose[0]+5,nose[1]+2],[nose[0]+9+breath*3,nose[1]+3]],tail,.25*p.sniff,1);
    }
    if(p.shake>.3) {
      for(const side of [-1,1]) {
        const head=p.geometry.head;
        line([[head.x+side*23,head.y-3],[head.x+side*27,head.y+4]],tail,.28*p.shake,1);
      }
    }
    // A tiny collar with a warm tag distinguishes the neck from the four legs.
    const collar=p.geometry.collar;
    line(collar.slice(0,2),tail,0.8,2);
    dot(collar[2][0],collar[2][1],2.1,accent,0.85);
    if(p.action==='rest') {
      const y=-27+p.lie*15;
      line([[-17,y],[1,y-1-p.breath*1.1],[16,y]],fur,0.18,1);
      if(t%4>1)line([[59,-72],[64,-78],[59,-78],[64,-84]],tail,(t%4-1)/10,1);
    }
    if(p.dig>0.15) {
      // Dirt arcs originate at the working forepaw and fall behind the dog.
      line([[38,4],[50,5],[63,3]],earth,0.28*p.dig,1.5);
      for(let i=0;i<7;i++) {
        const age=(t*2.1+i/7)%1;
        const x=36-age*(32+i*4),y=2-Math.sin(age*Math.PI)*(9+i*2.5);
        dot(x,y,1.1+i%2*0.4,earth,(1-age)*0.6*p.dig);
      }
    }
    if(p.action==='pee'&&p.lift>0.5) {
      // Brief, abstract droplets at the edge; no lasting mark or page-wide trail.
      for(let i=0;i<4;i++) {
        const age=(t*1.8+i/4)%1;
        dot(-38+age*30,-15*(1-age)+age*age*16,0.9,accent,(1-age)*0.32*p.lift);
      }
    }
    if(p.state==='cute' && p.action==='nuzzle') {
      line([[49,-96],[51,-101],[53,-96]],accent,0.45,1);
      dot(59,-99+Math.sin(t*3)*2,1.5,accent,0.5);
    }
    context.restore();
    if(p.toy) {
      context.save();context.translate(p.toy.x,p.toy.y);context.scale(s,s);
      if(p.toy.type==='butterfly') {
        const wing=0.4+Math.abs(p.toy.flap)*0.6;
        context.rotate(Math.sin(t*2)*0.25);
        context.fillStyle=accent;context.globalAlpha=0.75;
        for(const side of [-1,1]){
          context.beginPath();context.ellipse(side*5*wing,-3,6*wing,8,side*0.4,0,TAU);context.fill();
          context.globalAlpha=0.5;context.beginPath();context.ellipse(side*4*wing,5,4*wing,5,0,0,TAU);context.fill();context.globalAlpha=0.75;
        }
        line([[0,7],[0,-6],[-3,-10]],detail,0.8,1.2);
        line([[0,-6],[3,-10]],detail,0.8,1);
      } else {
        // String and knot move with the balloon when the head bumps it upward.
        const squash=p.toy.squash||0;
        context.scale(1+squash*.22,1-squash*.18);
        context.fillStyle=accent;context.globalAlpha=0.17;
        context.beginPath();context.ellipse(0,0,14,18,0,0,TAU);context.fill();
        context.globalAlpha=0.7;context.strokeStyle=accent;context.lineWidth=1.5;context.stroke();
        line([[-4,-8],[-6,-4]],accent,0.75,2);
        line([[-2,18],[0,21],[3,18]],accent,0.75,1.2);
        const sway=Math.sin(t*2.2)*(4+Math.min(5,Math.abs(p.toy.vy||0)/50));
        line([[0,21],[sway,32],[-sway,43],[0,51]],tail,0.45,0.9);
      }
      context.restore();
    }
  }
  const api={draw};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PrismaraPetRenderer=api;
})(typeof window!=='undefined'?window:globalThis);
