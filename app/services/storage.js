import Service from '@ember/service';
import TimestampstorageType from '../storagemodel/timestampstorage';
// import LandscapeType from '../storagemodel/landscape';


export default Service.extend({

  allowedTypes: null,

  init() {
    this._super(...arguments);

    this.set('allowedTypes', {
      'timestampstorage': TimestampstorageType.create()
      // 'landscape' : LandscapeType.create()
    });
  },

  save: function (object) {
    var json = object.serialize({ includeId: true });

    const types = Object.keys(this.allowedTypes);

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type === json.data.type) {
        return this.allowedTypes[type].saveItem(object, json);
      }
    }
    return false;
  },

  get: function (modelType, id) {
    const types = Object.keys(this.allowedTypes);

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type === modelType) {
        return this.allowedTypes[type].getItem(id);
      }
    }
    return false;
  },

  getWithInclude: function (modelType, id) {
    const types = Object.keys(this.allowedTypes);

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type === modelType) {
        return this.allowedTypes[type].getItemWithInclude(id);
      }
    }
    return false;
  },
});
