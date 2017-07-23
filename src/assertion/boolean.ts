import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeBoolean(): BooleanAssertion;
  }
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
