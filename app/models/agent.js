import DS from 'ember-data';
import BaseModel from './base-model';

const { attr, hasMany } = DS;


/**
* Ember model for a Process. This model is used as an abstraction for
* distributed processes.
*
* TODO more description
*
* @class Process-Model
* @extends BaseModel
*
* @module explorviz.extension.discovery
* @submodule model
*/
export default BaseModel.extend({

  ip: attr('string'),
  port: attr('string'),

  procezzes: hasMany('procezz')

});
