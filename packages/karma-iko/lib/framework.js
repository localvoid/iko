"use strict";

const path = require("path");
const extend = require("util")._extend;
const minimist = require("minimist");

function createPattern(path) {
  return { pattern: path, included: true, served: true, watched: false };
}

function IkoFramework(files, config) {
  const mochaPath = path.dirname(require.resolve("mocha"))
  files.unshift(createPattern(path.join(__dirname, "adapter.js")))

  config = config || {}
  config.client = config.client || {}
  const mochaConfig = config.client.mocha = getMochaOpts(config.client.mocha || {})

  files.unshift(createPattern(path.join(mochaPath, "mocha.js")))

  if (mochaConfig.reporter) {
    files.unshift(createPattern(path.join(mochaPath, "mocha.css")))
  }
}

IkoFramework.$inject = ["config.files", "config"];

function getMochaOpts(mochaConfig) {
  var optsPath = typeof mochaConfig.opts === "string" ? mochaConfig.opts : "test/mocha.opts";

  if (!mochaConfig.opts) {
    return mochaConfig;
  }

  delete mochaConfig.opts;

  var fs = require("fs");
  if (!fs.existsSync(optsPath)) {
    return mochaConfig;
  }

  return extend(normalizeOpts(minimist(fs.readFileSync(optsPath, "utf8")
    .replace(/\\\s/g, "%20")
    .split(/\s/)
    .filter(Boolean)
    .map(function (value) {
      return value.replace(/%20/g, " ")
    }))), mochaConfig)

  function normalizeOpts(opts) {
    opts = [
      "ui",
      "reporter",
      "globals",
      "grep",
      "timeout",
      "slow",
      "bail",
      "ignoreLeaks"
    ].reduce(function (result, optName) {
      if (opts.hasOwnProperty(optName)) {
        result[optName] = opts[optName]
      }

      return result
    }, {});

    opts.require = [].concat(opts.require || []);

    return opts;
  }
}

module.exports = IkoFramework;
