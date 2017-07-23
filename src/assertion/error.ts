import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeError<E extends Error>(): ErrorAssertion<E>;
  }
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
