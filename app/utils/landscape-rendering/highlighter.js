import Object from '@ember/object';
import { calculateColorBrightness } from '../helpers/threejs-helpers';
import THREE from "three";

export default Object.extend({

  hoveredEntityColorObj: null,

  highlight(entity) { // eslint-disable-line
    
  },


  resetHoverEffect() {
    if(this.get('hoveredEntityColorObj')) {

      this.get('hoveredEntityColorObj').entity.material.color = 
        this.get('hoveredEntityColorObj').color;

      this.set('hoveredEntityColorObj', null);

    }
  },


  handleHoverEffect(raycastTarget) {

    // no raycastTarget, do nothing and return
    if(!raycastTarget) {
      this.resetHoverEffect();
        return;
    }

    const newHoverEntity = raycastTarget.object;

    // same object, do nothing and return
    if(this.get('hoveredEntityColorObj') && 
      this.get('hoveredEntityColorObj').entity === newHoverEntity) {
        return;
    }

    this.resetHoverEffect();

    const oldColor = newHoverEntity.material.color;

    this.set('hoveredEntityColorObj', {
      entity: newHoverEntity,
      color: new THREE.Color().copy(oldColor)
    });

    newHoverEntity.material.color = calculateColorBrightness(oldColor, 1.12);
    
  },


  unhighlightAll() {},


  applyHighlighting() {}
  

});