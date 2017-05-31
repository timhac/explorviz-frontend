import Ember from 'ember';
import HammerInteraction from '../hammer-interaction';

export default Ember.Object.extend(Ember.Evented, {

  canvas: null,
  camera: null,
  renderer: null,
  raycaster: null,
  rotationObject: null,
  hammerHandler: null,
  raycastObjects: Ember.computed('rotationObject', function() {
    return this.get('rotationObject.children');
  }),

  setupInteraction(canvas, camera, renderer, raycaster, parentObject) {
    this.set('canvas', canvas);
    this.set('camera', camera);
    this.set('renderer', renderer);
    this.set('raycaster', raycaster);
    this.set('rotationObject', parentObject);

    const self = this;

    // zoom handler    
    canvas.addEventListener('mousewheel', registerMouseWheel, false);

    function registerMouseWheel(evt) {
      self.onMouseWheelStart(evt);
    }

    // init Hammer
    if (!this.get('hammerHandler')) {
      this.set('hammerHandler', HammerInteraction.create());
      this.get('hammerHandler').setupHammer(canvas);
    }

    this.setupHammerListener();

  },

  onMouseWheelStart(evt) {

    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));

    // zoom in
    if (delta > 0) {
      this.camera.position.z -= delta * 3.5;
    }
    // zoom out
    else {
      this.camera.position.z -= delta * 3.5;
    }
  },

  setupHammerListener() {

    const self = this;
    
    this.get('hammerHandler').on('doubleClick', function(mouse) {
      self.handleDoubleClick(mouse);
    });

    this.get('hammerHandler').on('panning', function(delta, event) {
      self.handlePanning(delta, event);
    });

    this.get('hammerHandler').on('singleClick', function(mouse) {
      self.handleSingleClick(mouse);
    });    

  },

  removeHandlers() {
    this.get('hammerHandler.hammerManager').off();
    this.get('canvas').removeEventListener('mousewheel', this.onMouseWheelStart);
  },

  handleDoubleClick(mouse) {

    const origin = {};

    origin.x = ((mouse.x - (this.get('renderer').domElement.offsetLeft+0.66)) / 
      this.get('renderer').domElement.clientWidth) * 2 - 1;

    origin.y = -((mouse.y - (this.get('renderer').domElement.offsetTop+0.665)) / 
      this.get('renderer').domElement.clientHeight) * 2 + 1;

    const intersectedViewObj = this.get('raycaster').raycasting(null, origin, 
      this.get('camera'), this.get('raycastObjects'));

    if(intersectedViewObj) {

      const emberModel = intersectedViewObj.object.userData.model;
      const emberModelName = emberModel.constructor.modelName;

      if(emberModelName === "component"){
        emberModel.setOpenedStatus(!emberModel.get('opened'));
        emberModel.set('highlighted', false);
        this.trigger('redrawScene');
      } 

    }

  },

  handleSingleClick(mouse) {

    const origin = {};

    origin.x = ((mouse.x - (this.get('renderer').domElement.offsetLeft+0.66)) / 
      this.get('renderer').domElement.clientWidth) * 2 - 1;

    origin.y = -((mouse.y - (this.get('renderer').domElement.offsetTop+0.665)) / 
      this.get('renderer').domElement.clientHeight) * 2 + 1;

    const intersectedViewObj = this.get('raycaster').raycasting(null, origin, 
      this.get('camera'), this.get('raycastObjects'));

    if(intersectedViewObj) {

      const emberModel = intersectedViewObj.object.userData.model;
      const emberModelName = emberModel.constructor.modelName;

      if(emberModelName === "component" && !emberModel.get('opened')){

        emberModel.set('highlighted', !emberModel.get('highlighted'));    
      } 
      else if(emberModelName === "clazz") {
        emberModel.set('highlighted', !emberModel.get('highlighted'));
      }

      this.trigger('redrawScene');

    }

  },

  handlePanning(delta, event) {

    if(event.button === 3) {
      // rotate object
      this.get('rotationObject').rotation.x += delta.y / 100;
      this.get('rotationObject').rotation.y += delta.x / 100;
    } 

    else if(event.button === 1){
      // translate camera
      var distanceXInPercent = (delta.x /
      parseFloat(this.get('renderer').domElement.clientWidth)) * 100.0;

      var distanceYInPercent = (delta.y /
        parseFloat(this.get('renderer').domElement.clientHeight)) * 100.0;

      var xVal = this.get('camera').position.x + distanceXInPercent * 6.0 * 0.015 * -(Math.abs(this.get('camera').position.z) / 4.0);

      var yVal = this.get('camera').position.y + distanceYInPercent * 4.0 * 0.01 * (Math.abs(this.get('camera').position.z) / 4.0);

      this.get('camera').position.x = xVal;
      this.get('camera').position.y = yVal;
    }

  }





});