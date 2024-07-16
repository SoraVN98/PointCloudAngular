import { PerspectiveCamera, Vector3, Vector2, MOUSE } from 'three';

const CAMERA_STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };
const MOUSSE_BUTTONS = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };

/**
 * Simple camera controls which just make the camera spin around a target position.
 * Quentin : I make a basic version of OrbitControls because I had some issues between my project and Three.OrbitControls
 * I tried to use THREE.OrbitControls, but he can found the constructor.
 * So i tried to use { OrbitControls } from 'three-orbitcontrols-ts' but the function didn't work on my project.
 * To the end i made a base orbit controller based on three js OrbitControls.
 */
export class CameraControls {
  // Camera state
  private state = CAMERA_STATE.NONE;
  public enabled = true;
  // Rotation speed factor
  private rotationSpeed = 0.001;

  // Zoom speed factor
  private zoomSpeed = 0.0125;

  // Initial distance to the model
  private distance = 10.0;

  // Camera target
  private target = new Vector3();

  // Angle Theta in polar coordinates
  private theta = 0.0;
  // Angle Phi in polar coordinates
  private phi = 0.0;

  // Initial rotation ( Mousse space )
  private rotateStart = new Vector2();
  // End rotation ( Mousse space )
  private rotateEnd = new Vector2();
  // Delta rotation ( Mousse space ) => RotateEnd - RotateStart
  private rotateDelta = new Vector2();

  constructor(private camera: PerspectiveCamera) {
  }

  update(): void {
    const phi = this.phi;
    const theta = this.theta;

    // Compute angles.
    const x = Math.sin(theta) * this.distance;
    const y = Math.cos(phi) * this.distance;
    const z = Math.cos(theta) * this.distance;

    // Set Camera position.
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  /**
   * Function to handle the mousse wheel event.
   * @param event
   */
  handleMouseWheel(event: any) {
    // event.preventDefault();
    event.stopPropagation();

    if (event.deltaY < 0) {
      this.distance /= (event.deltaY * -1) * this.zoomSpeed;
    } else if (event.deltaY > 0) {
      this.distance *= event.deltaY * this.zoomSpeed;
    }
  }

  /**
   * Function to handle the mousse click event.
   * => Rotation start.
   * @param event
   */
  onMouseDown(event: any) {
    event.preventDefault();
    if (event.button === MOUSSE_BUTTONS.ORBIT) {
      this.handleMouseDownRotate(event);
      this.state = CAMERA_STATE.ROTATE;
    }
  }

  /**
   * Set initial rotation.
   * @param event
   */
  handleMouseDownRotate(event: any) {
    this.rotateStart.set(event.clientX, event.clientY);
  }

  /**
   * Function to handle the mousse move event.
   *  => Rotation in progress.
   * @param event
   */
  onMouseMove(event: any) {
    event.preventDefault();
    if (this.enabled) {
      this.handleMouseMoveRotate(event);
    }
  }

  /**
   * Function to handle the mousse stop click event.
   * => Rotation stop.
   */
  onMouseUp() {
    this.state = CAMERA_STATE.NONE;
  }

  /**
   * Function to compute the camera movement.
   * @param event
   */
  handleMouseMoveRotate(event: any) {
    if (this.state === CAMERA_STATE.ROTATE) {
      this.rotateEnd.set(event.clientX, event.clientY);

      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotationSpeed);

      // rotating across whole screen goes 360 degrees around
      this.rotateLeft(2 * Math.PI * this.rotateDelta.x);

      // rotating up and down along whole screen attempts to go 360, but limited to 180
      this.rotateUp(2 * Math.PI * this.rotateDelta.y);

      this.rotateStart.copy(this.rotateEnd);
    }
  }

  /**
   * Compute the X axis rotation.
   * @param angle
   */
  rotateLeft(angle: any) {
    this.theta -= angle;
  }

  /**
   * Compute the Y axis rotation.
   * @param angle
   */
  rotateUp(angle: any) {
    this.phi -= angle;
  }

}
