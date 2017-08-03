import * as prettyFormat from "pretty-format";
import { RichText } from "rtext";
import { RichTextWriter, annotate } from "rtext-writer";

const PLUGINS = [
  prettyFormat.plugins.HTMLElement,
  prettyFormat.plugins.AsymmetricMatcher,
].concat(prettyFormat.plugins.Immutable);

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

export function printReceived(
  writer: RichTextWriter,
  value: any,
  raw?: boolean,
) {
  writer
    .begin("received")
    .write(raw ? value : hl(stringify(value)))
    .end("received");
}

export function printExpected(
  writer: RichTextWriter,
  value: any,
  raw?: boolean,
) {
  writer
    .begin("expected")
    .write(raw ? value : hl(stringify(value)))
    .end("expected");
}

export function r(value: any, raw?: boolean): (w: RichTextWriter) => void {
  return function (w: RichTextWriter): void {
    printReceived(w, value, raw);
  };
}

export function e(value: any, raw?: boolean): (w: RichTextWriter) => void {
  return function (w: RichTextWriter): void {
    printExpected(w, value, raw);
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
      .begin("hint")
      .write(...ws)
      .end("hint");
    return this;
  }

  info(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): this {
    this
      .write(...ws);
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
    this.write(function (w: ErrorMessageWriter): void {
      printReceived(w, value);
    });
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
