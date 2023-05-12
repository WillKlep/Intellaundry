import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MonitorContent } from '../MonitorContent';
import { WasherService } from '../washer.service';

@Component({
  selector: 'app-monitor-table',
  templateUrl: './monitor-table.component.html',
  styleUrls: ['./monitor-table.component.css']
})
export class MonitorTableComponent implements OnInit{

  monitor_list = new MatTableDataSource<MonitorContent>();
  public columns = ['machineName'];
  loading = true;


  //Variables used for esp data table. Used for testing
  /*
  esp_list = new MatTableDataSource<ESP>();
  public espTableColumns = ['espID', 'machineID','recentData'];
  */
  constructor(private washerService: WasherService){}
  
  ngOnInit() {
    //subscribe to changes in monitor_list
    this.washerService.monitor_list$.subscribe(res => {
      this.monitor_list.data = res;
      this.loading = false;
      
    })

    //subscribe to changes in the esp_list. Used for testing
    /*
    this.washerService.esp_list$.subscribe(res => {
      this.esp_list.data = res
    })
    */

  }


  //Used to parse esp data. Used for testing
  /*
  parseJSON(JSONString: string){
    let parsedString = JSON.parse(JSONString)
    let date = new Date(parsedString.timestamp)
  
    return [parsedString.count, parsedString.current, date.toLocaleTimeString("en-us")]

   }
*/


}
