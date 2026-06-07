// Particle fragment shader
// Renders soft, glowing circular particles

precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;
varying float vRandom;

void main() {
  // Create soft circular particle
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Soft circle with glow
  float circle = 1.0 - smoothstep(0.0, 0.5, dist);
  float glow = exp(-dist * 4.0) * 0.4;
  float alpha = (circle + glow) * vAlpha * uOpacity;
  
  // Slight color variation per particle
  vec3 color = uColor * (0.8 + vRandom * 0.4);
  
  if (alpha < 0.01) discard;
  
  gl_FragColor = vec4(color, alpha);
}
