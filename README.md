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
board, connected via USB to your computer.

Now setup software:

**TBD**


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

TBD:

- build firmware
- UART responder (low level emulator to test firmware on bare metal)


## License

MIT.
