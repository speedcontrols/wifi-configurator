/*global describe, it*/

const assert = require('assert');
const cmd_emu = require('../scripts/lib/cmd_emu.js');
const read = require('fs').readFileSync;
const resolve = require('path').resolve;
const yaml = require('js-yaml').safeLoad;

const formInfo = yaml(read(resolve(__dirname, './fixtures/form.yml')));

describe('commands emulator', function () {

  it('R/W', function () {
    assert.strictEqual(cmd_emu('R 1'), '0 0');
    assert.strictEqual(cmd_emu('W 1 14'), '0');
    assert.strictEqual(cmd_emu('R 1'), '0 14');
  });

  it('R/W bad address', function () {
    assert.strictEqual(cmd_emu('R 100'), '1 Bad params');
    assert.strictEqual(cmd_emu('W 100 0'), '1 Bad params');
  });

  it('R/W bad format', function () {
    assert.strictEqual(cmd_emu('R ii'), '1 Bad params');
    assert.strictEqual(cmd_emu('W 1 ii'), '1 Bad params');
  });

  it('Config', function () {
    assert.strictEqual(cmd_emu('C 5'), '1 Bad params');
    assert.strictEqual(cmd_emu('C'), '0 ' + JSON.stringify(formInfo));
  });

});
