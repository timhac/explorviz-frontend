import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  //inject websocket
  websockets: service(),
  socketRef: null,

  didInsertElement() {
    this._super(...arguments);

    //create websocket
    const socket = this.websockets.socketFor('ws://localhost:4444/');

    //define event handlers
    socket.on('open', this.myOpenHandler, this);
    socket.on('message', this.myMessageHandler, this);
    socket.on('close', this.myCloseHandler, this);

    this.set('socketRef', socket);
  },

  willDestroyElement() {
    this._super(...arguments);

    const socket = this.socketRef;

    //remove listeners
    socket.off('open', this.myOpenHandler);
    socket.off('message', this.myMessageHandler);
    socket.off('close', this.myCloseHandler);
  },

  myOpenHandler(event) {
    console.log(`On open event has been called: ${event}`);
  },

  myMessageHandler(event) {
    console.log(`Message: ${event.data}`);
  },

  myCloseHandler(event) {
    console.log(`On close event has been called: ${event}`);
  },

  actions: {
    sendButtonPressed() {
      this.socketRef.send('Hello Websocket World');
    }
  }
});