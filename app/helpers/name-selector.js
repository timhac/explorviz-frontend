import { helper } from '@ember/component/helper';

export function nameSelector(params) {
  const [pid, name] = params;
  if (name !== undefined && name !== '') {
    return name;
  }
  return pid;
}

export default helper(nameSelector);
