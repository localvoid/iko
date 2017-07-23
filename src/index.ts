export { AssertionError, ErrorMessage, formatError } from "./error";
export { ObjectInspector, addInspectorType, inspect } from "./inspect";
export { Matcher, m } from "./matcher";

/**
 * TypeScript doesn't allow augmentation of re-exported modules:
 * https://github.com/Microsoft/TypeScript/issues/12607
 */
import { AssertionError, ErrorMessage, formatError } from "./error";
import { inspect } from "./inspect";
import { Matcher, matchArray } from "./matcher";

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

export interface Assertion<T> {
  toBeArray<U>(): ArrayAssertion<U[]>;
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

  toMatch(match: T[], message?: ErrorMessage<T[], T[]>): ArrayAssertion<T> {
    const expected = match;
    const actual = this.obj;
    if (matchArray(actual, expected) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to match ${inspect(e)}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        true,
        this.toMatch,
      );
    }
    return this;
  }

  notToMatch(match: T[], message?: ErrorMessage<T[], T[]>): ArrayAssertion<T> {
    const expected = match;
    const actual = this.obj;
    if (matchArray(actual, expected) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to match ${inspect(e)}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToMatch,
      );
    }
    return this;
  }
}

export interface Assertion<T> {
  toBeBoolean(): BooleanAssertion;
}

Assertion.prototype.toBeBoolean = function (
  message?: ErrorMessage<string, string, boolean>,
): BooleanAssertion {
  const expected = "boolean";
  const actual = this.obj;
  if (typeof actual !== "boolean") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to have a boolean type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeBoolean,
    );
  }
  return this as any as BooleanAssertion;
};

export class BooleanAssertion extends Assertion<boolean> { }

export interface Assertion<T> {
  toBeDate(): DateAssertion;
}

Assertion.prototype.toBeDate = function (
  message?: ErrorMessage<string, string, Date>,
): DateAssertion {
  const expected = "Date";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof Date) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a Date`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeDate,
    );
  }
  return this as any as DateAssertion;
};

export class DateAssertion extends Assertion<Date> { }

export interface Assertion<T> {
  toBeError<E extends Error>(): ErrorAssertion<E>;
}

Assertion.prototype.toBeError = function <E extends Error>(
  message?: ErrorMessage<string, string, Error>,
): ErrorAssertion<E> {
  const expected = "Error";
  const actual = this.obj;
  if (typeof actual !== "object" || (actual instanceof Error) === false) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be an Error`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeError,
    );
  }
  return this as any as ErrorAssertion<E>;
};

export class ErrorAssertion<E extends Error> extends Assertion<E> { }

export interface Assertion<T> {
  toBeFunction(): FunctionAssertion;
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

