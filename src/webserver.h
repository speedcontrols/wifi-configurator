#ifndef WEBSERVER_H
#define WEBSERVER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "config.h"
#include "data.h"
#include "../template/template.h"

DNSServer dnsServer;
ESP8266WebServer server(WEB_SERVER_PORT);
Data data;

class WebServer {
public:
    static void start(){
        WiFi.mode(WIFI_AP);
        WiFi.softAPConfig(
            IPAddress(192, 168, 156, 1),
            IPAddress(192, 168, 156, 1),
            IPAddress(255, 255, 255, 0)
        );
        WiFi.softAP(AP_NAME);
        LOG(String("SoftAPName: ") + AP_NAME);

        dnsServer.start(DNS_PORT, "*", IPAddress(192, 168, 156, 1));

        server.onNotFound(handleCaptive);
        server.on("/", handleRoot);
        server.on("/send", handleSend);
        server.on("/upload", handleUpload);

        server.begin();

        LOG("WebServer started");
        LOG(String("IP: ") + toStringIp(IPAddress(192, 168, 156, 1)));
    }
    static void handlers(){
        dnsServer.processNextRequest();
        server.handleClient();
    }

private:
    static boolean captivePortal()
    {
        if (!isIp(server.hostHeader())) {
            //LOG("Request redirected to captive portal");
            server.sendHeader("Location", String("http://") + toStringIp(
                                   server.client().localIP()), true);
            server.send(302, "text/plain", "");
            server.client().stop();
            return true;
        }
        return false;
    }

    static boolean isIp(String str)
    {
        int l = str.length();
        for (int i = 0; i < l; i++) {
            int c = str.charAt(i);
            if (c != '.' && (c < '0' || c > '9'))
                return false;
        }
        return true;
    }

    static String toStringIp(IPAddress ip)
    {
        String res = "";
        for (int i = 0; i < 3; i++)
            res += String((ip >> (8 * i)) & 0xFF) + ".";
        res += String(((ip >> 8 * 3)) & 0xFF);
        return res;
    }

    static void handleCaptive(){
        delay(50);
        if(!captivePortal()) handleRoot();
    }
    static void handleRoot(){
        delay(50);
        String h = FPSTR(Template::HEAD);
        String s = FPSTR(Template::STYLE);
        String b = FPSTR(Template::BODY);
        String j = FPSTR(Template::JS);
        String html = String(h + s + b + j);
        server.send(200, "text/html", html);
    }
    static void handleSend(){
        delay(50);
        //LOG(server.args());
        for(int i = 0; i<server.args(); i++){
            String name = server.argName(i);
            String value = server.arg(name);
            Serial.println(name + ": " + value);
        }
        handleRoot();
    }

    static void handleUpload(){
        delay(50);
        String h = FPSTR(Template::HEAD);
        String s = FPSTR(Template::STYLE);
        String b = FPSTR(Template::BODY);
        String j = FPSTR(Template::JS);
        String d = "<p id='pData'>" + data.loadedString + "</p>";
        String html = String(h + s + b + d + j);
        server.send(200, "text/html", html);
    }
};
#endif
