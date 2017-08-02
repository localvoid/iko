import * as prettyFormat from "pretty-format";
import { RichText } from "rtext";
import { RichTextWriter } from "rtext-writer";

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

const NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
];

export function pluralize(word: string, count: number): string {
  const result = ((count < NUMBERS.length) ? NUMBERS[count] : count.toString()) + " " + word;
  if (count === 1) {
    return result;
  }
  return result + "s";
}

export function matcherHint(
  writer: RichTextWriter,
  matcherName: string,
  received: string = "received",
  expected: string = "expected",
  secondArgument?: string,
): void {
  writer
    .begin("matcherHint")
    .write("expect(")
    .begin("received").write(received).end("received")
    .write(`).${matcherName}(`)
    .begin("expected").write(expected).end("expected");

  if (secondArgument !== undefined) {
    writer
      .write(", ")
      .begin("expected").write(secondArgument).end("expected");
  }

  writer
    .write(")")
    .write("\n\n")
    .end("matcherHint");
}

export function highlightTrailingWhitespace(
  text: string,
): RichText {
  const re = /\s+$/gm;
  let match = re.exec(text);
  const annotations = [];
  while (match !== null) {
    const start = match.index;
    const end = start + match[0].length;
    annotations.push({
      type: "trailingWhitespace",
      start: start,
      end: end,
      data: undefined,
      key: undefined,
    });
    match = re.exec(text);
  }
  return {
    text: text,
    annotations: annotations.length === 0 ? undefined : annotations,
  };
}

export function printReceived(
  writer: RichTextWriter,
  value: any,
  raw?: boolean,
) {
  writer
    .begin("received")
    .write(raw ? value : highlightTrailingWhitespace(stringify(value)))
    .end("received");
}

export function printExpected(
  writer: RichTextWriter,
  value: any,
  raw?: boolean,
) {
  writer
    .begin("expected")
    .write(raw ? value : highlightTrailingWhitespace(stringify(value)))
    .end("expected");
}

export function printInfo(
  writer: RichTextWriter,
  s: string,
) {
  writer
    .begin("info")
    .write(s)
    .end("info");
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
    this.write(function (w: ErrorMessageWriter): void {
      matcherHint(w, matcherName, received, expected, secondArgument);
    });
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

  received(value: any, raw?: boolean): this {
    this.write(function (w: ErrorMessageWriter): void {
      printReceived(w, value, raw);
    });
    return this;
  }

  expected(value: any, raw?: boolean): this {
    this.write(function (w: ErrorMessageWriter): void {
      printExpected(w, value, raw);
    });
    return this;
  }
}

export function errMsg(): ErrorMessageWriter {
  return new ErrorMessageWriter();
}
