import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:landscape', 'Unit | Adapter | landscape', {
  // Specify the other units that are required for this test.
  needs: ['service:session']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let adapter = this.subject();
  assert.ok(adapter);
});
