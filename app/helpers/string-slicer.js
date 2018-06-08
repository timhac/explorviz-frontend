import { helper } from '@ember/component/helper';

export function stringSlicer(params/*, hash*/) {
  const inputString = params[0];
  const sliceIndex = params[1];

  return inputString.slice(sliceIndex);
}

export default helper(stringSlicer);
