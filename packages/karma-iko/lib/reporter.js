"use strict";

const chalk = require("chalk");
const ikoChalk = require("iko-error-chalk");

const Colors = {
  divider: chalk.dim.bold,
  sectionTitle: chalk.underline,
  browserName: chalk.italic.dim.yellow,
  suiteName: chalk.bold,
  testSkip: chalk.grey,
  testPass: chalk.green,
  testFail: chalk.red,
  testSlow: chalk.red,
  pending: chalk.yellow,
  errorTitle: chalk.bold.red,
  errorMessage: chalk,
  errorStack: chalk.italic.grey,
  errorUncaught: chalk.bold.red,
  duration: chalk.dim,
};

const Symbols = {
  suite: "›",
  info: "ℹ",
  success: "✔",
  warning: "⚠",
  error: "✖",
};

if (process.platform === "win32") {
  Object.assign(Symbols, {
    info: "i",
    success: "√",
    warning: "‼",
    error: "×",
  });
}

const renderAssertionError = ikoChalk.createAssertionErrorRenderer();

function formatTime(time) {
  const mins = Math.floor(time / 60000);
  const secs = (time - mins * 60000) / 1000;
  const str = secs + (secs === 1 ? " sec" : " secs");

  if (mins) {
    str = mins + (mins === 1 ? " min " : " mins ") + str;
  }

  return str;
}

function indent(depth) {
  return "  ".repeat(depth);
}

function leftPad(p, s) {
  return s.replace(/^/gm, p);
}

function getTestNounFor(testCount) {
  return testCount === 1 ? "test" : "tests";
}

function suiteName(suite) {
  let result = "";
  for (let i = 0; i < suite.length; i++) {
    result += `${suite[i]} ${Symbols.suite} `;
  }
  return result;
}

/**
 * The IkoReporter.
 *
 * @param {!object} baseReporterDecorator The karma base reporter.
 * @param {!object} config The karma config.
 * @param {!object} loggerFactory The karma logger factory.
 * @constructor
 */
function IkoReporter(baseReporterDecorator, config, loggerFactory, formatError) {
  // extend the base reporter
  baseReporterDecorator(this);

  const logger = loggerFactory.create("reporter.iko");

  const divider = "=".repeat(process.stdout.columns || 80);

  let slow = 0;
  let totalTime = 0;
  let netTime = 0;

  let failedTests = [];
  let firstRun = true;
  let isRunCompleted = false;

  // disable chalk when colors is set to false
  chalk.enabled = config.colors !== false;

  const self = this;
  const write = function () {
    for (let i = 0; i < arguments.length; i++) {
      self.write(arguments[i]);
    }
  }

  this.onSpecComplete = (browser, result) => {
    const suite = result.suite;
    const description = result.description;

    write(Colors.browserName(`${browser.name} `));

    if (result.skipped) {
      write(Colors.testSkip(`${Symbols.info} ${suiteName(suite)}${description}\n`));
    } else if (result.success) {
      write(Colors.testPass(`${Symbols.success} ${suiteName(suite)}${description}`));
      if (config.reportSlowerThan && result.time > config.reportSlowerThan) {
        write(Colors.testSlow(" (slow: " + formatTime(result.time) + ")"));
        slow++;
      }
      write("\n");
    } else {
      failedTests.push({ browser: browser, result: result });
      write(Colors.testFail(`${Symbols.error} ${suiteName(suite)}${description}\n`));
    }
  };

  this.onRunStart = () => {
    if (!firstRun && divider) {
      write(Colors.divider(`${divider}\n\n`));
    }
    failedTests = [];
    firstRun = false;
    isRunCompleted = false;
    totalTime = 0;
    netTime = 0;
    slow = 0;
  };

  this.onBrowserStart = () => {
  };

  this.onRunComplete = (browsers, results) => {
    browsers.forEach(function (browser) {
      totalTime += browser.lastResult.totalTime;
    });

    // print extra error message for some special cases, e.g. when having the error "Some of your tests did a full page
    // reload!" the onRunComplete() method is called twice
    if (results.error && isRunCompleted) {
      write("\n");
      write(colors.error(`${Symbols.error} Error while running the tests! Exit code: ${results.exitCode}\n\n`));
      return;
    }

    isRunCompleted = true;

    const currentTime = new Date().toTimeString();

    write(Colors.duration(`\n  Finished in ${formatTime(totalTime)} / ${formatTime(netTime)} @ ${currentTime}\n\n`));

    if (browsers.length > 0 && !results.disconnected) {
      write(Colors.testPass(`  ${Symbols.success} ${results.success} ${getTestNounFor(results.success)} completed\n`));

      if (slow) {
        write(Colors.testSlow(`  ${Symbols.warning} ${slow} ${getTestNounFor(slow)} slow\n`));
      }

      if (results.failed) {
        write(Colors.testFail(`  ${Symbols.error} ${results.failed} ${getTestNounFor(results.failed)} failed\n\n`));

        write(Colors.sectionTitle("FAILED TESTS:\n\n"));
        failedTests.forEach(function (failedTest) {
          const browser = failedTest.browser;
          const result = failedTest.result;
          const logs = result.log;
          const assertionErrors = result.assertionErrors;

          write(Colors.browserName(browser.name), "\n");
          write(Colors.errorTitle(`  ${Symbols.error} ${suiteName(result.suite)}${result.description}\n\n`));

          if (assertionErrors.length > 0) {
            for (let i = 0; i < assertionErrors.length; i++) {
              const error = assertionErrors[i];
              const rawMessage = error.message;
              const message = renderAssertionError({ text: rawMessage, annotations: error.annotations });

              let stack = error.stack;
              if (rawMessage) {
                const index = stack.indexOf(rawMessage);
                if (index !== -1) {
                  stack = stack.slice(index + rawMessage.length + 1);
                }
              }
              stack = leftPad("  ", stack);

              write(leftPad("    ", message), "\n");
              write(Colors.errorStack(formatError(stack)), "\n");
            }
          } else if (logs.length > 0) {
            for (let i = 0; i < logs.length; i++) {
              write(Colors.errorMessage(leftPad("    ", formatError(logs[i]))), "\n");
            }
          }
        });
      }
    }
    write("\n");
  };
};

IkoReporter.$inject = ["baseReporterDecorator", "config", "logger", "formatError"];

module.exports = IkoReporter;
