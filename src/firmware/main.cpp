#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>

const byte DNS_PORT = 53;

IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);

const char *wifi_ssid = "cfg";
const char *wifi_password = "configure";
const char *hostname = "cfg";
String host = "";
String captive_portal_url = "http://";


DNSServer dnsServer;
ESP8266WebServer webServer(80);


void toCaptivePortal()
{
  webServer.sendHeader("Location", captive_portal_url, true);
  webServer.send(302, "text/plain", "");
  // Stop is needed because we sent no content length (empty content)
  webServer.client().stop();
  Serial.print(webServer.uri());
  Serial.println(" => redirect to /");
}

void handleRoot()
{
  // Respond only for our IP, redirect the rest
  String h = webServer.header("Host");
  if (h != host && h != "") {
    toCaptivePortal();
    return;
  }

  webServer.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  webServer.sendHeader("Pragma", "no-cache");
  webServer.sendHeader("Expires", "-1");

  const char *index_path = "/www/index.html";
  const char *index_gz_path = "/www/index.html.gz";

  if (!SPIFFS.exists(index_path) | !SPIFFS.exists(index_gz_path)) {
    webServer.send(500, "text/plain", "No index.html(.gz) on SPIFFS");
    Serial.println("Serving / failed, index missed");
    return;
  }

  File file;

  if (webServer.header("Accept-Encoding").indexOf("gzip") >= 0) {
    Serial.println("Start serve / (gzipped)");
    file = SPIFFS.open(index_gz_path, "r");
  } else {
    Serial.println("Start serve / (plain)");
    file = SPIFFS.open(index_path, "r");
    webServer.sendHeader("Vary", "Accept-Encoding");
  }
  // streamer adds "Content-Encoding: gzip" if file name ends with `.gz`
  // and content-type is NOT gzip
  webServer.streamFile(file, "text/html");
  file.close();
  Serial.println("Served /");
}

void handleCmd() {
  webServer.send(500, "text/plain", "not implemented yet");
}

void handleNotFound()
{
  // We still have to redirect all apple testing requests
  if (webServer.header("User-Agent").startsWith("CaptiveNetworkSupport")) {
    toCaptivePortal();
    return;
  }
  Serial.print(webServer.uri());
  Serial.println(" => 404");
}


void setup() {
  Serial.begin(115200);
  Serial.print("\n");
  Serial.setDebugOutput(true);

  // Init FS
  SPIFFS.begin();

  // Run WiFi
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, netMsk);
  WiFi.softAP(wifi_ssid, wifi_password);

  host += apIP.toString();
  // Calculate Captive Portal URL for redirects
  captive_portal_url += host;

  delay(500);
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());

  // Setup fake DNS server - redirect all domains to apIP
  dnsServer.setTTL(5); // reduce cache time, but avoid issues with 0
  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(DNS_PORT, "*", apIP);

  Serial.println("DNS stub started");

  // Setup MDNS responder
  if (!MDNS.begin(hostname)) {
    Serial.println("Error setting up MDNS responder!");
  } else {
    // Announce service
    MDNS.addService("http", "tcp", 80);
    Serial.println("mDNS responder started");
  }

  // Setup web server
  webServer.on("/", handleRoot);
  webServer.on("/cmd", handleCmd);
  webServer.onNotFound(handleNotFound);

  // Captive portals - redirect to default page
  // https://serverfault.com/questions/679393/captive-portal-popups-the-definitive-guide
  webServer.on("/library/test/success.html", toCaptivePortal); // apple
  webServer.on("/hotspot-detect.html", toCaptivePortal); // apple
  webServer.on("/generate_204", toCaptivePortal); // android
  webServer.on("/ncsi.txt", toCaptivePortal); // win mo

  // set headers to parse
  const char *headerkeys[] = { "Host", "User-Agent", "Cookie", "Accept-Encoding" } ;
  size_t headerkeyssize = sizeof(headerkeys) / sizeof(char*);
  webServer.collectHeaders(headerkeys, headerkeyssize);

  webServer.begin();
  Serial.println("HTTP server started");
}


void loop() {
  dnsServer.processNextRequest();
  webServer.handleClient();
}