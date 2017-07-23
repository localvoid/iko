import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeNull(): NullAssertion;
  }
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

export class NullAssertion extends Assertion<null> {
  constructor() {
    super(null);
  }
}
