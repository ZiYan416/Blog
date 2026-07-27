export function getErrorMessage(error: unknown, fallback = '发生未知错误') {
  return error instanceof Error && error.message ? error.message : fallback
}

export function isAbortError(error: unknown) {
  return error instanceof Error && (
    error.name === 'AbortError'
    || error.message === 'The user aborted a request.'
  )
}
