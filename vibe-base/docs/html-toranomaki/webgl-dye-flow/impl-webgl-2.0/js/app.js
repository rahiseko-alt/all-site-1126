// Modified from verbatim: 単一HTML(sandbox/webgl-dye-flow.html)を index/css/js に分割（ロジック無改変）
"use strict";
/* ============================================================
   WebGL Fluid Simulation（PavelDoGreat ベース）の自己完結クローン
   + docs/ops/webgl-fluid-knowhow.md の「有機的アイドル自動巡回」再現
   - 多重サイン/コサイン波合成によるカオス的軌跡（AutoPointer）
   - 前フレーム差分から速度ベクトルを算出した velocity splat
   - HSV 色相を毎フレーム回転（オーロラ的色彩）
   - 3秒アイドル判定でユーザー操作とシームレス切替
   外部依存なし（dat.GUI/解析/プロモ等は排除）・単一HTML
============================================================ */

var canvas = document.getElementById("c");
var hintEl = document.getElementById("hint");

var config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  DENSITY_DISSIPATION: 1.0,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  IDLE_MS: 3000,
  AUTO_POINTERS: 5
};

/* ---------- WebGL context + extensions ---------- */
function getWebGLContext(c) {
  var params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
  var gl = c.getContext("webgl2", params);
  var isWebGL2 = !!gl;
  if (!isWebGL2) gl = c.getContext("webgl", params) || c.getContext("experimental-webgl", params);
  var halfFloat, supportLinearFiltering;
  if (isWebGL2) {
    gl.getExtension("EXT_color_buffer_float");
    supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float");
    supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  }
  gl.clearColor(0, 0, 0, 1);
  var halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);
  var formatRGBA, formatRG, formatR;
  if (isWebGL2) {
    formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
    formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
  } else {
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = formatRGBA;
    formatR = formatRGBA;
  }
  return { gl: gl, ext: { formatRGBA: formatRGBA, formatRG: formatRG, formatR: formatR, halfFloatTexType: halfFloatTexType, supportLinearFiltering: supportLinearFiltering }, isWebGL2: isWebGL2 };
}
function getSupportedFormat(gl, internalFormat, format, type) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) return { internalFormat: gl.RGBA, format: gl.RGBA };
  return { internalFormat: internalFormat, format: format };
}
function supportRenderTextureFormat(gl, internalFormat, format, type) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
  var fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

var ctx = getWebGLContext(canvas);
var gl = ctx.gl, ext = ctx.ext;
if (!gl) { hintEl.textContent = "このブラウザは WebGL に対応していません"; throw new Error("no webgl"); }

/* ---------- shader helpers ---------- */
function compileShader(type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
  return shader;
}
function createProgram(vs, fs) {
  var program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(program));
  return program;
}
function getUniforms(program) {
  var uniforms = {}; var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < count; i++) { var name = gl.getActiveUniform(program, i).name; uniforms[name] = gl.getUniformLocation(program, name); }
  return uniforms;
}
function Program(vs, fs) { this.program = createProgram(vs, fs); this.uniforms = getUniforms(this.program); }
Program.prototype.bind = function () { gl.useProgram(this.program); };

/* ---------- shaders ---------- */
var baseVertex = compileShader(gl.VERTEX_SHADER,
  "precision highp float; attribute vec2 aPosition; varying vec2 vUv,vL,vR,vT,vB; uniform vec2 texelSize;" +
  "void main(){vUv=aPosition*0.5+0.5;vL=vUv-vec2(texelSize.x,0.0);vR=vUv+vec2(texelSize.x,0.0);" +
  "vT=vUv+vec2(0.0,texelSize.y);vB=vUv-vec2(0.0,texelSize.y);gl_Position=vec4(aPosition,0.0,1.0);}");

var copyShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;" +
  "void main(){gl_FragColor=texture2D(uTexture,vUv);}");

var clearShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;" +
  "void main(){gl_FragColor=value*texture2D(uTexture,vUv);}");

var displayShader = compileShader(gl.FRAGMENT_SHADER,
  "precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTexture;" +
  "void main(){vec3 c=texture2D(uTexture,vUv).rgb;float a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}");

var splatShader = compileShader(gl.FRAGMENT_SHADER,
  "precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;" +
  "void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.0);}");

var advectionShader = compileShader(gl.FRAGMENT_SHADER,
  "precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform float dt;uniform float dissipation;" +
  "void main(){vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);float decay=1.0+dissipation*dt;gl_FragColor=result/decay;}");

var divergenceShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;" +
  "void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;" +
  "vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.0){L=-C.x;}if(vR.x>1.0){R=-C.x;}if(vT.y>1.0){T=-C.y;}if(vB.y<0.0){B=-C.y;}" +
  "float div=0.5*(R-L+T-B);gl_FragColor=vec4(div,0.0,0.0,1.0);}");

var curlShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;" +
  "void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;" +
  "float vorticity=R-L-T+B;gl_FragColor=vec4(0.5*vorticity,0.0,0.0,1.0);}");

var vorticityShader = compileShader(gl.FRAGMENT_SHADER,
  "precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;" +
  "void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;" +
  "vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+0.0001;force*=curl*C;force.y*=-1.0;" +
  "vec2 vel=texture2D(uVelocity,vUv).xy;vel+=force*dt;vel=min(max(vel,-1000.0),1000.0);gl_FragColor=vec4(vel,0.0,1.0);}");

var pressureShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;" +
  "void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;" +
  "float divergence=texture2D(uDivergence,vUv).x;float pressure=(L+R+B+T-divergence)*0.25;gl_FragColor=vec4(pressure,0.0,0.0,1.0);}");

var gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER,
  "precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;" +
  "void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;" +
  "vec2 velocity=texture2D(uVelocity,vUv).xy;velocity.xy-=vec2(R-L,T-B);gl_FragColor=vec4(velocity,0.0,1.0);}");

var copyProgram = new Program(baseVertex, copyShader);
var clearProgram = new Program(baseVertex, clearShader);
var splatProgram = new Program(baseVertex, splatShader);
var advectionProgram = new Program(baseVertex, advectionShader);
var divergenceProgram = new Program(baseVertex, divergenceShader);
var curlProgram = new Program(baseVertex, curlShader);
var vorticityProgram = new Program(baseVertex, vorticityShader);
var pressureProgram = new Program(baseVertex, pressureShader);
var gradienSubtractProgram = new Program(baseVertex, gradientSubtractShader);
var displayProgram = new Program(baseVertex, displayShader);

/* ---------- blit ---------- */
var blit = (function () {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  return function (target) {
    if (target == null) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    else { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };
})();

/* ---------- FBOs ---------- */
var dye, velocity, divergence, curl, pressure;
function createFBO(w, h, internalFormat, format, type, param) {
  gl.activeTexture(gl.TEXTURE0);
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
  var fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
  var texelX = 1.0 / w, texelY = 1.0 / h;
  return {
    texture: texture, fbo: fbo, width: w, height: h, texelSizeX: texelX, texelSizeY: texelY,
    attach: function (id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
  };
}
function createDoubleFBO(w, h, internalFormat, format, type, param) {
  var fbo1 = createFBO(w, h, internalFormat, format, type, param);
  var fbo2 = createFBO(w, h, internalFormat, format, type, param);
  return {
    width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
    get read() { return fbo1; }, set read(v) { fbo1 = v; },
    get write() { return fbo2; }, set write(v) { fbo2 = v; },
    swap: function () { var tmp = fbo1; fbo1 = fbo2; fbo2 = tmp; }
  };
}
function getResolution(resolution) {
  var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspect < 1) aspect = 1.0 / aspect;
  var min = Math.round(resolution), max = Math.round(resolution * aspect);
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
  return { width: min, height: max };
}
function initFramebuffers() {
  var simRes = getResolution(config.SIM_RESOLUTION);
  var dyeRes = getResolution(config.DYE_RESOLUTION);
  var texType = ext.halfFloatTexType;
  var rgba = ext.formatRGBA, rg = ext.formatRG, r = ext.formatR;
  var filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
  dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
  velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
  divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
}

/* ---------- HSV→RGB（ノウハウ §3③ 準拠） ---------- */
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6); f = h * 6 - i; p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: r, g: g, b: b };
}

/* ---------- AutoPointer（ノウハウ §3① 多重サイン波合成） ---------- */
function AutoPointer(id, seedX, seedY, speedX, speedY) {
  this.id = id; this.seedX = seedX; this.seedY = seedY; this.speedX = speedX; this.speedY = speedY;
  this.x = 0; this.y = 0; this.prevX = 0; this.prevY = 0; this.hue = Math.random() * 360;
}
AutoPointer.prototype.update = function (t, width, height) {
  this.prevX = this.x; this.prevY = this.y;
  var xOffset = Math.sin(t * this.speedX + this.seedX) * 0.35;
  xOffset += Math.sin(t * this.speedX * 2.3 + this.seedX * 1.5) * 0.1;
  xOffset += Math.cos(t * this.speedX * 0.7 - this.seedX * 0.5) * 0.05;
  var yOffset = Math.cos(t * this.speedY + this.seedY) * 0.35;
  yOffset += Math.cos(t * this.speedY * 1.9 + this.seedY * 1.2) * 0.1;
  yOffset += Math.sin(t * this.speedY * 0.6 - this.seedY * 0.8) * 0.05;
  this.x = (xOffset + 0.5) * width;
  this.y = (yOffset + 0.5) * height;
  this.hue = (this.hue + 0.15) % 360;
};
AutoPointer.prototype.getColor = function () {
  var c = HSVtoRGB(this.hue / 360, 1.0, 1.0);
  return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
};

