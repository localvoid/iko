export class Matcher {
  private readonly matcher: (value: any) => boolean;

  constructor(matcher: (value: any) => boolean) {
    this.matcher = matcher;
  }

  match(value: any): boolean {
    return this.matcher(value);
  }
}

export function matchArray(a: Array<any>, b: Array<any>): boolean {
  if (a !== b) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (matchAny(a[i], b[i]) === false) {
        return false;
      }
    }
  }

  return true;
}

export function matchObjectLoose(a: { [key: string]: any }, b: { [key: string]: any }): boolean {
  if (a !== b) {
    if (a.constructor !== b.constructor) {
      return false;
    }

    if (
      a instanceof String ||
      a instanceof Number ||
      a instanceof Boolean ||
      a instanceof Date
    ) {
      return a.valueOf() === b.valueOf();
    }

    if (
      a instanceof Promise ||
      a instanceof Symbol ||
      a instanceof WeakMap ||
      a instanceof WeakSet ||
      a instanceof Error
    ) {
      return a === b;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (bKeys.length > aKeys.length) {
      return false;
    }

    for (let i = 0; i < bKeys.length; i++) {
      const key = bKeys[i];
      if (a.hasOwnProperty(key) === false) {
        return false;
      }
      if (matchAny(a[key], b[key]) === false) {
        return false;
      }
    }
  }

  return true;
}

export function matchObject(a: { [key: string]: any }, b: { [key: string]: any }): boolean {
  if (a !== b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (let i = 0; i < bKeys.length; i++) {
      const key = bKeys[i];
      if (a.hasOwnProperty(key) === false) {
        return false;
      }
      if (matchAny(a[key], b[key]) === false) {
        return false;
      }
    }
  }

  return true;
}

function isArray(a: any): boolean {
  return (
    Array.isArray(a) ||
    a instanceof Int8Array ||
    a instanceof Int16Array ||
    a instanceof Int32Array ||
    a instanceof Uint8Array ||
    a instanceof Uint16Array ||
    a instanceof Uint32Array ||
    a instanceof Float32Array ||
    a instanceof Float64Array ||
    a instanceof Uint8Array
  );
}

export function matchAny(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "object") {
    if (b instanceof Matcher) {
      return b.match(a);
    }
    if (isArray(a) === true) {
      return matchArray(a, b);
    }
    return matchObject(a, b);
  }

  return Object.is(a, b);
}

export function matchAnyLoose(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "object") {
    if (b instanceof Matcher) {
      return b.match(a);
    }
    if (isArray(a) === true) {
      return matchArray(a, b);
    }
    return matchObjectLoose(a, b);
  }

  return Object.is(a, b);
}

export function matchException(a: any, b: Error | ErrorConstructor): boolean {
  if (b instanceof Error) {
    return a.constructor === b.constructor || a instanceof b.constructor;
  } else if (b.prototype instanceof Error || b === Error) {
    return a.constructor === b || a instanceof b;
  }
  return false;
}

export const m = {
  includesString: function (s: string): Matcher {
    return new Matcher(function (value: any) {
      return (typeof value === "string" && value.includes(s) === true);
    });
  },

  matchesObject: function (o: { [key: string]: any }): Matcher {
    return new Matcher(function (value: any) {
      return (typeof value === "object" && matchObject(value, o) === true);
    });
  },

  matchesObjectLoose: function (o: { [key: string]: any }): Matcher {
    return new Matcher(function (value: any) {
      return (typeof value === "object" && matchObjectLoose(value, o) === true);
    });
  },
};
