import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
@Component({
  selector: 'app-visualization-canvas',
  template: '<canvas #canvasElement class="w-full h-full"></canvas>',
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  standalone: true
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

  /**
   * OnChanges is an Angular lifecycle hook that fires when any @Input properties change.
   * We use it to detect when new `vertices` data arrives from the parent component.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'vertices' input property has changed and is not the initial empty value.
    if (changes['vertices'] && changes['vertices'].currentValue.length > 0) {
      // If the scene is already initialized, update the shape.
      // This handles file uploads that happen after the initial page load.
      if (this.scene) {
        this.updateShape();
      }
    }
  }

  /**
   * AfterViewInit is an Angular lifecycle hook that fires once after the component's view
   * (and its child elements like our <canvas>) has been initialized.
   * This is the perfect place to set up our Three.js scene.
   */
  ngAfterViewInit(): void {
    this.initThreeJs();
    this.updateShape(); // Perform an initial draw of the shape (which will be the default placeholder)
    this.animate(); // Start the rendering loop
  }

  /**
   * OnDestroy is a lifecycle hook that fires just before the component is removed from the DOM.
   * It's crucial for cleaning up resources to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Release memory used by the WebGL renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  /**
   * The core method to create or replace the 3D shape in the scene.
   */
  private updateShape(): void {
    // If a shape already exists in the scene, we must remove it before adding a new one.
    if (this.shapeMesh) {
      this.scene.remove(this.shapeMesh);
      // It's also good practice to dispose of the old geometry and material to free up GPU memory
      this.shapeMesh.geometry.dispose();
      (this.shapeMesh.material as THREE.Material).dispose();
    }

    let geometry: THREE.BufferGeometry;

    // Check if we have received vertex data from an uploaded file.
    if (this.vertices && this.vertices.length > 0) {
      // Create a geometry from the incoming vertex array.
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
      geometry.computeVertexNormals(); // Calculate normals for proper lighting if we use a Mesh

      // Use a PointsMaterial to create a "point cloud" effect, which looks great for this kind of data.
      const pointsMaterial = new THREE.PointsMaterial({ color: 0x61dafb, size: 0.05, sizeAttenuation: true });
      this.shapeMesh = new THREE.Points(geometry, pointsMaterial);

    } else {
      // If no vertices are provided, create a nice-looking default placeholder shape.
      // An Icosahedron looks more complex and "scientific" than a cube.
      geometry = new THREE.IcosahedronGeometry(1.5, 1); // A sphere with a radius of 1.5
      const meshMaterial = new THREE.MeshStandardMaterial({ color: 0x9861fb, flatShading: true, wireframe: false });
      this.shapeMesh = new THREE.Mesh(geometry, meshMaterial);
    }

    // Add the newly created shape to our scene.
    this.scene.add(this.shapeMesh);
  }

  /**
   * This method sets up the initial, one-time configuration of the Three.js environment.
   */
  private initThreeJs(): void {
    // The Scene is the container for all objects, lights, and cameras.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x282c34); // A dark, modern background color

    // The Camera defines what we see.
    const aspectRatio = this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 5; // Move the camera back from the origin to see the object

    // The Renderer does the magic of drawing the scene onto the <canvas>.
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // Render at the screen's native resolution

    // The Controls allow the user to interact with the scene using the mouse.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Makes the rotation feel smoother
    this.controls.dampingFactor = 0.05;

    // The Lights make the objects visible.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft, global light
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // A light acting like the sun
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }

  /**
   * The animation loop, which is called continuously to render frames.
   */
  private animate = (): void => {
    // requestAnimationFrame schedules the next repaint of the screen. It's the standard way to create animations.
    this.animationFrameId = requestAnimationFrame(this.animate);

    // If a shape exists, give it a slow, continuous rotation.
    if (this.shapeMesh) {
      this.shapeMesh.rotation.y += 0.002;
    }

    // This must be called in the loop if damping is enabled for the controls.
    this.controls.update();

    // Render the scene from the perspective of the camera.
    this.renderer.render(this.scene, this.camera);
  }
}