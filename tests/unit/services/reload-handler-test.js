import { moduleFor, test } from 'ember-qunit';

moduleFor('service:reload-handler', 'Unit | Service | reload handler', {
  // Specify the other units that are required for this test.
  needs: ['service:timeshift-reload', 'service:landscape-reload', 
  'service:repos/landscape-repository']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
