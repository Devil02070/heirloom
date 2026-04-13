import { Effect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const createTouchTexture = () => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const trail = [];
  let last = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const drawPoint = (p) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t) => -t * (t - 2);
    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  const addTouch = (norm) => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 10000, 1);
    }
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };
  return {
    canvas,
    texture,
    addTouch,
    update,
    set radiusScale(v) {
      radius = 0.1 * size * v;
    },
    get radiusScale() {
      return radius / (0.1 * size);
    },
    size
  };
};

const createLiquidEffect = (texture, opts) => {
  const fragment = `
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;

    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;

      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

      float amt = uStrength * intensity * wave;

      uv += vec2(vx, vy) * amt;
    }
    `;
  return new Effect('LiquidEffect', fragment, {
    uniforms: new Map([
      ['uTexture', new THREE.Uniform(texture)],
      ['uStrength', new THREE.Uniform(opts?.strength ?? 0.025)],
      ['uTime', new THREE.Uniform(0)],
      ['uFreq', new THREE.Uniform(opts?.freq ?? 4.5)]
    ])
  });
};

const SHAPE_MAP = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3
};

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;
const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

const MAX_CLICKS = 10;

export default function PixelBlast({
  variant = 'square',
  pixelSize = 3,
  color = '#B19EEF',
  className,
  style,
  antialias = true,
  patternScale = 2,
  patternDensity = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleIntensityScale = 1,
  rippleThickness = 0.1,
  rippleSpeed = 0.3,
  liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.5,
  noiseAmount = 0
}) {
  const containerRef = useRef(null);
  const visibilityRef = useRef({ visible: true });
  const speedRef = useRef(speed);
  const threeRef = useRef(null);
  const prevConfigRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    speedRef.current = speed;

    const needsReinitKeys = ['antialias', 'liquid', 'noiseAmount'];
    const cfg = { antialias, liquid, noiseAmount };
    let mustReinit = false;
    if (!threeRef.current) {
      mustReinit = true;
    } else if (prevConfigRef.current) {
      for (const k of needsReinitKeys) {
        if (prevConfigRef.current[k] !== cfg[k]) {
          mustReinit = true;
          break;
        }
      }
    }

    if (!mustReinit && threeRef.current) {
      const t = threeRef.current;
      const c = new THREE.Color(color).convertLinearToSRGB();
      t.material.uniforms.uColor.value.set(c.r, c.g, c.b);
      t.material.uniforms.uPixelSize.value = pixelSize;
      t.material.uniforms.uScale.value = patternScale;
      t.material.uniforms.uDensity.value = patternDensity;
      t.material.uniforms.uShapeType.value = SHAPE_MAP[variant] ?? 0;
      t.material.uniforms.uPixelJitter.value = pixelSizeJitter;
      t.material.uniforms.uEnableRipples.value = enableRipples ? 1 : 0;
      t.material.uniforms.uRippleSpeed.value = rippleSpeed;
      t.material.uniforms.uRippleThickness.value = rippleThickness;
      t.material.uniforms.uRippleIntensity.value = rippleIntensityScale;
      t.material.uniforms.uEdgeFade.value = edgeFade;
      if (t.liquidEffect) {
        t.liquidEffect.uniforms.get('uStrength').value = liquidStrength;
        t.liquidEffect.uniforms.get('uFreq').value = liquidWobbleSpeed;
      }
      if (t.touchTexture) {
        t.touchTexture.radiusScale = liquidRadius;
      }
      prevConfigRef.current = cfg;
      return;
    }

    // Clean up previous instance
    if (threeRef.current) {
      threeRef.current.dispose();
      threeRef.current = null;
    }

    prevConfigRef.current = cfg;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: transparent,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const c = new THREE.Color(color).convertLinearToSRGB();

    const clickPositions = [];
    const clickTimes = [];
    for (let i = 0; i < MAX_CLICKS; i++) {
      clickPositions.push(new THREE.Vector2(-1, -1));
      clickTimes.push(-9999);
    }

    const uniforms = {
      uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      uTime: { value: 0 },
      uPixelSize: { value: pixelSize },
      uScale: { value: patternScale },
      uDensity: { value: patternDensity },
      uShapeType: { value: SHAPE_MAP[variant] ?? 0 },
      uPixelJitter: { value: pixelSizeJitter },
      uEnableRipples: { value: enableRipples ? 1 : 0 },
      uRippleSpeed: { value: rippleSpeed },
      uRippleThickness: { value: rippleThickness },
      uRippleIntensity: { value: rippleIntensityScale },
      uEdgeFade: { value: edgeFade },
      uClickPos: { value: clickPositions },
      uClickTimes: { value: clickTimes }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SRC,
      fragmentShader: FRAGMENT_SRC,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      glslVersion: THREE.GLSL3
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let touchTexture = null;
    let liquidEffect = null;
    let composer = null;

    if (liquid) {
      touchTexture = createTouchTexture();
      touchTexture.radiusScale = liquidRadius;
      liquidEffect = createLiquidEffect(touchTexture.texture, {
        strength: liquidStrength,
        freq: liquidWobbleSpeed
      });
      composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType
      });
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new EffectPass(camera, liquidEffect));
    }

    if (noiseAmount > 0) {
      const noiseFragment = `
        uniform float uNoiseAmount;
        uniform float uNoiseTime;

        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
          float n = fract(sin(dot(uv + fract(uNoiseTime), vec2(12.9898, 78.233))) * 43758.5453);
          vec3 noise = vec3(n) * uNoiseAmount;
          outputColor = vec4(inputColor.rgb + noise * inputColor.a, inputColor.a);
        }
      `;
      const noiseEffect = new Effect('NoiseEffect', noiseFragment, {
        uniforms: new Map([
          ['uNoiseAmount', new THREE.Uniform(noiseAmount)],
          ['uNoiseTime', new THREE.Uniform(0)]
        ])
      });

      if (!composer) {
        composer = new EffectComposer(renderer, {
          frameBufferType: THREE.HalfFloatType
        });
        composer.addPass(new RenderPass(scene, camera));
      }
      composer.addPass(new EffectPass(camera, noiseEffect));

      // Store reference so we can update it in the animation loop
      liquidEffect = liquidEffect || null;
      touchTexture = touchTexture || null;
    }

    let clickIndex = 0;
    let animationTime = 0;
    let rafId = 0;
    let lastFrameTime = performance.now();

    const onPointerMove = (e) => {
      if (!touchTexture) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      touchTexture.addTouch({ x, y });
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) * dpr;
      const py = (rect.height - (e.clientY - rect.top)) * dpr;
      clickPositions[clickIndex].set(px, py);
      clickTimes[clickIndex] = animationTime;
      clickIndex = (clickIndex + 1) % MAX_CLICKS;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    // Intersection observer for auto-pause
    let observer = null;
    if (autoPauseOffscreen) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visibilityRef.current.visible = entry.isIntersecting;
          }
        },
        { threshold: 0 }
      );
      observer.observe(container);
    }

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (autoPauseOffscreen && !visibilityRef.current.visible) return;

      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      animationTime += delta * speedRef.current;
      uniforms.uTime.value = animationTime;

      if (touchTexture) {
        touchTexture.update();
      }

      if (liquidEffect) {
        liquidEffect.uniforms.get('uTime').value = animationTime;
      }

      if (composer) {
        composer.render(delta);
      } else {
        renderer.render(scene, camera);
      }
    };

    rafId = requestAnimationFrame(animate);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w === 0 || h === 0) continue;
        renderer.setSize(w, h);
        uniforms.uResolution.value.set(w * dpr, h * dpr);
        if (composer) {
          composer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    const dispose = () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      resizeObserver.disconnect();
      if (observer) observer.disconnect();
      if (composer) composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };

    threeRef.current = {
      renderer,
      scene,
      camera,
      material,
      geometry,
      mesh,
      composer,
      touchTexture,
      liquidEffect,
      dispose
    };

    return () => {
      if (threeRef.current) {
        threeRef.current.dispose();
        threeRef.current = null;
      }
    };
  }, [
    variant,
    pixelSize,
    color,
    antialias,
    patternScale,
    patternDensity,
    liquid,
    liquidStrength,
    liquidRadius,
    pixelSizeJitter,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    speed,
    transparent,
    edgeFade,
    noiseAmount
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
    />
  );
}
