export const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision mediump float;

  uniform sampler2D uFluid;           // máscara (R) do fluido
  uniform sampler2D uTopTexture;      // imagem do topo
  uniform sampler2D uBottomTexture;   // imagem do fundo

  uniform vec2 uTopTextureSize;       // tamanho da textura do topo (px)
  uniform vec2 uBottomTextureSize;    // tamanho da textura do fundo (px)
  uniform vec2 uResolution;           // resolução do render (px)
  uniform float uDpr;                 // device pixel ratio

  varying vec2 vUv;

  // Ajusta UV para strategy "cover" mantendo proporção
  vec2 getCoverUV(vec2 uv, vec2 texSize) {
    float rs = uResolution.x / uResolution.y; // aspecto da tela
    float ts = texSize.x / texSize.y;         // aspecto da textura

    if (rs < ts) {
      // tela mais "alta" que a textura → expandir em X
      uv.x = (uv.x - 0.5) * (ts / rs) + 0.5;
    } else {
      // tela mais "larga" → expandir em Y
      uv.y = (uv.y - 0.5) * (rs / ts) + 0.5;
    }
    return uv;
  }
  `;
  const displayFragmentShader = `
  uniform sampler2D uFluid;
  uniform sampler2D uTopTexture;
  uniform sampler2D uBottomTexture;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform vec2 uTopTextureSize;
  uniform vec2 uBottomTextureSize;

  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
      if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

      vec2 s = uResolution / textureSize;

      float scale = max(s.x, s.y);

      vec2 scaledSize = textureSize * scale;

      vec2 offset = (uResolution - scaledSize) * 0.5;

      return (uv * uResolution - offset) / scaledSize;
  }


  void main() {
    float fluid = texture2D(uFluid, vUv).r;

    vec2 topUV = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);

    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);

    float threshold = 0.02;
    float edgeWidth = 0.004 / uDpr;

    float t = smoothstep(threshold, threshold + edgeWidth, fluid);

    vec4 finalColor = mix(topColor, bottomColor, t);
    gl_FragColor = finalColor;
  }
`;
export { vertexShader, fragmentShader, displayFragmentShader };