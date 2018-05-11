#ifndef CONFIG_H
#define CONFIG_H

//#include <EEPROM.h>
#include <Arduino.h>


#ifdef DEBUG
#define LOG(x) Serial.println(x)
#else
#define LOG(x)
#endif


#define AP_NAME "ESP_Configurator"
#define SERIAL_BAUD_RATE 115200
#define DNS_PORT 53
#define WEB_SERVER_PORT 80

#endif