var autoPointers = [];
for (var ap = 0; ap < config.AUTO_POINTERS; ap++) {
  autoPointers.push(new AutoPointer(
    ap, Math.random() * 1000, Math.random() * 1000,
    0.12 + Math.random() * 0.18, 0.12 + Math.random() * 0.18
  ));
}

/* ---------- user pointer + idle ---------- */
var userPointer = { x: 0, y: 0, prevX: 0, prevY: 0, down: false, moved: false, color: { r: 0.2, g: 0.1, b: 0.4 }, hue: Math.random() * 360 };
var lastInputTime = -99999; // 起動直後からアイドル＝自動巡回開始

function markInput() { lastInputTime = Date.now(); hintEl.style.opacity = "1"; }
function pointerMove(x, y) {
  userPointer.prevX = userPointer.x; userPointer.prevY = userPointer.y;
  userPointer.x = x; userPointer.y = y; userPointer.moved = true;
  userPointer.hue = (userPointer.hue + 1) % 360;
  var c = HSVtoRGB(userPointer.hue / 360, 1.0, 1.0);
  userPointer.color = { r: c.r * 0.2, g: c.g * 0.2, b: c.b * 0.2 };
  markInput();
}
canvas.addEventListener("mousemove", function (e) { pointerMove(e.clientX, e.clientY); });
canvas.addEventListener("mousedown", function (e) { userPointer.x = userPointer.prevX = e.clientX; userPointer.y = userPointer.prevY = e.clientY; userPointer.down = true; markInput(); });
window.addEventListener("mouseup", function () { userPointer.down = false; });
canvas.addEventListener("touchstart", function (e) { var t = e.touches[0]; userPointer.x = userPointer.prevX = t.clientX; userPointer.y = userPointer.prevY = t.clientY; markInput(); }, { passive: true });
canvas.addEventListener("touchmove", function (e) { var t = e.touches[0]; pointerMove(t.clientX, t.clientY); }, { passive: true });

/* ---------- splat ---------- */
function correctRadius(radius) {
  var aspect = canvas.width / canvas.height;
  if (aspect > 1) radius *= aspect;
  return radius;
}
function splat(x, y, dx, dy, color) {
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
  gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 0.0);
  gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
  blit(velocity.write); velocity.swap();
  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
  blit(dye.write); dye.swap();
}

/* ---------- simulation step ---------- */
function step(dt) {
  gl.disable(gl.BLEND);
  // curl
  curlProgram.bind();
  gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);
  // vorticity
  vorticityProgram.bind();
  gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write); velocity.swap();
  // divergence
  divergenceProgram.bind();
  gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence);
  // clear pressure
  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
  blit(pressure.write); pressure.swap();
  // pressure jacobi
  pressureProgram.bind();
  gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  for (var i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
    blit(pressure.write); pressure.swap();
  }
  // gradient subtract
  gradienSubtractProgram.bind();
  gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
  gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
  blit(velocity.write); velocity.swap();
  // advect velocity
  advectionProgram.bind();
  gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
  blit(velocity.write); velocity.swap();
  // advect dye
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform2f(advectionProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
  gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
  blit(dye.write); dye.swap();
}

function render() {
  displayProgram.bind();
  gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
  blit(null);
}

/* ---------- inputs（アイドル判定: ノウハウ §4） ---------- */
function applyInputs() {
  var idle = Date.now() - lastInputTime > config.IDLE_MS;
  var t = performance.now() / 1000;
  if (idle) {
    // 自動巡回（5個の AutoPointer を駆動）
    hintEl.style.opacity = "0.25";
    for (var i = 0; i < autoPointers.length; i++) {
      var p = autoPointers[i];
      p.update(t, canvas.width, canvas.height);
      var dx = (p.x - p.prevX) * 8.0; // 慣性強調係数（ノウハウ §3②）
      var dy = (p.y - p.prevY) * 8.0;
      splat(p.x, p.y, dx, dy, p.getColor());
    }
  } else if (userPointer.moved) {
    userPointer.moved = false;
    var udx = (userPointer.x - userPointer.prevX) * 6.0;
    var udy = (userPointer.y - userPointer.prevY) * 6.0;
    splat(userPointer.x, userPointer.y, udx, udy, userPointer.color);
  }
}

/* ---------- main loop ---------- */
var lastUpdate = Date.now();
function calcDeltaTime() { var now = Date.now(); var dt = Math.min((now - lastUpdate) / 1000, 0.016666); lastUpdate = now; return dt; }
function resize() {
  var w = Math.floor(canvas.clientWidth * (window.devicePixelRatio || 1));
  var h = Math.floor(canvas.clientHeight * (window.devicePixelRatio || 1));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
  return false;
}
function update() {
  var dt = calcDeltaTime();
  if (resize()) initFramebuffers();
  applyInputs();
  step(dt);
  render();
  requestAnimationFrame(update);
}

resize();
initFramebuffers();
update();
