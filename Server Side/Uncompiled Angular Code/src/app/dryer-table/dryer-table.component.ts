import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { MonitorContent } from '../MonitorContent';
import { WasherService } from '../washer.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Machine } from '../Machine';

@Component({
  selector: 'app-dryer-table',
  templateUrl: './dryer-table.component.html',
  styleUrls: ['./dryer-table.component.css']
})
export class DryerTableComponent implements OnInit {
  

  monitor_list: MonitorContent[] = [];

  public building = '';
  public loading = true;
  public errorMsg!: string;
  public successMsg!: string;
  //public dryer_list!: Dryer[];
  dryer_list = new MatTableDataSource<Machine>();
  public columns = ['id', 'state', 'notify'];
  Math = Math;

  private readonly VAPID_PUBLIC_KEY = environment.VAPID_PUBLIC;

  constructor(private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private swPush: SwPush, private washerService: WasherService){}
  
  ngOnInit() {
    
    //create bell outline and filled icons
    this.matIconRegistry.addSvgIcon(
      "notifyOff",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/notify-off.svg"),
    );

    this.matIconRegistry.addSvgIcon(
      "notifyOn",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/notify-on.svg"),
    );

    
    //subscribe to changes in dryer_list
    this.washerService.dryer_list$.subscribe(res => {
      this.dryer_list.data = res;
    })

    //subscribe to changes in monitor_list
    this.washerService.monitor_list$.subscribe(res => {
      this.monitor_list = res;
      
    })

    //subscribe to changes in the buildingName
    this.washerService.buildingName$.subscribe(res => {
      this.building = res;
    })

    this.loading = false;

  }

  //checks if a dryer's ID appears in the monitoring list
  checkForId(id: string){
    
    //if there is an object with a matching id, then it is being monitored
    if(this.monitor_list.findIndex((monitoredMachine) => monitoredMachine.id == id) != -1){
      return true;
    }
    return false;
    
  }

  //creates notification for a given dryer
  subscribeToNotifications(id: string){

    //first check if a subObj has already been created for a user
    const activeSubscriberCheck = this.swPush.subscription.subscribe(res => {

    //if one hasn't
    if(res == null){

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(sub => this.washerService.storeSubscription(sub, [id]).subscribe()).catch(err => console.log(err, err));
  }
  else{
    //if one already exists
    this.washerService.storeSubscription(res, [id]).subscribe()
    this.washerService.checkSubscriberList()
  }

  activeSubscriberCheck.unsubscribe()
})
    

  }

  //remove a notification for a given machine
  unSubFromNotification(id: string){
    //get the active subscription object
    const activeSubscriberCheck = this.swPush.subscription.subscribe(activeSubscription => {
    
      if(activeSubscription != null){
      this.washerService.removeSubscription(activeSubscription, [id]).subscribe()
      this.washerService.checkSubscriberList()
      }
  
      activeSubscriberCheck.unsubscribe()
    })
  
  
  
  
  }

}
