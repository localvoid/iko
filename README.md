# TypeScript Assertion Library

This library and its API is designed to provide a good developer experience in TypeScript environment, so it is
recommended only for TypeScript developers.

![iko screenshot][screenshot]

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

## API

```ts
class Assertion<T> {
  readonly obj: T;

  constructor(obj: T);

  toSnapshot(): string | { lang?: string, code: string };

  assert<E>(
    expr: (() => boolean) | boolean,
    message: (expected: E, actual?: T) => RichText,
    expected: E,
    actual?: T,
  ): this;

  toBeFalsy(): this;
  toBeTruthy(): this;
  toBe(value: T): this;
  toBeNull(): NullAssertion;
  toBeUndefined(): UndefinedAssertion;
  toBeInstanceOf(type: Function): this;

  notToBe(value: T): this;
  notToBeNull(): this;
  notToBeUndefined(): this;
  notToBeInstanceOf(type: Function): this;

  toBeObject<O extends object>(): ObjectAssertion<O>;
  toBeArray<U>(): ArrayAssertion<U>;
  toBeBoolean(): BooleanAssertion;
  toBeNumber(): NumberAssertion;
  toBeString(): StringAssertion;
  toBeFunction(): FunctionAssertion;
  toBeSymbol(): SymbolAssertion;
  toBeDate(): DateAssertion;
  toBeRegExp(): RegExpAssertion;
  toBeError<E extends Error>(): ErrorAssertion<E>;
  toBeMap<K extends object = any, V = any>(): MapAssertion<K, V>;
  toBeWeakMap<K extends object = any, V = any>(): WeakMapAssertion<K, V>;
  toBeSet<V = any>(): SetAssertion<V>;
  toBeWeakSet<V = any>(): WeakSetAssertion<V>;
}

class NullAssertion extends Assertion<null> { }

class UndefinedAssertion extends Assertion<undefined> { }

class BooleanAssertion extends Assertion<boolean> { }

class FunctionAssertion extends Assertion<Function> {
  toHaveArgumentsLength(length: number): this;
  toThrow<E extends Error | ErrorConstructor>(expected?: string | E): this;

  notToHaveArgumentsLength(length: number): this;
  notToThrow<E extends Error | ErrorConstructor>(expected?: string | E): this;
}

class NumberAssertion extends Assertion<number> {
  toBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): this;
  toBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): this;
  toBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): this;
  toBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): this;
  toBeGreaterThan(number: number): this;
  toBeGreaterThanOrEqual(number: number): this;
  toBeLessThan(number: number): this;
  toBeLessThanOrEqual(number: number): this;
  toBeNaN(): this;

  notToBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): this;
  notToBeEssentiallyEqual(number: number, epsilon = Number.EPSILON): this;
  notToBeDefinetelyGreaterThan(number: number, epsilon = Number.EPSILON): this;
  notToBeDefinetelyLessThan(number: number, epsilon = Number.EPSILON): this;
  notToBeGreaterThan(number: number): this;
  notToBeGreaterThanOrEqual(number: number): this;
  notToBeLessThan(number: number): this;
  notToBeLessThanOrEqual(number: number): this;
  notToBeNaN(): this;
}

class StringAssertion extends Assertion<string> {
  toHaveLength(length: number): this;
  toInclude(text: string): this;
  toMatch(text: string | RegExp): this;

  notToHaveLength(length: number): this;
  notToInclude(text: string): this;
  notToMatch(text: string | RegExp): this;
}

class SymbolAssertion extends Assertion<Symbol> { }

class ObjectAssertion<T extends object> extends Assertion<T> {
  readonly type: string;

  constructor(obj: T, type = "object");

  toBeEqual(expected: T): this;

  notToBeEqual(expected: T): this;
}

class ArrayAssertion<T> extends ObjectAssertion<T[]> {
  toHaveLength(length: number): this;
  notToHaveLength(length: number): this;
  toContain(value: T): this;
  notToContain(value: T): this;
}

class DateAssertion extends ObjectAssertion<Date> { }

class ErrorAssertion<E extends Error> extends ObjectAssertion<E> { }

class RegExpAssertion extends ObjectAssertion<RegExp> {
  toTest(text: string): this;

  notToTest(text: string): this;
}

class MapAssertion<K, V> extends ObjectAssertion<Map<K, V>> {
  toHaveSize(size: number): this;
  toHave(key: K): this;

  notToHaveSize(size: number): this;
  notToHave(key: K): this;
}

class SetAssertion<V> extends ObjectAssertion<Set<V>> {
  toHaveSize(size: number): this;
  toHave(value: V): this;

  notToHaveSize(size: number): this;
  notToHave(value: V): this;
}

class WeakMapAssertion<K extends object, V> extends ObjectAssertion<WeakMap<K, V>> {
  toHave(key: K): this;

  notToHave(key: K): this;
}

class WeakSetAssertion<V> extends ObjectAssertion<WeakSet<V>> {
  toHave(value: V): this;

  notToHave(value: V): this;
}
```

## License

MIT

[screenshot]: https://localvoid.github.io/karma-snapshot/images/example.png "iko screenshot"
