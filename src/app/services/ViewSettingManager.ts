import { PointShape, PointColorType } from '@pix4d/three-potree-loader';

// This class need to inherit from an event manager.

/**
 * Singleton to manage settings
 */
export class ViewerSettingManager {
  private static _instance: ViewerSettingManager;
  private _shape: PointShape = PointShape.CIRCLE;
  private _pointColorType: PointColorType = PointColorType.RGB;
  private _size: number;
  private _opacity: number;
  private readonly _changesCallback: Array<Function>;

  /**
   * Base constructor
   */
  private constructor() {
    this._shape = PointShape.CIRCLE;
    this._pointColorType = PointColorType.RGB;
    this._opacity = 1.0;
    this._size = 1.0;
    this._changesCallback = [];
  }

  /**
   * Singleton access
   * @returns {ViewerSettingManager}  the instance value
   * @constructor
   */
  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  /**
   * Add a function to call on change.
   * @param callback
   * @returns {number}
   */
  public onChange(callback: any) {
    this._changesCallback.push(callback);
    return this._changesCallback.length - 1;
  }

  /**
    * Remove a function to call
    * @param id
    */
  public offChange(id: number) {
    this._changesCallback.splice(id, 1);
  }

  /**
   * Call all function listening to changes.
   */
  private changesRequested() {
    for (let i = 0; i < this._changesCallback.length; i++) {
      this._changesCallback[i]();
    }
  }

  /**
   * Return the point shape to use.
   * @returns {PointShape}
   */
  public get shapeType() {
    return this._shape;
  }

  /**
   * Return the point shape to use.
   * @returns {PointShape}
   */
  public get pointColorType() {
    return this._pointColorType;
  }

  /**
   * Return the stored opacity
   * @returns {number}
   */
  public get opacity() {
    return this._opacity;
  }

  /**
   * Return the stored size
   * @returns {number}
   */
  public get size() {
    return this._size;
  }

  public setShape(shapeName: string) {
    switch (shapeName) {
      case 'Squares':
        this._shape = PointShape.SQUARE;
        break;
      case 'Circles':
      default:
        this._shape = PointShape.CIRCLE;
    }
    this.changesRequested();
  }

  /**
   * Additional function to have some fun renderings
   * @param {string} pointColorType
   */
  public setPointColorType(pointColorType: string) {
    switch (pointColorType) {
      case 'RGB':
        this._pointColorType = PointColorType.RGB;
        break;
      case 'DEPTH':
        this._pointColorType = PointColorType.DEPTH;
        break;
      case 'HEIGHT':
        this._pointColorType = PointColorType.HEIGHT;
        break;
      case 'INTENSITY_GRADIENT':
        this._pointColorType = PointColorType.INTENSITY_GRADIENT;
        break;
      case 'LOD':
        this._pointColorType = PointColorType.LOD;
        break;
      case 'POINT_INDEX':
        this._pointColorType = PointColorType.POINT_INDEX;
        break;
      case 'CLASSIFICATION':
        this._pointColorType = PointColorType.CLASSIFICATION;
        break;
      case 'RETURN_NUMBER':
        this._pointColorType = PointColorType.RETURN_NUMBER;
        break;
      case 'SOURCE':
        this._pointColorType = PointColorType.SOURCE;
        break;
      case 'NORMAL':
        this._pointColorType = PointColorType.NORMAL;
        break;
      case 'RGB_HEIGHT':
        this._pointColorType = PointColorType.RGB_HEIGHT;
        break;
      case 'COMPOSITE':
        this._pointColorType = PointColorType.COMPOSITE;
        break;
      default:
        this._pointColorType = PointColorType.RGB;
    }
    this.changesRequested();
  }

  public setSize(size: number) {
    this._size = size;
    this.changesRequested();
  }

  public setOpacity(opacity: number) {
    this._opacity = opacity;
    this.changesRequested();
  }
}

