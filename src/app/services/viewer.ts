import { PerspectiveCamera, Scene, WebGLRenderer, Vector3, Box3, AmbientLight, DirectionalLight, Vector2, Raycaster } from 'three';
import { PointCloudOctree, Potree } from '@pnext/three-loader';
import { CameraControls } from './camera-controls';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

export class Viewer {
 
  private targetEl: HTMLElement | undefined;
  private renderer = new WebGLRenderer();
  private scene = new Scene();
  private light = new AmbientLight(0x404040); 
  private directionalLight1 = new DirectionalLight(0xffeeff, 0.8);
  private directionalLight2 = new DirectionalLight(0xffffff, 0.8);
  private camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  private cameraControls = new CameraControls(this.camera);
  private potree = new Potree();
  private pointClouds: PointCloudOctree[] = [];
  private prevTime: number | undefined;
  private reqAnimationFrameHandle: number | undefined;
  // @ts-ignore
  private pointCloudOctree: PointCloudOctree;
  // @ts-ignore
  private transformControl: TransformControls;

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
    window.addEventListener('wheel', (event) => {
      const canvas = this.renderer.domElement
      if (event.target === canvas) {
        this.cameraControls.handleMouseWheel(event)
      }
    }, false);
    window.addEventListener('mousedown', (event) => {
      const canvas = this.renderer.domElement
      if (event.target === canvas) {
        this.cameraControls.onMouseDown(event)
      }
    }, false);
    window.addEventListener('mousemove', (event) => {
      const canvas = this.renderer.domElement
      if (event.target === canvas) {
        this.cameraControls.onMouseMove(event)
      }
    }, false);
    window.addEventListener('mouseup', (event) => {
      const canvas = this.renderer.domElement
      if (event.target === canvas) {
        this.cameraControls.onMouseUp()
      }
    }, false);
    window.addEventListener('dblclick', (event) => { this.addTransformControls(event) }, false);

    requestAnimationFrame(this.loop);
  }

  destroy(): void {
    if (this.targetEl) {
      this.targetEl.removeChild(this.renderer.domElement);
      this.targetEl = undefined;
    }

    window.removeEventListener('resize', this.resize);
    window.removeEventListener('wheel', this.cameraControls.handleMouseWheel, false);
    window.removeEventListener('mousedown', this.cameraControls.onMouseDown, false);
    window.removeEventListener('mousemove', this.cameraControls.onMouseMove, false);
    window.removeEventListener('mouseup', this.cameraControls.onMouseUp, false);

    this.scene.remove(this.pointCloudOctree);
    this.pointClouds.slice(0);

    if (this.reqAnimationFrameHandle !== undefined) {
      cancelAnimationFrame(this.reqAnimationFrameHandle);
    }
  }

  load(fileName: string, baseUrl: string): Promise<PointCloudOctree> {
    return this.potree
      .loadPointCloud(
        fileName,
        url => `${baseUrl}${url}`
      )
      .then((pco: PointCloudOctree) => {
        this.scene.children.forEach((child) => {
          if (child.children[0] &&  child.children[0].type === "Points") {
            this.scene.remove(child)
          }
        })
        this.scene.add(pco);
        this.pointClouds.pop();
        this.pointClouds.push(pco);
        this.pointCloudOctree = pco;
        return pco;
      });
  }

  update(dt: number): void {
    this.cameraControls.update();

    this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
  }

  render(): void {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  loop = (time: number) => {
    this.reqAnimationFrameHandle = requestAnimationFrame(this.loop);

    const prevTime = this.prevTime;
    this.prevTime = time;
    if (prevTime === undefined) {
      return;
    }
    if (this.transformControl)
      this.transformControl.setSize(20 / this.transformControl.position.distanceTo(this.camera.position) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7));

    this.update(time - prevTime);
    this.render();
  };

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
      this.scene.add(model)
    })
  }

  addTransformControls(event: MouseEvent) {
    const mouse = new Vector2();
    const raycaster = new Raycaster();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);

    for (const child of this.scene.children) {
      const intersects = raycaster.intersectObject(child);
      if (child.type == 'Mesh' && intersects.length > 0) {
        const control = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControl = control;
        control.attach(child);
        this.scene.add(control);
        control.addEventListener('dragging-changed', (event) => {
          this.cameraControls.enabled = !event.value
        });
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
        if (this.transformControl) {
          this.transformControl.detach();
        }
      }
    }
  }
}
