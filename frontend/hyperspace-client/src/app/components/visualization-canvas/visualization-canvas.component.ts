// --- FIX: ADD MISSING IMPORTS ---
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, Input, SimpleChanges, OnChanges, inject } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';
// --- FIX: ADD MISSING IMPORTS ---
import { SignalrService, SceneUpdate } from '../../services/signalr.service';


@Component({
  selector: 'app-visualization-canvas',
  template: '<canvas #canvasElement class="w-full h-full"></canvas>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  standalone: true,
})
export class VisualizationCanvasComponent implements AfterViewInit, OnDestroy, OnChanges {
  // A reference to the <canvas> element in our template
  @ViewChild('canvasElement') private canvasRef!: ElementRef<HTMLCanvasElement>;

  // An Input property to receive vertex data from a parent component (like AppComponent)
  @Input() public vertices: number[] = [];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  // This property will hold our 3D object, which could be a mesh or a point cloud
  private shapeMesh!: THREE.Mesh | THREE.Points;
  private animationFrameId: number | undefined;
  
  private sceneUpdateSubscription?: Subscription;
  // Inject the SignalR service using the modern `inject` function
  private signalrService = inject(SignalrService);

  /**
   * OnChanges lifecycle hook to detect when new `vertices` data arrives.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vertices'] && changes['vertices'].currentValue.length > 0) {
      if (this.scene) {
        this.updateShape();
      }
    }
  }

  /**
   * AfterViewInit lifecycle hook fires once the component's view is ready.
   */
  ngAfterViewInit(): void {
    this.initThreeJs();
    this.updateShape(); // Perform an initial draw of the placeholder shape
    this.animate(); // Start the rendering loop

    // Subscribe to the real-time scene update stream from our service
    this.sceneUpdateSubscription = this.signalrService.sceneUpdateReceived
      .subscribe((update: SceneUpdate) => {
        // When we receive an update from the backend, apply its properties to our 3D object
        if (this.shapeMesh) {
          this.shapeMesh.rotation.y = update.rotation.y;
        }
      });
  }

  /**
   * OnDestroy lifecycle hook to clean up resources and prevent memory leaks.
   */
  ngOnDestroy(): void {
    // --- FIX: RE-ORDERED AND CORRECTED CLEANUP ---
    // 1. First, stop receiving any new data by unsubscribing.
    this.sceneUpdateSubscription?.unsubscribe();
    
    // 2. Then, stop the animation loop.
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // 3. Finally, release the WebGL context and related resources.
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  /**
   * The core method to create or replace the 3D shape in the scene.
   * This method is correct as you have it.
   */
  private updateShape(): void {
    if (this.shapeMesh) {
      this.scene.remove(this.shapeMesh);
      this.shapeMesh.geometry.dispose();
      (this.shapeMesh.material as THREE.Material).dispose();
    }

    let geometry: THREE.BufferGeometry;

    if (this.vertices && this.vertices.length > 0) {
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
      geometry.computeVertexNormals();

      const pointsMaterial = new THREE.PointsMaterial({ color: 0x61dafb, size: 0.05, sizeAttenuation: true });
      this.shapeMesh = new THREE.Points(geometry, pointsMaterial);
    } else {
      geometry = new THREE.IcosahedronGeometry(1.5, 1);
      const meshMaterial = new THREE.MeshStandardMaterial({ color: 0x9861fb, flatShading: true, wireframe: false });
      this.shapeMesh = new THREE.Mesh(geometry, meshMaterial);
    }

    this.scene.add(this.shapeMesh);
  }

  /**
   * This method sets up the initial, one-time configuration of the Three.js environment.
   * This method is correct as you have it.
   */
  private initThreeJs(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x282c34);

    const aspectRatio = this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }

  /**
   * The animation loop, which is called continuously to render frames.
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    // --- FIX: REMOVED THE SELF-ROTATION LOGIC ---
    // This is the CRITICAL change. The rotation is now 100% controlled by SignalR.
    //
    // DELETED:
    // if (this.shapeMesh) {
    //   this.shapeMesh.rotation.y += 0.002;
    // }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}