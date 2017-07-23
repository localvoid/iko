import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeDate(): DateAssertion;
  }
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
