const HasErrorCaptureStackTrace = Error.captureStackTrace !== undefined;

export class AssertionError extends Error {
  readonly expected: any;
  readonly actual: any;
  readonly showDiff: boolean;

  constructor(message: string, expected: any, actual: any, showDiff = true, ssf?: Function) {
    super(message !== undefined ? message : "Unspecified AssertionError");
    this.expected = expected;
    this.actual = actual;
    this.showDiff = showDiff;

    if (HasErrorCaptureStackTrace === true && ssf !== undefined) {
      Error.captureStackTrace(this, ssf);
    }
  }
}

AssertionError.prototype.name = "AssertionError";

export type ErrorMessage<E, A, O = A> = string | ((expected: E, actual: A, object: O) => string);

export function formatError<E, A, O = A>(
  message: ErrorMessage<E, A, O>,
  expected: E,
  actual: A,
  object: O,
  overrideMessage?: ErrorMessage<E, A, O>,
): string {
  if (overrideMessage !== undefined) {
    message = overrideMessage;
  }
  if (typeof message === "function") {
    return message(expected, actual, object);
  }
  return message;
}
