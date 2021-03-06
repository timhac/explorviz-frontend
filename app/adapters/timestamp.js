import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'explorviz-frontend/config/environment';

const {JSONAPIAdapter} = DS;
const {APP} = ENV;

/**
* This Adapter operates as communication abstraction for all network requests,
* that refer to Timestamp objects. It provides functions for fetching,
* updating and uploading. However, at the time of writing this documentation
* only fetching is implemented by the backend.
* {{#crossLink "Timeshift-Reload/updateObject:method"}}{{/crossLink}} shows an
* exemplary requests.
*
* @class Timestamp-Adapter
* @extends DS.JSONAPIAdapter
*
* @module explorviz
* @submodule network
*/
export default JSONAPIAdapter.extend(DataAdapterMixin,{

  host: APP.API_ROOT,
  namespace: "timestamp",


  init() {

    this.set('headers', {
      "Accept": "application/vnd.api+json"
    });
 
  },

  // @Override
  urlForQueryRecord(query) {
    const baseUrl = this.buildURL();
    if(query === "1"){
      return `${baseUrl}/from-recent?intervalSize=100`;
    } else if(query === "2"){
      //query all uploaded timestamps
      return `${baseUrl}/all-uploaded`;
    }
    else{
      return `${baseUrl}/before-timestamp/${query}?intervalSize=100`;
    }
  },


  // @Override
  urlForQuery(query) {
    const baseUrl = this.buildURL();
    if(query === "1"){
      return `${baseUrl}/from-recent?intervalSize=100`;
    }else if(query === "2"){
      //query all uploaded timestamps
      return `${baseUrl}/all-uploaded`;
    }
    else{
      return `${baseUrl}/before-timestamp/${query}?intervalSize=100`;
    }
  },

  authorize(xhr) {
    let { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Basic ${access_token}`);
  }

});
