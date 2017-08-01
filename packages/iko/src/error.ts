import { RichText, RichTextAnnotation } from "rtext";

const HasErrorCaptureStackTrace = Error.captureStackTrace !== undefined;

export class AssertionError extends Error {
  readonly actual: any;
  readonly expected?: any;
  readonly annotations?: RichTextAnnotation[];

  constructor(message: RichText, actual: any, expected?: any, ssf?: Function) {
    super(message.text);
    this.actual = actual;
    if (expected !== undefined) {
      this.expected = expected;
    }
    if (message.annotations !== null) {
      this.annotations = message.annotations;
    }

    if (HasErrorCaptureStackTrace === true && ssf !== undefined) {
      Error.captureStackTrace(this, ssf);
    }
  }
}

AssertionError.prototype.name = "AssertionError";
