import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { WasherService } from '../washer.service';
import { MonitorContent } from '../MonitorContent';
import { Machine } from '../Machine';

@Component({
  selector: 'app-washer-table',
  templateUrl: './washer-table.component.html',
  styleUrls: ['./washer-table.component.css']
})
export class WasherTableComponent implements OnInit {
  
  monitor_list: MonitorContent[] = [];
  public building = '';
  public loading = true;
  public errorMsg!: string;
  public successMsg!: string;
  public washer_list!: Machine[];
  public columns = ['id', 'state', 'notify'];
  public dataRefresher: any;
  public toggleState_list!: Boolean[];
  Math = Math;

  private readonly VAPID_PUBLIC_KEY = environment.VAPID_PUBLIC;


  constructor(private swPush: SwPush, private washerService: WasherService){}
  
  ngOnInit() {
    
    //subscribe to changes in the washer_list
    this.washerService.washer_list$.subscribe(res => {
      this.washer_list = res;
    })

    //subscribe to changes in the monitor_list
    this.washerService.monitor_list$.subscribe(res => {
      this.monitor_list = res;
      
    })

    //subscribe to changes in the buildingName
    this.washerService.buildingName$.subscribe(res => {
      this.building = res;
    })

    this.loading = false;

  }


//creates notification for a given dryer
subscribeToNotifications(id: string){
  console.log(id);
  
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

//checks if a washer's ID appears in the monitoring list
checkForId(id: string){
    
  //if there is an object with a matching id, then it is being monitored
  if(this.monitor_list.findIndex((monitoredMachine) => monitoredMachine.id == id) != -1){
    return true;
  }
  return false;
  
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
