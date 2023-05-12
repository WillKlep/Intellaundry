import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { Building } from './Building';
import { ESP } from './ESP';
import { Machine } from './Machine';
import { MonitorContent } from './MonitorContent';

@Injectable({
  providedIn: 'root'
})
export class WasherService {

  private SUBSCRIBER_REFRESH_MILLISEC = 1000
  private MACHINE_REFRESH_MILLISEC = 5000



  private BASE_URL = environment.API_URL;
  //holds the particular building being viewed
  //this variable must start as a valid building
  private buildingName = new BehaviorSubject('Maglott');
  buildingName$ = this.buildingName.asObservable();

  //holds the particular building id being viewed
  //this variable must start as a valid buildingID
  private buildingID = new BehaviorSubject(3);
  buildingID$ = this.buildingID.asObservable();


  //holds all building names and ids
  private building_list: Building[] = [];
  private buildingSubject = new BehaviorSubject(this.building_list);
  building_list$ = this.buildingSubject.asObservable();

  //holds all washers from building being viewed
  private washer_list: Machine[] = [];
  private washerSubject = new BehaviorSubject(this.washer_list);
  washer_list$ = this.washerSubject.asObservable();

  //holds all dryers from building being viewed
  private dryer_list: Machine[] = [];
  private dryerSubject = new BehaviorSubject(this.dryer_list);
  dryer_list$ = this.dryerSubject.asObservable();

  //holds all machines being monitored
  private monitor_list: MonitorContent[] = [];
  private monitorSubject = new BehaviorSubject(this.monitor_list);
  monitor_list$ = this.monitorSubject.asObservable();

  public dataRefresher: any;
  public subListRefresher: any;

  //Used for ESP testing
  /*
  holds all ESPs
  private esp_list: ESP[] = [];
  private espSubject = new BehaviorSubject(this.esp_list);
  esp_list$ = this.espSubject.asObservable();
  
  public ESPDataRefresher: any;
  */

  constructor(private swPush: SwPush, private http: HttpClient) {  

    //obtain list of buildings in db
    this.getBuildings().subscribe((buildings: Building[]) => {
      this.building_list = buildings;
      this.buildingSubject.next(this.building_list)
    })
    
    //when a building's id changes, get the machines that are in that building
    this.buildingID$.subscribe(res => {
      this.getMachines(res).subscribe((machines: Machine[]) => {
        let tempDryerList: Machine[] = []
        let tempWasherList: Machine[] = []

        //put washers and dryers in proper lists
        for(let i = 0; i < machines.length; i++){
          if(machines[i].type == "Dryer"){
            tempDryerList.push(machines[i])
          }
          else if(machines[i].type == "Washer"){
            tempWasherList.push(machines[i])
          }
        }

        this.dryer_list = tempDryerList
        this.washer_list = tempWasherList
        this.washerSubject.next(this.washer_list);
        this.dryerSubject.next(this.dryer_list);

      });
    });

    //Updates esp table with new data every second. Used for testing
    /*
    this.ESPDataRefresher = setInterval(() => {

      this.getESPData().subscribe((espList: ESP[]) => {
        this.espSubject.next(espList)
      })


    }, 1000);
    */

    //Refreshes the monitoring table
    this.subListRefresher = setInterval(() => {

      this.checkSubscriberList()

      
    }, this.SUBSCRIBER_REFRESH_MILLISEC);

    
    //refreshes washer and dryer tables
    this.dataRefresher = setInterval(() => {

      this.getMachines(this.buildingID.value).subscribe((machines: Machine[]) => {
        
        let tempWasherList: Machine[] = []
        let tempDryerList: Machine[] = []

        //put washers and dryers in proper list
        for(let i = 0; i < machines.length; i++){
          if(machines[i].type == "Dryer"){
            tempDryerList.push(machines[i])
          }
          else if(machines[i].type == "Washer"){
            tempWasherList.push(machines[i])
          }
        }


        //check if a washer being monitored has turned off
        for(let i = 0; i < tempWasherList.length; i++){
          
          //if the machine's state is off
          if(!tempWasherList[i].active){

          //check the monitor list for a matching id. If there is one, remove it from the list
          if(this.monitor_list.findIndex((monitoredMachine) => monitoredMachine.id == tempWasherList[i].machineID) != -1){
            
            this.monitor_list = this.monitor_list.filter((monitorObj) => monitorObj.id !== tempWasherList[i].machineID); 
            this.monitorSubject.next(this.monitor_list)

          }
        }
        }
        
        //check if a dryer being monitored has turned off
        for(let i = 0; i < tempDryerList.length; i++){
          
          //if the machines state is off
          if(!tempDryerList[i].active){
            
          //check the monitor list for a matching id. If there is one, remove it from the list
          if(this.monitor_list.findIndex((monitoredMachine) => monitoredMachine.id == tempDryerList[i].machineID) != -1){

            this.monitor_list = this.monitor_list.filter((monitorObj) => monitorObj.id !== tempDryerList[i].machineID); 
            this.monitorSubject.next(this.monitor_list)

          }
        }
        }
        
        this.washerSubject.next(tempWasherList);
        this.dryerSubject.next(tempDryerList);
        
        console.log("refreshed");
      });
      }, this.MACHINE_REFRESH_MILLISEC);
      
    }

