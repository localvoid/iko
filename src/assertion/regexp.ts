import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeRegExp(): RegExpAssertion;
  }
}

Assertion.prototype.toBeRegExp = function (
  message?: ErrorMessage<string, string, RegExp>,
): RegExpAssertion {
  const expected = "RegExp";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof RegExp) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a RegExp`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeRegExp,
    );
  }
  return this as any as RegExpAssertion;
};

export const enum RegExpFlags {
  Global = 1,
  IgnoreCase = 1 << 1,
  Multiline = 1 << 2,
  Unicode = 1 << 3,
  Sticky = 1 << 4,
}

function regExpFlags(re: RegExp): RegExpFlags {
  let flags = 0;
  if (re.global === true) {
    flags |= RegExpFlags.Global;
  }
  if (re.ignoreCase === true) {
    flags |= RegExpFlags.IgnoreCase;
  }
  if (re.multiline === true) {
    flags |= RegExpFlags.Multiline;
  }
  if (re.unicode === true) {
    flags |= RegExpFlags.Unicode;
  }
  if (re.sticky === true) {
    flags |= RegExpFlags.Sticky;
  }
  return flags;
}

export class RegExpAssertion extends Assertion<RegExp> {
  toSnapshot() {
    return this.obj.valueOf();
  }

  toHaveFlags(flags: RegExpFlags, message?: ErrorMessage<RegExpFlags, RegExpFlags, RegExp>): RegExpAssertion {
    const expected = flags;
    const actual = regExpFlags(this.obj);
    if ((expected & actual) === expected) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have flags ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toHaveFlags,
      );
    }
    return this;
  }

  notToHaveFlags(flags: RegExpFlags, message?: ErrorMessage<RegExpFlags, RegExpFlags, RegExp>): RegExpAssertion {
    const expected = flags;
    const actual = regExpFlags(this.obj);
    if ((expected & actual) !== 0) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to have flags ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToHaveFlags,
      );
    }
    return this;
  }

  toTest(text: string, message?: ErrorMessage<string, RegExp>): RegExpAssertion {
    const expected = text;
    const actual = this.obj;
    if (actual.test(expected) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to test "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toTest,
      );
    }
    return this;
  }

  notToTest(text: string, message?: ErrorMessage<string, RegExp>): RegExpAssertion {
    const expected = text;
    const actual = this.obj;
    if (actual.test(expected) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to test "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToTest,
      );
    }
    return this;
  }
}
