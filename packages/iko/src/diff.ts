import * as prettyFormat from "pretty-format";
import { RichText } from "rtext";
import { RichTextWriter, richText } from "rtext-writer";
import { diffLines, structuredPatch, IHunk } from "diff";
import { highlightTrailingWhitespace } from "./stringify";

const NO_DIFF_MESSAGE = richText()
  .begin("hint")
  .write("Compared values have no visual difference.")
  .end("hint")
  .compose();

const SIMILAR_MESSAGE = richText()
  .begin("hint")
  .write("Compared values serialize to the same structure.\n")
  .write("Printing internal object structure without calling `toJSON` instead.")
  .end("hint")
  .compose();

const DIFF_CONTEXT = 5;

const PLUGINS = [
  prettyFormat.plugins.HTMLElement,
  prettyFormat.plugins.AsymmetricMatcher,
].concat(prettyFormat.plugins.Immutable);
const FORMAT_OPTIONS = {
  plugins: PLUGINS,
};
const FALLBACK_FORMAT_OPTIONS = {
  plugins: PLUGINS,
  callToJSON: false,
  maxDepth: 10,
};

function _diffLines(a: string, b: string): RichText | null {
  const result = richText();
  let isDifferent = false;

  const parts = diffLines(a, b);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    let j = 0;

    const lines = part.value.split("\n");
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    if (part.added) {
      isDifferent = true;
      while (j < lines.length) {
        result.begin("+").write("+ ", highlightTrailingWhitespace(lines[j++]), "\n").end("+");
      }
    } else if (part.removed) {
      isDifferent = true;
      while (j < lines.length) {
        result.begin("-").write("- ", highlightTrailingWhitespace(lines[j++]), "\n").end("-");
      }
    } else {
      while (j < lines.length) {
        result.write("  ", highlightTrailingWhitespace(lines[j++]), "\n");
      }
    }
  }

  if (isDifferent === true) {
    return result.compose();
  }
  return null;
}

function shouldShowPatchMarks(hunk: IHunk, oldLinesCount: number): boolean {
  return oldLinesCount > hunk.oldLines;
}

function writePatchMark(writer: RichTextWriter, hunk: IHunk): void {
  writer
    .begin("patchMark")
    .write("@@ ")
    .begin("-").write(`-${hunk.oldStart},${hunk.oldLines}`).end("-")
    .write(" ")
    .begin("+").write(`+${hunk.newStart},${hunk.newLines}`).end("+")
    .write(" @@\n")
    .end("patchMark");
}

function countLines(s: string): number {
  let result = 0;
  let pos = s.indexOf("\n");
  while (pos !== -1) {
    result++;
    pos = s.indexOf("\n", pos + 1);
  }
  return result;
}

function _structuredPatch(a: string, b: string): RichText | null {
  const result = richText();
  if (a.endsWith("\n") === false) {
    a += "\n";
  }
  if (b.endsWith("\n") === false) {
    b += "\n";
  }

  const oldLinesCount = countLines(a);

  const hunks = structuredPatch("", "", a, b, "", "", { context: DIFF_CONTEXT }).hunks;
  for (let i = 0; i < hunks.length; i++) {
    const hunk = hunks[i];
    if (shouldShowPatchMarks(hunk, oldLinesCount) === true) {
      writePatchMark(result, hunk);
    }

    const lines = hunk.lines;
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const highlightedLined = highlightTrailingWhitespace(line);
      const added = line.charCodeAt(0) === 43; // +
      const removed = line.charCodeAt(0) === 45; // -
      if (added === true) {
        result.begin("+").write(highlightedLined, "\n").end("+");
      } else if (removed === true) {
        result.begin("-").write(highlightedLined, "\n").end("-");
      } else {
        result.write(highlightedLined, "\n");
      }
    }
  }

  if (hunks.length > 0) {
    return result.compose();
  }
  return null;
}

function diffStrings(a: string, b: string, expand?: boolean): RichText {
  const result = expand === true ? _structuredPatch(a, b) : _diffLines(a, b);
  if (result === null) {
    return NO_DIFF_MESSAGE;
  }
  return result;
}

function compareObjects(a: Object, b: Object, expand?: boolean): RichText {
  let diffMessage: RichText | null = null;
  let hasThrown = false;

  try {
    diffMessage = diffStrings(
      prettyFormat(a, FORMAT_OPTIONS),
      prettyFormat(b, FORMAT_OPTIONS),
      expand,
    );
  } catch (e) {
    hasThrown = true;
  }

  if (diffMessage === null || diffMessage === NO_DIFF_MESSAGE) {
    diffMessage = diffStrings(
      prettyFormat(a, FALLBACK_FORMAT_OPTIONS),
      prettyFormat(b, FALLBACK_FORMAT_OPTIONS),
      expand,
    );
    if (diffMessage !== NO_DIFF_MESSAGE && hasThrown === false) {
      diffMessage = richText().write(SIMILAR_MESSAGE, "\n\n", diffMessage).compose();
    }
  }

  return diffMessage;
}

function sortMap(map: Map<any, any>): Map<any, any> {
  return new Map(Array.from(map.entries()).sort());
}

function sortSet(set: Set<any>): Set<any> {
  return new Set(Array.from(set.values()).sort());
}

export function diff(a: any, b: any): RichText | null {
  if (a === b) {
    return NO_DIFF_MESSAGE;
  }

  if (typeof a === "object") {
    if (a instanceof Map) {
      return compareObjects(sortMap(a), sortMap(b));
    } else if (a instanceof Set) {
      return compareObjects(sortSet(a), sortSet(b));
    }
  } else if (typeof a === "string") {
    return diffStrings(a, b);
  } else if (typeof a === "number") {
    return null;
  } else if (typeof a === "boolean") {
    return null;
  }
  return compareObjects(a, b);
}
