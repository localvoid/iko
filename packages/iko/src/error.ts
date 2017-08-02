import { RichText, RichTextAnnotation } from "rtext";

const HasErrorCaptureStackTrace = Error.captureStackTrace !== undefined;

export class AssertionError extends Error {
  readonly $$type: "AssertionError";
  readonly annotations?: RichTextAnnotation[];

  constructor(message: RichText, ssf?: Function) {
    super(message.text);
    this.$$type = "AssertionError";
    if (message.annotations !== null) {
      this.annotations = message.annotations;
    }

    if (HasErrorCaptureStackTrace === true && ssf !== undefined) {
      Error.captureStackTrace(this, ssf);
    }
  }
}

AssertionError.prototype.name = "AssertionError";
