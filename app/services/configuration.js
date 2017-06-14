import Ember from 'ember';

export default Ember.Service.extend({

  addonImports: [],

  landscapeColors: {
    system: "rgb(199,199,199)",
    nodegroup: "rgb(1,155,32)",
    node: "rgb(0,189,56)",
    application: "rgb(81,34,183)",
    communication: "rgb(244,145,0)",
    appTextureChanged: false
  }

});
