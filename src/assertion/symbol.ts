import { AssertionError, ErrorMessage, formatError } from "../error";
import { inspect } from "../inspect";
import { Assertion } from "./assertion";

declare module "./assertion" {
  interface Assertion<T> {
    toBeSymbol(): SymbolAssertion;
  }
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
}

export class SymbolAssertion extends Assertion<Symbol> { }
