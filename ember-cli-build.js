/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {

  var app = new EmberApp(defaults, {
    sassOptions: {},
    fingerprint: {
      exclude: ['images']
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('vendor/layout/klay.js');
  app.import('vendor/threex/threex.rendererstats.min.js');
  app.import('vendor/threex/threex.dynamictexture.min.js');

  app.import('vendor/alertifyjs/alertify.min.js');
  app.import('vendor/alertifyjs/css/alertify.min.css');
  app.import('vendor/alertifyjs/css/themes/default.min.css');

  app.import('vendor/d3/d3.min.js');

  app.import('vendor/c3/c3.min.js');
  app.import('vendor/c3/c3.min.css');

  return app.toTree();
};