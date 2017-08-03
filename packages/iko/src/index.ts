export { AssertionError } from "./error";
export { ErrorMessageWriter, errMsg, r, e, hl, stringify } from "./stringify";
export { diff } from "./diff";

/**
 * TypeScript doesn't allow augmentation of re-exported modules:
 * https://github.com/Microsoft/TypeScript/issues/12607
 */
import { RichText } from "rtext";
import { rt } from "rtext-writer";
import { AssertionError } from "./error";
import { diff } from "./diff";
import { errMsg, r, e, stringify } from "./stringify";
import { isEqual } from "lodash";

export class Assertion<T> {
  readonly obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  toSnapshot(): string {
    return this.obj.toString();
  }

  assert<E>(
    expr: (() => boolean) | boolean,
    message: (expected: E, actual?: T) => RichText,
    expected: E,
    actual?: T,
  ): this {
    const pass = ((typeof expr === "function") ? expr() : expr) === true;
    if (pass === false) {
      throw new AssertionError(message(expected, actual), this.assert);
    }
    return this;
  }

  toBeFalsy(): this {
    const received = this.obj;
    const pass = !received;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeFalsy", "received", "")
        .info("Expected value to be truthy, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeFalsy);
    }
    return this;
  }

  toBeTruthy(): this {
    const received = this.obj;
    const pass = !!received;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeTruthy", "received", "")
        .info("Expected value to be truthy, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeTruthy);
    }
    return this;
  }

  toBe(value: T): this {
    const expected = value;
    const received = this.obj;
    const pass = expected === received;
    if (!pass) {
      const diffText = diff(expected, received);
      const message = errMsg()
        .matcherHint("toBe")
        .info("Expected value to be (strict equality ===):\n")
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");
      if (diffText !== null) {
        message.diff("\nDifference:\n\n", diffText);
      }

      throw new AssertionError(message.compose(), this.toBe);
    }
    return this;
  }

