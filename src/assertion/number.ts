import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeNumber(): NumberAssertion;
  }
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
}

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
    if ((expected - actual) <= ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
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
    if ((expected - actual) > ((actualAbs < expectedAbs ? expectedAbs : actualAbs) * epsilon)) {
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
    if (actual > expected) {
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
    if (actual <= expected) {
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
    if (actual >= expected) {
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
    if (actual < expected) {
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
    if (actual < expected) {
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
    if (actual >= expected) {
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
    if (actual <= expected) {
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
    if (actual > expected) {
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
