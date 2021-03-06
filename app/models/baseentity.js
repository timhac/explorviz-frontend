import DS from 'ember-data';

const {Model, attr} = DS;

/**
* Ember model for a BaseEntity. Every element of ExplorViz's Meta-Model should
* inherit this class, since it might change and contain some useful data at
* some point.
*
* @class BaseEntity-Model
* @extends DS.Model
*
* @module explorviz
* @submodule model.util
*/
export default Model.extend({
  /**
  * This attribute can be used by extensions to insert custom properties to any
  * meta-model object.
  *
  * @property extensionAttributes
  * @type Array
  *
  */
  extensionAttributes: attr(),

});
