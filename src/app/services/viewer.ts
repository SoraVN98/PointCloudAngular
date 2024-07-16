import { PerspectiveCamera, Scene, WebGLRenderer, Vector3, Box3, AmbientLight, DirectionalLight, Vector2, Raycaster } from 'three';
import { PointCloudOctree, Potree } from '@pnext/three-loader';
import { CameraControls } from './camera-controls';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

export class Viewer {
  /**
   * The element where we will insert our canvas.
   */
  private targetEl: HTMLElement | undefined;
  /**
   * The ThreeJS renderer used to render the scene.
   */
  private renderer = new WebGLRenderer();
  /**
   * Our scene which will contain the point cloud.
   */
  private scene = new Scene();
  /**
   * The camera used to view the scene.
   */
  private light = new AmbientLight(0x404040); // soft white light
  private directionalLight1 = new DirectionalLight(0xffeeff, 0.8);
  private directionalLight2 = new DirectionalLight(0xffffff, 0.8);
  private camera = new PerspectiveCamera(45, NaN, 0.1, 1000);
  /**
   * Controls which update the position of the camera.
   */
  private cameraControls = new CameraControls(this.camera);

  /**
   * Out potree instance which handles updating point clouds, keeps track of loaded nodes, etc.
   */
  private potree = new Potree();
  /**
   * Array of point clouds which are in the scene and need to be updated.
   */
  private pointClouds: PointCloudOctree[] = [];
  /**
   * The time (milliseconds) when `loop()` was last called.
   */
  private prevTime: number | undefined;
  /**
   * requestAnimationFrame handle we can use to cancel the viewer loop.
   */
  private reqAnimationFrameHandle: number | undefined;
  /**
   * Private point cloud Octree instance keep for the destroy function.
   */
  // @ts-ignore
  private pointCloudOctree: PointCloudOctree;
  private transformControls: TransformControls[] = [];
  /**
   * Initializes the viewer into the specified element.
   *
   * @param targetEl
   *    The element into which we should add the canvas where we will render the scene.
   */
  initialize(targetEl: HTMLElement): void {
    if (this.targetEl || !targetEl) {
      return;
    }

    this.targetEl = targetEl;
    targetEl.appendChild(this.renderer.domElement);

    this.directionalLight1.position.set(1, 1, 1);
    this.directionalLight2.position.set(- 1, 0.5, - 1);
    this.scene.add(this.light);
    this.scene.add(this.directionalLight1);
    this.scene.add(this.directionalLight2);

    this.resize();
    window.addEventListener('resize', this.resize);
    // Manage zoom
    window.addEventListener('wheel', this.cameraControls.handleMouseWheel.bind(this.cameraControls), false);
    // Manage click
    window.addEventListener('mousedown', this.cameraControls.onMouseDown.bind(this.cameraControls), false);
    // manage move
    window.addEventListener('mousemove', this.cameraControls.onMouseMove.bind(this.cameraControls), false);
    // manage mouse up to stop the rotation
    window.addEventListener('mouseup', this.cameraControls.onMouseUp.bind(this.cameraControls), false);
    // select mesh to translate, rotate, scale
    window.addEventListener('dblclick', (event) => { this.addTransformControls(event) }, false);

    requestAnimationFrame(this.loop);
  }

  /**
   * Performs any cleanup necessary to destroy/remove the viewer from the page.
   */
  destroy(): void {
    if (this.targetEl) {
      this.targetEl.removeChild(this.renderer.domElement);
      this.targetEl = undefined;
    }

    // Remove all listeners.
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('wheel', this.cameraControls.handleMouseWheel, false);
    window.removeEventListener('mousedown', this.cameraControls.onMouseDown, false);
    window.removeEventListener('mousemove', this.cameraControls.onMouseMove, false);
    window.removeEventListener('mouseup', this.cameraControls.onMouseUp, false);

    // Scene optimisation on destroy.
    this.scene.remove(this.pointCloudOctree);
    this.pointClouds.slice(0);

    if (this.reqAnimationFrameHandle !== undefined) {
      cancelAnimationFrame(this.reqAnimationFrameHandle);
    }
  }

