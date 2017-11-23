import DS from 'ember-data';
import DrawNodeEntity from './drawnodeentity';

const { attr, belongsTo, hasMany } = DS;

/**
* Ember model for an Application.
* 
* @class Application-Model
* @extends DrawNodeEntity-Model
*
* @module explorviz
* @submodule model.meta
*/
export default DrawNodeEntity.extend({

  database: attr('boolean'),

  programmingLanguage: attr('string'),

  lastUsage: attr('number'),

  parent: belongsTo('node', {
    inverse: 'applications'
  }),

  components: hasMany('component', {
    inverse: 'belongingApplication'
  }),

  communications: hasMany('communicationclazz'),

  communicationsAccumulated: [],

  incomingCommunications: hasMany('communication', {
    inverse: 'target'
  }),

  outgoingCommunications: hasMany('communication', {
    inverse: 'source'
  }),
  
  //databaseQueries: hasMany('databasequery')

  // used for text labeling performance in respective renderers
  state: "application",

  unhighlight() {
    this.get('components').forEach((component) => {
      component.unhighlight();
    });
  },

  contains(emberEntity) {
    let found = false;

    this.get('components').forEach((component) => {
      found = component.contains(emberEntity);
    });

    return found;
  }

});
