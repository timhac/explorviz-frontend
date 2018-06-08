import { helper } from '@ember/component/helper';

export function stringSplitter(params) {
  const inputString = params[0];
  const delimeter = params[1];
  const returnIndex = params[2];

  return inputString.split(delimeter)[returnIndex];
}

export default helper(stringSplitter);
