#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <driver/adc.h>
#include <WiFiMulti.h>

WiFiMulti wifiMulti;  

//const char* url = "https://ec2-18-116-20-30.us-east-2.compute.amazonaws.com";
const char* url = "https://intellaundry.com/api/logESPdata";

const char* root_ca = "-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"-----END CERTIFICATE-----\n";

int count;
const uint16_t samplesPerRead = 10000;
#define SENSE_PIN 34
#define SEG_A 32
#define SEG_B 0
#define SEG_C 0
#define SEG_D 4
#define SEG_E 0
#define SEG_F 0
#define SEG_G 0
#define SEG_DP 0

void setup() {
  count = 0;  

  pinMode(SEG_A, OUTPUT);
  pinMode(SEG_B, OUTPUT);
  pinMode(SEG_C, OUTPUT);
  pinMode(SEG_D, OUTPUT);
  pinMode(SEG_E, OUTPUT);
  pinMode(SEG_F, OUTPUT);
  pinMode(SEG_G, OUTPUT);
  pinMode(SEG_DP, OUTPUT);
  pinMode(SENSE_PIN, INPUT);
  digitalWrite(SEG_A,HIGH);
  
  adc1_config_width(ADC_WIDTH_BIT_12); //Initialize ADC width and attenuation
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);

  for (int i = 0; i < 6; i++){
    lightCycle();
  }
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, HIGH);
  delay(50); //Delay before staring wifi 
  
  WiFi.mode(WIFI_STA);
  wifiMulti.addAP("USER_SSID", "USER_PASSWORD");
  //wifiMulti.addAP("ONUGuest", NULL);
  
  wifiMulti.run();
  
  digitalWrite(SEG_A, LOW);
  digitalWrite(SEG_B, LOW);
  digitalWrite(SEG_C, LOW);
  digitalWrite(SEG_D, LOW);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, LOW);
}

char message[70];
StaticJsonDocument<100> doc;
HTTPClient http;
int httpResponseCode;
int current;
int cur_max = 0;
int cur_min = 4095;

void loop() {
  if (WiFi.status() == WL_CONNECTED) { //Check the current connection status
    http.begin(url, root_ca); //Specify the URL and certificate
    http.addHeader("Content-Type", "application/json");
    
    for(int i = 0; i < samplesPerRead; i++){ //Read 10000 times (takes 412ms, captures 24.72 cycles)
      current = adc1_get_raw(ADC1_CHANNEL_6); // GPIO34
      cur_min = (cur_min > current) ? current : cur_min; //save min and max of reading  
      cur_max = (cur_max < current) ? current : cur_max;    
    }
    current = (int)(((cur_max - (cur_max + cur_min) / 2 * 1000) - cur_offset) / cur_scale) * 1000; //current in mA
    doc["espID"] = NODE_ID;
    doc["current"] = (float)current / 1000; //displays 3 decimals of precision 
    doc["count"] = count;
    serializeJson(doc, message);
    httpResponseCode = http.POST(message);   //Send the request
    
    cur_max = 0; //Reset min and max
    cur_min = 4095;
    
    if(httpResponseCode>0){
      count++;
    }
    
    http.end(); //Free the resources
  }else{
    digitalWrite(32,HIGH);
    WiFi.disconnect();
    //WiFi.begin(ssid); 
    wifiMulti.run();
    while (WiFi.status() != WL_CONNECTED) { //Wait until connected
      lightCycle();
    }
    digitalWrite(32,LOW);
  }
  delay(500);
}

void lightCycle() {
  for (int j = 0; j < 6; j++) {
    // A
    digitalWrite(SEG_F, LOW);
    digitalWrite(SEG_A, HIGH);
    delay(100);
    // B
    digitalWrite(SEG_A, LOW);
    digitalWrite(SEG_B, HIGH);
    delay(100);
    // C
    digitalWrite(SEG_B, LOW);
    digitalWrite(SEG_C, HIGH);
    delay(100);
    // D
    digitalWrite(SEG_C, LOW);
    digitalWrite(SEG_D, HIGH);
    delay(100);
    // E
    digitalWrite(SEG_D, LOW);
    digitalWrite(SEG_E, HIGH);
    delay(100);
    // F
    digitalWrite(SEG_E, LOW);
    digitalWrite(SEG_F, HIGH);
    delay(100);
  }
}
