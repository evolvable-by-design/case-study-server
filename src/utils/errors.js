class ForbiddenException extends Error {}
class WrongCredentialsException extends Error {}
class BusinessRuleEnforced extends Error {}
class UnknownEmailConfirmationTokenError extends Error {}
class NotFound extends Error {}

function HttpError(code, description) {
  this.code = code;
  this.description = description;
}

function toHttpMessage(error) {
  return new HttpError(toHttpStatus(error), describe(error));
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

function describe(error) {
  if (error instanceof ForbiddenException) {
    return 'Access forbidden, you may not have access rights';
  } else if (error instanceof WrongCredentialsException) {
    return 'Please login';
  } else if (
    error instanceof UnknownEmailConfirmationTokenError
    || error instanceof BusinessRuleEnforced
  ) {
    return 'There is something wrong in the request. Very likely some wrong values, or business rules which are not respected.';
  } else if (error instanceof NotFound) {
    return 'The resource can not be found, it is very likely that it does not exist. Sorry.';
  } else {
    return 'Arf, we don\'t know what happened. We may have made a mistake while building the server. Sorry, please come back later.';
  }
}

function handleErrorsGlobally(f, res) {
  try {
    f();
  } catch (error) {
    // console.error(error)
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