import { Component, OnInit, OnDestroy } from '@angular/core';
import { Viewer } from '../../../services/viewer';
import { PointCloudOctree } from '@pnext/three-loader';
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
    const pcURL = './assets/pointclouds/demo/'
    const ifcURL = './assets/ifc/Project1.ifc'
    const ifcURL1 = './assets/ifc/test2.ifc'
    this.loadPointCloud(pcURL);
    this.loadIfcFile(ifcURL);
    // this.loadIfcFile(ifcURL1);
  }

  /**
   * Clear memory
   */
  ngOnDestroy() {
    ViewerSettingManager.Instance.offChange(this.idChange);
    this.viewer.destroy();
  }

  loadPointCloud(pcURL: string) {
    this.viewer
      .load('cloud.js', pcURL)
      .then(pco => {
        pco.translateX(-1);
        pco.rotateX(-Math.PI / 2);
        this.pointCloudOctree = pco;
        this.updatePointCloud();
        console.log("point", this.pointCloudOctree)
      })
      .catch(err => console.error(err));
  }

  loadIfcFile(url: string) {
    this.viewer.loadIfc(url)
  }

}
