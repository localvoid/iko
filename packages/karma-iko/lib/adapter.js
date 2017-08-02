
(function (window) {
  "use strict";

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var context = window.__mocha_context__ = {
    test: null,
    index: 0
  };

  var formatError = function (error) {
    var stack = error.stack;
    var message = error.message;

    if (stack) {
      if (message && stack.indexOf(message) === -1) {
        stack = message + "\n" + stack;
      }

      // remove mocha stack entries
      return stack.replace(/\n.+\/mocha\/mocha\.js\?\w*:[\d:]+\)?(?=(\n|$))/g, "");
    }

    return message;
  };

  var processAssertionError = function (error) {
    if (error.$$type === "AssertionError") {
      return {
        name: error.name,
        message: error.message,
        annotations: error.annotations,
        stack: error.stack
      };
    }
  };

  var createMochaReporterConstructor = function (tc, pathname) {
    var isDebugPage = /debug.html$/.test(pathname);

    // Set custom reporter on debug page
    if (isDebugPage && karma.config && karma.config.mocha && tc.config.mocha.reporter) {
      var mochaNode = document.createElement("div");
      mochaNode.id = "mocha";
      document.body.appendChild(mochaNode);
      return tc.config.mocha.reporter;
    }

    return function (runner) {
      runner.on("start", function () {
        tc.info({ total: runner.total });
      });

      runner.on("end", function () {
        tc.complete({
          coverage: window.__coverage__,
          snapshot: window.__snapshot__
        });
      });

      runner.on("test", function (test) {
        context.test = test;
        context.index = 0;

        test.$startTime = Date.now();
        test.$errors = [];
        test.$assertionErrors = [];
      });

      runner.on("pending", function (test) {
        test.pending = true;
      });

      runner.on("fail", function (test, error) {
        var simpleError = formatError(error);
        var assertionError = processAssertionError(error);
        if (test.type === "hook") {
          test.$errors = isDebugPage ? [error] : [simpleError];
          test.$assertionErrors = assertionError ? [assertionError] : [];
          runner.emit("test end", test)
        } else {
          test.$errors.push(isDebugPage ? error : simpleError);
          if (assertionError) {
            test.$assertionErrors.push(assertionError);
          }
        }
      });

      runner.on("test end", function (test) {
        var skipped = test.pending === true;

        var result = {
          id: "",
          description: test.title,
          suite: [],
          success: test.state === "passed",
          skipped: skipped,
          pending: skipped,
          time: skipped ? 0 : test.duration,
          log: test.$errors,
          assertionErrors: test.$assertionErrors,
          startTime: test.$startTime,
          endTime: Date.now()
        };

        var node = test.parent;
        while (!node.root) {
          result.suite.push(node.title);
          node = node.parent;
        }
        result.suite.reverse();

        tc.result(result);
      })
    }
  };

  // Default configuration
  var mochaConfig = {
    reporter: createMochaReporterConstructor(window.__karma__, window.location.pathname),
    ui: "bdd",
    globals: ["__cov*"]
  };

  window.__karma__.start = (function (mocha) {
    return function (config) {
      var args = config && config.args;

      if (args) {
        if (Array.isArray(args)) {
          var isGrepArg = false;
          for (var i = 0; i < args.length; i++) {
            if (isGrepArg) {
              mocha.grep(new RegExp(arg));
            } else if (arg === "--grep") {
              isGrepArg = true;
              continue;
            } else {
              var match = /--grep=(.*)/.exec(arg);

              if (match) {
                mocha.grep(new RegExp(match[1]));
              }
            }
            isGrepArg = false;
          }
        }
      }

      mocha.run();
    }
  })(window.mocha);

  window.mocha.setup((function (karma) {
    if (!karma.config || !karma.config.mocha) {
      return mochaConfig
    }

    // Copy all properties to mochaConfig
    for (var key in karma.config.mocha) {
      if (hasOwnProperty.call(karma.config.mocha, key)) {
        switch (key) {
          case "reporter":
          case "require":
            continue;
        }

        // and merge the globals if they exist.
        if (key === "globals") {
          mochaConfig.globals = mochaConfig.globals.concat(karma.config.mocha[key]);
          continue;
        }

        mochaConfig[key] = karma.config.mocha[key];
      }
    }

    return mochaConfig;
  })(window.__karma__));
})(window);