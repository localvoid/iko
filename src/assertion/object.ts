import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Matcher } from "../matcher";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeObject<O extends object>(): ObjectAssertion<O>;
  }
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
