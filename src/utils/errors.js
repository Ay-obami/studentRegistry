export function getErrorMessage(error, fallback) {
  return error?.reason || error?.shortMessage || error?.message || fallback;
}
