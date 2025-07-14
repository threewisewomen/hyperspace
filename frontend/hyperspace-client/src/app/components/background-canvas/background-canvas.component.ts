import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

// This is the core logic from the React component, translated to pure Three.js
const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

@Component({
  selector: 'app-background-canvas',
  standalone: true,
  template: '<canvas #canvasElement class="fixed top-0 left-0 w-full h-full -z-10"></canvas>',
  styles: ``
})
export class BackgroundCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') private canvasRef!: ElementRef<HTMLCanvasElement>;

  // These inputs mirror the props of the React component
  @Input() speed: number = 5;
  @Input() scale: number = 1;
  @Input() color: string = "#7B7481";
  @Input() noiseIntensity: number = 1.5;
  @Input() rotation: number = 0;

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera; // Using an Orthographic camera for a 2D effect
  private renderer!: THREE.WebGLRenderer;
  private planeMesh!: THREE.Mesh;
  private animationFrameId: number | undefined;

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }

  private initThreeJs(): void {
    // --- 1. Set up the Scene and Camera ---
    this.scene = new THREE.Scene();
    // An OrthographicCamera is used for 2D planes because it has no perspective.
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // --- 2. Set up the Renderer ---
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
    this.updateRendererSize();
    window.addEventListener('resize', this.onWindowResize); // Handle browser resizing

    // --- 3. Define the Shaders (Copied directly from the React component) ---
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3  uColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uRotation;
      uniform float uNoiseIntensity;
      const float e = 2.71828182845904523536;

      float noise(vec2 texCoord) {
        float G = e;
        vec2 r = (G * sin(G * texCoord));
        return fract(r.x * r.y * (1.0 + texCoord.x));
      }

      vec2 rotateUvs(vec2 uv, float angle) {
        float c = cos(angle); float s = sin(angle);
        mat2 rot = mat2(c, -s, s, c);
        return rot * uv;
      }

      void main() {
        float rnd = noise(gl_FragCoord.xy);
        vec2 uv = rotateUvs(vUv, uRotation);
        vec2 tex = uv * uScale;
        float tOffset = uSpeed * uTime;
        tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
        float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
        vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
        col.a = 1.0;
        gl_FragColor = col;
      }
    `;

    // --- 4. Create the ShaderMaterial with Uniforms ---
    // 'Uniforms' are variables we pass from our TypeScript code to the GLSL shader code.
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: this.speed },
        uScale: { value: this.scale },
        uNoiseIntensity: { value: this.noiseIntensity },
        uRotation: { value: this.rotation },
        uColor: { value: new THREE.Color(...hexToNormalizedRGB(this.color)) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // --- 5. Create the full-screen plane mesh ---
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.planeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.planeMesh);
  }

  // --- 6. The Animation Loop ---
  // This is the equivalent of `useFrame` in react-three-fiber
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Update the 'uTime' uniform on every frame to drive the animation.
    const material = this.planeMesh.material as THREE.ShaderMaterial;
    material.uniforms['uTime'].value += 0.005;

    this.renderer.render(this.scene, this.camera);
  }

  // Helper function to handle window resizing, equivalent to what react-three-fiber does automatically
  private onWindowResize = () => {
    this.updateRendererSize();
  }

  private updateRendererSize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}