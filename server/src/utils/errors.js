class ForbiddenException extends Error {}
class WrongCredentialsException extends Error {}
class BusinessRuleEnforced extends Error {}
class UnknownEmailConfirmationTokenError extends Error {}
class NotFound extends Error {}

function HttpError(errorCode) {
  this.errorCode = errorCode;
}

function toHttpMessage(error) {
  return new HttpError(toHttpStatus(error));
}

function toHttpStatus(error) {
  if (error instanceof ForbiddenException) {
    return 403;
  } else if (error instanceof WrongCredentialsException) {
    return 401;
  } else if (
    error instanceof UnknownEmailConfirmationTokenError
    || error instanceof BusinessRuleEnforced
  ) {
    return 400;
  } else if (error instanceof NotFound) {
    return 404;
  } else {
    return 500;
  }
}

function handleErrorsGlobally(f, res) {
  try {
    f();
  } catch (error) {
    res.status(toHttpStatus(error)).json(toHttpMessage(error));
  }
}

module.exports = {
  ForbiddenException,
  WrongCredentialsException,
  BusinessRuleEnforced,
  UnknownEmailConfirmationTokenError,
  NotFound,
  HttpError,
  handleErrorsGlobally
}