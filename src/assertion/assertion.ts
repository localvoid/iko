import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";

export class Assertion<T> {
  obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  toSnapshot(): any {
    return this.obj;
  }

  assert<E>(
    expr: (() => boolean) | boolean,
    message: ErrorMessage<E, E, T>,
    expected: E,
    actual?: E,
    showDiff = true,
  ): Assertion<T> {
    if (((typeof expr === "function") ? expr() : expr) === false) {
      throw new AssertionError(
        formatError(message, expected, actual, this.obj),
        expected,
        actual,
        showDiff,
        this.assert,
      );
    }
    return this;
  }

  toBeFalsy(message?: ErrorMessage<boolean, T>): Assertion<T> {
    const actual = this.obj;
    if (actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to be falsy`,
          false, actual, this.obj, message,
        ),
        false,
        actual,
        false,
        this.toBeFalsy,
      );
    }
    return this;
  }

  toBeTruthy(message?: ErrorMessage<boolean, T>): Assertion<T> {
    const actual = this.obj;
    if (!actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to be truthy`,
          true, actual, this.obj, message,
        ),
        true,
        actual,
        false,
        this.toBeTruthy,
      );
    }
    return this;
  }

  toBeEqual(value: T, message?: ErrorMessage<T, T>): Assertion<T> {
    const expected = value;
    const actual = this.obj;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to be equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toBeEqual,
      );
    }
    return this;
  }

  notToBeEqual(value: T, message?: ErrorMessage<T, T>): Assertion<T> {
    const expected = value;
    const actual = this.obj;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to be equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToBeEqual,
      );
    }
    return this;
  }

  toBeInstanceOf(type: Function, message?: ErrorMessage<Function, T>): Assertion<T> {
    const expected = type;
    const actual = this.obj;
    if ((this.obj instanceof expected) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to be an instance of ${e}`,
          expected, actual, this.obj, message,
        ),
        type,
        this.obj,
        false,
        this.toBeInstanceOf,
      );
    }
    return this;
  }

  notToBeInstanceOf(type: Function, message?: ErrorMessage<Function, T>): Assertion<T> {
    const expected = type;
    const actual = this.obj;
    if ((this.obj instanceof expected) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to be an instance of ${e}`,
          expected, actual, this.obj, message,
        ),
        type,
        this.obj,
        false,
        this.notToBeInstanceOf,
      );
    }
    return this;
  }
}
