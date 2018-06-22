export function encodeStringForPopUp(toBeEncodedString) {
  return String(toBeEncodedString).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function shortenString(toBeShortenedString) {
  const shortenedString = `${String(toBeShortenedString).substr(0, 8)}...`;
  return shortenedString;
}
