import { Component, OnInit, OnDestroy } from '@angular/core';
import { Viewer } from '../../../services/viewer';
import { PointCloudOctree } from '@pix4d/three-potree-loader';
import { ViewerSettingManager } from '../../../services/ViewSettingManager';

@Component({
  selector: 'app-potree-viewer',
  templateUrl: './potree-viewer.component.html',
  styleUrls: ['./potree-viewer.component.css']
})
export class PotreeViewerComponent implements OnInit, OnDestroy {
  private viewer!: Viewer;
  private pointCloudOctree!: PointCloudOctree;
  private idChange!: number;

  constructor() {
  }

  /**
   * Function to update point cloud rendering options.
   */
  updatePointCloud() {
    this.pointCloudOctree.material.shape = ViewerSettingManager.Instance.shapeType;
    this.pointCloudOctree.material.size = ViewerSettingManager.Instance.size;
    this.pointCloudOctree.material.opacity = ViewerSettingManager.Instance.opacity;
    this.pointCloudOctree.material.pointColorType = ViewerSettingManager.Instance.pointColorType;
  }

  ngOnInit() {
    this.idChange = ViewerSettingManager.Instance.onChange(() => {
      this.updatePointCloud();
    });
    this.viewer = new Viewer();
    const target = document.getElementById('target')
    if (target) {
      this.viewer.initialize(target);
    }
    const baseUrl = './assets/pointclouds/demo/'
    this.viewer
      .load('cloud.js', baseUrl)
      .then(pco => {
        pco.translateX(-1);
        pco.rotateX(-Math.PI / 2);
        this.pointCloudOctree = pco;
        this.updatePointCloud();
        console.log("point", this.pointCloudOctree)
      })
      .catch(err => console.error(err));
    // // load ifc
    // const ifcUrl = './assets/ifc/Project1.ifc'
    // this.viewer.loadIfcModel(ifcUrl)
  }

  /**
   * Clear memory
   */
  ngOnDestroy() {
    ViewerSettingManager.Instance.offChange(this.idChange);
    this.viewer.destroy();
  }
}
