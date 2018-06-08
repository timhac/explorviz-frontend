import Component from '@ember/component';
import { inject as service } from "@ember/service";

export default Component.extend({

    store: service(),

    actions: {

        createUser() {
            
            const { name, password, role } = 
                this.getProperties('name', 'password', 'role');

            
            this.get('store').createRecord('user', {
                id: "createID",
                username: name,
                password: password
            }).save();

            
            this.setProperties({name: null, password: null, role: null});

        }

    }

});
