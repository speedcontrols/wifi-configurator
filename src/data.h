#ifndef DATA_H
#define DATA_H

#include <Arduino.h>
#include "config.h"


class Data {
public:
    String loadedString;
    void readSerial(){
        if(Serial.available()){
            loadedString = "";
            loadedString = Serial.readString();
            LOG(String("Loaded string: ") + loadedString);
        }
    }
};

#endif
