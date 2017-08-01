# TypeScript Assertion Library

This library and its API is designed to provide a good developer experience in TypeScript environment, so it is
recommended only for TypeScript developers.

## Features

 - TypeScript-friendly API
 - Nicely formatted error messages in a [rtext](https://github.com/localvoid/rtext) format
 - Side-effect free assertions
 - Snapshot testing in a browser

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
import { Assertion, mh, r } from "iko";
import { richText } from "rtext-writer";

declare module "iko" {
  interface Assertion<T> {
    toBeMyType(): MyTypeAssertion;
  }
}

Assertion.prototype.toBeMyType = function(
  message?: ErrorMessage<string, MyType>,
): MyTypeAssertion {
  const received = this.obj;
  const pass = typeof received === "object" && obj instanceof MyType;
  if (!pass) {
    const message = richText()
      .write(mh("toBeMyType", "received", ""))
      .write("Expected Object to have MyType type:\n")
      .write("  ", r(received));

    throw new AssertionError(message.compose(), received, "MyType", this.toBeMyType);
  }

  return this as any as MyTypeAssertion;
}
```

## License

MIT
