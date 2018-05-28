#ifndef __CONFIG_HPP__
#define __CONFIG_HPP__

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FS.h>
#include <ArduinoJson.h>


struct CFG {
  IPAddress ip = IPAddress(192, 168, 4, 1);
  IPAddress mask = IPAddress(255, 255, 255, 0);
  String wifi_ssid = "cfg";
  String wifi_password = "configure";
  String name_local = "cfg";
  String host;
  String captive_portal_url;
  bool button = false;
};


void loadConfig(CFG &cfg) {
  const char* cfg_path = "/config.json5";

  if (SPIFFS.exists(cfg_path)) {
    DynamicJsonBuffer jsonBuffer(2048);
    File file = SPIFFS.open(cfg_path, "r");
    JsonObject& root = jsonBuffer.parseObject(file);

    if (root.success()) {
      Serial.println("Config load: root ok");

      if (root["wifi_ssid"].is<const char*>() &&
          strlen(root["wifi_ssid"].as<const char*>()) > 0) {
        cfg.wifi_ssid = root["wifi_ssid"].as<const char*>();
      }

      if (root["wifi_password"].is<const char*>()) {
        if (strlen(root["wifi_password"].as<const char*>()) < 8) {
          Serial.println("Config load: password too short, use default");
        } else {
          cfg.wifi_password = root["wifi_password"].as<const char*>();
        }
      }

      IPAddress ip;
      if (root["wifi_ip"].is<const char*>() &&
          ip.fromString(root["wifi_ip"].as<const char*>())) {
        cfg.ip = ip;
      }

      IPAddress mask;
      if (root["wifi_netmask"].is<const char*>() &&
          mask.fromString(root["wifi_netmask"].as<const char*>())) {
        cfg.mask = mask;
      }

      if (root["name_local"].is<const char*>() &&
          strlen(root["name_local"].as<const char*>()) > 0) {
        cfg.name_local = root["name_local"].as<const char*>();
      }

      if (root["button"].is<bool>()) cfg.button = root["button"].as<bool>();
    } else {
      Serial.println("Config load: parse failed, use defaults");
    }
  } else {
    Serial.println("Missed config file, use defaults");
  }

  // Finalize - calculate some constants for convenience
  cfg.host = cfg.ip.toString();
  cfg.captive_portal_url = "http://" + cfg.host;
}

#endif
