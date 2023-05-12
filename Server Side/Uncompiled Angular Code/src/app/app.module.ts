import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WasherTableComponent } from './washer-table/washer-table.component';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http'
import {MatTableModule} from '@angular/material/table'
import {MatButtonModule} from '@angular/material/button'
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { BuildingListComponent } from './building-list/building-list.component';
import { DryerTableComponent } from './dryer-table/dryer-table.component';
import { ServiceWorkerModule } from '@angular/service-worker'
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MonitorTableComponent } from './monitor-table/monitor-table.component';
import {MatIconModule} from '@angular/material/icon';




@NgModule({
  declarations: [
    AppComponent,
    WasherTableComponent,
    BuildingListComponent,
    DryerTableComponent,
    MonitorTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
  }),
    MatButtonToggleModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      //register service worker asap, otherwise it will always take 30 seconds to use notifications
      registrationStrategy: 'registerImmediately'
    })
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
