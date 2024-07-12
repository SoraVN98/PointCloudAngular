import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PotreeViewerComponent } from './potree-viewer/potree-viewer.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PotreeViewerComponent],
  exports: [
    PotreeViewerComponent
  ]
})
export class PotreeViewerModule { }
