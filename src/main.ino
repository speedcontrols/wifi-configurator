#define DEBUG

#include "webserver.h"

void espInit(){
    delay(500);
    Serial.begin(SERIAL_BAUD_RATE);
    LOG();
}

void setup() {
    espInit();
    WebServer::start();
}

void loop() {
    WebServer::handlers();
    data.readSerial();
}
