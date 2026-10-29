// One fragment shader paints the whole painted backdrop so motion, light and depth are shared across
// the paintings, the chrome and the atmosphere. Region masks are derived from the artwork itself:
//   sky     – analytic region (upper right) where the clouds and moon live
//   fabric  – red cloth (red channel dominates)
//   chrome  – bright, low-saturation metal
// Marble figures match none of them, so they stay still like paintings.
// Every term is a continuous function of time (no fract/floor of t), so nothing ever resets.

export const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uBoost; // 1 = base motion; higher = bigger, faster, brighter
varying vec2 vUv;

const vec2 ASPECT = vec2(1.5, 1.0);
const vec2 PX = vec2(1.0 / 1536.0, 1.0 / 1024.0);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return v;
}

float chromeAt(vec2 uv) {
  vec3 c = texture2D(uTex, uv).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  float sat = (max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b))) / (max(c.r, max(c.g, c.b)) + 0.001);
  return smoothstep(0.42, 0.72, l) * (1.0 - smoothstep(0.14, 0.34, sat));
}
float fabricAt(vec2 uv) {
  vec3 c = texture2D(uTex, uv).rgb;
  return smoothstep(0.07, 0.26, c.r - max(c.g, c.b)) * smoothstep(0.1, 0.28, c.r);
}

// Particles: an endlessly scrolling grid of sparse motes, so none ever pops in or out.
vec3 motes(vec2 uv, float t, float scale, float speed, float seed) {
  vec2 pp = uv * vec2(1.5, 1.0) * scale + vec2(t * speed * 0.35, -t * speed) + seed;
  vec2 cell = floor(pp);
  vec2 f = fract(pp) - 0.5;
  float h = hash(cell + seed);
  if (h < 0.9) return vec3(0.0);
  vec2 pos = (vec2(hash(cell + 1.7), hash(cell + 3.1)) - 0.5) * 0.6;
  float a = smoothstep(0.16, 0.0, length(f - pos)) * (0.5 + 0.5 * sin(t * (0.6 + h) + h * 40.0));
  vec3 tint = mix(vec3(0.95, 0.82, 0.7), vec3(1.0, 0.2, 0.25), step(0.55, hash(cell + 5.3)));
  return tint * a;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * ASPECT;
  float B = uBoost;
  float t = uTime * (1.0 + (B - 1.0) * 0.5);

  // soft masks, averaged over a few taps so they are not speckled by single pixels
  float fabric = 0.0;
  float chrome = 0.0;
  vec2 offs[5];
  offs[0] = vec2(0.0); offs[1] = vec2(7.0, 0.0); offs[2] = vec2(-7.0, 0.0);
  offs[3] = vec2(0.0, 7.0); offs[4] = vec2(0.0, -7.0);
  for (int i = 0; i < 5; i++) {
    fabric += fabricAt(uv + offs[i] * PX);
    chrome += chromeAt(uv + offs[i] * PX);
  }
  fabric *= 0.2;
  chrome *= 0.2;
  float sky = smoothstep(0.36, 0.5, uv.x) * smoothstep(0.04, 0.1, uv.y) * (1.0 - smoothstep(0.3, 0.42, uv.y));

  // displacement: clouds drift, cloth flows, metal barely breathes; the sky and the water sway
  // against each other for a little depth.
  vec2 cloud = vec2(fbm(p * 1.6 + vec2(t * 0.03, 0.0)), fbm(p * 1.6 + vec2(5.2, t * 0.022))) - 0.5;
  vec2 flow = vec2(noise(p * 5.0 + vec2(t * 0.16, t * 0.11)), noise(p * 5.0 + vec2(9.7 - t * 0.12, t * 0.14))) - 0.5;
  vec2 deform = vec2(noise(p * 7.0 + vec2(t * 0.04, 3.0)), noise(p * 7.0 + vec2(11.0 - t * 0.03, t * 0.05))) - 0.5;
  vec2 sway = vec2(sin(t * 0.08), cos(t * 0.06));
  float water = smoothstep(0.62, 0.8, uv.y);
  vec2 disp = cloud * 0.022 * sky
            + flow * 0.012 * fabric * (1.0 - chrome)
            + deform * 0.0035 * chrome
            + sway * 0.004 * sky
            - sway * 0.002 * water;
  disp *= B;
  vec3 col = texture2D(uTex, uv + disp).rgb;

  // liquid chrome: a slow highlight travels along the metal, with rare glints
  float band = sin(dot(uv, vec2(0.82, 0.57)) * 11.0 - t * 0.5 + fbm(p * 2.0 + t * 0.03) * 5.0);
  float sweep = pow(max(band, 0.0), 4.0);
  vec2 gp = uv * vec2(120.0, 80.0);
  float h = hash(floor(gp));
  float glint = step(0.94, h) * pow(max(0.0, sin(t * (0.5 + 0.6 * h) + h * 60.0)), 10.0) * smoothstep(0.5, 0.0, length(fract(gp) - 0.5));
  col += vec3(1.0, 0.93, 0.9) * chrome * (sweep * 0.38 + glint * 1.0) * B;

  // the painting answers the chrome: faint crimson bleed next to the passing highlight
  float wide = (chromeAt(uv + vec2(22.0, 0.0) * PX) + chromeAt(uv - vec2(22.0, 0.0) * PX)
              + chromeAt(uv + vec2(0.0, 22.0) * PX) + chromeAt(uv - vec2(0.0, 22.0) * PX)) * 0.25;
  col += vec3(0.55, 0.06, 0.08) * wide * (1.0 - chrome) * pow(max(band, 0.0), 3.0) * 0.14 * B;

  // moonlight breathes
  float md = length((uv - vec2(0.7305, 0.158)) * ASPECT);
  float moon = 1.0 + 0.12 * sin(t * 0.3) + 0.08 * sin(t * 0.19 + 1.7);
  col += vec3(1.0, 0.84, 0.62) * exp(-md * md * 60.0) * 0.14 * (1.0 + (moon - 1.0) * B) * B;

  // slow drift of overall illumination
  col *= 1.0 + (0.16 * (noise(p * 1.1 + vec2(t * 0.03, t * 0.02)) - 0.5) + 0.06 * sin(t * 0.1)) * B;

  // occasional restrained crimson light scatter
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(0.2 + 0.3 * fi + 0.1 * sin(t * 0.03 + fi * 2.0), 0.5 + 0.2 * sin(t * 0.025 + fi * 1.7));
    float d = length((uv - c) * ASPECT);
    float on = pow(max(0.0, sin(t * 0.12 + fi * 2.1)), 3.0);
    col += vec3(0.9, 0.05, 0.08) * exp(-d * d * 8.0) * on * 0.16 * B;
  }

  // haze, thicker near the water
  float fog = fbm(p * 1.4 + vec2(t * 0.03, -t * 0.02));
  col = mix(col, vec3(0.22, 0.17, 0.19), smoothstep(0.45, 0.8, fog) * min(0.22 * B, 0.6) * (0.2 + 0.8 * smoothstep(0.45, 1.0, uv.y)));

  // fine drifting particles on two depths
  col += (motes(uv, t, 70.0, 0.08, 0.0) * 0.16 + motes(uv, t, 120.0, 0.12, 41.0) * 0.1) * B;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