  toThrow<E extends Function>(expected: E, message?: ErrorMessage<E, Function>): FunctionAssertion {
    let catched = false;
    let actual;
    try {
      this.obj();
    } catch (e) {
      actual = e;
      if (actual instanceof expected) {
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

  notToThrow<E extends Function>(expected: E, message?: ErrorMessage<E, Function>): FunctionAssertion {
    let catched = false;
    let actual;
    try {
      this.obj();
    } catch (e) {
      actual = e;
      if (actual instanceof expected) {
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

export interface Assertion<T> {
  toBeMap<K extends object = any, V = any>(): MapAssertion<K, V>;
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

export interface Assertion<T> {
  toBeNull(): NullAssertion;
  notToBeNull(): Assertion<T>;
}

Assertion.prototype.toBeNull = function (
  message?: ErrorMessage<string, string, null>,
): NullAssertion {
  const expected = "null";
  const actual = this.obj;
  if (actual !== null) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be a null`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeNull,
    );
  }
  return this as any as NullAssertion;
};

Assertion.prototype.notToBeNull = function (
  message?: ErrorMessage<string, string, null>,
): NullAssertion {
  const expected = "not null";
  const actual = this.obj;
  if (actual === null) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} not to be a null`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.notToBeNull,
    );
  }
  return this as any as NullAssertion;
};

export class NullAssertion extends Assertion<null> {
  constructor() {
    super(null);
  }
}

export interface Assertion<T> {
  toBeNumber(): NumberAssertion;
}

Assertion.prototype.toBeNumber = function (
  message?: ErrorMessage<string, string, number>,
): NumberAssertion {
  const expected = "number";
  const actual = this.obj;
  if (typeof actual !== "number") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to have a number type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeNumber,
    );
  }
  return this as any as NumberAssertion;
};

export class NumberAssertion extends Assertion<number> {
  toBeApproximatelyEqual(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if (Math.abs(actual - expected) > (actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} to be approximately equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.toBeApproximatelyEqual,
      );
    }
    return this;
  }

  notToBeApproximatelyEqual(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if (Math.abs(actual - expected) <= (actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} not to be approximately equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.notToBeApproximatelyEqual,
      );
    }
    return this;
  }

  toBeEssentiallyEqual(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if (Math.abs(actual - expected) > ((actualAbs > expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} to be essentially equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.toBeEssentiallyEqual,
      );
    }
    return this;
  }

  notToBeEssentiallyEqual(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if (Math.abs(actual - expected) <= ((actualAbs > expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} not to be essentially equal to ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.notToBeEssentiallyEqual,
      );
    }
    return this;
  }

  toBeDefinetelyGreaterThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if ((actual - expected) <= ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} to be definetely greater than ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.toBeDefinetelyGreaterThan,
      );
    }
    return this;
  }

  notToBeDefinetelyGreaterThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const expectedAbs = Math.abs(expected);
    const actualAbs = Math.abs(actual);
    if ((actual - expected) > ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} not to be definetely greater than ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.notToBeDefinetelyGreaterThan,
      );
    }
    return this;
  }

  toBeDefinetelyLessThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const actualAbs = Math.abs(actual);
    const expectedAbs = Math.abs(expected);
    if ((expected - actual) >= ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} to be definetely less than ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.toBeDefinetelyLessThan,
      );
    }
    return this;
  }

  notToBeDefinetelyLessThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    const actualAbs = Math.abs(actual);
    const expectedAbs = Math.abs(expected);
    if ((expected - actual) < ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} not to be definetely less than ${e}`,
          expected, actual, this.obj, message,
        ),
        number,
        actual,
        false,
        this.notToBeDefinetelyLessThan,
      );
    }
    return this;
  }

  toBeGreaterThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual <= expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} to be greater than ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toBeGreaterThan,
      );
    }
    return this;
  }

  notToBeGreaterThan(
    number: number,
    epsilon = Number.EPSILON,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual > expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${a} not to be greater than ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToBeGreaterThan,
      );
    }
    return this;
  }

  toBeGreaterThanOrEqual(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual < expected) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${a} to be greater than or equal ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toBeGreaterThanOrEqual,
      );
    }
    return this;
  }

  notToBeGreaterThanOrEqual(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual >= expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${e} not to be greater than or equal ${a}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToBeGreaterThanOrEqual,
      );
    }
    return this;
  }

  toBeLessThan(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual >= expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${e} to be less than ${a}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toBeLessThan,
      );
    }
    return this;
  }

  notToBeLessThan(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual < expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${e} not to be less than ${a}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToBeLessThan,
      );
    }
    return this;
  }

  toBeLessThanOrEqual(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual > expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${e} to be less than or equal ${a}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.toBeLessThanOrEqual,
      );
    }
    return this;
  }

  notToBeLessThanOrEqual(
    number: number,
    message?: ErrorMessage<number, number>,
  ): NumberAssertion {
    const expected = number;
    const actual = this.obj;
    if (actual <= expected) {
      throw new AssertionError(
        formatError(
          (e, a) => `Expected ${e} not to be less than or equal ${a}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToBeLessThanOrEqual,
      );
    }
    return this;
  }
}

export interface Assertion<T> {
  toBeObject<O extends object>(): ObjectAssertion<O>;
}

Assertion.prototype.toBeObject = function <O extends object>(
  message?: ErrorMessage<string, string, O>,
): ObjectAssertion<O> {
  const expected = "Object";
  const actual = this.obj;
  if (typeof actual !== "object") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be an Object`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeObject,
    );
  }
  return this as any as ObjectAssertion<O>;
};

export class ObjectAssertion<T extends object> extends Assertion<T> {
  toMatch(matcher: Matcher, message?: ErrorMessage<Matcher, T>): ObjectAssertion<T> {
    const expected = matcher;
    const actual = this.obj;
    if (matcher.match(actual) === false) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} to match ${e}`,
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

  notToMatch(matcher: Matcher, message?: ErrorMessage<Matcher, T>): ObjectAssertion<T> {
    const expected = matcher;
    const actual = this.obj;
    if (matcher.match(actual) === true) {
      throw new AssertionError(
        formatError(
          (e, a, o) => `Expected ${inspect(o)} not to match ${e}`,
          expected, actual, this.obj, message,
        ),
        expected,
        actual,
        false,
        this.notToMatch,
      );
    }
    return this;
  }
}

