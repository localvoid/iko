import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Matcher } from "../matcher";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeArray<U>(): ArrayAssertion<U[]>;
  }
}

Assertion.prototype.toBeArray = function <U>(
  message?: ErrorMessage<string, string, U[]>,
): ArrayAssertion<U> {
  const expected = "Array";
  const actual = this.obj;
  if (typeof actual !== "object" || Array.isArray(actual) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be an Array`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeArray,
    );
  }
  return this as any as ArrayAssertion<U>;
};

export class ArrayAssertion<T> extends Assertion<T[]> {
  toHaveLength(length: number, message?: ErrorMessage<number, number, T[]>): ArrayAssertion<T> {
    const expected = length;
    const actual = this.obj.length;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have length ${e}`,
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

  notToHaveLength(length: number, message?: ErrorMessage<number, number, T[]>): ArrayAssertion<T> {
    const expected = length;
    const actual = this.obj.length;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have length ${e}`,
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

  toInclude(value: T | Matcher, message?: ErrorMessage<T | Matcher, T[]>): ArrayAssertion<T> {
    const expected = value;
    const actual = this.obj;
    const ok = expected instanceof Matcher ?
      actual.some((i) => expected.match(i)) :
      actual.indexOf(expected) !== -1;
    if (ok === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to include ${e}`,
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

  notToInclude(value: T | Matcher, message?: ErrorMessage<T | Matcher, T[]>): ArrayAssertion<T> {
    const expected = value;
    const actual = this.obj;
    const ok = expected instanceof Matcher ?
      actual.some((i) => expected.match(i)) :
      actual.indexOf(expected) !== -1;
    if (ok === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to include ${e}`,
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
}
