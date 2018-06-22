export default function processNameSelector(fallbackName, possibleName) {
  if (possibleName && possibleName !== undefined && possibleName !== '') {
    return possibleName;
  }
  return fallbackName;
}
