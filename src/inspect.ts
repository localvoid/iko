export type ObjectInspector = (obj: any, depth: number, visited: Set<any>) => string | undefined;

const isElement = typeof HTMLElement === "undefined" ?
  function () { return false; } :
  function (x: any) {
    return (typeof x === "object" && x instanceof HTMLElement);
  };

let objectInspector = function (obj: any, depth: number, visited: Set<any>): string {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  if (typeof obj === "boolean") {
    return obj === true ? "true" : "false";
  }
  if (typeof obj === "string") {
    return inspectString(obj);
  }
  if (typeof obj === "number") {
    if (obj === 0) {
      return Infinity / obj > 0 ? "0" : "-0";
    }
    return obj.toString();
  }

  if (depth > 0 && typeof obj === "object") {
    return "[Object]";
  }

  if (visited.has(obj) === true) {
    return "[Circular]";
  }

  if (typeof obj === "function") {
    const name = getFunctionName(obj);
    if (name) {
      return `[Function: ${name}]`;
    }
    return `[Function]`;
  }

  if (typeof obj === "object") {
    const deepInspect = function (value: any, from?: any) {
      if (from) {
        visited = new Set(visited);
        visited.add(from);
      }
      return objectInspector(value, depth - 1, visited);
    };

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return "[]";
      }
      const xs = new Array(obj.length);
      for (let i = 0; i < obj.length; i++) {
        xs[i] = deepInspect(obj[i], obj);
      }
      return `[ ${xs.join(", ")} ]`;
    }

    if (obj instanceof Symbol) {
      const symString = Symbol.prototype.toString.call(obj);
      return typeof obj === "object" ?
        markBoxed(symString) :
        symString;
    }

    if (obj instanceof Error) {
      const parts = [];
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/[^\w$]/.test(key)) {
          parts.push(deepInspect(key) + ": " + deepInspect((obj as any)[key]));
        } else {
          parts.push(key + ": " + deepInspect((obj as any)[key]));
        }
      }
      if (parts.length === 0) {
        return `[${obj.toString()}]`;
      }

      return `{ [${obj.toString()}] ${parts.join(", ")} }`;
    }

    if (obj instanceof Map) {
      const parts: string[] = [];
      obj.forEach(function (value, key) {
        parts.push(deepInspect(key, obj) + " => " + deepInspect(value, obj));
      });
      return collectionOf("Map", obj.size, parts);
    }

    if (obj instanceof Set) {
      const parts: string[] = [];
      obj.forEach(function (value) {
        parts.push(deepInspect(value, obj));
      });
      return collectionOf("Set", obj.size, parts);
    }

    if (obj instanceof Number) {
      return markBoxed(obj.toString());
    }

    if (obj instanceof Boolean) {
      return markBoxed(obj.toString());
    }

    if (obj instanceof String) {
      return markBoxed(deepInspect(obj));
    }

    if ((obj instanceof Date || obj instanceof RegExp) === false) {
      const xs = [];
      const keys = Object.keys(obj);
      keys.sort();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/[^\w$]/.test(key)) {
          xs.push(deepInspect(key) + ": " + deepInspect(obj[key], obj));
        } else {
          xs.push(key + ": " + deepInspect(obj[key], obj));
        }
      }
      if (xs.length === 0) {
        return "{}";
      }
      return `{ ${xs.join(", ")} }`;
    }

    if (isElement(obj) === true) {
      const tagName = obj.nodeName.toString().toLowerCase();
      let s = `<${tagName}`;
      const attrs = obj.attributes;
      if (attrs) {
        for (let i = 0; i < attrs.length; i++) {
          const a = attrs[i];
          s += ` ${a.name}="${escapeHTMLAttribute(a.value)}"`;
        }
      }
      s += ">";
      if (obj.childNodes && obj.childNodes.length > 0) {
        s += "...";
      }
      s += `</${tagName}>`;
      return s;
    }
  }

  return obj.toString();
};

function escapeHTMLAttribute(s: any): string {
  if (typeof s !== "string") {
    s = s.toString();
  }
  return s.replace(/"/g, "&quot;");
}

function getFunctionName(f: Function): string | null {
  if ((f as any).displayName) {
    return (f as any).displayName;
  }
  if (f.name) {
    return f.name;
  }
  const m = f.toString().match(/^function\s*([\w$]+)/);
  if (m) {
    return m[1];
  }
  return null;
}

function inspectString(s: string): string {
  return "'" + s.replace(/(['\\])/g, "\\$1").replace(/[\x00-\x1f]/g, lowbyte) + "'";
}

function lowbyte(c: string): string {
  const n = c.charCodeAt(0);
  if (n < 14) {
    switch (n) {
      case 8:
        return `\\b`;
      case 9:
        return `\\t`;
      case 10:
        return `\\n`;
      case 12:
        return `\\f`;
      case 13:
        return `\\r`;
    }
  }
  const v = n.toString(16);
  if (n < 0x10) {
    return `\\x0${v}`;
  }
  return `\\x${v}`;
}

function markBoxed(s: string): string {
  return `Object(${s})`;
}

function collectionOf(type: string, size: number, entries: string[]): string {
  return `${type}(${size}) { ${entries.join(", ")} }`;
}

export function addInspectorType(inspector: (obj: any, depth: number, visited: Set<any>) => string | undefined): void {
  const next = objectInspector;
  objectInspector = function (obj: any, depth: number, visited: Set<any>) {
    const result = inspector(obj, depth, visited);
    if (result !== undefined) {
      return result;
    }
    return next(obj, depth, visited);
  };
}

export function inspect(obj: any, maxDepth = 5): string {
  return objectInspector(obj, maxDepth, new Set<any>());
}
