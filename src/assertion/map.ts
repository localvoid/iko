import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeMap<K extends object = any, V = any>(): MapAssertion<K, V>;
  }
}

Assertion.prototype.toBeMap = function <K extends object = any, V = any>(
  message?: ErrorMessage<string, string, WeakSet<V>>,
): MapAssertion<K, V> {
  const expected = "Map";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof Map) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a Map`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeMap,
    );
  }
  return this as any as MapAssertion<K, V>;
};

export class MapAssertion<K, V> extends Assertion<Map<K, V>> {
  toHaveSize(size: number, message?: ErrorMessage<number, number, Map<K, V>>): MapAssertion<K, V> {
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

  notToHaveSize(size: number, message?: ErrorMessage<number, number, Map<K, V>>): MapAssertion<K, V> {
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

  toHave(key: K, message?: ErrorMessage<K, Map<K, V>>): MapAssertion<K, V> {
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

  notToHave(key: K, message?: ErrorMessage<K, Map<K, V>>): MapAssertion<K, V> {
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
