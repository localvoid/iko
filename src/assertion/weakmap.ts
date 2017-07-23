import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeWeakMap<K extends object = any, V = any>(): WeakMapAssertion<K, V>;
  }
}

Assertion.prototype.toBeWeakMap = function <K extends object = any, V = any>(
  message?: ErrorMessage<string, string, WeakSet<V>>,
): WeakMapAssertion<K, V> {
  const expected = "WeakMap";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof WeakMap) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a WeakMap`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeWeakMap,
    );
  }
  return this as any as WeakMapAssertion<K, V>;
};

export class WeakMapAssertion<K extends object, V> extends Assertion<WeakMap<K, V>> {
  toHave(key: K, message?: ErrorMessage<K, WeakMap<K, V>>): WeakMapAssertion<K, V> {
    const expected = key;
    const actual = this.obj;
    if (actual.has(key) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to have key ${e}`,
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

  notToHave(key: K, message?: ErrorMessage<K, WeakMap<K, V>>): WeakMapAssertion<K, V> {
    const expected = key;
    const actual = this.obj;
    if (actual.has(key) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to have key ${e}`,
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
