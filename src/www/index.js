import './bootstrap_custom/css/bootstrap.css';
import './index.css';

const serializeError = require('serialize-error');
const { ungzip } = require('pako/lib/inflate');

const $ = global.$ = global.jQuery = require('jquery');

require('json-form');


function fatalError(text, throwError) {
  let msg;

  if (text instanceof Error) msg = JSON.stringify(serializeError(text));
  else if (typeof msg !== 'string') msg = JSON.stringify(text);
  else msg = text;

  let alert = $('<div>', {
    'class': 'alert alert-danger fatal-error',
    text: msg
  });
  $('.content').html(alert);
  if (throwError) throw new Error(msg);
}


if (typeof fetch === 'undefined') {
  fatalError('Your browser is too old, "fetch()" is not supported', true);
}

fetch('cmd?C').then(
  response => {
    if (response.ok) return response.text(response);
    throw `Failed to fetch config. Bad reply status (response = ${JSON.stringify(response)})`;
  },
  err => {
    throw `Failed to fetch config. (Error = ${JSON.stringify(serializeError(err))})`;
  }
).then(body => {
  if (body[0] !== '0') throw `Failed to fetch config. Bad reply body content (${body})`;

  body = body.slice(2);

  if (/^gzb64:/.test(body)) {
    // base64 decode, ungzip, convert utf8 to utf16
    body = ungzip(atob(body.slice(6)), { to: 'string' });
  }

  let config = JSON.parse(body);

  if (config.header) {
    $(document).prop('title', config.header);
    $('h1').text(config.header);
  }

  $('form').jsonForm($.extend({}, config, {
    /*eslint-disable no-console*/
    onSubmitValid: values => console.log(values)
  }));
}).catch(err => {
  fatalError(err);
  console.error(err);
});