    //obtains a list of monitored machines based on the subObj of the user
    checkSubscriberList(){
      //first check if a sub object exists
      const activeSubscriberCheck = this.swPush.subscription.subscribe(activeSubscription => {
  
        if(activeSubscription != null){
          //obtain the list of subbed machines using the sub object
          const subbedMachine = this.getSubbedMachines(activeSubscription).subscribe((subbedMachineList: Machine[]) =>{
            let tempMonitorList: MonitorContent[] = []

            //for each subbed machine, create a monitor object
            for(let i = 0; i < subbedMachineList.length; i++){
            let buildingIndex = this.building_list.findIndex((buildingObj) => buildingObj.buildingID === subbedMachineList[i].buildingID)
            let monitorObj = {} as MonitorContent
            monitorObj.id = subbedMachineList[i].machineID
            monitorObj.machineType = subbedMachineList[i].type
            monitorObj.buildingName = this.building_list[buildingIndex].name
            tempMonitorList.push(monitorObj)
          }
            //push new monitor list into the monitor subject
            this.monitorSubject.next(tempMonitorList)


          })
          
        }
    
        activeSubscriberCheck.unsubscribe()
      })

    }

  //changes the building being viewed
  changeBuilding(id: number){
    this.buildingID.next(id);

    let buildingIndex = this.building_list.findIndex((buildingObj) => buildingObj.buildingID === id)

    this.buildingName.next(this.building_list[buildingIndex].name)
  }

  //obtains the list of subscribed machines, given the subObj
  getSubbedMachines(sub: PushSubscription): Observable<Machine[]>{
    return this.http.post<Machine[]>(`${  this.BASE_URL}/subbedList`,{sub})
   }
  
   //gets data being logged by the ESP for displaying. Used for testing
   /*
  getESPData(): Observable<ESP[]>{
    return this.http.get<ESP[]>(`${  this.BASE_URL}/getESPData`)
   }
   */

  //obtains the list of all machines in the building being viewed
  getMachines(buildingID: number): Observable<Machine[]>{
    return this.http.post<Machine[]>(`${  this.BASE_URL}/machine`,{buildingID})

   }

   //obtains the list of all building names and ids
   getBuildings(): Observable<Building[]>{
    return this.http.get<Building[]>(`${this.BASE_URL}/getBuilding`)
   }

   //Adds a specified subscription object
   storeSubscription(sub: PushSubscription, id: string[]){
    return this.http.post(`${this.BASE_URL}/storeSubscriber`, {sub, id}, {responseType: 'text'});
   }

   //calls api to remove a specified subscription object
   removeSubscription(sub : PushSubscription, id: string[]){
    return this.http.post(`${this.BASE_URL}/removeSubscriber`, {sub, id}, {responseType: 'text'});
   }


}
