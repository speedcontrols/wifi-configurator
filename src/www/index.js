import utils from './utils';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

const serializeError = require('serialize-error');
const { ungzip } = require('pako/lib/inflate');

const $ = global.$ = global.jQuery = require('jquery');
const { JSONForm } = require('json-form');

const tpl = require('./templates');

JSONForm.fieldTemplate = tpl.fieldTemplate;
JSONForm.elementTypes.fieldset.template = tpl.fieldsetTemplate;


function fatalError(text) {
  $('.msg-content').removeClass('d-none');
  $('.page-content').addClass('d-none');
  $('.msg-content').html(tpl.fatalErrorTemplate);

  // Simple text. Replace all content.
  if (typeof text === 'string') {
    $('.msg-fatal').text(text);
    return;
  }

  // Error. Format message and stack.
  if (text instanceof Error) {
    let err = serializeError(text);

    let msg = err.message ? `Error: ${err.message}\n\n` : 'Error:\n\n';
    let stack = err.stack;

    delete err.message;
    delete err.stack;

    msg += JSON.stringify(err, null, 2);

    if (stack) msg += '\n\n' + stack;

    $('.msg-fatal-code').text(msg);
    return;
  }

  // Other object - show content.
  $('.msg-fatal-code').text(JSON.stringify(text, null, 2));
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

  promise.then(() => {
    $('.msg-content').removeClass('d-none');
    $('.msg-content').html(tpl.loadSettingsTemplate);
  });

  let total = utils.countSchema(config);
  let progress = 0;

  // warning: this function changes config.schema, overwriting the defaults
  utils.iterateSchema(config, function (desc, addr) {
    promise = promise
      .then(() => runCmd(`R ${addr}`))
      .then(v => { desc.default = Number(v); })
      .then(() => {
        progress++;
        $('.msg-loading .progress-bar').width(`${progress / total * 100}%`);
      });
  });

  promise = promise.then(() => { $('.msg-content').addClass('d-none'); });

  return promise;
}


// Save all settings from server sequentially
//
function saveSettings(config, values) {
  let promise = Promise.resolve();

  promise.then(() => {
    $('.page-content').addClass('d-none');
    $('.msg-content').removeClass('d-none');
    $('.msg-content').html(tpl.saveSettingsTemplate);
  });

  let total = utils.countSchema(config);
  let progress = 0;

  utils.iterateSchema(config, function (desc, addr) {
    let value = Number(values[addr]) || 0;
    promise = promise
      .then(() => runCmd(`W ${addr} ${value}`))
      .then(() => {
        progress++;
        $('.msg-saving .progress-bar').width(`${progress / total * 100}%`);
      });
  });

  promise = promise.then(() => {
    $('.msg-content').addClass('d-none');
    $('.page-content').removeClass('d-none');
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

  $('.page-content').removeClass('d-none');
}).catch(err => {
  fatalError(err);
  console.error(err);
});
