import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeString(): StringAssertion;
  }
}

Assertion.prototype.toBeString = function (
  message?: ErrorMessage<string, string, string>,
): StringAssertion {
  const expected = "string";
  const actual = this.obj;
  if (typeof actual !== "string") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to have a string type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeString,
    );
  }
  return this as any as StringAssertion;
};

export class StringAssertion extends Assertion<string> {
  toHaveLength(length: number, message?: ErrorMessage<number, number, string>): StringAssertion {
    const expected = length;
    const actual = this.obj.length;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" to have length ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toHaveLength,
      );
    }
    return this;
  }

  notToHaveLength(length: number, message?: ErrorMessage<number, number, string>): StringAssertion {
    const expected = length;
    const actual = this.obj.length;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" not to have length ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToHaveLength,
      );
    }
    return this;
  }

  toInclude(text: string, message?: ErrorMessage<string, string>): StringAssertion {
    const expected = text;
    const actual = text;
    if (actual.includes(expected) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" to include "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toInclude,
      );
    }
    return this;
  }

  notToInclude(text: string, message?: ErrorMessage<string, string>): StringAssertion {
    const expected = text;
    const actual = text;
    if (actual.includes(expected) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" not to include "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToInclude,
      );
    }
    return this;
  }

  toMatch(text: string, message?: ErrorMessage<string, string>): StringAssertion {
    const expected = text;
    const actual = text;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" to match "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toMatch,
      );
    }
    return this;
  }

  notToMatch(text: string, message?: ErrorMessage<string, string>): StringAssertion {
    const expected = text;
    const actual = text;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected "${o}" not to match "${e}"`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toMatch,
      );
    }
    return this;
  }
}
