import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeWeakSet<V = any>(): WeakSetAssertion<V>;
  }
}

Assertion.prototype.toBeWeakSet = function <V = any>(
  message?: ErrorMessage<string, string, WeakSet<V>>,
): WeakSetAssertion<V> {
  const expected = "WeakSet";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof WeakSet) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a WeakSet`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeWeakSet,
    );
  }
  return this as any as WeakSetAssertion<V>;
};

export class WeakSetAssertion<V> extends Assertion<WeakSet<V>> {
  toHave(value: V, message?: ErrorMessage<V, WeakSet<V>>): WeakSetAssertion<V> {
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

  notToHave(value: V, message?: ErrorMessage<V, WeakSet<V>>): WeakSetAssertion<V> {
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
