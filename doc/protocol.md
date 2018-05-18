Configurator protocol spec
==========================

There are 2 level of abstractions

- bare metal firmware
- web page with form

## bare metal firmware

It does NOT know almost anything about commands. Firmware transparently send
strings between web page and configured device. Strings been sent via UART are
`\n`-terminated. That's all :).

Full list of what firmware does is:

- Creates WiFi access point with captive portal.
- Serves web page.
- Creates `/cmd` entry point to send commands to device and receive replies (as
  `/cmd?percent_encoded_command`).

Such approach allows JS developpers to modify everything without knowledge about
C programming.


## Commands internals

- Send:
    - `command_name <optional_params>`
- Receive
    - `0 <optional_data>` - on success
    - `error_code <optional_message>` - on fail

Current conventions, implemented in JS are:

| Command        | Reply                  | Description |
|----------------|------------------------|-------------|
| `C`            | `0 {json_form_config}` | Request device config, see [json form description](https://github.com/joshfire/jsonform/wiki) |
|                | `0 gzb64:{DATA}`       | Alt reply, gzipped and base64 encoded |
| `W addr value` | `0` or error           | Write `value` to `addr` |
| `R addr`       | `0 value` or error     | Read `addr` content     |

Note, if device is configured properly, error should never happen. All
validation happens in JS before data been sent.

Also, for simplicity we use modbus approach. Each field name has numeric
value and each written content is numeric too. That simplifies device firmware.
To show form in human friendly way, config contains human readable descriptions
for each field.


## Form description requirements

- All form fields MUST have unique names, even if nested schema (with grouped
  fields) used.
- Use `header` field to define head text
- Arrays in `schema` section are not allowed. But you can use those in `form`
  section for advanced layouts.
