import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { WasherService } from './washer.service';
import { MonitorContent } from './MonitorContent';
import { Machine } from './Machine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'laundry';
  buildingName = '';
  private washer_list: Machine[] = [];
  private dryer_list: Machine[] = [];
  private monitor_list: MonitorContent[] = [];

  private readonly VAPID_PUBLIC_KEY = environment.VAPID_PUBLIC;


  constructor(private washerService: WasherService, private swPush: SwPush){}
  ngOnInit() {
    //subscribes to various variables to remain updated
    this.washerService.buildingName$.subscribe(res => this.buildingName = res);
    this.washerService.washer_list$.subscribe(res => this.washer_list = res);
    this.washerService.dryer_list$.subscribe(res => this.dryer_list = res);
    this.washerService.monitor_list$.subscribe(res => this.monitor_list = res);
  }

  //creates notifications for all machines of a given type being viewed
  subToAll(subType: string){

    let idList: string[] = []

    if(subType == "Washer"){
    //iterate through current washer list, and add their id if they are active
    for(let i = 0; i < this.washer_list.length; i++){

      //check if machine is active and has no errors
      if(this.washer_list[i].active && !this.washer_list[i].errorCodeList.includes("NO_UPDATES")){
        
        idList.push(this.washer_list[i].machineID)
      }

    }
    }
    else if(subType == "Dryer"){

    //iterate through current dryer list, and add their id if they are active
    for(let i = 0; i < this.dryer_list.length; i++){

      if(this.dryer_list[i].active && !this.dryer_list[i].errorCodeList.includes("NO_UPDATES")){
        
        idList.push(this.dryer_list[i].machineID)
      }

    }

    }

    
    //before sending, remove any ids that appear in the monitor list already
    for(let i = 0; i < this.monitor_list.length; i++){
      if(idList.includes(this.monitor_list[i].id)){
        let foundIndex = idList.indexOf(this.monitor_list[i].id)
        idList.splice(foundIndex, 1)
      }

    }


    const activeSubscriberCheck = this.swPush.subscription.subscribe(res => {

      if(res == null){
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(sub => this.washerService.storeSubscription(sub, idList).subscribe()).catch(err => console.log(err, err));
  }
  else{
    this.washerService.storeSubscription(res, idList).subscribe()
    this.washerService.checkSubscriberList()
  }
    

  activeSubscriberCheck.unsubscribe()
})

  }
  
  //remove notifications for all machines
  unsubFromAll(){


    let idList: string[] = []

    
    for(let i = 0; i < this.monitor_list.length; i++){
      idList.push(this.monitor_list[i].id)

    }


    const activeSubscriberCheck = this.swPush.subscription.subscribe(activeSubscription => {
    
      if(activeSubscription != null){
      this.washerService.removeSubscription(activeSubscription, idList).subscribe()
      this.washerService.checkSubscriberList()
      }
  
      activeSubscriberCheck.unsubscribe()
    })
  }


}
