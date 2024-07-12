import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {PotreeViewerModule} from './components/potree-viewer/potree-viewer.module';
import {ViewerSettingsModule} from './components/viewer-settings/viewer-settings.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PotreeViewerModule,
    ViewerSettingsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
