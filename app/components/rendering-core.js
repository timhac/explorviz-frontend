import Ember from 'ember';
import THREE from "npm:three";
import Stats from "npm:stats.js";

/**
* This component contains the core mechanics of the different (three.js-based) 
* renderer. All functions below are called in a determined order, hence you only 
* need to override them in your custom renderer.
*
* See {{#crossLink "Landscape-Rendering"}}{{/crossLink}} or 
* {{#crossLink "Application-Rendering"}}{{/crossLink}} for example usage.
*
* Call order:
*
* 1. 
*
* @class Rendering-Core
* @extends Ember.Component
*/
export default Ember.Component.extend(Ember.Evented, {

  // Declare url-builder service 
  urlBuilder: Ember.inject.service("url-builder"),

  classNames: ['viz'],

  scene : null,
  webglrenderer: null,
  camera: null,

  canvas: null,

  entity: null,

  font: null,
  animationFrameId: null,


  // @Override
  didRender(){
    this._super(...arguments);

    this.initRendering();
  },


  // @Override
  willDestroyElement() {
    this._super(...arguments);
    this.cleanup();    
  },

  /**
   * This function is called once on the didRender event. Inherit this function 
   * to call other important function, e.g. initInteraction as shown in 
   * {@landscape-rendering}.
   *
   * @method initRendering
   */
  initRendering() {

    const self = this;

    // get size if outer ember div
    const height = this.$()[0].clientHeight;
    const width = this.$()[0].clientWidth;
    
    const canvas = this.$('#threeCanvas')[0];

    this.set('canvas', canvas);

    this.set('scene', new THREE.Scene());
    this.set('scene.background', new THREE.Color(0xffffff));

    this.set('camera', new THREE.PerspectiveCamera(75, width / height, 0.1, 1000));

    this.set('webglrenderer', new THREE.WebGLRenderer({
      antialias: true,  
      canvas: canvas
    }));
    this.get('webglrenderer').setSize(width, height);

    this.$(window).on('resize.visualization', function(){
      const outerDiv = this.$('.viz')[0];

      if(outerDiv) {

        const height = Math.round(this.$('.viz').height());
        const width = Math.round(this.$('.viz').width());

        self.set('camera.aspect', width / height);
        self.get('camera').updateProjectionMatrix();

        self.get('webglrenderer').setSize(width, height);

        self.trigger("resized");
      }
    });


    // Three.js monitoring/performance code
    const stats = new Stats();
    // 0: fps, 1: ms, 2: mb, 3+: custom or just click the window to toggle
    stats.showPanel(0); 
    stats.dom.style.top = "200px";
    console.log(stats.dom);
    document.body.appendChild( stats.dom );

    const rendererStats = new THREEx.RendererStats();
    rendererStats.domElement.style.position = 'absolute';
    rendererStats.domElement.style.top = '250px';
    document.body.appendChild(rendererStats.domElement);

    // Rendering loop //
    function render() {
      const animationId = requestAnimationFrame(render);
      self.set('animationFrameId', animationId);
      rendererStats.update(self.get('webglrenderer'));
      stats.begin();
      self.get('webglrenderer').render(self.get('scene'), self.get('camera'));
      stats.end();
    }

    render();

    this.set('entity', this.get('renderingModel'));


    // Bind url-builder
    this.get('urlBuilder').on('requestURL', function() {
      console.log(self);
      const state = {};
      state.cameraX = self.get('camera').position.x; 
      state.cameraY = self.get('camera').position.y; 
      state.cameraZ = self.get('camera').position.z; 
      state.timestamp = self.get('model.timestamp');
      state.id = self.get('model.id');
      // Passes the state from component via service to controller
      self.get('urlBuilder').transmitState(state);
    });


    ////////////////////

    // load font for labels and proceed with populating the scene
    new THREE.FontLoader().load('three.js/fonts/helvetiker_regular.typeface.json', (font) => {

      self.set('font', font);
      self.populateScene();

    });    

  },  


  /**
   * This function is called once on initRendering. Inherit this function to 
   * insert objects in the Three.js scene. Have a look 
   * at {{#crossLink "Landscape-Rendering"}}{{/crossLink}} for an example.
   *
   * @method populateScene
   */
  populateScene() {},


  /**
   * This function is called when the willDestroyElement event is fired. Inherit this 
   * function to cleanup custom properties or unbind listener 
   * as shown in {{#crossLink "Landscape-Rendering"}}{{/crossLink}}.
   *
   * @method cleanup
   */
  cleanup() {
    cancelAnimationFrame(this.get('animationFrameId'));

    this.$(window).off('resize.visualization');

    this.set('scene', null);
    this.set('webglrenderer', null);
    this.set('camera', null);
    this.get('urlBuilder').off('requestURL');
  },



  /**
   * Inherit this function to update the scene with a new renderingModel. It 
   * automatically removes every mesh from the scene. Add your custom code 
   * as shown in landscape-rendering.
   *
   * @method cleanAndUpdateScene
   */
  cleanAndUpdateScene() {
    const scene = this.get('scene');

    for (let i = scene.children.length - 1; i >= 0 ; i--) {
      let child = scene.children[i];

      if ( child.type !== 'AmbientLight' && child.type !== 'SpotLight' ) {
        scene.remove(child);
      }
    }
  },


  /**
   * This function is called automatically when a new landscape was fetched. It 
   * is executed before 
   * {{#crossLink "Rendering-Core/cleanAndUpdateScene:method"}}{{/crossLink}}.
   * Inherit this function to preprocess the 
   * {{#crossLink "Landscape"}}{{/crossLink}} for rendering, e.g. filter some 
   * value.
   *
   * See {{#crossLink "Application-Rendering"}}{{/crossLink}} for example usage.
   *
   * @method preProcessEntity
   */
  preProcessEntity() {}

});