  notToBe(value: T): this {
    const expected = value;
    const received = this.obj;
    const pass = expected !== received;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBe")
        .info("Expected value not to be (strict inequality !==):\n")
        .info("  ", e(expected), "\n");

      throw new AssertionError(message.compose(), this.toBe);
    }
    return this;
  }

  toBeNull(): NullAssertion {
    const received = this.obj;
    const pass = received === null;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeNull", "received", "")
        .info("Expected value to be null, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeNull);
    }
    return this as any as NullAssertion;
  }

  notToBeNull(): this {
    const received = this.obj;
    const pass = received !== null;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeNull", "received", "")
        .info("Expected value not to be null\n");

      throw new AssertionError(message.compose(), this.notToBeNull);
    }
    return this;
  }

  toBeUndefined(): UndefinedAssertion {
    const received = this.obj;
    const pass = received === undefined;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeUndefined", "received", "")
        .info("Expected value to be undefined, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeUndefined);
    }
    return this as any as UndefinedAssertion;
  }

  notToBeUndefined(): this {
    const received = this.obj;
    const pass = received !== undefined;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeUndefined", "received", "")
        .info("Expected value not to be undefined\n");

      throw new AssertionError(message.compose(), this.notToBeUndefined);
    }
    return this;
  }

  toBeObject<O extends object>(): ObjectAssertion<O> {
    const received = this.obj;
    const pass = typeof received === "object";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeObject", "received", "")
        .info("Expected value to be an object, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeObject);
    }
    return this as any as ObjectAssertion<O>;
  }

  toBeArray<U>(): ArrayAssertion<U> {
    const received = this.obj;
    const pass = typeof received === "object" && Array.isArray(received);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeArray", "received", "")
        .info("Expected value to be an array, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeArray);
    }
    return this as any as ArrayAssertion<U>;
  }

  toBeBoolean(): BooleanAssertion {
    const received = this.obj;
    const pass = typeof received === "boolean";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeBoolean", "received", "")
        .info("Expected value to be a boolean, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeBoolean);
    }
    return this as any as BooleanAssertion;
  }

  toBeNumber(): NumberAssertion {
    const received = this.obj;
    const pass = typeof received === "number";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeNumber", "received", "")
        .info("Expected value to be a number, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeNumber);
    }
    return this as any as NumberAssertion;
  }

  toBeString(): StringAssertion {
    const received = this.obj;
    const pass = typeof received === "string";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeString", "received", "")
        .info("Expected value to be a string, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeString);
    }
    return this as any as StringAssertion;
  }

  toBeFunction(): FunctionAssertion {
    const received = this.obj;
    const pass = typeof received === "function";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeFunction", "received", "")
        .info("Expected value to be a function, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeFunction);
    }
    return this as any as FunctionAssertion;
  }

  toBeSymbol(): SymbolAssertion {
    const received = this.obj;
    const pass = typeof received === "symbol";
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeSymbol", "received", "")
        .info("Expected value to be a symbol, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeSymbol);
    }
    return this as any as SymbolAssertion;
  }

  toBeDate(): DateAssertion {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Date;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeDate", "received", "")
        .info("Expected value to be a Date, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeDate);
    }
    return this as any as DateAssertion;
  }

  toBeRegExp(): RegExpAssertion {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof RegExp;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeRegExp", "received", "")
        .info("Expected value to be a RegExp, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeRegExp);
    }
    return this as any as RegExpAssertion;
  }

  toBeError<E extends Error>(): ErrorAssertion<E> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Error;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeError", "received", "")
        .info("Expected value to be an Error, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeError);
    }
    return this as any as ErrorAssertion<E>;
  }

  toBeMap<K extends object = any, V = any>(): MapAssertion<K, V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Map;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeMap", "received", "")
        .info("Expected value to be a Map, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeMap);
    }
    return this as any as MapAssertion<K, V>;
  }

  toBeWeakMap<K extends object = any, V = any>(): WeakMapAssertion<K, V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof WeakMap;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeWeakMap", "received", "")
        .info("Expected value to be a WeakMap, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeWeakMap);
    }
    return this as any as WeakMapAssertion<K, V>;
  }

  toBeSet<V = any>(): SetAssertion<V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Set;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeSet", "received", "")
        .info("Expected value to be a Set, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeSet);
    }
    return this as any as SetAssertion<V>;
  }

  toBeWeakSet<V = any>(): WeakSetAssertion<V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof WeakSet;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeWeakSet", "received", "")
        .info("Expected value to be a WeakSet, instead received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeWeakSet);
    }
    return this as any as WeakSetAssertion<V>;
  }

  toBeInstanceOf(type: Function): this {
    const received = this.obj;
    const expected = type;
    const pass = typeof received === "object" && received instanceof type;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeInstanceOf")
        .info("Expected value to be an instance of:\n")
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeInstanceOf);
    }
    return this;
  }

  notToBeInstanceOf(type: Function): this {
    const received = this.obj;
    const expected = type;
    const pass = typeof received !== "object" || (received instanceof type) === false;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeInstanceOf")
        .info("Expected value not to be an instance of:\n")
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.notToBeInstanceOf);
    }
    return this;
  }
}

export class NullAssertion extends Assertion<null> {
  constructor() {
    super(null);
  }
}

export class UndefinedAssertion extends Assertion<undefined> {
  constructor() {
    super(undefined);
  }
}

export class BooleanAssertion extends Assertion<boolean> { }

function matchException(a: any, b: string | Error | ErrorConstructor): boolean {
  if (typeof b === "string") {
    if (typeof a === "string" && a.indexOf(b) !== -1) {
      return true;
    } else if (a instanceof Error && a.message.indexOf(b) !== -1) {
      return true;
    }
  } else {
    if (b instanceof Error) {
      return a.constructor === b.constructor || a instanceof b.constructor;
    } else if (b.prototype instanceof Error || b === Error) {
      return a.constructor === b || a instanceof b;
    }
  }
  return false;
}

export class FunctionAssertion extends Assertion<Function> {
  toHaveArgumentsLength(length: number): this {
    const received = this.obj.length;
    const expected = length;
    const pass = received === expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHaveArgumentsLength")
        .info(rt`Expected function to have arguments length ${e(expected)}, instead it have length ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toHaveArgumentsLength);
    }
    return this;
  }

  notToHaveArgumentsLength(length: number): this {
    const received = this.obj;
    const expected = length;
    const pass = received.length !== expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHaveLength")
        .info(rt`Expected function not to have arguments length ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHaveArgumentsLength);
    }
    return this;
  }

  toThrow<E extends Error | ErrorConstructor>(expected?: string | E): this {
    let pass = false;
    try {
      this.obj();
    } catch (e) {
      if (expected !== undefined && matchException(e, expected) === true) {
        pass = true;
      }
    }

    if (!pass) {
      const message = errMsg()
        .matcherHint("toThrow")
        .info(rt`Expected function to throw an exception ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.toThrow);
    }

    return this;
  }

  notToThrow<E extends Error | ErrorConstructor>(expected?: string | E): this {
    let pass = true;
    try {
      this.obj();
    } catch (e) {
      if (expected !== undefined && matchException(e, expected) === true) {
        pass = false;
      }
    }

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToThrow")
        .info(rt`Expected function not to throw an exception ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToThrow);
    }

    return this;
  }
}

