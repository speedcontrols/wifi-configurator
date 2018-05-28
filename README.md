WiFi configurator
=================

> Firmware for [Wemos D1 mini](https://www.aliexpress.com/wholesale?SearchText=Wemos+D1+mini)
(ESP8266) to configure speed controls (or any other device, supporting
> simple [protocol](doc/protocol.md)).

**Why?**

Some devices like motor speed controls need to be configured. But that happens
only once. It would be nice to avoid add display/keyboard into hardware
for such task and implement complex menu system in device firmware.

Idea is simple - use cheap ESP8266 board and configure everything via web
browser on your mobile or desktop. Just insert `Wemos D1 mini` into your device,
connect to new WiFi network, follow to suggested web page and update params as
you need. After config complete - remove Wemos board from your device. Easy!


## How to flash firmware

First, you need [Wemos D1 mini](https://www.aliexpress.com/wholesale?SearchText=Wemos+D1+mini)
board, connected via USB to your computer (4MB version).

1. Install PlatformIO IDE. Follow instructions [here](http://docs.platformio.org/en/latest/ide/pioide.html).
   We use PIO for Atom, but PIO for VSCode should be ok too.
   - Make sure you've [installed](http://docs.platformio.org/en/latest/installation.html#troubleshooting)
     udev rules (linux) or device drivers (windows).
2. Clone this repo or download via zip archive.
3. Edit wifi password in `/src/firmware/data/config.json5`, tune other params
   if you wish.
4. Open this project in installed IDE.
5. Open `PlatformIO` -> `Terminal` -> `New Terminal`

Now type this commands in terminat window:

```bash
pio run --target upload
pio run --target uploadfs
```


## How thing work

This happens step-by-step:

- New access point is created, with captive portal.
- When user connects to AP, it's suggested to follow captive portal page.
- User opens suggested page
- Default web page served, and device configuration requested via UART in
  [json-form](https://github.com/joshfire/jsonform/wiki) format.
- Form with described fields displayed to user
- User modifies params and press submit buttons
- Form fields been sent to defice via UART.

See [protocol](doc/protocol.md) description for details about UART
communications.


## Development

- `npm run www` - Starts web server to develop web page content. With simple
  device emulator.
- `npm run build-www` - update firmware files with new www content.

In PlatformIO:

```bash
pio run --target upload
pio run --target uploadfs
```

First command compiles sources and upload firmware to board. Second one builds
SPIFFS image and uploads it. Also, you can run those commands via IDE menus.

`IDE` -> `PlatformIO` -> `Monitor` - starts monitor to see debug messages.


## License

MIT.
