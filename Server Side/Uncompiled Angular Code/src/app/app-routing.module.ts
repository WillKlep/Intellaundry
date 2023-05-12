import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BuildingListComponent } from './building-list/building-list.component';
import { DryerTableComponent } from './dryer-table/dryer-table.component';
import { MonitorTableComponent } from './monitor-table/monitor-table.component';
import { WasherTableComponent } from './washer-table/washer-table.component';

const routes: Routes = [
  {
    path:'',
    component: WasherTableComponent
    //outlet: "a second outlet here"
  },
  {
    path:'',
    component: BuildingListComponent,
    outlet: "buildingDropdown"
  },
  {
    path:'',
    component: DryerTableComponent,
    outlet: "dryerTable"
  },
  {
    path:'',
    component: MonitorTableComponent,
    outlet: "monitorTable"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
