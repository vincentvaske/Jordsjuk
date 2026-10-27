// Liquid background: seed 59, speed 1.79, scale 2, amplitude 1,
// frequency 2, definition 7, bands .1, grain .05.
(()=>{
 const canvas=document.createElement('canvas');canvas.className='liquid-background';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false});if(!gl){canvas.remove();return}
 const vertex='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
 const fragment=`precision mediump float;
 uniform vec2 resolution;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+59.)*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<7;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.+13.7;a*=.5;}return v;}
 void main(){vec2 uv=gl_FragCoord.xy/resolution;vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.)*.9;float t=time*1.79*.08;
 vec2 driftA=vec2(sin(t*.43),cos(t*.31))*.7;vec2 driftB=vec2(cos(t*.27+2.),sin(t*.37+1.))*.8;
 vec2 warp=vec2(fbm(p+driftA),fbm(p+vec2(5.2,1.3)+driftB));
 float n=fbm(p+warp*2.+driftB*.35);vec2 curl=p+(warp-.5)*2.4;float a=fbm(curl*.65+driftA*.3)*6.28318;vec2 direction=vec2(cos(a),sin(a));float phase=dot(curl,direction)*.8+warp.x*1.4+warp.y*.65+n*.8;float flow=.5+.5*sin(phase*6.28318);flow=mix(flow,floor(flow*7.)/7.,.45);
 vec3 black=vec3(0.);vec3 red=vec3(.045,0.,0.);vec3 brown=vec3(.022,.004,0.);vec3 color;
 if(flow<.3333){color=mix(black,red,smoothstep(0.,.3333,flow));}else if(flow<.6667){color=mix(red,black,smoothstep(.3333,.6667,flow));}else{color=mix(black,brown,smoothstep(.6667,1.,flow));}
 color*=1.+(hash(gl_FragCoord.xy)-.5)*.05;gl_FragColor=vec4(color,1.);}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 try{
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Liquid background could not initialize');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const size=gl.getUniformLocation(program,'resolution'),clock=gl.getUniformLocation(program,'time');
 function resize(){const pageHeight=document.querySelector('.page').scrollHeight;canvas.style.height=pageHeight+'px';const ratio=Math.min(1,800/innerWidth,2400/pageHeight);canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(pageHeight*ratio);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(size,canvas.width,canvas.height)}
 resize();addEventListener('resize',resize);new ResizeObserver(resize).observe(document.querySelector('.page'));const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0,start=performance.now();
 function render(now){if(now-last>40){gl.uniform1f(clock,reduced.matches?0:(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,6);last=now}if(!reduced.matches)requestAnimationFrame(render)}
 render(start+50);reduced.addEventListener('change',()=>requestAnimationFrame(render));
 }catch(error){canvas.remove();console.warn(error)}
})();
