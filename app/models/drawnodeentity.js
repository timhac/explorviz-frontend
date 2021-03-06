import BaseEntity from './baseentity';
import DS from 'ember-data';

const { attr } = DS;

/**
* Ember model for a DrawNodeEntity.
*
* @class DrawNodeEntity-Model
* @extends BaseEntity-Model
*
* @module explorviz
* @submodule model.util
*/
export default BaseEntity.extend({

  plusColor: attr(),
  foregroundColor: attr(),
  backgroundColor: attr(),
  highlighted: attr('boolean', { defaultValue: false }),

  width: attr('number', { defaultValue: 0}),
  height: attr('number', { defaultValue: 0}),
  depth: attr('number', { defaultValue: 0}),
  positionX: attr('number', { defaultValue: 0}),
  positionY: attr('number', { defaultValue: 0}),
  positionZ: attr('number', { defaultValue: 0}),
  threeJSModel: attr(),

  kielerGraphReference: null,

  sourcePorts: null,
  targetPorts: null,

  init() {
    this._super(...arguments);
    this.set('sourcePorts', {});
    this.set('targetPorts', {});
  }


});
