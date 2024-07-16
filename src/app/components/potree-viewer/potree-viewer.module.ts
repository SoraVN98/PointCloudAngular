import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PotreeViewerComponent } from './potree-viewer/potree-viewer.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [PotreeViewerComponent],
  exports: [
    PotreeViewerComponent
  ]
})
export class PotreeViewerModule { }
