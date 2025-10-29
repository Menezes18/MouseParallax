

export const vertexShader = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const fragmentShader = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.95, 0.65, 0.05, 1.0);
  }
`;

