import { RichText, RichTextAnnotation } from "rtext";

const HasErrorCaptureStackTrace = Error.captureStackTrace !== undefined;

export class AssertionError extends Error {
  readonly annotations?: RichTextAnnotation[];

  constructor(message: RichText, ssf?: Function) {
    super(message.text);
    if (message.annotations !== null) {
      this.annotations = message.annotations;
    }

    if (HasErrorCaptureStackTrace === true && ssf !== undefined) {
      Error.captureStackTrace(this, ssf);
    }
  }
}

AssertionError.prototype.name = "AssertionError";
