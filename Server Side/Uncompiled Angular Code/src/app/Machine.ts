export interface Machine {
    type: string;
    machineID: string;
    active: boolean;
    cycle: string;
    buildingID: number;
    UNIXtimeWhenOff: number;
    UNIXtimeWhenOn: number;
    UNIXtimeWhenUpdate: number;
    UNIXtimeRemaining: number;
    errorCodeList: [string];
}