const eB = e("b", true);
const rA = r("a", true);
const eE = e("epsilon", true);

export class NumberAssertion extends Assertion<number> {
  toBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = Math.abs(a - b) <= (aAbs < bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeApproximatelyEqual", "received", "expected", "epsilon")
        .hint(rt`abs(${rA} - ${eB}) <= (abs(${rA}) < abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}\n\n`)
        .info(rt`Expected number to be approximately equal to ${e(b)}, intstead received ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeApproximatelyEqual);
    }

    return this;
  }

  notToBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !(Math.abs(a - b) <= (aAbs < bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeApproximatelyEqual", "received", "expected", "epsilon")
        .hint(rt`!(abs(${rA} - ${eB}) <= (abs(${rA}) < abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE})\n\n`)
        .info(rt`Expected number not to be approximately equal to ${e(b)}, instead received ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeApproximatelyEqual);
    }

    return this;
  }

  toBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = Math.abs(a - b) <= (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeEssentiallyEqual", "received", "expected", "epsilon")
        .hint(rt`abs(${rA} - ${eB}) <= (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}\n\n`)
        .info(rt`Expected number to be essentially equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeEssentiallyEqual);
    }

    return this;
  }

  notToBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !(Math.abs(a - b) <= (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeEssentiallyEqual", "received", "expected", "epsilon")
        .hint(rt`!(abs(${rA} - ${eB}) <= (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}) \n\n`)
        .info(rt`Expected number not to be essentially equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeEssentiallyEqual);
    }

    return this;
  }

  toBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = (a - b) > (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeDefinitelyGreaterThan", "received", "expected", "epsilon")
        .hint(rt`(${rA} - ${eB}) > (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}\n\n`)
        .info(rt`Expected number to be definetely greater than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeDefinetelyGreaterThan);
    }

    return this;
  }

  notToBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !((a - b) > (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeDefinitelyGreaterThan", "received", "expected", "epsilon")
        .hint(rt`!((${rA} - ${eB}) > (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE})\n\n`)
        .info(rt`Expected number not to be definetely greater than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeDefinetelyGreaterThan);
    }

    return this;
  }

  toBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = (b - a) > (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeDefinitelyLessThan", "received", "expected", "epsilon")
        .hint(rt`(${eB} - ${rA}) > (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}\n\n`)
        .info(rt`Expected number to be definetely less than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeDefinetelyLessThan);
    }

    return this;
  }

  notToBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !((b - a) > (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeDefinitelyLessThan", "received", "expected", "epsilon")
        .hint(rt`!((${eB} - ${rA}) > (abs(${rA}) > abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE})\n\n`)
        .info(rt`Expected number not to be definetely less than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeDefinetelyLessThan);
    }

    return this;
  }

  toBeGreaterThan(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = a > b;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeGreaterThan")
        .info(rt`Expected number to be greater than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeGreaterThan);
    }

    return this;
  }

  notToBeGreaterThan(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = !(a > b);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeGreaterThan")
        .info(rt`Expected number not to be greater than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeGreaterThan);
    }

    return this;
  }

  toBeGreaterThanOrEqual(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = a >= b;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeGreaterThanOrEqual")
        .info(rt`Expected number to be greater than or equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeGreaterThanOrEqual);
    }

    return this;
  }

  notToBeGreaterThanOrEqual(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = !(a >= b);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeGreaterThanOrEqual")
        .info(rt`Expected number not to be greater than or equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeGreaterThanOrEqual);
    }

    return this;
  }

  toBeLessThan(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = a < b;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeLessThan")
        .info(rt`Expected number to be less than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeLessThan);
    }

    return this;
  }

  notToBeLessThan(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = !(a < b);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeLessThan")
        .info(rt`Expected number not to be less than ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeLessThan);
    }

    return this;
  }

  toBeLessThanOrEqual(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = a <= b;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeLessThanOrEqual")
        .info(rt`Expected number to be less than or equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeLessThanOrEqual);
    }

    return this;
  }

  notToBeLessThanOrEqual(number: number): this {
    const a = this.obj;
    const b = number;
    const pass = !(a <= b);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeLessThanOrEqual")
        .info(rt`Expected number not to be less than or equal to ${e(b)}, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.notToBeLessThanOrEqual);
    }

    return this;
  }

  toBeNaN(): this {
    const a = this.obj;
    const pass = Number.isNaN(a);

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeNaN", "received", "")
        .info(rt`Expected number to be NaN, instead received: ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeNaN);
    }

    return this;
  }

  notToBeNaN(): this {
    const a = this.obj;
    const pass = !Number.isNaN(a);

    if (!pass) {
      const message = errMsg()
        .matcherHint("notToBeNaN", "received", "")
        .info("Expected number not to be NaN\n");

      throw new AssertionError(message.compose(), this.notToBeNaN);
    }

    return this;
  }
}

export class StringAssertion extends Assertion<string> {
  toSnapshot() {
    return this.obj;
  }

  toHaveLength(length: number): this {
    const received = this.obj.length;
    const expected = length;
    const pass = received === expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHaveLength")
        .info(rt`Expected string to have length ${e(expected)}, instead it have length ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toHaveLength);
    }
    return this;
  }

  notToHaveLength(length: number): this {
    const received = this.obj.length;
    const expected = length;
    const pass = received !== expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHaveLength")
        .info(rt`Expected string not to have length ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHaveLength);
    }
    return this;
  }

  toInclude(text: string): this {
    const received = this.obj;
    const expected = text;
    const pass = received.includes(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toInclude")
        .info(rt`Expected string to include ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toInclude);
    }
    return this;
  }

  notToInclude(text: string): this {
    const received = this.obj;
    const expected = text;
    const pass = !received.includes(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToInclude")
        .info(rt`Expected string not to include ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.notToInclude);
    }
    return this;
  }

  toMatch(text: string | RegExp): this {
    const received = this.obj;
    const expected = text;
    const pass = !!received.match(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toMatch")
        .info(rt`Expected string to match ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toMatch);
    }
    return this;
  }

  notToMatch(text: string | RegExp): this {
    const received = this.obj;
    const expected = text;
    const pass = !received.match(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToMatch")
        .info(rt`Expected string not to match ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.notToMatch);
    }
    return this;
  }
}

export class SymbolAssertion extends Assertion<Symbol> { }

export class ObjectAssertion<T extends object> extends Assertion<T> {
  readonly type: string;

  constructor(obj: T, type = "object") {
    super(obj);
    this.type = type;
  }

  toSnapshot() {
    return stringify(this.obj);
  }

  toBeEqual(expected: T): this {
    const received = this.obj;
    const pass = isEqual(received, expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeEqual")
        .info(`Expected ${this.type} to be equal (deep equality):\n`)
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toBeEqual);
    }
    return this;
  }

  notToBeEqual(expected: T): this {
    const received = this.obj;
    const pass = !isEqual(received, expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToMatch")
        .info(`Expected ${this.type} not to be equal (deep equality):\n`)
        .info("  ", e(expected), "\n");

      throw new AssertionError(message.compose(), this.notToBeEqual);
    }
    return this;
  }
}

export class ArrayAssertion<T> extends ObjectAssertion<T[]> {
  constructor(obj: T[]) {
    super(obj, "array");
  }

  toHaveLength(length: number): this {
    const received = this.obj;
    const expected = length;
    const pass = received.length === expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHaveLength")
        .info(rt`Expected array to have a length ${e(expected)} instead it have a length ${r(received.length)}\n`);

      throw new AssertionError(message.compose(), this.toHaveLength);
    }
    return this;
  }

  notToHaveLength(length: number): this {
    const received = this.obj;
    const expected = length;
    const pass = received.length !== expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHaveLength")
        .info(rt`Expected array not to have a length ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHaveLength);
    }
    return this;
  }

  toContain(value: T): this {
    const received = this.obj;
    const expected = value;
    const pass = received.indexOf(expected) !== -1;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toContain")
        .info("Expected array to contain:\n")
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.toContain);
    }
    return this;
  }

  notToContain(value: T): this {
    const received = this.obj;
    const expected = value;
    const pass = received.indexOf(expected) === -1;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToContain")
        .info("Expected array not to contain:\n")
        .info("  ", e(expected), "\n")
        .info("Received:\n")
        .info("  ", r(received), "\n");

      throw new AssertionError(message.compose(), this.notToContain);
    }

    return this;
  }
}

