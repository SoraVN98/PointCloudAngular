import { PerspectiveCamera, Vector3, Vector2, MOUSE } from 'three';

const CAMERA_STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };
const MOUSSE_BUTTONS = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };


export class CameraControls {
  private state = CAMERA_STATE.NONE;
  public enabled = true;
  private rotationSpeed = 0.001;
  private zoomSpeed = 0.0125;
  private distance = 10.0;
  private target = new Vector3();
  private theta = 0.0;
  private phi = 0.0;
  private rotateStart = new Vector2();
  private rotateEnd = new Vector2();
  private rotateDelta = new Vector2();

  constructor(private camera: PerspectiveCamera) {
  }

  update(): void {
    const phi = this.phi;
    const theta = this.theta;

    const x = Math.sin(theta) * this.distance;
    const y = Math.cos(phi) * this.distance;
    const z = Math.cos(theta) * this.distance;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  handleMouseWheel(event: any) {
    event.stopPropagation();

    if (event.deltaY < 0) {
      this.distance /= (event.deltaY * -1) * this.zoomSpeed;
    } else if (event.deltaY > 0) {
      this.distance *= event.deltaY * this.zoomSpeed;
    }
  }

  onMouseDown(event: any) {
    event.preventDefault();
    if (event.button === MOUSSE_BUTTONS.ORBIT) {
      this.handleMouseDownRotate(event);
      this.state = CAMERA_STATE.ROTATE;
    }
  }

  handleMouseDownRotate(event: any) {
    this.rotateStart.set(event.clientX, event.clientY);
  }

  onMouseMove(event: any) {
    event.preventDefault();
    if (this.enabled) {
      this.handleMouseMoveRotate(event);
    }
  }

  onMouseUp() {
    this.state = CAMERA_STATE.NONE;
  }

  handleMouseMoveRotate(event: any) {
    if (this.state === CAMERA_STATE.ROTATE) {
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotationSpeed);
      this.rotateLeft(2 * Math.PI * this.rotateDelta.x);
      this.rotateUp(2 * Math.PI * this.rotateDelta.y);
      this.rotateStart.copy(this.rotateEnd);
    }
  }

  rotateLeft(angle: any) {
    this.theta -= angle;
  }

  rotateUp(angle: any) {
    this.phi -= angle;
  }

}
