// Fragment shader for the fluid nebula effect
// Uses Fractional Brownian Motion (FBM) + domain warping
// Scroll-driven via uniforms for storytelling

precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uScrollProgress;    // 0.0 to 1.0
uniform vec2 uResolution;
uniform vec2 uMouse;              // normalized mouse position
uniform float uIntensity;         // overall brightness
uniform float uColorShift;        // hue offset per section

// Simplex-like noise (hash-based)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,   // (3.0-sqrt(3.0))/6.0
    0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
    -0.577350269189626,  // -1.0 + 2.0 * C.x
    0.024390243902439    // 1.0 / 41.0
  );
  
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  
  return 130.0 * dot(m, g);
}

// Fractional Brownian Motion
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Domain warping for organic fluid look
vec2 domainWarp(vec2 p, float t, float warpStrength) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0), 5),
    fbm(p + vec2(5.2, 1.3), 5)
  );
  
  vec2 r = vec2(
    fbm(p + warpStrength * q + vec2(1.7, 9.2) + 0.15 * t, 5),
    fbm(p + warpStrength * q + vec2(8.3, 2.8) + 0.126 * t, 5)
  );
  
  return r;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  
  // Slow time for ambient motion
  float t = uTime * 0.06;
  
  // Scroll parameter
  float scroll = uScrollProgress;
  
  // Mouse influence (subtle interactive flow)
  vec2 mouseInfluence = (uMouse - 0.5) * 0.15;
  
  // Warp strength and scale
  float warpStrength = 2.5;
  float scale = 2.0 + scroll * 0.5; // Slight zoom on scroll
  vec2 offset = vec2(0.0, scroll * -0.5);
  
  // Domain warp
  vec2 warp = domainWarp(p * scale + offset + mouseInfluence, t, warpStrength);
  
  // Final noise value
  float n = fbm(p * scale + warp * 2.0 + offset, 6);
  
  // --------------------------------------------------------
  // OBSIDIAN & ELECTRIC BLUE THEME
  // --------------------------------------------------------
  
  // The obsidian base: deep black with subtle dark gray reflections
  vec3 obsidianBase = vec3(0.015, 0.015, 0.02);
  vec3 rockHighlight = vec3(0.04, 0.04, 0.05);
  
  // Base surface texture (rock)
  float rockTex = fbm(p * 5.0 + warp * 0.5, 4);
  vec3 rock = mix(obsidianBase, rockHighlight, smoothstep(0.3, 0.7, rockTex));
  
  // Fluid energy: pure electric blue
  vec3 electricBlue = vec3(0.082, 0.647, 1.0); // #15A5FE
  vec3 deepBlueEnergy = vec3(0.02, 0.1, 0.3);
  
  // Isolate the fluid paths (where the noise is high)
  float fluidPath = smoothstep(0.5, 0.75, n);
  float fluidCore = smoothstep(0.65, 0.9, n);
  
  // Mix energy colors from deep to bright core
  vec3 energy = mix(deepBlueEnergy, electricBlue, fluidCore);
  
  // Blend rock surface with fluid energy
  vec3 color = mix(rock, energy, fluidPath);
  
  // Add an intense glowing core for the brightest electric spots
  color += electricBlue * fluidCore * 1.5;
  
  // Apply overall intensity
  color *= uIntensity;
  
  // Vignette — darken edges heavily to keep focus on center and blend into background
  float vignette = 1.0 - smoothstep(0.2, 1.4, length(p));
  color *= vignette;
  
  // Subtle grain for physical obsidian texture
  float grain = (snoise(uv * 400.0 + t * 100.0) * 0.5 + 0.5) * 0.015;
  color += grain;
  
  // Output solid alpha since this is our pure dark background
  gl_FragColor = vec4(color, 1.0);
}
