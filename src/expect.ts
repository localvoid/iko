import {
  Assertion, NullAssertion, ArrayAssertion, DateAssertion, RegExpAssertion, MapAssertion, WeakMapAssertion,
  SetAssertion, WeakSetAssertion, ErrorAssertion, ObjectAssertion, StringAssertion, NumberAssertion, BooleanAssertion,
  FunctionAssertion, SymbolAssertion, UndefinedAssertion,
} from "./assertion";

export type AssertionFactory<T extends Assertion<any>> = (obj: any) => T | undefined;

let assertionFactory: AssertionFactory<any> = function (obj: any): Assertion<any> {
  if (typeof obj === "object") {
    if (obj === null) {
      return new NullAssertion();
    }
    if (Array.isArray(obj) === true) {
      return new ArrayAssertion<any>(obj);
    }
    if (obj instanceof Date) {
      return new DateAssertion(obj);
    }
    if (obj instanceof RegExp) {
      return new RegExpAssertion(obj);
    }
    if (obj instanceof Map) {
      return new MapAssertion<any, any>(obj);
    }
    if (obj instanceof WeakMap) {
      return new WeakMapAssertion<any, any>(obj);
    }
    if (obj instanceof Set) {
      return new SetAssertion<any>(obj);
    }
    if (obj instanceof WeakSet) {
      return new WeakSetAssertion<any>(obj);
    }
    if (obj instanceof Error) {
      return new ErrorAssertion<any>(obj);
    }
    if (obj instanceof Symbol) {
      return new SymbolAssertion(obj);
    }
    return new ObjectAssertion(obj);
  } else {
    if (typeof obj === "string") {
      return new StringAssertion(obj);
    }
    if (typeof obj === "number") {
      return new NumberAssertion(obj);
    }
    if (typeof obj === "boolean") {
      return new BooleanAssertion(obj);
    }
    if (typeof obj === "function") {
      return new FunctionAssertion(obj);
    }
    if (typeof obj === "undefined") {
      return new UndefinedAssertion();
    }
    if (typeof obj === "symbol") {
      return new SymbolAssertion(obj);
    }
  }
  return new Assertion<any>(obj);
};

export function addAssertionType<T>(factory: (obj: any) => T | undefined): void {
  const next = assertionFactory;
  assertionFactory = function (obj: any) {
    const assertion = factory(obj);
    if (assertion !== undefined) {
      return assertion;
    }
    return next(obj);
  };
}

export function expect(obj: null): NullAssertion;
export function expect(obj: undefined): UndefinedAssertion;
export function expect(obj: void): UndefinedAssertion;
export function expect(obj: number): NumberAssertion;
export function expect(obj: boolean): BooleanAssertion;
export function expect(obj: string): StringAssertion;
export function expect(obj: symbol): SymbolAssertion;
export function expect(obj: Function): FunctionAssertion;
export function expect<T>(obj: T[]): ArrayAssertion<T>;
export function expect(obj: Date): DateAssertion;
export function expect(obj: RegExp): RegExpAssertion;
export function expect<K, V>(obj: Map<K, V>): MapAssertion<K, V>;
export function expect<K extends object, V>(obj: WeakMap<K, V>): WeakMapAssertion<K, V>;
export function expect<V>(obj: Set<V>): SetAssertion<V>;
export function expect<V>(obj: WeakSet<V>): WeakSetAssertion<V>;
export function expect<E extends Error>(obj: E): ErrorAssertion<E>;
export function expect<T extends object>(obj: T): ObjectAssertion<T>;
export function expect(obj: any): Assertion<any> {
  return assertionFactory(obj);
}
