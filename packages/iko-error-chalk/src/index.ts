import { RichText } from "rtext";
import { createRichTextRenderer } from "rtext-render";
import * as chalk from "chalk";

export type ColorSchemaModifier = string[] | string | null;

export interface AssertionErrorColorSchema {
  "matcherHint"?: ColorSchemaModifier;
  "hint"?: ColorSchemaModifier;

  "received"?: ColorSchemaModifier;
  "expected"?: ColorSchemaModifier;
  "trailingWhitespace"?: ColorSchemaModifier;

  "diff"?: ColorSchemaModifier;
  "diffPatchMark"?: ColorSchemaModifier;
  "diffAdded"?: ColorSchemaModifier;
  "diffRemoved"?: ColorSchemaModifier;
  "diffAddedTrailingWhitespace"?: ColorSchemaModifier;
  "diffRemovedTrailingWhitespace"?: ColorSchemaModifier;
}

const DEFAULT_COLOR_SCHEMA = {
  "matcherHint": "dim",
  "hint": "dim",

  "received": "red",
  "expected": "green",
  "trailingWhitespace": "bgRed",

  "diff": null,
  "diffPatchMark": "dim",
  "diffAdded": "green",
  "diffRemoved": "red",
  "diffAddedTrailingWhitespace": "bgGreen",
  "diffRemovedTrailingWhitespace": "bgRed",
};

const PRIORITIES = {
  "trailingWhitespace": 0,

  "received": 1,
  "expected": 2,

  "+": 3,
  "-": 4,

  "hint": 100,
  "patchMark": 101,

  "matcherHint": 1000,
  "diff": 1001,
};

const enum StateFlags {
  MatcherHint = 1,
  Hint = 1 << 1,
  Received = 1 << 2,
  Expected = 1 << 3,
  TrailingWhitespace = 1 << 4,
  Diff = 1 << 5,
  DiffPatchMark = 1 << 6,
  DiffAdded = 1 << 7,
  DiffRemoved = 1 << 8,
}

function createNewChalk(c: any, modifier: string[] | string | null): any {
  if (typeof modifier === "string") {
    return c[modifier];
  }
  if (modifier !== null) {
    for (let i = 0; i < modifier.length; i++) {
      c = c[modifier[i]];
    }
  }
  return c;
}

export function createAssertionErrorRenderer(colors?: AssertionErrorColorSchema): (richText: RichText) => string {
  const colorSchema = colors === undefined ?
    DEFAULT_COLOR_SCHEMA :
    { ...DEFAULT_COLOR_SCHEMA, ...colors };

  return createRichTextRenderer(
    PRIORITIES,
    {
      onInit: () => ({
        flags: 0 as StateFlags,
        chalk: chalk as any,
        result: "",
      }),
      onEnter: (a, p) => {
        const type = a.type;
        let newChalk = p.chalk;
        let flags = p.flags;

        switch (type) {
          case "matcherHint":
            newChalk = createNewChalk(newChalk, colorSchema.matcherHint);
            flags = StateFlags.MatcherHint;
            break;
          case "hint":
            newChalk = createNewChalk(newChalk, colorSchema.hint);
            flags = StateFlags.Hint;
            break;
          case "received":
            newChalk = createNewChalk(newChalk, colorSchema.received);
            flags = StateFlags.Received;
            break;
          case "expected":
            newChalk = createNewChalk(newChalk, colorSchema.expected);
            flags = StateFlags.Expected;
            break;
          case "diff":
            newChalk = createNewChalk(newChalk, colorSchema.diff);
            flags = StateFlags.Diff;
            break;
          case "patchMark":
            newChalk = createNewChalk(newChalk, colorSchema.diffPatchMark);
            flags = StateFlags.DiffPatchMark;
            break;
          case "+":
            newChalk = createNewChalk(newChalk, colorSchema.diffAdded);
            flags = StateFlags.DiffAdded;
            break;
          case "-":
            newChalk = createNewChalk(newChalk, colorSchema.diffRemoved);
            flags = StateFlags.DiffRemoved;
            break;
          case "trailingWhitespace":
            if ((flags & (StateFlags.DiffAdded | StateFlags.DiffRemoved)) !== 0) {
              if ((flags & StateFlags.DiffAdded) !== 0) {
                newChalk = createNewChalk(newChalk, colorSchema.diffAddedTrailingWhitespace);
              } else {
                newChalk = createNewChalk(newChalk, colorSchema.diffRemovedTrailingWhitespace);
              }
            } else {
              newChalk = createNewChalk(newChalk, colorSchema.trailingWhitespace);
            }
            flags = StateFlags.TrailingWhitespace;
            break;
        }

        return {
          flags: flags,
          chalk: newChalk,
          result: "",
        };
      },
      onExit: (a, c, p) => {
        p.result += c.result;
      },
      onText: (s, c) => {
        c.result += c.chalk(s);
      },
      onResult: (c) => c.result,
    },
  );
}