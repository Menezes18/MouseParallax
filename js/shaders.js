const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidFragmentShader = `
  precision mediump float;

  uniform sampler2D uPrevTrails;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform vec2 uResolution;
  uniform float uDecay;
  uniform bool uIsMoving;

  varying vec2 vUv;

  void main() {
    vec4 prevState = texture2D(uPrevTrails, vUv);
    float newValue = prevState.r * uDecay;

    if (uIsMoving) {
      vec2 mouseDirection = uMouse - uPrevMouse;
      float lineLength = length(mouseDirection);
      if (lineLength > 0.001) {
        vec2 mouseDir = mouseDirection / lineLength;
        vec2 toPixel = vUv - uPrevMouse;
        float projAlong = dot(toPixel, mouseDir);
        projAlong = clamp(projAlong, 0.0, lineLength);
        vec2 closestPoint = uPrevMouse + projAlong * mouseDir;
        float dist = length(vUv - closestPoint);
        float lineWidth = 0.09;
        float intensity = smoothstep(lineWidth, 0.0, dist) * 0.3;
        newValue += intensity;
      }
    }

    gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
  }
`;

const displayFragmentShader = `
  precision mediump float;

  uniform sampler2D uFluid;
  uniform sampler2D uTopTexture;
  uniform sampler2D uBottomTexture;
  uniform vec2 uTopTextureSize;
  uniform vec2 uBottomTextureSize;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform float uPanY; // deslocamento vertical em pixels

  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
    vec2 s = uResolution / textureSize;
    float scale = min(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset - vec2(0.0, uPanY)) / scaledSize;
  }
  
  float inBounds(vec2 uv) {
    float inX = step(0.0, uv.x) * step(uv.x, 1.0);
    float inY = step(0.0, uv.y) * step(uv.y, 1.0);
    return inX * inY;
  }

  void main() {
    float fluid = texture2D(uFluid, vUv).r;
    vec2 topUV = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);
    float inTop = inBounds(topUV);
    float inBottom = inBounds(bottomUV);
    topUV = clamp(topUV, 0.0, 1.0);
    bottomUV = clamp(bottomUV, 0.0, 1.0);
    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);
    float threshold = 0.02;
    float edgeWidth = 0.004 / uDpr;
    float t = smoothstep(threshold, threshold + edgeWidth, fluid);
    vec4 finalColor = mix(topColor, bottomColor, t);
    float inAny = max(inTop, inBottom);
    finalColor = mix(vec4(1.0), finalColor, inAny);
    gl_FragColor = finalColor;
  }
`;

export { vertexShader, fluidFragmentShader, displayFragmentShader };
