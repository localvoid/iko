import { Assertion, AssertionError, diff, errMsg } from "iko";

declare global {
  interface Snapshot {
    visited?: boolean;
    dirty?: boolean;
    lang?: string | null;
    code: string;
  }

  interface SnapshotSuite {
    visited?: boolean;
    dirty?: boolean;
    children: { [key: string]: SnapshotSuite };
    snapshots: { [key: string]: Snapshot[] };
  }

  interface SnapshotState {
    update?: boolean;
    suite: SnapshotSuite;
    get(path: string[], index: number): Snapshot | undefined;
    set(path: string[], index: number, code: string, lang?: boolean): void;
  }

  interface MochaContext {
    test: any;
    index: number;
  }

  interface Window {
    __mocha_context__: MochaContext;
    __snapshot__: SnapshotState;
  }
}

declare module "iko" {
  interface Assertion<T> {
    toMatchSnapshot(update?: boolean): this;
  }
}

const context = window.__mocha_context__;
const snapshotState = window.__snapshot__;

function snapshotPath(node: any) {
  const path = [];
  while (node && node.parent) {
    path.push(node.title);
    node = node.parent;
  }
  return path.reverse();
}

Assertion.prototype.toMatchSnapshot = function (update?: boolean) {
  const received = this.toSnapshot();
  const path = snapshotPath(context.test);
  const index = context.index++;

  if (update || snapshotState.update) {
    snapshotState.set(path, index, received, undefined);
  } else {
    const snapshot = snapshotState.get(path, index);
    if (!snapshot) {
      snapshotState.set(path, index, received, undefined);
    } else {
      const expected = snapshot.code;
      const pass = received === expected;

      if (!pass) {
        const diffText = diff(expected, received);
        const message = errMsg()
          .matcherHint("toMatchSnapshot", "received", "")
          .info(`Expected value to match snapshot ${index}\n`);
        if (diffText !== null) {
          message.diff("\n", diffText);
        }
        throw new AssertionError(message.compose(), this.toMatchSnapshot);
      }
    }
  }

  return this;
};
