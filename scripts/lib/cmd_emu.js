// Emulate responces to command
//
// C => config
// W DDD VVV => write
// R DDD => read
//

const read = require('fs').readFileSync;
const resolve = require('path').resolve;
const yaml = require('js-yaml').safeLoad;
const gzip = require('zlib').gzipSync;

const BAD_PARAMS = '1 Bad params';

const memory = {
  1: 0,
  2: 35
};

// Read on start to make sure content is correct
yaml(read(resolve(__dirname, '../../test/fixtures/form.yml')));

module.exports = function (cmd, options = {}) {
  if (cmd === 'C') {
    // Reread form config on each request - useful for development
    const config = yaml(read(resolve(__dirname, '../../test/fixtures/form.yml')));

    if (!options.gzip) return `0 ${JSON.stringify(config)}`;

    return `0 gzb64:${gzip(JSON.stringify(config)).toString('base64')}`;
  }

  const R_RE = /^R (\d+)$/;

  if (R_RE.test(cmd)) {
    let addr = cmd.match(R_RE)[1];

    if (!memory.hasOwnProperty(addr)) return BAD_PARAMS;

    return `0 ${memory[addr]}`;
  }

  const W_RE = /^W (\d+) (\d+)$/;

  if (W_RE.test(cmd)) {
    let addr = cmd.match(W_RE)[1];
    let value = cmd.match(W_RE)[2];

    if (!memory.hasOwnProperty(addr)) return BAD_PARAMS;

    memory[addr] = value;

    return '0';
  }

  return BAD_PARAMS;
};
