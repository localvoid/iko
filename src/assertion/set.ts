import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeSet<V = any>(): SetAssertion<V>;
  }
}

Assertion.prototype.toBeSet = function <V = any>(
  message?: ErrorMessage<string, string, Set<V>>,
): SetAssertion<V> {
  const expected = "Set";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof Set) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a Set`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeSet,
    );
  }
  return this as any as SetAssertion<V>;
};

export class SetAssertion<V> extends Assertion<Set<V>> {
  toHaveSize(size: number, message?: ErrorMessage<number, number, Set<V>>): SetAssertion<V> {
    const expected = size;
    const actual = this.obj.size;
    if (expected !== actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have size ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toHaveSize,
      );
    }
    return this;
  }

  notToHaveSize(size: number, message?: ErrorMessage<number, number, Set<V>>): SetAssertion<V> {
    const expected = size;
    const actual = this.obj.size;
    if (expected === actual) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to have size ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToHaveSize,
      );
    }
    return this;
  }

  toHave(value: V, message?: ErrorMessage<V, Set<V>>): SetAssertion<V> {
    const expected = value;
    const actual = this.obj;
    if (actual.has(value) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have value ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toHave,
      );
    }
    return this;
  }

  notToHave(value: V, message?: ErrorMessage<V, Set<V>>): SetAssertion<V> {
    const expected = value;
    const actual = this.obj;
    if (actual.has(value) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to have value ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToHave,
      );
    }
    return this;
  }
}
