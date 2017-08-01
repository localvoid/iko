export { AssertionError } from "./error";
export { Matcher, m } from "./matcher";
import { diff } from "./diff";

/**
 * TypeScript doesn't allow augmentation of re-exported modules:
 * https://github.com/Microsoft/TypeScript/issues/12607
 */
import { RichText } from "rtext";
import { richText } from "rtext-writer";
import { AssertionError } from "./error";
import { mh, r, e } from "./stringify";
import { Matcher, matchArray, matchException } from "./matcher";

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
    message: (expected: E, actual?: T) => RichText,
    expected: E,
    actual?: T,
  ): Assertion<T> {
    const pass = ((typeof expr === "function") ? expr() : expr) === true;
    if (pass === false) {
      throw new AssertionError(message(expected, actual), actual, expected, this.assert);
    }
    return this;
  }

  toBeFalsy(): Assertion<T> {
    const received = this.obj;
    const pass = !received;
    if (!pass) {
      const message = richText()
        .write(mh("toBeFalsy", "received", ""))
        .write("Expected value to be truthy, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, false, this.toBeFalsy);
    }
    return this;
  }

  toBeTruthy(): Assertion<T> {
    const received = this.obj;
    const pass = !!received;
    if (!pass) {
      const message = richText()
        .write(mh("toBeTruthy", "received", ""))
        .write("Expected value to be truthy, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeTruthy);
    }
    return this;
  }

  toBe(value: T): Assertion<T> {
    const expected = value;
    const received = this.obj;
    const pass = expected === received;
    if (!pass) {
      const diffText = diff(expected, received);
      const message = richText()
        .write(mh("toBe"))
        .write("Expected value to be (strict equality ===):\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");
      if (diffText !== null) {
        message
          .begin("diff")
          .write("\n", "Difference:\n\n")
          .write(diffText)
          .end("diff");
      }

      throw new AssertionError(message.compose(), received, expected, this.toBe);
    }
    return this;
  }

  notToBe(value: T): Assertion<T> {
    const expected = value;
    const received = this.obj;
    const pass = expected !== received;
    if (!pass) {
      const message = richText()
        .write(mh("notToBe"))
        .write("Expected value not to be (strict inequality !==):\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, expected, this.toBe);
    }
    return this;
  }

  toBeNull(): NullAssertion {
    const received = this.obj;
    const pass = received === null;
    if (!pass) {
      const message = richText()
        .write(mh("toBeNull", "received", ""))
        .write("Expected value to be null, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeNull);
    }
    return this as any as NullAssertion;
  }

  notToBeNull(): NullAssertion {
    const received = this.obj;
    const pass = received !== null;
    if (!pass) {
      const message = richText()
        .write(mh("notToBeNull", "received", ""))
        .write("Expected value not to be null\n");

      throw new AssertionError(message.compose(), received, true, this.notToBeNull);
    }
    return this as any as NullAssertion;
  }

  toBeUndefined(): UndefinedAssertion {
    const received = this.obj;
    const pass = received === undefined;
    if (!pass) {
      const message = richText()
        .write(mh("toBeUndefined", "received", ""))
        .write("Expected value to be undefined, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeUndefined);
    }
    return this as any as UndefinedAssertion;
  }

  notToBeUndefined(): UndefinedAssertion {
    const received = this.obj;
    const pass = received !== undefined;
    if (!pass) {
      const message = richText()
        .write(mh("notToBeUndefined", "received", ""))
        .write("Expected value not to be undefined\n");

      throw new AssertionError(message.compose(), received, true, this.notToBeUndefined);
    }
    return this as any as UndefinedAssertion;
  }

  toBeObject<O extends object>(): ObjectAssertion<O> {
    const received = this.obj;
    const pass = typeof received === "object";
    if (!pass) {
      const message = richText()
        .write(mh("toBeObject", "received", ""))
        .write("Expected value to be an object, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeObject);
    }
    return this as any as ObjectAssertion<O>;
  }

  toBeArray<U>(): ArrayAssertion<U> {
    const received = this.obj;
    const pass = typeof received === "object" && Array.isArray(received);
    if (!pass) {
      const message = richText()
        .write(mh("toBeArray", "received", ""))
        .write("Expected value to be an array, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeArray);
    }
    return this as any as ArrayAssertion<U>;
  }

  toBeBoolean(): BooleanAssertion {
    const received = this.obj;
    const pass = typeof received === "boolean";
    if (!pass) {
      const message = richText()
        .write(mh("toBeBoolean", "received", ""))
        .write("Expected value to be a boolean, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeBoolean);
    }
    return this as any as BooleanAssertion;
  }

  toBeNumber(): NumberAssertion {
    const received = this.obj;
    const pass = typeof received === "number";
    if (!pass) {
      const message = richText()
        .write(mh("toBeNumber", "received", ""))
        .write("Expected value to be a number, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeNumber);
    }
    return this as any as NumberAssertion;
  }

  toBeString(): StringAssertion {
    const received = this.obj;
    const pass = typeof received === "string";
    if (!pass) {
      const message = richText()
        .write(mh("toBeString", "received", ""))
        .write("Expected value to be a string, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeString);
    }
    return this as any as StringAssertion;
  }

  toBeFunction(): FunctionAssertion {
    const received = this.obj;
    const pass = typeof received === "function";
    if (!pass) {
      const message = richText()
        .write(mh("toBeFunction", "received", ""))
        .write("Expected value to be a function, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeFunction);
    }
    return this as any as FunctionAssertion;
  }

  toBeSymbol(): SymbolAssertion {
    const received = this.obj;
    const pass = typeof received === "symbol";
    if (!pass) {
      const message = richText()
        .write(mh("toBeSymbol", "received", ""))
        .write("Expected value to be a symbol, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeSymbol);
    }
    return this as any as SymbolAssertion;
  }

  toBeDate(): DateAssertion {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Date;
    if (!pass) {
      const message = richText()
        .write(mh("toBeDate", "received", ""))
        .write("Expected value to be a Date, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeDate);
    }
    return this as any as DateAssertion;
  }

  toBeRegExp(): RegExpAssertion {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof RegExp;
    if (!pass) {
      const message = richText()
        .write(mh("toBeRegExp", "received", ""))
        .write("Expected value to be a RegExp, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeRegExp);
    }
    return this as any as RegExpAssertion;
  }

  toBeError<E extends Error>(): ErrorAssertion<E> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Error;
    if (!pass) {
      const message = richText()
        .write(mh("toBeError", "received", ""))
        .write("Expected value to be an Error, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeError);
    }
    return this as any as ErrorAssertion<E>;
  }

  toBeMap<K extends object = any, V = any>(): MapAssertion<K, V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Map;
    if (!pass) {
      const message = richText()
        .write(mh("toBeMap", "received", ""))
        .write("Expected value to be a Map, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeMap);
    }
    return this as any as MapAssertion<K, V>;
  }

  toBeWeakMap<K extends object = any, V = any>(): WeakMapAssertion<K, V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof WeakMap;
    if (!pass) {
      const message = richText()
        .write(mh("toBeWeakMap", "received", ""))
        .write("Expected value to be a WeakMap, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeWeakMap);
    }
    return this as any as WeakMapAssertion<K, V>;
  }

  toBeSet<V = any>(): SetAssertion<V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof Set;
    if (!pass) {
      const message = richText()
        .write(mh("toBeSet", "received", ""))
        .write("Expected value to be a Set, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeSet);
    }
    return this as any as SetAssertion<V>;
  }

  toBeWeakSet<V = any>(): WeakSetAssertion<V> {
    const received = this.obj;
    const pass = typeof received === "object" && received instanceof WeakSet;
    if (!pass) {
      const message = richText()
        .write(mh("toBeWeakSet", "received", ""))
        .write("Expected value to be a WeakSet, instead received:\n")
        .write("  ", r(received));

      throw new AssertionError(message.compose(), received, true, this.toBeWeakSet);
    }
    return this as any as WeakSetAssertion<V>;
  }

  toBeInstanceOf(type: Function): Assertion<T> {
    const received = this.obj;
    const expected = type;
    const pass = typeof received === "object" && received instanceof type;
    if (!pass) {
      const message = richText()
        .write(mh("toBeInstanceOf"))
        .write("Expected value to be an instance of:\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toBeInstanceOf);
    }
    return this;
  }

  notToBeInstanceOf(type: Function): Assertion<T> {
    const received = this.obj;
    const expected = type;
    const pass = typeof received !== "object" || (received instanceof type) === false;
    if (!pass) {
      const message = richText()
        .write(mh("notToBeInstanceOf"))
        .write("Expected value not to be an instance of:\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToBeInstanceOf);
    }
    return this;
  }
}

export class ArrayAssertion<T> extends Assertion<T[]> {
  toHaveLength(length: number): ArrayAssertion<T> {
    const received = this.obj;
    const expected = length;
    const pass = received.length === expected;
    if (!pass) {
      const message = richText()
        .write(mh("toHaveLength"))
        .write("Expected array to have a length ", e(expected),
        ", instead it have a length ", r(received.length), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHaveLength);
    }
    return this;
  }

  notToHaveLength(length: number): ArrayAssertion<T> {
    const received = this.obj;
    const expected = length;
    const pass = received.length !== expected;
    if (!pass) {
      const message = richText()
        .write(mh("notToHaveLength"))
        .write("Expected array not to have a length ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHaveLength);
    }
    return this;
  }

  toContain(value: T | Matcher): ArrayAssertion<T> {
    const received = this.obj;
    const expected = value;
    const pass = expected instanceof Matcher ?
      received.some((i) => expected.match(i)) :
      received.indexOf(expected) !== -1;
    if (!pass) {
      const message = richText()
        .write(mh("toContain"))
        .write("Expected array to include:\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toContain);
    }
    return this;
  }

  notToContain(value: T | Matcher): ArrayAssertion<T> {
    const received = this.obj;
    const expected = value;
    const pass = expected instanceof Matcher ?
      !received.some((i) => expected.match(i)) :
      received.indexOf(expected) === -1;
    if (!pass) {
      const message = richText()
        .write(mh("notToContain"))
        .write("Expected array not to contain:\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToContain);
    }

    return this;
  }

  toMatch(match: T[]): ArrayAssertion<T> {
    const received = this.obj;
    const expected = match;
    const pass = matchArray(received, expected);
    if (!pass) {
      const message = richText()
        .write(mh("toMatch"))
        .write("Expected array to match:\n")
        .write("  ", e(expected), "\n")
        .write("Received:\n")
        .write("  ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toMatch);
    }
    return this;
  }

  notToMatch(match: T[]): ArrayAssertion<T> {
    const received = this.obj;
    const expected = match;
    const pass = !matchArray(received, expected);
    if (!pass) {
      const message = richText()
        .write(mh("notToMatch"))
        .write("Expected array not to match:\n")
        .write("  ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToMatch);
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

export class DateAssertion extends Assertion<Date> { }
export class ErrorAssertion<E extends Error> extends Assertion<E> { }

export class FunctionAssertion extends Assertion<Function> {
  toHaveArgumentsLength(length: number): FunctionAssertion {
    const received = this.obj;
    const expected = length;
    const pass = received.length === expected;
    if (!pass) {
      const message = richText()
        .write(mh("toHaveArgumentsLength"))
        .write("Expected function to have arguments length ", e(expected),
        ", instead it have arguments length ", r(received.length), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHaveArgumentsLength);
    }
    return this;
  }

  notToHaveArgumentsLength(length: number): FunctionAssertion {
    const received = this.obj;
    const expected = length;
    const pass = received.length !== expected;
    if (!pass) {
      const message = richText()
        .write(mh("notToHaveLength"))
        .write("Expected function not to have arguments length ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHaveArgumentsLength);
    }
    return this;
  }

  toThrow<E extends Error | ErrorConstructor>(expected?: E): FunctionAssertion {
    const received = this.obj;

    let pass = false;
    let throwed;
    try {
      this.obj();
    } catch (e) {
      throwed = e;
      if (expected !== undefined && matchException(throwed, expected) === true) {
        pass = true;
      }
    }

    if (!pass) {
      const message = richText()
        .write(mh("toThrow"))
        .write("Expected function to throw an exception ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.toThrow);
    }

    return this;
  }

  notToThrow<E extends Error | ErrorConstructor>(expected?: E): FunctionAssertion {
    const received = this.obj;

    let pass = true;
    let throwed;
    try {
      this.obj();
    } catch (e) {
      throwed = e;
      if (expected !== undefined && matchException(throwed, expected) === true) {
        pass = false;
      }
    }

    if (!pass) {
      const message = richText()
        .write(mh("notToThrow"))
        .write("Expected function not to throw an exception ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToThrow);
    }

    return this;
  }
}

const eB = e("b", true);
const rA = r("a", true);
const eE = e("epsilon", true);

export class NumberAssertion extends Assertion<number> {
  toBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = Math.abs(a - b) <= (aAbs < bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = richText()
        .write(mh("toBeApproximatelyEqual", "received", "expected", "epsilon"))
        .begin("hint")
        .write("abs(", rA, " - ", eB, ") <= ",
        "(abs(", rA, ") < abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, "\n\n")
        .end("hint")
        .write("Expected number to be approximately equal to ", e(b), ", intstead received ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeApproximatelyEqual);
    }

    return this;
  }

  notToBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !(Math.abs(a - b) <= (aAbs < bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeApproximatelyEqual", "received", "expected", "epsilon"))
        .begin("hint")
        .write("!(abs(", rA, " - ", eB, ") <= ",
        "(abs(", rA, ") < abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, ")\n\n")
        .end("hint")
        .write("Expected number not to be approximately equal to ", e(b), ", instead received ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeApproximatelyEqual);
    }

    return this;
  }

  toBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = Math.abs(a - b) <= (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = richText()
        .write(mh("toBeEssentiallyEqual", "received", "expected", "epsilon"))
        .begin("hint")
        .write("abs(", rA, " - ", eB, ") <= ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, "\n\n")
        .end("hint")
        .write("Expected number to be essentially equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeEssentiallyEqual);
    }

    return this;
  }

  notToBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !(Math.abs(a - b) <= (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeEssentiallyEqual", "received", "expected", "epsilon"))
        .begin("hint")
        .write("!(abs(", rA, " - ", eB, ") <= ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, ")\n\n")
        .end("hint")
        .write("Expected number not to be essentially equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeEssentiallyEqual);
    }

    return this;
  }

  toBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = (a - b) > (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = richText()
        .write(mh("toBeDefinitelyGreaterThan", "received", "expected", "epsilon"))
        .begin("hint")
        .write("(", rA, " - ", eB, ") > ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, "\n\n")
        .end("hint")
        .write("Expected number to be definetely greater than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeDefinetelyGreaterThan);
    }

    return this;
  }

  notToBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !((a - b) > (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeDefinitelyGreaterThan", "received", "expected", "epsilon"))
        .begin("hint")
        .write("!((", rA, " - ", eB, ") > ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, ")\n\n")
        .end("hint")
        .write("Expected number not to be definetely greater than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeDefinetelyGreaterThan);
    }

    return this;
  }

  toBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = (b - a) > (aAbs > bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = richText()
        .write(mh("toBeDefinitelyLessThan", "received", "expected", "epsilon"))
        .begin("hint")
        .write("(", eB, " - ", rA, ") > ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, "\n\n")
        .end("hint")
        .write("Expected number to be definetely less than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeDefinetelyLessThan);
    }

    return this;
  }

  notToBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): NumberAssertion {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = !((b - a) > (aAbs > bAbs ? bAbs : aAbs) * epsilon);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeDefinitelyLessThan", "received", "expected", "epsilon"))
        .begin("hint")
        .write("!((", eB, " - ", rA, ") > ",
        "(abs(", rA, ") > abs(", eB, ") ? abs(", eB, ") : abs(", rA, ")) * ", eE, ")\n\n")
        .end("hint")
        .write("Expected number not to be definetely less than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeDefinetelyLessThan);
    }

    return this;
  }

  toBeGreaterThan(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = a > b;

    if (!pass) {
      const message = richText()
        .write(mh("toBeGreaterThan"))
        .write("Expected number to be greater than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeGreaterThan);
    }

    return this;
  }

  notToBeGreaterThan(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = !(a > b);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeGreaterThan"))
        .write("Expected number not to be greater than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeGreaterThan);
    }

    return this;
  }

  toBeGreaterThanOrEqual(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = a >= b;

    if (!pass) {
      const message = richText()
        .write(mh("toBeGreaterThanOrEqual"))
        .write("Expected number to be greater than or equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeGreaterThanOrEqual);
    }

    return this;
  }

  notToBeGreaterThanOrEqual(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = !(a >= b);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeGreaterThanOrEqual"))
        .write("Expected number not to be greater than or equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeGreaterThanOrEqual);
    }

    return this;
  }

  toBeLessThan(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = a < b;

    if (!pass) {
      const message = richText()
        .write(mh("toBeLessThan"))
        .write("Expected number to be less than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeLessThan);
    }

    return this;
  }

  notToBeLessThan(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = !(a < b);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeLessThan"))
        .write("Expected number not to be less than ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeLessThan);
    }

    return this;
  }

  toBeLessThanOrEqual(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = a <= b;

    if (!pass) {
      const message = richText()
        .write(mh("toBeLessThanOrEqual"))
        .write("Expected number to be less than or equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.toBeLessThanOrEqual);
    }

    return this;
  }

  notToBeLessThanOrEqual(number: number): NumberAssertion {
    const a = this.obj;
    const b = number;
    const pass = !(a <= b);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeLessThanOrEqual"))
        .write("Expected number not to be less than or equal to ", e(b), ", instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, b, this.notToBeLessThanOrEqual);
    }

    return this;
  }

  toBeNaN(): NumberAssertion {
    const a = this.obj;
    const pass = Number.isNaN(a);

    if (!pass) {
      const message = richText()
        .write(mh("toBeNaN", "received", ""))
        .write("Expected number to be NaN, instead received: ", r(a), "\n");

      throw new AssertionError(message.compose(), a, NaN, this.toBeNaN);
    }

    return this;
  }

  notToBeNaN(): NumberAssertion {
    const a = this.obj;
    const pass = !Number.isNaN(a);

    if (!pass) {
      const message = richText()
        .write(mh("notToBeNaN", "received", ""))
        .write("Expected number not to be NaN\n");

      throw new AssertionError(message.compose(), a, NaN, this.notToBeNaN);
    }

    return this;
  }
}

export class StringAssertion extends Assertion<string> {
  toHaveLength(length: number): StringAssertion {
    const received = this.obj;
    const expected = length;
    const pass = received.length === expected;
    if (!pass) {
      const message = richText()
        .write(mh("toHaveLength"))
        .write("Expected string to have length ", e(expected),
        ", instead it have length ", r(received.length), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHaveLength);
    }
    return this;
  }

  notToHaveLength(length: number): StringAssertion {
    const received = this.obj;
    const expected = length;
    const pass = received.length !== expected;
    if (!pass) {
      const message = richText()
        .write(mh("notToHaveLength"))
        .write("Expected string not to have length ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHaveLength);
    }
    return this;
  }

  toInclude(text: string): StringAssertion {
    const received = this.obj;
    const expected = text;
    const pass = received.includes(expected);
    if (!pass) {
      const message = richText()
        .write(mh("toInclude"))
        .write("Expected string to include ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toInclude);
    }
    return this;
  }

  notToInclude(text: string): StringAssertion {
    const received = this.obj;
    const expected = text;
    const pass = !received.includes(expected);
    if (!pass) {
      const message = richText()
        .write(mh("notToInclude"))
        .write("Expected string not to include ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToInclude);
    }
    return this;
  }

  toMatch(text: string | RegExp): StringAssertion {
    const received = this.obj;
    const expected = text;
    const pass = !!received.match(expected);
    if (!pass) {
      const message = richText()
        .write(mh("toMatch"))
        .write("Expected string to match ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toMatch);
    }
    return this;
  }

  notToMatch(text: string | RegExp): StringAssertion {
    const received = this.obj;
    const expected = text;
    const pass = !received.match(expected);
    if (!pass) {
      const message = richText()
        .write(mh("notToMatch"))
        .write("Expected string not to match ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToMatch);
    }
    return this;
  }
}

export class SymbolAssertion extends Assertion<Symbol> { }

export class ObjectAssertion<T extends object> extends Assertion<T> {
  toMatch(matcher: Matcher): ObjectAssertion<T> {
    const received = this.obj;
    const expected = matcher;
    const pass = matcher.match(received);
    if (!pass) {
      const message = richText()
        .write(mh("toMatch"))
        .write("Expected Object to match ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toMatch);
    }
    return this;
  }

  notToMatch(matcher: Matcher): ObjectAssertion<T> {
    const received = this.obj;
    const expected = matcher;
    const pass = !matcher.match(received);
    if (!pass) {
      const message = richText()
        .write(mh("notToMatch"))
        .write("Expected Object not to match ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToMatch);
    }
    return this;
  }
}

export const enum RegExpFlags {
  Global = 1,
  IgnoreCase = 1 << 1,
  Multiline = 1 << 2,
  Unicode = 1 << 3,
  Sticky = 1 << 4,
}

export class RegExpAssertion extends Assertion<RegExp> {
  toSnapshot() {
    return this.obj.valueOf();
  }

  toTest(text: string): RegExpAssertion {
    const received = this.obj;
    const expected = text;
    const pass = received.test(expected);
    if (!pass) {
      const message = richText()
        .write(mh("toTest"))
        .write("Expected RegExp to test ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.toTest);
    }
    return this;
  }

  notToTest(text: string): RegExpAssertion {
    const received = this.obj;
    const expected = text;
    const pass = received.test(expected);
    if (!pass) {
      const message = richText()
        .write(mh("notToTest"))
        .write("Expected RegExp not to test ", e(expected), "\n")
        .write("Received: ", r(received), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToTest);
    }
    return this;
  }
}

export class MapAssertion<K, V> extends Assertion<Map<K, V>> {
  toHaveSize(size: number): MapAssertion<K, V> {
    const received = this.obj;
    const expected = size;
    const pass = received.size === expected;
    if (!pass) {
      const message = richText()
        .write(mh("toHaveSize"))
        .write("Expected Map to have size ", e(expected), ", instead it have size ", r(received.size), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHaveSize);
    }

    return this;
  }

  notToHaveSize(size: number): MapAssertion<K, V> {
    const received = this.obj;
    const expected = size;
    const pass = received.size !== expected;
    if (!pass) {
      const message = richText()
        .write(mh("notToHaveSize"))
        .write("Expected Map not to have size ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHaveSize);
    }

    return this;
  }

  toHave(key: K): MapAssertion<K, V> {
    const received = this.obj;
    const expected = key;
    const pass = received.has(key);
    if (!pass) {
      const message = richText()
        .write(mh("toHave"))
        .write("Expected Map to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHave);
    }
    return this;
  }

  notToHave(key: K): MapAssertion<K, V> {
    const received = this.obj;
    const expected = key;
    const pass = !received.has(key);
    if (!pass) {
      const message = richText()
        .write(mh("notToHave"))
        .write("Expected Map not to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHave);
    }
    return this;
  }
}

export class SetAssertion<V> extends Assertion<Set<V>> {
  toHaveSize(size: number): SetAssertion<V> {
    const received = this.obj;
    const expected = size;
    const pass = received.size === expected;
    if (!pass) {
      const message = richText()
        .write(mh("toHaveSize"))
        .write("Expected Set to have size ", e(expected), ", instead it have size ", r(received.size), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHaveSize);
    }

    return this;
  }

  notToHaveSize(size: number): SetAssertion<V> {
    const received = this.obj;
    const expected = size;
    const pass = received.size !== expected;
    if (!pass) {
      const message = richText()
        .write(mh("notToHaveSize"))
        .write("Expected Set not to have size ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHaveSize);
    }

    return this;
  }

  toHave(value: V): SetAssertion<V> {
    const received = this.obj;
    const expected = value;
    const pass = received.has(value);
    if (!pass) {
      const message = richText()
        .write(mh("toHave"))
        .write("Expected Set to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHave);
    }
    return this;
  }

  notToHave(value: V): SetAssertion<V> {
    const received = this.obj;
    const expected = value;
    const pass = !received.has(value);
    if (!pass) {
      const message = richText()
        .write(mh("notToHave"))
        .write("Expected Set not to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHave);
    }
    return this;
  }
}

export class WeakMapAssertion<K extends object, V> extends Assertion<WeakMap<K, V>> {
  toHave(key: K): WeakMapAssertion<K, V> {
    const received = this.obj;
    const expected = key;
    const pass = received.has(key);
    if (!pass) {
      const message = richText()
        .write(mh("toHave"))
        .write("Expected WeakMap to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHave);
    }
    return this;
  }

  notToHave(key: K): WeakMapAssertion<K, V> {
    const received = this.obj;
    const expected = key;
    const pass = !received.has(key);
    if (!pass) {
      const message = richText()
        .write(mh("notToHave"))
        .write("Expected WeakMap not to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHave);
    }
    return this;
  }
}

export class WeakSetAssertion<V> extends Assertion<WeakSet<V>> {
  toHave(value: V): WeakSetAssertion<V> {
    const received = this.obj;
    const expected = value;
    const pass = received.has(value);
    if (!pass) {
      const message = richText()
        .write(mh("toHave"))
        .write("Expected WeakSet to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.toHave);
    }
    return this;
  }

  notToHave(value: V): WeakSetAssertion<V> {
    const received = this.obj;
    const expected = value;
    const pass = !received.has(value);
    if (!pass) {
      const message = richText()
        .write(mh("notToHave"))
        .write("Expected WeakSet not to have ", e(expected), "\n");

      throw new AssertionError(message.compose(), received, true, this.notToHave);
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
