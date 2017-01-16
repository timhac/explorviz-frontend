import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['viz'],

  scene : null,
  webglrenderer: null,
  camera: null,

  animationFrameId: null,

  // @Override
  didRender() {
    this._super(...arguments);

    this.initRendering();
  },

  // @Override
  didDestroyElement() {
    this._super(...arguments);

    // cleanup

    cancelAnimationFrame(this.get('animationFrameId'));

    this.set('scene', null);
    this.set('webglrenderer', null);
    this.set('camera', null);
    
  },


  initRendering() {

    const self = this;

    const height = this.$()[0].clientHeight;
    const width = this.$()[0].clientWidth;
    const canvas = this.$('#threeCanvas')[0];

    this.set('scene', new THREE.Scene());
    this.set('scene.background', new THREE.Color(0xffffff));

    this.set('camera', new THREE.PerspectiveCamera(70, width / height, 1, 10));
    this.get('camera').position.set(13, -2, 10);

    this.set('webglrenderer', new THREE.WebGLRenderer({
      antialias: true,  
      canvas: canvas
    }));
    this.get('webglrenderer').setSize(width, height);

    this.createLandscape(this.get('landscape'));

    // Rendering loop //

    function render() {
      console.log("rendering");
      const animationId = requestAnimationFrame(render);
      self.set('animationFrameId', animationId);
      self.get('webglrenderer').render(self.get('scene'), self.get('camera'));
    }

    render();

    ////////////////////

  },

  createLandscape(landscape) {

    const self = this;

    const systems = landscape.get('systems'); 

    const scaleFactor = {width: 0.5, height: 0.5};

    getLandscapeRect(landscape);

    let isRequestObject = false;

    if(systems) {
      systems.forEach(function(system) {

        isRequestObject = false;

        if(!isRequestObject && system.get('name') === "Requests") {
          console.log("test");
          isRequestObject = true;
        }

        if(!isRequestObject) {

          const{x, y, z} = system.get('backgroundColor');

          var extensionX = system.get('width') * scaleFactor.width;
          var centerX = system.get('positionX') + extensionX;

          var extensionY = system.get('height') * scaleFactor.height;
          var centerY = system.get('positionY') - extensionY;

          var systemMesh = addPlane(centerX, centerY, 0, system.get('width'), 
            system.get('height'), new THREE.Color(x,y,z), null, self.get('scene'), system);

          system.set('threeJSModel', systemMesh);

        }

        const nodegroups = system.get('nodegroups');

        nodegroups.forEach(function(nodegroup) {

          if(!isRequestObject) {

            const{x, y, z} = nodegroup.get('backgroundColor');

            extensionX = nodegroup.get('width') * scaleFactor.width;
            extensionY = nodegroup.get('height') * scaleFactor.height;

            centerX = nodegroup.get('positionX') + extensionX;          
            centerY = nodegroup.get('positionY') - extensionY;

            var nodegroupMesh = addPlane(centerX, centerY, 0, nodegroup.get('width'), 
            nodegroup.get('height'), new THREE.Color(x,y,z), null, self.get('scene'), nodegroup);

            nodegroup.set('threeJSModel', nodegroupMesh);              

          }

          const nodes = nodegroup.get('nodes');

          nodes.forEach(function(node) {

            if(!isRequestObject) {

              const{x, y, z} = node.get('color');

              extensionX = node.get('width') * scaleFactor.width;
              extensionY = node.get('height') * scaleFactor.height;

              centerX = node.get('positionX') + extensionX;          
              centerY = node.get('positionY') - extensionY;

              var nodeMesh = addPlane(centerX, centerY, 0, node.get('width'), 
                node.get('height'), new THREE.Color(x,y,z), null, self.get('scene'), node);

              node.set('threeJSModel', nodeMesh);

            }

            const applications = node.get('applications');

            applications.forEach(function(application) {

              extensionX = application.get('width') * scaleFactor.width;
              extensionY = application.get('height') * scaleFactor.width;

              centerX = application.get('positionX') + extensionX - 0;
              centerY = application.get('positionY') - extensionY - 0;

              if(!isRequestObject) {  

                const{x, y, z} = application.get('backgroundColor'); 

                var applicationMesh = addPlane(centerX, centerY, 0, 
                  application.get('width'), application.get('height'), 
                  new THREE.Color(x,y,z), null, self.get('scene'), application);

                application.set('threeJSModel', applicationMesh);             

                applicationMesh.geometry.computeBoundingBox();

                const logoSize = {width: 0.4, height: 0.4};
                const appBBox = applicationMesh.geometry.boundingBox;  

                const logoPos = {x : 0, y : 0, z : 0};    

                const logoLeftPadding = logoSize.width * 0.7;

                logoPos.x = appBBox.max.x - logoLeftPadding;

                const texturePartialPath = application.get('database') ? 
                  'database2' : application.get('programmingLanguage').toLowerCase();

                addPlane(logoPos.x, logoPos.y, logoPos.z, 
                  logoSize.width, logoSize.height, new THREE.Color(1,0,0), 
                  texturePartialPath, applicationMesh, "label");                

                new THREE.FontLoader().load('three.js/fonts/helvetiker_regular.typeface.json', 
                  (font) => {

                    var padding = {left: 0.0, right: -logoLeftPadding, top: 0.0, bottom: 0.0};
                    var labelMesh = createLabel(font, 0.2, null, applicationMesh, 
                      padding, 0xffffff, logoSize, "center"); 

                    applicationMesh.add(labelMesh);

                    padding = {left: 0.0, right: 0.0, top: 0.0, bottom: 0.2};
                    labelMesh = createLabel(font, 0.125, node.get('ipAddress'), nodeMesh, 
                      padding, 0xffffff, {width: 0.0, height: 0.0}, "min"); 

                    nodeMesh.add(labelMesh);

                    padding = {left: 0.0, right: 0.0, top: -0.4, bottom: 0.0};
                    labelMesh = createLabel(font, 0.2, null, systemMesh, 
                      padding, 0x00000, {width: 0.0, height: 0.0}, "max");                  

                    systemMesh.add(labelMesh);

                });

              } else {
                // draw request logo
                addPlane(centerX, centerY, 0, 
                  1.6, 1.6, new THREE.Color(1,0,0), 
                  "requests", self.get('scene'), "label");
              }

            });

          });

        });

      });
    } // END if(systems)

    const appCommunication = landscape.get('applicationCommunication');

    const communicationsAccumulated = [];

    var accum;

    if(appCommunication) {
      appCommunication.forEach((communication) => {

        var points = communication.get('points');

        if (points.length !== 0) {

          const{x, y, z} = communication.get('pipeColor');

          accum = {tiles:[], pipeColor: new THREE.Color(x, y, z)};
          communicationsAccumulated.push(accum);

          for (var i = 1; i < points.length; i++) {
            
            var lastPoint = points[i - 1];
            var thisPoint = points[i];

            var tile = seekOrCreateTile(lastPoint, thisPoint, communicationsAccumulated, 0.02);
            tile.communications.push(appCommunication);
            tile.requestsCache = tile.requestsCache + appCommunication.requests;

            accum.tiles.push(tile);
          }

          communicationsAccumulated.push(accum);

        }

      });

      addCommunicationLineDrawing(communicationsAccumulated, self.get('scene'));

    }


    // Helper functions //

    function addCommunicationLineDrawing(communicationsAccumulated, parent) {
      communicationsAccumulated.forEach((accum) => {

        accum.tiles.forEach((tile) => { 

          tile.lineThickness = 0.07 * 1.3 + 0.01;

          // TODO createCommunicationLabel
          // ...


          createLine(accum, parent);

        });
      });
    }


    function checkEqualityOfPoints(p1, p2) {
      var x = p1.x === p2.x;
      var y = p1.y === p2.y;
      var z = p1.z === p2.z;

      return x && y && z;
    }


    function seekOrCreateTile(start, end, 
      communicationAccumulated, lineZvalue) {

      communicationAccumulated.forEach((accum) => {

        accum.tiles.forEach((tile) => {       

          if (checkEqualityOfPoints(tile.startPoint, start) && 
            checkEqualityOfPoints(tile.endPoint, end)) {
            //console.log("old tile");
            return tile;
          }

        });

      });

      //console.log("new tile");
      var tile = {startPoint: start, endPoint: end, positionZ: lineZvalue, 
        requestsCache: 0, communications: []};
      return tile;
    }


    function createLine(accum, parent) {

      if(accum.tiles.length !== 0) {

        var firstTile = accum.tiles[0];

        const material = new MeshLineMaterial({
          color: accum.pipeColor,
          lineWidth: firstTile.lineThickness
        });

        const geometry = new THREE.Geometry();

        geometry.vertices.push(
          new THREE.Vector3(firstTile.startPoint.x, firstTile.startPoint.y, firstTile.positionZ)
        );

        accum.tiles.forEach((tile) => {
          geometry.vertices.push(
            new THREE.Vector3(tile.endPoint.x, tile.endPoint.y, tile.positionZ)
          );
        });

        const line = new MeshLine();
        line.setGeometry(geometry);

        var lineMesh = new THREE.Mesh( line.geometry, material );
        
        parent.add(lineMesh);

      }
    }


    function createLabel(font, size, textToShow, parent, padding, color, 
      logoSize, yPosition) {

      const text = textToShow ? textToShow : 
        parent.userData.model.get('name');

      const labelGeo = new THREE.TextGeometry(
        text,
        {
          font: font,
          size: size,
          height: 0
        }
      );

      labelGeo.computeBoundingBox();
      var bboxLabel = labelGeo.boundingBox;
      var labelWidth = bboxLabel.max.x - bboxLabel.min.x;

      parent.geometry.computeBoundingBox();
      const bboxParent = parent.geometry.boundingBox;

      var boxWidth =  Math.abs(bboxParent.max.x) + 
        Math.abs(bboxParent.min.x) - logoSize.width +
        padding.left + padding.right;   

      // upper scaling factor
      var i = 1.0;

      // scale until text fits into parent bounding box
      while ((labelWidth > boxWidth) && (i > 0.1)) {    
         // TODO time complexity: linear -> Do binary search alike approach                         
        i -= 0.1;
        labelGeo.scale(i, i, i);
        // update the boundingBox
        labelGeo.computeBoundingBox();
        bboxLabel = labelGeo.boundingBox;
        labelWidth = bboxLabel.max.x - bboxLabel.min.x;
      }

      const posX = (-labelWidth / 2.0) + padding.left + padding.right;

      var posY = padding.bottom + padding.top;

      if(yPosition === "max") {
        posY += bboxParent.max.y;
      } 
      else if(yPosition === "min") {
        posY += bboxParent.min.y;
      }

      const material = new THREE.MeshBasicMaterial({color: color});

      const labelMesh = new THREE.Mesh(labelGeo, material);

      labelMesh.position.set(posX, posY, 0);

      return labelMesh;
    }


    function addPlane(x, y, z, width, height, color, texture, parent, model) {

      if(texture) {
         
         new THREE.TextureLoader().load('images/logos/' + texture + '.png', (texture) => {
            const material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), 
             material);
            plane.position.set(x, y, z);
            parent.add(plane);
            plane.userData['model'] = model;
            return plane;
          });   

        
      } else {

        const material = new THREE.MeshBasicMaterial({color: color});
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), 
          material);
        plane.position.set(x, y, z);
        parent.add(plane);
        plane.userData['model'] = model;
        return plane;
      }

      
    }
    

    function getLandscapeRect(landscape) {

      const MIN_X = 0;
      const MAX_X = 1;
      const MIN_Y = 2;
      const MAX_Y = 3;

      let rect = [];
      rect.push(Number.MAX_VALUE);
      rect.push(-Number.MAX_VALUE);
      rect.push(Number.MAX_VALUE);
      rect.push(-Number.MAX_VALUE);

      const systems = landscape.get('systems');

      if(systems.length === 0) {
        rect[MIN_X] = 0.0;
        rect[MAX_X] = 1.0;
        rect[MIN_Y] = 0.0;
        rect[MAX_Y] = 1.0;
      } 
      else {
        systems.forEach((system) => {
          getMinMaxFromQuad(system, rect);

          const nodegroups = system.get('nodegroups');
          nodegroups.forEach((nodegroup) => {

            const nodes = nodegroup.get('nodes');
            nodes.forEach((node) => {
              getMinMaxFromQuad(node, rect);
            });

          });

        });
      }

      return rect;

    }


    function getMinMaxFromQuad(drawnodeentity, rect) {

      const MIN_X = 0;
      const MAX_X = 1;
      const MIN_Y = 2;
      const MAX_Y = 3;


      const curX = drawnodeentity.get('positionX');
      const curY = drawnodeentity.get('positionY');

      if (curX < rect[MIN_X]) {
        rect[MIN_X] = curX;
      }
      if (rect[MAX_X]< curX + drawnodeentity.get('width')) {
        rect[MAX_X] = curX + drawnodeentity.get('width');
      }
      if (curY > rect[MAX_Y]) {
        rect[MAX_Y] = curY;
      }
      if (rect[MIN_Y] > curY - drawnodeentity.get('height')) {
        rect[MIN_Y] = curY - drawnodeentity.get('height');
      }

    }




  }





});