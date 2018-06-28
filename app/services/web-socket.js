import Service, { inject as service } from '@ember/service';

export default Service.extend({

  websockets: service('websockets'),
  socketRef: null,

  init() {
    this._super(...arguments);
    console.log("bla");
    const socket = this.websockets.socketFor('ws://localhost:4444');

    console.log('Socket is now running');

    socket.on('open', this.myOpenHandler, this);
    socket.on('message', this.myMessageHandler, this);
    socket.on('close', this.myCloseHandler, this);

    this.set('socketRef', socket);
  },

  willDestroyElement() {
    this._super(...arguments);

    const socket = this.socketRef;

    /*
      4. The final step is to remove all of the listeners you have setup.
    */
    socket.off('open', this.myOpenHandler);
    socket.off('message', this.myMessageHandler);
    socket.off('close', this.myCloseHandler);
  },

  myOpenHandler(event) {
    console.log(`On open event has been called: ${event}`);
    this.get('socketRef').send('asd');
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
