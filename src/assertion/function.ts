import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeFunction(): FunctionAssertion;
  }
}

Assertion.prototype.toBeFunction = function (
  message?: ErrorMessage<string, string, Function>,
): FunctionAssertion {
  const expected = "function";
  const actual = this.obj;
  if (typeof actual !== "function") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to have a function type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeFunction,
    );
  }
  return this as any as FunctionAssertion;
};

export class FunctionAssertion extends Assertion<Function> {
  toHaveArgumentsLength(length: number, message?: ErrorMessage<number, number, Function>): FunctionAssertion {
    const expected = length;
    const actual = this.obj.length;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have arguments length ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toHaveArgumentsLength,
      );
    }
    return this;
  }

  notToHaveArgumentsLength(length: number, message?: ErrorMessage<number, number, Function>): FunctionAssertion {
    const expected = length;
    const actual = this.obj.length;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to have arguments length ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToHaveArgumentsLength,
      );
    }
    return this;
  }

  toThrow(expected: Error, message?: ErrorMessage<Error, Function>): FunctionAssertion {
    let catched = false;
    let actual;
    try {
      this.obj();
    } catch (e) {
      actual = e;
      if (expected === actual) {
        catched = true;
      }
    }

    if (catched === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to throw exception ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toThrow,
      );
    }

    return this;
  }

  notToThrow(expected: Error, message?: ErrorMessage<Error, Function>): FunctionAssertion {
    let catched = false;
    let actual;
    try {
      this.obj();
    } catch (e) {
      actual = e;
      if (expected === actual) {
        catched = true;
      }
    }

    if (catched === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to throw exception ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToThrow,
      );
    }

    return this;
  }
}