export class DateAssertion extends ObjectAssertion<Date> {
  constructor(obj: Date) {
    super(obj, "Date");
  }
}

export class ErrorAssertion<E extends Error> extends ObjectAssertion<E> {
  constructor(obj: E) {
    super(obj, "Error");
  }
}

export class RegExpAssertion extends ObjectAssertion<RegExp> {
  constructor(obj: RegExp) {
    super(obj, "RegExp");
  }

  toSnapshot(): string {
    return this.obj.valueOf().toString();
  }

  toTest(text: string): this {
    const received = this.obj;
    const expected = text;
    const pass = received.test(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toTest")
        .info(rt`Expected RegExp to test ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toTest);
    }
    return this;
  }

  notToTest(text: string): this {
    const received = this.obj;
    const expected = text;
    const pass = received.test(expected);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToTest")
        .info(rt`Expected RegExp not to test ${e(expected)}\n`)
        .info(rt`Received: ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.notToTest);
    }
    return this;
  }
}

export class MapAssertion<K, V> extends ObjectAssertion<Map<K, V>> {
  constructor(obj: Map<K, V>) {
    super(obj, "Map");
  }

  toHaveSize(size: number): this {
    const received = this.obj.size;
    const expected = size;
    const pass = received === expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHaveSize")
        .info(rt`Expected Map to have size ${e(expected)}, instead it have size ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toHaveSize);
    }

    return this;
  }

  notToHaveSize(size: number): this {
    const received = this.obj.size;
    const expected = size;
    const pass = received !== expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHaveSize")
        .info(rt`Expected Map not to have size ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHaveSize);
    }

