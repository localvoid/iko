# TypeScript Assertion Library

This library and its API is designed to provide a good developer experience in TypeScript environment, so it is
recommended only for TypeScript developers.

## Motivation

I really didn't wanted to create another assertion library, but unfortunately, all existing solutions that I've looked
at had different problems when I've tried to extend them in TypeScript environment. And at some point it was just easier
to create my own assertion library instead of wasting many hours trying to find workarounds in existing libraries.

Also, it doesn't have any chainable properties that I've started to hate when I wrote several extensions. All assertions
are implemented as simple methods without any side-effects, there is no need to worry about "current context", all
information is contained inside a simple assertion method.

## Namespaces for different Types

When `expect(obj)` function is invoked, it will return different `Assertion` depending on its type.

In order for compiler to get correct type when `expect(obj)` is invoked, we are using [function overloading](https://www.typescriptlang.org/docs/handbook/functions.html).

```ts
function expect(obj: null): NullAssertion;
function expect(obj: undefined): UndefinedAssertion;
function expect(obj: void): UndefinedAssertion;
function expect(obj: number): NumberAssertion;
function expect(obj: boolean): BooleanAssertion;
function expect(obj: string): StringAssertion;
function expect(obj: symbol): SymbolAssertion;
function expect(obj: Function): FunctionAssertion;
function expect<T>(obj: Array<T>): ArrayAssertion<T>;
function expect(obj: Date): DateAssertion;
function expect(obj: RegExp): RegExpAssertion;
function expect<K, V>(obj: Map<K, V>): MapAssertion<K, V>;
function expect<K extends object, V>(obj: WeakMap<K, V>): WeakMapAssertion<K, V>;
function expect<V>(obj: Set<V>): SetAssertion<V>;
function expect<V>(obj: WeakSet<V>): WeakSetAssertion<V>;
function expect<E extends Error>(obj: E): ErrorAssertion<E>;
function expect<T extends object>(obj: T): ObjectAssertion<T>;
function expect(obj: any): Assertion<any>;
```

### Adding your own type

```ts
import { Assertion, addAssertionType } from "iko";
import { MyType } from "./mylib";

declare module "iko" {
  function expect(obj: MyType): MyTypeAssertion;
}

addAssertionType((obj: any) => {
  if (typeof obj === "object" && obj instanceof MyType) {
    return new MyTypeAssertion(obj);
  }
  return undefined;
}):

export class MyTypeAssertion extends Assertion<MyType> {
  // ...
}
```

### Extending existing namespaces

```ts
import { Assertion, ErrorMessage, formatError } from "iko";

declare module "iko" {
  interface Assertion<T> {
    toBeMyType(): MyTypeAssertion;
  }
}

Assertion.prototype.toBeMyType = function(
  message?: ErrorMessage<string, MyType>,
): MyTypeAssertion {
  const expected = "MyType";
  const actual = this.obj;
  if (actual !== "object" || (obj instanceof MyType) === false) {
    throw new AssertionError(
      formatError(
        (a, e, o) => `Expected ${inspect(o)} to have MyType type`,
        expected, actual, this.obj, message,
      ),
      expected,
      actual,
      false,
      this.toBeMyType,
    );
  }
  return this as any as MyTypeAssertion;
}
```

## License

MIT
