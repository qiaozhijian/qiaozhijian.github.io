/* Calibrated pinhole rays in a shared 3D frame; time is a separate coordinate. */
(() => {
  const host = document.querySelector('[data-ray-spacetime]');
  if (!host) return;
  const blue = '#0071e3', purple = '#8759c7';
  const project = ([x,y,z]) => [335 + 52*x + 23*z, 190 - 76*y + 18*z - 9*x];
  const add = (a,b) => a.map((v,i)=>v+b[i]);
  const mul = (a,s) => a.map(v=>v*s);
  const origin = t => [-3.2+6.4*t, .3+.18*Math.sin(t*Math.PI), .5*Math.sin(t*Math.PI*2)];
  const basis = t => {const a=-.3+.6*t;return {r:[Math.cos(a),0,-Math.sin(a)],f:[Math.sin(a),0,Math.cos(a)]};};
  const planePoint = (t,u,v) => {const {r,f}=basis(t);return add(add(add(origin(t),mul(f,1.65)),mul(r,u)),[0,v,0]);};
  const path = points => points.map((p,i)=>(i?'L':'M')+project(p).map(v=>v.toFixed(2)).join(',')).join(' ');
  const line = (points,color,width=1,extra='') => `<path d="${path(points)}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const label = (x,y,s,size=20,color='#86868b',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${s}</text>`;
  const dot = (p,r,color) => {const [x,y]=project(p);return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;};
  function camera(t,active=false,uv=[0,0]) {
    const o=origin(t),c=[planePoint(t,-1.05,-.66),planePoint(t,1.05,-.66),planePoint(t,1.05,.66),planePoint(t,-1.05,.66)];
    const color=active?blue:'#ccd5e0';
    let s=`<path d="${path([...c,c[0]])}" fill="${active?'#edf5ff':'#fafbfd'}" fill-opacity=".8" stroke="${color}" stroke-width="${active?1.5:1}"/>`;
    c.forEach(p=>s+=line([o,p],color,active?1.1:.8));
    for(let i=1;i<4;i++){const u=-1.05+i*.525,v=-.66+i*.33;s+=line([planePoint(t,u,-.66),planePoint(t,u,.66)],color,.6);s+=line([planePoint(t,-1.05,v),planePoint(t,1.05,v)],color,.6);}
    if(active){
      const [u,w]=uv,du=.22,dv=.15;
      const token=[planePoint(t,u-du,w-dv),planePoint(t,u+du,w-dv),planePoint(t,u+du,w+dv),planePoint(t,u-du,w+dv)];
      s+=`<path d="${path([...token,token[0]])}" fill="${blue}" fill-opacity=".65"/>`;
      const p=planePoint(t,...uv),v=p.map((x,i)=>x-o[i]),end=add(o,mul(v,2.1));
      s+=line([o,end],blue,2.4,'marker-end="url(#ray-tip)"')+dot(o,4,blue)+dot(p,3,blue);
      const [x,y]=project(p);s+=label(x+12,y+4,'token',20,blue);
      const [ox,oy]=project(o);s+=label(ox-8,oy-13,'o(t)',20,blue);
      const [ex,ey]=project(end);s+=label(ex+8,ey-7,'d',22,blue);
    } else s+=dot(o,2.5,color);
    return s;
  }
  host.innerHTML=`<svg viewBox="0 0 1000 440" role="img" aria-labelledby="ray-title ray-desc" style="display:block;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><title id="ray-title">A video token in space and time</title><desc id="ray-desc">A moving calibrated camera and gridded image plane in three-dimensional space. A token moves within the image plane and defines a ray from the camera origin through its image-plane position. A separate synchronized time axis provides the fourth coordinate.</desc><defs><marker id="ray-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="${blue}" stroke-width="1.5"/></marker></defs><rect width="1000" height="440" fill="white"/><g id="ray-static"></g><g id="ray-live"></g></svg><button type="button" class="ray-motion-toggle" aria-label="Pause ray illustration">Pause</button>`;
  const staticGroup=host.querySelector('#ray-static'),live=host.querySelector('#ray-live');
  let base=label(24,38,'A token in space and time',30,'#1d1d1f');
  for(let x=-5;x<=5;x++)base+=line([[x,-.55,-1.5],[x,-.55,5]],'#eef0f3',1.05);
  for(let z=-1;z<=5;z++)base+=line([[-5,-.55,z],[5,-.55,z]],'#eef0f3',1.05);
  const axis=[-4.6,-.55,3.5];
  [[[1,0,0],'x'],[[0,1,0],'y'],[[0,0,1],'z']].forEach(([v,n])=>{const end=add(axis,mul(v,.65));base+=line([axis,end],'#aab0b8',1.2);const [x,y]=project(end);base+=label(x-4,y-7,n,18);});
  base+=line(Array.from({length:65},(_,i)=>origin(i/64)),'#b9c3ce',1.3,'stroke-dasharray="3 5"');
  [0,.5,1].forEach((t,i)=>{base+=camera(t);const [x,y]=project(origin(t));base+=label(x-13,y-28,['t − 2','t','t + 2'][i],18);});
  base+=`<path d="M726 72V332" stroke="#eceef1"/>`;
  base+=label(754,100,'Image position (u, v)',22,'#1d1d1f');
  base+=label(754,180,'Ray origin · o',22,'#1d1d1f');
  base+=label(754,260,'Ray direction · d',22,'#1d1d1f');
  base+=label(24,378,'Time',22,'#1d1d1f')+`<path d="M110 372H940" stroke="#e0e4e9" stroke-width="2"/>`;
  [0,.25,.5,.75,1].forEach((t,i)=>{const x=110+830*t;base+=`<path d="M${x} 367V377" stroke="#bfc5ce"/>`+label(x,412,['t − 2','t − 1','t','t + 1','t + 2'][i],20,'#6e6e73','text-anchor="middle"');});
  staticGroup.innerHTML=base;
  let phase=0,last=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true;
  const button=host.querySelector('button');
  const updateButton=()=>{button.textContent=playing?'Pause':'Play';button.setAttribute('aria-label',(playing?'Pause':'Play')+' ray illustration');};
  function draw(){
    const t=.5-.5*Math.cos(phase),uv=[.72*Math.sin(phase*1.7),.44*Math.cos(phase*2.3)],o=origin(t),p=planePoint(t,...uv),v=p.map((x,i)=>x-o[i]),norm=Math.hypot(...v),d=v.map(x=>x/norm);
    const imageUv=[(uv[0]+1.05)/2.1,(.66-uv[1])/1.32];
    host.dataset.tokenUv=imageUv.join(',');
    live.innerHTML=camera(t,true,uv)+label(754,132,imageUv.map(x=>x.toFixed(2)).join(' , '),23,blue)+label(754,212,o.map(x=>x.toFixed(2)).join(' · '),20,blue)+label(754,292,d.map(x=>x.toFixed(2)).join(' · '),20,blue)+`<circle cx="${110+830*t}" cy="372" r="7" fill="${purple}"/><circle cx="${110+830*t}" cy="372" r="13" fill="${purple}" opacity=".1"/>`;

  }
  function tick(now){if(last!==null && playing && visible && !document.hidden){phase+=(now-last)*2*Math.PI/14000;draw();}last=now;requestAnimationFrame(tick);}
  button.onclick=()=>{playing=!playing;updateButton();};
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{playing=!e.matches;updateButton();});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;}).observe(host);
  updateButton();draw();requestAnimationFrame(tick);
})();
