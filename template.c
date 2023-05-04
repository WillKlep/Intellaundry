/*
Error codes:
0 - Failed to connect to Wifi
1 - Failed to send packet
2 - Server not found (404)
3 - Other server error (not 200 or 404)
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <driver/adc.h>
#include <WiFiMulti.h>

WiFiMulti wifiMulti;
const char* url = "https://intellaundry.com/api/logLaundryData";

const char* root_ca = "-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"-----END CERTIFICATE-----\n";

const int cycle_time = 500;   //minimum cycle time (miliseconds)
const double cur_scale = 57.132;
const double cur_offset = 65.811;
const uint16_t samplesPerRead = 450;  //367 sample per 60hz cycle, 440 per 50hz cycle - 450 is 20.45ms
const uint16_t samplesAveraged = 5;   //highest & lowest are dropped, remaining are averaged
#define SENSE_PIN 34
#define SEG_A 32
#define SEG_B 33
#define SEG_C 18
#define SEG_D 4
#define SEG_E 27
#define SEG_F 26
#define SEG_G 25
#define SEG_DP 19

void setup() {
  pinMode(SEG_A, OUTPUT);
  pinMode(SEG_B, OUTPUT);
  pinMode(SEG_C, OUTPUT);
  pinMode(SEG_D, OUTPUT);
  pinMode(SEG_E, OUTPUT);
  pinMode(SEG_F, OUTPUT);
  pinMode(SEG_G, OUTPUT);
  pinMode(SEG_DP, OUTPUT);
  pinMode(SENSE_PIN, INPUT);

  adc1_config_width(ADC_WIDTH_BIT_12); //Initialize ADC width and attenuation
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);

  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
  digitalWrite(SEG_DP, HIGH);
  delay(50);

  WiFi.mode(WIFI_STA);
  wifiMulti.addAP(USER_SSID, USER_PASSWORD);
  //wifiMulti.addAP("ONUGuest", NULL);

  wifiMulti.run();

  digitalWrite(SEG_A, LOW);
  digitalWrite(SEG_B, LOW);
  digitalWrite(SEG_C, LOW);
  digitalWrite(SEG_D, LOW);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, LOW);
  digitalWrite(SEG_G, LOW);
  digitalWrite(SEG_DP, LOW);
}

char message[256];
StaticJsonDocument<256> doc;
HTTPClient http;
int httpResponseCode;
int connect_state;
unsigned long start_time = 0;
double cur_read;
double cur_max;
double cur_min;
double cur_sum;
int current = 0;
int prev_current1 = 0;
int prev_current2 = 0;

void loop() {
  cur_max = 0; //Reset min and max after each loop
  cur_min = 40000;
  cur_sum = 0;
  if ((millis() - start_time) > cycle_time) {
    start_time = millis();
    if (WiFi.status() == WL_CONNECTED) { //Check the current connection status
      for (int i = 0; i < samplesAveraged; i++) {
        cur_read = ((ReadADC() - cur_offset) / cur_scale); //ADC is multiplied to match scale & offset
        cur_min = (cur_min > cur_read) ? cur_read : cur_min; //save min and max of readings
        cur_max = (cur_max < cur_read) ? cur_read : cur_max;
        cur_sum += cur_read;   //running sum
      }
      prev_current2 = prev_current1;
      prev_current1 = current;
      current = (long)(((cur_sum - (cur_min + cur_max)) / (samplesAveraged - 2))*1000); //remove min and max, scale to mA
      current = (current < 0) ? 0 : current; //cap at 0, no negative current
      connect_state = WifiTransmit((current + prev_current1 + prev_current2) / 3);  //sends moving avg of last 3 readings, records whether the transmission succeeded
      if (connect_state == 1) {
        digitalWrite(SEG_DP, HIGH);
        delay(50);
        digitalWrite(SEG_DP, LOW);
      }
    }
    else {  //no connection established
     displayNumber(0);
     delay(500);
     WiFi.disconnect();
     wifiMulti.run();
     clearDisplay();
    }
  }
}

int ReadADC() {
  int adc_max = 0; //Reset min and max
  int adc_min = 4095;
  int raw_adc;
  for (int i = 0; i < samplesPerRead; i++) {
    raw_adc = adc1_get_raw(ADC1_CHANNEL_6); // GPIO34
    adc_min = (adc_min > raw_adc) ? raw_adc : adc_min; //save min and max of reading
    adc_max = (adc_max < raw_adc) ? raw_adc : adc_max;
  }
  return adc_max - ((adc_max + adc_min) / 2);
}



int WifiTransmit(int current) {
  static long count = 0;
  int verify = 0;
  http.begin(url, root_ca); //Specify the URL and certificate
  http.addHeader("Content-Type", "application/json");
  doc["espID"] = NODE_ID;
  doc["current"] = current;
  doc["count"] = count;
  doc["cscID"] = CSC_ID;
  doc["buildingName"] = BUILDING_NAME;
  doc["espPswd"] = "cjfskbbxgzkpaskb";
  doc["machineType"] = MACHINE_TYPE;
  serializeJson(doc, message);
  httpResponseCode = http.POST(message);   //Send the request
  if (httpResponseCode > 0) {
    if (httpResponseCode == 200){
      count++;
      verify = 1;
    }else if (httpResponseCode == 404){
      displayNumber(2);
      delay(500);
      clearDisplay();
    }else{
      displayNumber(3);
      delay(500);
      clearDisplay();
    }
  }else{
    displayNumber(1);
    delay(500);
    clearDisplay();
  }
  http.end(); //Free the resources
  return verify;
}

void clearDisplay(){
    digitalWrite(SEG_A, LOW);
    digitalWrite(SEG_B, LOW);
    digitalWrite(SEG_C, LOW);
    digitalWrite(SEG_D, LOW);
    digitalWrite(SEG_E, LOW);
    digitalWrite(SEG_F, LOW);
    digitalWrite(SEG_G, LOW);
}

void displayNumber(int n){
    switch(n){
    case 0:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, HIGH);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, LOW);
        break;
    case 1:
        digitalWrite(SEG_A, LOW);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, LOW);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, LOW);
        digitalWrite(SEG_G, LOW);
        break;
    case 2:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, LOW);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, HIGH);
        digitalWrite(SEG_F, LOW);
        digitalWrite(SEG_G, HIGH);
        break;
    case 3:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, LOW);
        digitalWrite(SEG_G, HIGH);
        break;
    case 4:
        digitalWrite(SEG_A, LOW);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, LOW);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, HIGH);
        break;
    case 5:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, LOW);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, HIGH);
        break;
    case 6:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, LOW);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, HIGH);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, HIGH);
        break;
    case 7:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, LOW);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, LOW);
        digitalWrite(SEG_G, LOW);
        break;
    case 8:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, HIGH);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, HIGH);
        break;
    case 9:
        digitalWrite(SEG_A, HIGH);
        digitalWrite(SEG_B, HIGH);
        digitalWrite(SEG_C, HIGH);
        digitalWrite(SEG_D, HIGH);
        digitalWrite(SEG_E, LOW);
        digitalWrite(SEG_F, HIGH);
        digitalWrite(SEG_G, HIGH);
        break;
    }
}
