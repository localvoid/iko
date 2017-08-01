# karma-iko

This package is a part of [iko](https://github.com/localvoid/iko) library.

It is a modified [Karma](http://karma-runner.github.io/) adapter for [Mocha](https://mochajs.org/) testing framework and
a Karma reporter that supports iko rich text messages.

## Karma Configuration

Just replace `mocha` framework and reporter with `iko`:

```js
// karma.conf.js
module.exports = function (config) {
  config.set({
    frameworks: ["iko"],
    reporters: ["iko"],
  });
};
```