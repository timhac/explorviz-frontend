import AuthenticatedRouteMixin from
  'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from './base-route';

/**
* TODO
*
* @class Tutorial-Route
* @extends Ember.Route
*/
export default BaseRoute.extend(AuthenticatedRouteMixin, {

  // BUG
  // not 100% working unloading ember store, related to https://github.com/emberjs/data/issues/4938
  beforeModel() {
    // Error: Cannot update watchers for `systems` on
    // `<explorviz-frontend@model:landscape::ember697:1>` after it has been destroyed."
    // this.store.unloadAll();
    // this.store.unloadAll('databasequery');
    // this.store.unloadAll('timestamp');
  }

});
