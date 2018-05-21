import utils from '../utils';
import './bootstrap_custom/css/bootstrap.css';
import './index.css';

const serializeError = require('serialize-error');
const { ungzip } = require('pako/lib/inflate');

const $ = global.$ = global.jQuery = require('jquery');

require('json-form');


function fatalError(text) {
  let msg;

  if (text instanceof Error) msg = JSON.stringify(serializeError(text));
  else if (typeof msg !== 'string') msg = JSON.stringify(text);
  else msg = text;

  let alert = $('<div>', {
    'class': 'alert alert-danger fatal-error',
    text: msg
  });
  $('.content').html(alert);
}

function runCmd(cmd) {
  return fetch('cmd?' + encodeURIComponent(cmd)).then(
    response => {
      if (response.ok) return response.text(response);
      throw new Error(`Failed to run "${cmd}". Bad reply status (response = ${JSON.stringify(response)})`);
    }
  ).then(body => {
    if (body[0] !== '0') throw new Error(`Failed to run "${cmd}". Bad reply body content (${body})`);

    return body.slice(2);
  });
}

// Load all settings from server sequentially
// (no reason to do it in parallel 'cause controller sends them one by one anyway)
//
function loadSettings(config) {
  let promise = Promise.resolve();

  // warning: this function changes config.schema, overwriting the defaults
  utils.iterateSchema(config, function (desc, addr) {
    promise = promise
      .then(() =>
        runCmd(`R ${addr}`).then(v => {
          desc.default = Number(v);
        })
      );
  });

  return promise;
}

// Save all settings from server sequentially
//
function saveSettings(config, values) {
  let promise = Promise.resolve();

  utils.iterateSchema(config, function (desc, addr) {
    let value = Number(values[addr]) || 0;

    promise = promise
      .then(() =>
        runCmd(`W ${addr} ${value}`)
      );
  });

  return promise;
}

if (typeof fetch === 'undefined') {
  let msg = 'Your browser is too old, "fetch()" is not supported';
  fatalError(msg);
  throw new Error(msg);
}

let config;

// request config
runCmd('C').then(body => {
  if (/^gzb64:/.test(body)) {
    // base64 decode, ungzip, convert utf8 to utf16
    body = ungzip(atob(body.slice(6)), { to: 'string' });
  }

  config = JSON.parse(body);

  if (config.header) {
    $(document).prop('title', config.header);
    $('h1').text(config.header);
  }

  return loadSettings(config);
}).then(() => {
  $('form').jsonForm($.extend({}, config, {
    /*eslint-disable no-console*/
    onSubmitValid: values => {
      saveSettings(config, utils.flattenObject(values)).catch(err => {
        fatalError(err);
        console.error(err);
      });
    }
  }));
}).catch(err => {
  fatalError(err);
  console.error(err);
});
