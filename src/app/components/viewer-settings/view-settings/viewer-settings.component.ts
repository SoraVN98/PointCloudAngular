import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ViewerSettingManager } from '../../../services/ViewSettingManager';


@Component({
  selector: 'app-viewer-settings',
  templateUrl: './viewer-settings.component.html',
  styleUrls: ['./viewer-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class ViewerSettingsComponent {
  disabled = false;
  settingsActivated = false;
  invert = false;
  maxSize = 3.0;
  minSize = 0.0;
  maxOpacity = 1.0;
  minOpacity = 0.0;
  step = 0.1;
  thumbLabel = false;
  valueSize = 1.0;
  valueOpacity = 1.0;
  vertical = false;
  shapeSelected: string;
  selectedRender: string;
  ShapesType = [
    'Circles',
    'Squares'
  ];
  RenderMode = [
    'RGB',
    'DEPTH',
    'HEIGHT',
    'INTENSITY_GRADIENT',
    'LOD',
    'POINT_INDEX',
    'CLASSIFICATION',
    'RETURN_NUMBER',
    'SOURCE',
    'NORMAL',
    'RGB_HEIGHT',
    'COMPOSITE',
  ];

  constructor() {
    this.shapeSelected = this.ShapesType[0]; // Circle
    this.selectedRender = this.RenderMode[0]; // RGB
  }

  /**
   * Function to manage a click on settings => display the setting menu
   */
  onClickSettings() {
    this.settingsActivated = !this.settingsActivated;
  }

  /**
   * On click on shape radio button => Change point shape
   * @param shapeType
   */
  onClickItem(shapeType: string) {
    ViewerSettingManager.Instance.setShape(shapeType);
  }

  /**
   * On change point size slider => Change point size
   * @param event
   */
  onChangePointSize(event: any) {
    const size = this.valueSize;
    ViewerSettingManager.Instance.setSize(size);
  }

  /**
   * On change point opacity slider => Change point opacity
   * @param event
   */
  onChangeOpacity(event: any) {
    const opacity = this.valueOpacity;
    ViewerSettingManager.Instance.setOpacity(opacity);
  }

  /**
   * On change point render mode
   * @param renderType
   */
  onClickRender(renderType: any) {
    ViewerSettingManager.Instance.setPointColorType(renderType);
  }
}
