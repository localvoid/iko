"use strict";

const chalk = require("chalk");
const ikoChalk = require("iko-error-chalk");

const Colors = {
  sectionTitle: chalk.underline,
  suiteName: chalk.bold,
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

// Save timer references to avoid Sinon interfering.
// See: https://github.com/mochajs/mocha/issues/237
const Date = global.Date;

const renderAssertionError = ikoChalk.createAssertionErrorRenderer();
const stdout = process.stdout;

function formatTime(time) {
  const mins = Math.floor(time / 60000);
  const secs = (time - mins * 60000) / 1000;
  const str = secs + (secs === 1 ? " sec" : " secs");

  if (mins) {
    str = mins + (mins === 1 ? " min " : " mins ") + str;
  }

  return str;
}

function getTestNounFor(testCount) {
  return testCount === 1 ? "test" : "tests";
}

function indent(depth) {
  return "  ".repeat(depth);
}

function leftPad(p, s) {
  return s.replace(/^/gm, p);
}

function write() {
  for (let i = 0; i < arguments.length; i++) {
    stdout.write(arguments[i]);
  }
}

function fullTestName(node) {
  const result = [];
  while (node.parent) {
    result.push(node.title);
    node = node.parent;
  }
  result.reverse();
  return result.join(` ${Symbols.suite} `);
}

function Reporter(runner) {
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let slow = 0;

  const failedTests = [];
  let depth = 0;
  let netTime = 0;
  let startTime;

  runner.on("start", function () {
    startTime = new Date();
    write("\n");
  });

  runner.on("suite", function (suite) {
    if (!suite.root) {
      depth++;
      write(Colors.suiteName(`${indent(depth)}${Symbols.suite} ${suite.title}\n`));
    }
  });

  runner.on("suite end", function () {
    depth--;
    if (depth === 0) {
      write("\n");
    }
  });

  runner.on("test end", function (test) {
    netTime += test.duration;
  });

  runner.on("pass", function (test) {
    passed++;

    write(indent(depth), Colors.testPass(`  ${Symbols.success} ${test.title}`));
    const duration = test.duration;
    if (duration > test.slow()) {
      slow++;
      write(Colors.testSlow(` (${duration}ms)`));
    }

    write("\n");
  });

  runner.on("fail", function (test, err) {
    failed++;

    test.err = err;
    failedTests.push(test);
    write(indent(depth), Colors.testFail(`  ${Symbols.error} ${test.title}\n`));
  });

  runner.on("end", () => {
    const totalTime = new Date().getUTCMilliseconds() - startTime.getUTCMilliseconds();
    const currentTime = new Date().toTimeString();

    write(Colors.duration(`  Finished in ${formatTime(totalTime)} / ${formatTime(netTime)} @ ${currentTime}\n\n`));

    write(Colors.testPass(`  ${Symbols.success} ${passed} ${getTestNounFor(passed)} passed\n`));
    if (pending) {
      write(Colors.pending(`  ${Symbols.info} ${pending} ${getTestNounFor(pending)} pending\n`));
    }
    if (slow) {
      write(Colors.testSlow(`  ${Symbol.warning} ${slow} ${getTestNounFor(slow)} slow\n`));
    }
    if (failed) {
      write(Colors.testFail(`  ${Symbols.error} ${failed} ${getTestNounFor(failed)} failed\n\n`));

      write(Colors.sectionTitle("FAILED TESTS:\n\n"));
      failedTests.forEach(function (test) {
        const err = test.err;
        let rawMessage;
        let message;

        if (err.message && typeof err.message.toString === "function") {
          rawMessage = err.message;
          if (typeof rawMessage !== "string") {
            rawMessage = message = rawMessage.toString();
          } else {
            message = renderAssertionError({ text: rawMessage, annotations: err.annotations });
          }
        } else {
          rawMessage = message = "";
        }

        let stack = err.stack;
        // remove message from stack trace
        if (rawMessage) {
          const index = stack.indexOf(rawMessage);
          if (index !== -1) {
            stack = stack.slice(index + rawMessage.length + 1);
          }
        }
        stack = leftPad("  ", stack);

        write(Colors.errorTitle(`  ${Symbols.error} ${fullTestName(test)}\n\n`));
        if (err.uncaught) {
          write(Colors.errorUncaught(`    ${Symbols.warning} Uncaught Error:\n`))
        }
        write(leftPad("    ", message), "\n");
        write(Colors.errorStack(stack), "\n\n");
      });
    }
  });

  runner.on("pending", function (test) {
    pending++;
    write(Colors.pending(`  - ${test.title}`), "\n");
  });
}

module.exports = Reporter;
