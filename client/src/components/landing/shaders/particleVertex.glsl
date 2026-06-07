// Particle vertex shader
// Handles particle positioning, sizing, and state-based motion

attribute float aSize;
attribute float aRandom;
attribute vec3 aTarget;       // target position for current state
attribute float aSpeed;

uniform float uTime;
uniform float uScrollProgress;
uniform float uTransition;    // 0-1 interpolation to target
uniform float uPointSize;

varying float vAlpha;
varying float vRandom;

void main() {
  vRandom = aRandom;
  
  // Interpolate between current and target positions
  vec3 pos = mix(position, aTarget, uTransition);
  
  // Add ambient motion based on time
  float wobble = sin(uTime * aSpeed + aRandom * 6.28) * 0.02;
  pos.x += wobble;
  pos.y += cos(uTime * aSpeed * 0.7 + aRandom * 3.14) * 0.015;
  pos.z += sin(uTime * aSpeed * 0.5 + aRandom * 1.57) * 0.01;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Size attenuation for depth
  float sizeAtten = uPointSize * aSize / (-mvPosition.z);
  gl_PointSize = max(sizeAtten, 1.0);
  
  // Alpha based on depth and random
  float depthAlpha = smoothstep(-8.0, -1.0, mvPosition.z);
  vAlpha = depthAlpha * (0.3 + aRandom * 0.7);
  
  gl_Position = projectionMatrix * mvPosition;
}
