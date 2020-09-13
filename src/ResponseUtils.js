export const ResponseStates = {
  SUCCESS: "success",
  FAILURE: "failure",
  PENDING: "pending",
}

export const ResponseProperties = {
  TAG: "tag",
  VALUE: "value",
  ERR: "err",
}

export const Response = (response) => ({
  [ResponseProperties.TAG]: response[ResponseProperties.TAG],
  [ResponseProperties.VALUE]: response[ResponseProperties.TAG] === ResponseStates.SUCCESS
    ? response[ResponseProperties.VALUE]
    : null,
  [ResponseProperties.ERR]: response[ResponseProperties.TAG] === ResponseStates.FAILURE
    ? response[ResponseProperties.ERR]
    : null,
});

// TODO whoops, you forgot to wrap the actual Response
export const ResponseSuccess = (value) => ({
  [ResponseProperties.TAG]: ResponseStates.SUCCESS,
  [ResponseProperties.VALUE]: value,
});

export const ResponseFailure = (err) => ({
  [ResponseProperties.TAG]: ResponseStates.FAILURE,
  [ResponseProperties.ERR]: err,
});

export const ResponsePending = () => ({
  [ResponseProperties.TAG]: ResponseStates.PENDING,
});
