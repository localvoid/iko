import * as prettyFormat from "pretty-format";
import { RichText } from "rtext";
import { RichTextWriter, annotate } from "rtext-writer";

const PLUGINS = [
  prettyFormat.plugins.DOMCollection,
  prettyFormat.plugins.DOMElement,
  prettyFormat.plugins.Immutable,
  prettyFormat.plugins.AsymmetricMatcher,
];

export function stringify(object: any, maxDepth: number = 10): string {
  const MAX_LENGTH = 10000;
  let result;

  try {
    result = prettyFormat(object, {
      maxDepth,
      min: true,
      plugins: PLUGINS,
    });
  } catch (e) {
    result = prettyFormat(object, {
      callToJSON: false,
      maxDepth,
      min: true,
      plugins: PLUGINS,
    });
  }

  return result.length >= MAX_LENGTH && maxDepth > 1
    ? stringify(object, Math.floor(maxDepth / 2))
    : result;
}

export function leftPad(p: string, s: string): string {
  return s.replace(/^/gm, p);
}

/**
 * hl is a function that highlights matched text regions. By default it highlights trailing whitespaces.
 *
 * @param text Raw text.
 * @param regexp RegExp matcher.
 * @param type Annotation type.
 * @returns Rich Text.
 */
export function hl(
  text: string,
  regexp = /\s+$/gm,
  type = "highlight",
): RichText {
  return annotate(text, regexp, type);
}

export function r(value: any, raw?: boolean): (writer: RichTextWriter) => void {
  return function (writer: RichTextWriter): void {
    writer
      .begin("received")
      .write(raw ? value : hl(stringify(value)))
      .end("received");
  };
}

export function e(value: any, raw?: boolean): (writer: RichTextWriter) => void {
  return function (writer: RichTextWriter): void {
    writer
      .begin("expected")
      .write(raw ? value : hl(stringify(value)))
      .end("expected");
  };
}

export class ErrorMessageWriter extends RichTextWriter {
  matcherHint(
    matcherName: string,
    received: string = "received",
    expected: string = "expected",
    secondArgument?: string,
  ): this {
    this
      .begin("matcherHint")
      .write("expect(")
      .begin("received").write(received).end("received")
      .write(`).${matcherName}(`)
      .begin("expected").write(expected).end("expected");

    if (secondArgument !== undefined) {
      this
        .write(", ")
        .begin("expected").write(secondArgument).end("expected");
    }

    this
      .write(")")
      .write("\n\n")
      .end("matcherHint");

    return this;
  }

  hint(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): this {
    this
      .continue("hint")
      .write(...ws)
      .end("hint");
    return this;
  }

  info(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): this {
    this
      .continue("info")
      .write(...ws)
      .end("info");
    return this;
  }

  diff(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): this {
    this
      .begin("diff")
      .write(...ws)
      .end("diff");
    return this;
  }

  received(value: any): this {
    this
      .begin("received")
      .write(hl(stringify(value)))
      .end("received");
    return this;
  }

  expected(value: any): this {
    this
      .begin("expected")
      .write(hl(stringify(value)))
      .end("expected");
    return this;
  }
}

export function errMsg(): ErrorMessageWriter {
  return new ErrorMessageWriter();
}
