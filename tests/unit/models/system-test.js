import { moduleForModel, test } from 'ember-qunit';

moduleForModel('system', 'Unit | Model | system', {
  // Specify the other units that are required for this test.
  needs: ['model:landscape', 'model:nodegroup']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
