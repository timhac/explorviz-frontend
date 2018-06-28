import Socket from 'explorviz-frontend/utils/web-socket';

export function initialize(application) {
  application.register('object:web-socket', Socket);
}

export default {
  name: 'web-socket',
  initialize
};