  /**
   * Loads a point cloud into the viewer and returns it.
   *
   * @param fileName
   *    The name of the point cloud which is to be loaded.
   * @param baseUrl
   *    The url where the point cloud is located and from where we should load the octree nodes.
   */
  load(fileName: string, baseUrl: string): Promise<PointCloudOctree> {
    return this.potree
      .loadPointCloud(
        // The file name of the point cloud which is to be loaded.
        fileName,
        // Given the relative URL of a file, should return a full URL.
        url => `${baseUrl}${url}`
      )
      .then((pco: PointCloudOctree) => {
        // Add the point cloud to the scene and to our list of
        // point clouds. We will pass this list of point clouds to
        // potree to tell it to update them.
        this.scene.add(pco);
        this.pointClouds.push(pco);
        this.pointCloudOctree = pco;

        return pco;
      });
  }

  /**
   * Updates the point clouds, cameras or any other objects which are in the scene.
   *
   * @param dt
   *    The time, in milliseconds, since the last update.
   */
  update(dt: number): void {
    // Alternatively, you could use Three's OrbitControls or any other
    // camera control system.
    this.cameraControls.update();

    // This is where most of the potree magic happens. It updates the
    // visiblily of the octree nodes based on the camera frustum and it
    // triggers any loads/unloads which are necessary to keep the number
    // of visible points in check.
    this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
  }

  /**
   * Renders the scene into the canvas.
   */
  render(): void {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * The main loop of the viewer, called at 60FPS, if possible.
   */
  loop = (time: number) => {
    this.reqAnimationFrameHandle = requestAnimationFrame(this.loop);

    const prevTime = this.prevTime;
    this.prevTime = time;
    if (prevTime === undefined) {
      return;
    }
    this.transformControls.forEach((control) => {
      control.setSize(20 / control.position.distanceTo(this.camera.position) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7));
    })
    this.update(time - prevTime);
    this.render();
  };

  /**
   * Triggered anytime the window gets resized.
   */
  resize = () => {
    if (this.targetEl) {
      const { width, height } = this.targetEl.getBoundingClientRect();
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  };

  loadIfc(url: string) {
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath('./assets/');
    ifcLoader.load(url, (model) => {
      console.log("model", model)
      // this.transformModel(model)
      this.scene.add(model)
    })
  }


  // transformModel(ifcModel: IFCModel) {
  //   const control = new TransformControls(this.camera, this.renderer.domElement)
  //   this.transformControls.push(control)
  //   // control.addEventListener('dragging-changed', function (event) {
  //   //   control.enabled = !event.value;
  //   // });
  //   // controls.addEventListener('change', this.render);
  //   control.attach(ifcModel)
  //   this.scene.add(control)

  //   console.log("transform", this.transformControls)
  //   window.addEventListener('keydown', function (event) {
  //     switch (event.code) {
  //       case 'KeyG':
  //         control.setMode('translate')
  //         break
  //       case 'KeyR':
  //         control.setMode('rotate')
  //         break
  //       case 'KeyS':
  //         control.setMode('scale')
  //         break
  //     }
  //   })
  // }

  addTransformControls(event : MouseEvent) {
    const mouse = new Vector2();
    const raycaster = new Raycaster();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);

    for (const child of this.scene.children) {
      const intersects = raycaster.intersectObject(child);
      if (child.type == 'Mesh' && intersects.length > 0) {
        const control = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.push(control);
        control.attach(child);
        this.scene.add(control);
        window.addEventListener('keydown', function (event) {
          switch (event.code) {
            case 'KeyG':
              control.setMode('translate');
              break;
            case 'KeyR':
              control.setMode('rotate');
              break;
            case 'KeyS':
              control.setMode('scale');
              break;
          }
        })
        break;
      } else {
        this.transformControls.map(control => {
          control.detach();
        })
      }
    }
  }
}
