import { Component, OnInit } from '@angular/core';
import { Building } from '../Building';
import { WasherService } from '../washer.service';

@Component({
  selector: 'app-building-list',
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit {
  public loading = true;
  public errorMsg!: string;
  public successMsg!: string;
  public building_list!: Building[];

  constructor(private washerService: WasherService){}

  ngOnInit() {
    //subscribe to changes in the building_list
    this.washerService.building_list$.subscribe((buildings: Building[]) => {
      
      this.building_list = buildings;
    })

    this.loading = false;

  }

  //changes the building being viewed when selected from dropdown
  changeRoom(id : number){
    this.washerService.changeBuilding(id);
  }



}
