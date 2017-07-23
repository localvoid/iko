import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeUndefined(): UndefinedAssertion;
  }
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

export class UndefinedAssertion extends Assertion<undefined> {
  constructor() {
    super(undefined);
  }
}
