import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:timestamp', 'Unit | Adapter | timestamp', {
  // Specify the other units that are required for this test.
  needs: ['service:session']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let adapter = this.subject();
  assert.ok(adapter);
});
