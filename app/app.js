import loadInitializers from 'ember-load-initializers';
import Application from '@ember/application';
import Resolver from './resolver';
import config from './config/environment';

/**
* Ember application is the starting point for every Ember application.
*
* @class Application
* @extends Ember.Application
*
* @module ember
*/
const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
