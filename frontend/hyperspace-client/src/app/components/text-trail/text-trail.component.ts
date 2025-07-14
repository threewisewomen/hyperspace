import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import {
  Clock, Color, Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, WebGLRenderer, WebGLRenderTarget, CanvasTexture, LinearMipmapLinearFilter, LinearFilter, Vector3
} from 'three';

// Helper functions and shaders are correct and remain unchanged.
const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const loadFont = async (fam: string, weight: string | number): Promise<void> => {
  if ("fonts" in document) await (document as any).fonts.load(`${weight} 64px "${fam}"`);
};
const BASE_VERT = `varying vec2 v_uv; void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); v_uv=uv; }`;
const SIMPLEX = `vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float snoise3(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=inversesqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const PERSIST_FRAG = `uniform sampler2D sampler;uniform float time;uniform vec2 mousePos;uniform float noiseFactor,noiseScale,rgbPersistFactor,alphaPersistFactor;varying vec2 v_uv;${SIMPLEX} void main(){float a=snoise3(vec3(v_uv*noiseFactor,time*.1))*noiseScale;float b=snoise3(vec3(v_uv*noiseFactor,time*.1+100.))*noiseScale;vec4 t=texture2D(sampler,v_uv+vec2(a,b)+mousePos*.005);gl_FragColor=vec4(t.xyz*rgbPersistFactor,t.a*alphaPersistFactor);}`;
const TEXT_FRAG = `uniform sampler2D sampler;uniform vec3 color;varying vec2 v_uv;void main(){vec4 t=texture2D(sampler,v_uv);float alpha=smoothstep(0.1,0.9,t.a);if(alpha<0.01)discard;gl_FragColor=vec4(color,alpha);}`;

@Component({
  selector: 'app-text-trail',
  standalone: true,
  templateUrl: './text-trail.component.html',
  styleUrls: ['./text-trail.component.scss']
})
export class TextTrailComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  @Input() text: string = "Hyperspace";
  @Input() fontFamily: string = "Orbitron, sans-serif";
  @Input() fontWeight: string | number = "900";
  @Input() letterSpacing: number = 25;
  @Input() noiseFactor: number = 0.1;
  @Input() noiseScale: number = 0.0001;
  @Input() rgbPersistFactor: number = 0.96;
  @Input() alphaPersistFactor: number = 0.93;
  @Input() animateColor: boolean = true;
  @Input() startColor: string = "#e0e0e0";
  @Input() textColor?: string;
  @Input() colorCycleInterval: number = 3333;
  @Input() supersample: number = 2;

  private renderer!: WebGLRenderer;
  private clock!: Clock;
  private animationLoopId?: number;

  private persistColor: [number, number, number] = [1, 1, 1];
  private targetColor: [number, number, number] = [1, 1, 1];

  private rt0!: WebGLRenderTarget;
  private rt1!: WebGLRenderTarget;
  
  private fluidScene!: Scene;
  private textScene!: Scene;
  private camera!: OrthographicCamera;

  private fluidQuad!: Mesh;
  private textQuad!: Mesh;

  private mouse = new Vector2();
  private targetMouse = new Vector2();

  private resizeObserver!: ResizeObserver;
  private colorTimer?: number;
  private isInitialized = false;

  constructor(private ngZone: NgZone) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized) {
      if (changes['text'] || changes['fontFamily'] || changes['fontWeight'] || changes['letterSpacing']) {
        this.drawText();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.containerRef?.nativeElement) {
      this.init();
    }
  }

  ngOnDestroy(): void {
    this.cleanUp();
  }
  
  private cleanUp(): void {
    if (this.animationLoopId) cancelAnimationFrame(this.animationLoopId);
    if (this.colorTimer) clearInterval(this.colorTimer);
    if(this.containerRef?.nativeElement) this.containerRef.nativeElement.removeEventListener("pointermove", this.onMouseMove);
    this.resizeObserver?.disconnect();
    
    // Dispose of Three.js objects to free GPU memory
    this.rt0?.dispose(); this.rt1?.dispose();
    (this.fluidQuad?.material as ShaderMaterial)?.dispose(); this.fluidQuad?.geometry.dispose();
    (this.textQuad?.material as ShaderMaterial)?.dispose(); this.textQuad?.geometry.dispose();
    this.renderer?.dispose();
  }

  private init = async () => {
    const container = this.containerRef.nativeElement;
    const { width: w, height: h } = container.getBoundingClientRect();

    // Init state colors
    this.persistColor = hexToRgb(this.textColor || this.startColor).map(c => c / 255) as [number, number, number];
    this.targetColor = [...this.persistColor];

    // Init Three.js Core
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.fluidScene = new Scene();
    this.textScene = new Scene();
    this.clock = new Clock();
    this.camera = new OrthographicCamera(-w / 9, w / 9, h / 9, -h / 9, 0.1, 10);
    this.camera.position.z = 1;

    // Init Render Targets for the feedback loop
    this.rt0 = new WebGLRenderTarget(w, h);
    this.rt1 = this.rt0.clone();

    // Create the fluid quad (for the trail effect)
    const fluidQuadMat = new ShaderMaterial({
      uniforms: {
        sampler: { value: null }, time: { value: 0 }, mousePos: { value: this.mouse },
        noiseFactor: { value: this.noiseFactor }, noiseScale: { value: this.noiseScale },
        rgbPersistFactor: { value: this.rgbPersistFactor }, alphaPersistFactor: { value: this.alphaPersistFactor },
      },
      vertexShader: BASE_VERT, fragmentShader: PERSIST_FRAG, transparent: true
    });
    this.fluidQuad = new Mesh(new PlaneGeometry(w, h), fluidQuadMat);
    this.fluidScene.add(this.fluidQuad);

    // Create the text quad
    const textQuadMat = new ShaderMaterial({
      uniforms: { sampler: { value: null }, color: { value: new Vector3(...this.persistColor) } },
      vertexShader: BASE_VERT, fragmentShader: TEXT_FRAG, transparent: true,
    });
    this.textQuad = new Mesh(new PlaneGeometry(w,h), textQuadMat);
    this.textScene.add(this.textQuad);
    
    // Draw text onto a canvas texture, and once done, set up listeners and start animation.
    await this.drawText();
    this.initListeners();
    this.isInitialized = true;
    
    // We run the animation loop outside of Angular's zone to prevent unnecessary change detection cycles.
    this.ngZone.runOutsideAngular(() => {
        this.animationLoop();
    });
  }

  private drawText = async () => {
    try {
      await loadFont(this.fontFamily, this.fontWeight);
    } catch(e) {
      console.error("Font could not be loaded. Using default font.", e);
    }

    const texCanvas = document.createElement("canvas");
    const ctx = texCanvas.getContext("2d")!;
    if (!ctx) return;
    
    const maxTexSize = Math.min(this.renderer.capabilities.maxTextureSize, 4096);
    const pixelRatio = Math.min(window.devicePixelRatio, 2) * this.supersample;
    texCanvas.width = texCanvas.height = maxTexSize;

    ctx.scale(pixelRatio, pixelRatio);
    const scaledSize = maxTexSize / pixelRatio;

    ctx.clearRect(0, 0, scaledSize, scaledSize);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const refSize = 250;
    ctx.font = `${this.fontWeight} ${refSize}px ${this.fontFamily}`;

    // --- Letter spacing implementation ---
    ctx.letterSpacing = `${this.letterSpacing}px`;

    const textWidth = ctx.measureText(this.text).width;
    const finalFontSize = (refSize * scaledSize) / textWidth * 0.8; // Use 80% of width
    ctx.font = `${this.fontWeight} ${finalFontSize}px ${this.fontFamily}`;

    ctx.fillText(this.text, scaledSize / 2, scaledSize / 2);
    
    const texture = new CanvasTexture(texCanvas);
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    
    (this.textQuad.material as ShaderMaterial).uniforms['sampler'].value = texture;
  }
  
  private initListeners = () => {
    const container = this.containerRef.nativeElement;
    container.addEventListener("pointermove", this.onMouseMove);

    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.runOutsideAngular(() => {
        const { width: w, height: h } = container.getBoundingClientRect();
        this.renderer.setSize(w, h);
        this.rt0.setSize(w,h); this.rt1.setSize(w,h);
        this.camera.left = -w/2; this.camera.right = w/2;
        this.camera.top = h/2; this.camera.bottom = -h/2;
        this.camera.updateProjectionMatrix();
        this.fluidQuad.geometry = new PlaneGeometry(w,h);
        this.textQuad.geometry = new PlaneGeometry(w,h);
      });
    });
    this.resizeObserver.observe(container);

    if (this.animateColor && !this.textColor) {
      this.colorTimer = window.setInterval(() => {
        this.targetColor = [Math.random(), Math.random(), Math.random()];
      }, this.colorCycleInterval);
    }
  }

  private onMouseMove = (e: PointerEvent): void => {
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    // This coordinate system correction is vital.
    this.targetMouse.x = e.clientX - rect.left - rect.width / 2;
    this.targetMouse.y = -(e.clientY - rect.top - rect.height / 2);
  };
  
  private animationLoop = (): void => {
    // This is the definitive, corrected render loop.
    this.animationLoopId = requestAnimationFrame(this.animationLoop);
    
    const dt = this.clock.getDelta();
    const fluidMat = this.fluidQuad.material as ShaderMaterial;
    const textMat = this.textQuad.material as ShaderMaterial;

    // --- Update state (color, mouse position) ---
    if (this.animateColor && !this.textColor) {
        for (let i = 0; i < 3; i++) this.persistColor[i] += (this.targetColor[i] - this.persistColor[i]) * dt;
    }
    this.mouse.lerp(this.targetMouse, dt * 0.0111);
    
    // --- Update shader uniforms ---
    fluidMat.uniforms['mousePos'].value = this.mouse;
    fluidMat.uniforms['time'].value = this.clock.getElapsedTime();
    const colorVec = textMat.uniforms['color'].value as Vector3;
    colorVec.x = this.persistColor[0];
    colorVec.y = this.persistColor[1];
    colorVec.z = this.persistColor[2];

    // --- Render Pass 1: Draw to off-screen buffer ---
    // The fluid shader uses the *previous* frame's texture (`rt1`) as its input.
    fluidMat.uniforms['sampler'].value = this.rt1.texture;
    // Set the render target to our primary off-screen buffer (`rt0`).
    this.renderer.setRenderTarget(this.rt0);
    // Render the fluid scene (the trail from the last frame).
    this.renderer.render(this.fluidScene, this.camera);
    // Render the new, crisp text on top of the trail in the same buffer.
    this.renderer.render(this.textScene, this.camera);

    // --- Render Pass 2: Draw the result to the screen ---
    // The fluid shader's input is now the texture we just created (`rt0`).
    fluidMat.uniforms['sampler'].value = this.rt0.texture;
    // Set the render target back to the main canvas.
    this.renderer.setRenderTarget(null);
    // Render the final composition.
    this.renderer.render(this.fluidScene, this.camera);

    // --- Swap targets for the next frame ---
    // The buffer we just wrote to (`rt0`) now becomes the input for the next frame (`rt1`).
    [this.rt0, this.rt1] = [this.rt1, this.rt0];
  }
}