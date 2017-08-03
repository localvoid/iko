import * as  prettyFormat from "pretty-format";

export function toSnapshot(data: any): string {
  return prettyFormat(data, {
    escapeRegex: true,
    printFunctionName: false,
  });
}