    return this;
  }

  toHave(key: K): this {
    const received = this.obj;
    const expected = key;
    const pass = received.has(key);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHave")
        .info(rt`Expected Map to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.toHave);
    }
    return this;
  }

  notToHave(key: K): this {
    const received = this.obj;
    const expected = key;
    const pass = !received.has(key);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHave")
        .info(rt`Expected Map not to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHave);
    }
    return this;
  }
}

export class SetAssertion<V> extends ObjectAssertion<Set<V>> {
  constructor(obj: Set<V>) {
    super(obj, "Set");
  }

  toHaveSize(size: number): this {
    const received = this.obj.size;
    const expected = size;
    const pass = received === expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHaveSize")
        .info(rt`Expected Set to have size ${e(expected)}, instead it have size ${r(received)}\n`);

      throw new AssertionError(message.compose(), this.toHaveSize);
    }

    return this;
  }

  notToHaveSize(size: number): this {
    const received = this.obj.size;
    const expected = size;
    const pass = received !== expected;
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHaveSize")
        .info(rt`Expected Set not to have size ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHaveSize);
    }

    return this;
  }

  toHave(value: V): this {
    const received = this.obj;
    const expected = value;
    const pass = received.has(value);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHave")
        .info(rt`Expected Set to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.toHave);
    }
    return this;
  }

  notToHave(value: V): this {
    const received = this.obj;
    const expected = value;
    const pass = !received.has(value);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHave")
        .info(rt`Expected Set not to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHave);
    }
    return this;
  }
}

export class WeakMapAssertion<K extends object, V> extends ObjectAssertion<WeakMap<K, V>> {
  constructor(obj: WeakMap<K, V>) {
    super(obj, "WeakMap");
  }

  toHave(key: K): this {
    const received = this.obj;
    const expected = key;
    const pass = received.has(key);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHave")
        .info(rt`Expected WeakMap to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.toHave);
    }
    return this;
  }

  notToHave(key: K): this {
    const received = this.obj;
    const expected = key;
    const pass = !received.has(key);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHave")
        .info(rt`Expected WeakMap not to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHave);
    }
    return this;
  }
}

export class WeakSetAssertion<V> extends ObjectAssertion<WeakSet<V>> {
  constructor(obj: WeakSet<V>) {
    super(obj, "WeakSet");
  }

  toHave(value: V): this {
    const received = this.obj;
    const expected = value;
    const pass = received.has(value);
    if (!pass) {
      const message = errMsg()
        .matcherHint("toHave")
        .info(rt`Expected WeakSet to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.toHave);
    }
    return this;
  }

  notToHave(value: V): this {
    const received = this.obj;
    const expected = value;
    const pass = !received.has(value);
    if (!pass) {
      const message = errMsg()
        .matcherHint("notToHave")
        .info(rt`Expected WeakSet not to have ${e(expected)}\n`);

      throw new AssertionError(message.compose(), this.notToHave);
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
