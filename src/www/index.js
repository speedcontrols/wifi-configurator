import utils from '../utils';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

const serializeError = require('serialize-error');
const { ungzip } = require('pako/lib/inflate');

const $ = global.$ = global.jQuery = require('jquery');
const { JSONForm } = require('json-form');

/* eslint-disable max-len */
JSONForm.fieldTemplate = function (inner) {
  return '<div class="<%= cls.groupClass %> jsonform-node jsonform-error-<%= keydash %>' +
    '<%= elt.htmlClass ? " " + elt.htmlClass : "" %>' +
    '<%= (node.required && node.formElement && (node.formElement.type !== "checkbox") ? " jsonform-required" : "") %>' +
    '<%= (node.isReadOnly() ? " jsonform-readonly" : "") %>' +
    '<%= (node.disabled ? " jsonform-disabled" : "") %>' +
    '" data-jsonform-type="<%= node.formElement.type %>">' +
    '<% if (node.title && !elt.notitle && elt.inlinetitle !== true) { %>' +
      '<label class="<%= cls.labelClass %>" for="<%= node.id %>"><%= node.title %></label>' +
    '<% } %>' +
    '<div class="<%= cls.controlClass %>">' +
      '<% if (node.prepend || node.append) { %>' +
        '<div class="<%= node.prepend ? cls.prependClass : "" %> ' +
        '<%= node.append ? cls.appendClass : "" %>">' +
        '<% if (node.prepend && node.prepend.indexOf("<button ") >= 0) { %>' +
          '<% if (cls.buttonAddonClass) { %>' +
            '<span class="<%= cls.buttonAddonClass %>"><%= node.prepend %></span>' +
          '<% } else { %>' +
            '<%= node.prepend %>' +
          '<% } %>' +
        '<% } %>' +
        '<% if (node.prepend && node.prepend.indexOf("<button ") < 0) { %>' +
          '<span class="<%= cls.addonClass %>"><%= node.prepend %></span>' +
        '<% } %>' +
      '<% } %>' +
      inner +
      '<% if (node.append && node.append.indexOf("<button ") >= 0) { %>' +
        '<% if (cls.buttonAddonClass) { %>' +
          '<span class="<%= cls.buttonAddonClass %>"><%= node.append %></span>' +
        '<% } else { %>' +
          '<%= node.append %>' +
        '<% } %>' +
      '<% } %>' +
      '<% if (node.append && node.append.indexOf("<button ") < 0) { %>' +
        '<span class="<%= cls.addonClass %>"><%= node.append %></span>' +
      '<% } %>' +
      '<% if (node.prepend || node.append) { %>' +
        '</div>' +
      '<% } %>' +
      '<% if (node.description) { %>' +
        '<span class="form-text text-muted small jsonform-description"><%= node.description %></span>' +
      '<% } %>' +
      '<span class="form-text text-muted small jsonform-errortext" style="display:none;"></span>' +
    '</div></div>';
};

JSONForm.elementTypes.fieldset.template =
  '<fieldset class="jsonform-node jsonform-error-<%= keydash %> <% if (elt.expandable) { %>expandable<% } %> <%= elt.htmlClass?elt.htmlClass:"" %>" ' +
  '<% if (id) { %> id="<%= id %>"<% } %>' +
  ' data-jsonform-type="fieldset">' +
  '<% if (node.title || node.legend) { %><legend><%= node.title || node.legend %></legend><% } %>' +
  '<% if (elt.expandable) { %><div class="<%= cls.groupClass %>"><% } %>' +
  '<%= children %>' +
  '<% if (elt.expandable) { %></div><% } %>' +
  '<span class="form-text text-muted small jsonform-errortext" style="display:none;"></span>' +
  '</fieldset>';
/* eslint-enable max-len */

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