export interface Assertion<T> {
  toBeRegExp(): RegExpAssertion;
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

export interface Assertion<T> {
  toBeSet<V = any>(): SetAssertion<V>;
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

export interface Assertion<T> {
  toBeString(): StringAssertion;
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

export interface Assertion<T> {
  toBeSymbol(): SymbolAssertion;
}

Assertion.prototype.toBeSymbol = function (
  message?: ErrorMessage<string, string, Symbol>,
): SymbolAssertion {
  const expected = "symbol";
  const actual = this.obj;
  if (typeof actual !== "symbol") {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to have a symbol type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeSymbol,
    );
  }
  return this as any as SymbolAssertion;
};

export class SymbolAssertion extends Assertion<Symbol> { }

export interface Assertion<T> {
  toBeUndefined(): UndefinedAssertion;
  notToBeUndefined(): UndefinedAssertion;
}

Assertion.prototype.toBeUndefined = function (
  message?: ErrorMessage<string, string, null>,
): UndefinedAssertion {
  const expected = "undefined";
  const actual = this.obj;
  if (actual !== undefined) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} to be undefined`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeUndefined,
    );
  }
  return this as any as UndefinedAssertion;
};

Assertion.prototype.notToBeUndefined = function (
  message?: ErrorMessage<string, string, null>,
): UndefinedAssertion {
  const expected = "not undefined";
  const actual = this.obj;
  if (actual === undefined) {
    throw new AssertionError(
      formatError(
        (e, a, o) => `Expected ${inspect(o)} not to be undefined`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.notToBeUndefined,
    );
  }
  return this as any as UndefinedAssertion;
};

export class UndefinedAssertion extends Assertion<undefined> {
  constructor() {
    super(undefined);
  }
}

export interface Assertion<T> {
  toBeWeakMap<K extends object = any, V = any>(): WeakMapAssertion<K, V>;
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

export interface Assertion<T> {
  toBeWeakSet<V = any>(): WeakSetAssertion<V>;
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

export type AssertionFactory<T extends Assertion<any>> = (obj: any) => T | undefined;

let assertionFactory: AssertionFactory<any> = function (obj: any): Assertion<any> {
  if (typeof obj === "object") {
    if (obj === null) {
      return new NullAssertion();
    }
    if (Array.isArray(obj) === true) {
      return new ArrayAssertion<any>(obj);
    }
    if (obj instanceof Date) {
      return new DateAssertion(obj);
    }
    if (obj instanceof RegExp) {
      return new RegExpAssertion(obj);
    }
    if (obj instanceof Map) {
      return new MapAssertion<any, any>(obj);
    }
    if (obj instanceof WeakMap) {
      return new WeakMapAssertion<any, any>(obj);
    }
    if (obj instanceof Set) {
      return new SetAssertion<any>(obj);
    }
    if (obj instanceof WeakSet) {
      return new WeakSetAssertion<any>(obj);
    }
    if (obj instanceof Error) {
      return new ErrorAssertion<any>(obj);
    }
    if (obj instanceof Symbol) {
      return new SymbolAssertion(obj);
    }
    return new ObjectAssertion(obj);
  } else {
    if (typeof obj === "string") {
      return new StringAssertion(obj);
    }
    if (typeof obj === "number") {
      return new NumberAssertion(obj);
    }
    if (typeof obj === "boolean") {
      return new BooleanAssertion(obj);
    }
    if (typeof obj === "function") {
      return new FunctionAssertion(obj);
    }
    if (typeof obj === "undefined") {
      return new UndefinedAssertion();
    }
    if (typeof obj === "symbol") {
      return new SymbolAssertion(obj);
    }
  }
  return new Assertion<any>(obj);
};

export function addAssertionType<T>(factory: (obj: any) => T | undefined): void {
  const next = assertionFactory;
  assertionFactory = function (obj: any) {
    const assertion = factory(obj);
    if (assertion !== undefined) {
      return assertion;
    }
    return next(obj);
  };
}

export function expect(obj: null): NullAssertion;
export function expect(obj: undefined): UndefinedAssertion;
export function expect(obj: void): UndefinedAssertion;
export function expect(obj: number): NumberAssertion;
export function expect(obj: boolean): BooleanAssertion;
export function expect(obj: string): StringAssertion;
export function expect(obj: symbol): SymbolAssertion;
export function expect(obj: Function): FunctionAssertion;
export function expect<T>(obj: T[]): ArrayAssertion<T>;
export function expect(obj: Date): DateAssertion;
export function expect(obj: RegExp): RegExpAssertion;
export function expect<K, V>(obj: Map<K, V>): MapAssertion<K, V>;
export function expect<K extends object, V>(obj: WeakMap<K, V>): WeakMapAssertion<K, V>;
export function expect<V>(obj: Set<V>): SetAssertion<V>;
export function expect<V>(obj: WeakSet<V>): WeakSetAssertion<V>;
export function expect<T>(obj: T): Assertion<T>;
export function expect(obj: any): Assertion<any> {
  return assertionFactory(obj);
}
