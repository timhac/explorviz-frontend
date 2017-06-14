import Ember from 'ember';
import RenderingCore from './rendering-core';
import Raycaster from '../utils/raycaster';
import applyKlayLayout from '../utils/klay-layouter';
import Interaction from '../utils/landscape-rendering/interaction';
import THREE from "npm:three";
import Meshline from "npm:three.meshline";

 /**
 * Renderer for landscape visualization.
 *
 * @class Landscape-Rendering
 * @extends Rendering-Core
 */
export default RenderingCore.extend({

  landscapeRepo: Ember.inject.service("landscape-repository"),
  configuration: Ember.inject.service("configuration"),

  hammerManager: null,

  centerPoint : null,

  logos: {},
  textLabels: {},
  gradientTextures: {},

  raycaster: null,
  interaction: null,

  // @Override
  initRendering() {
    this._super(...arguments);

    const self = this;

    this.debug("init landscape rendering");

    if (!this.get('interaction')) {
      this.set('interaction', Interaction.create());
    }

    if (!this.get('raycaster')) {
      this.set('raycaster', Raycaster.create());
    }

    // init landscape exchange
    this.get('landscapeRepo').on("updated", function(landscape) {
      self.set("entity", landscape);
      self.preProcessEntity();
      self.cleanAndUpdateScene(self.get("entity"));
    });

    this.initInteraction();

    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(30, 10, 20);
    this.get('scene').add(dirLight);

    // handle window resize
    this.on('resized', function () {
      self.set('centerPoint', null);
      self.cleanAndUpdateScene();
    });
  },

  // @Override
  cleanup() {
    this._super(...arguments);

    this.debug("cleanup landscape rendering");

    this.set('logos', {});
    this.set('textLabels', {});
    this.set('gradientTextures', {});

    this.get('interaction').removeHandlers();

    this.get('landscapeRepo').off("updated");
  },

  // @Override
  cleanAndUpdateScene() {
    this._super(...arguments);

    this.debug("clean and populate landscape rendering");

    this.populateScene();

    this.set('interaction.raycastObjects', this.get('scene').children);
  },

  // @Override
  populateScene() {
    this._super(...arguments);

    const self = this;

    const emberLandscape = this.get('entity');
    applyKlayLayout(emberLandscape);

    const systems = emberLandscape.get('systems');

    const scaleFactor = {
      width: 0.5,
      height: 0.5
    };

    let isRequestObject = false;

    if (systems) {

      if(!this.get('centerPoint')) {
        this.set('centerPoint', calculateLandscapeCenterAndZZoom(emberLandscape));
      }      

      var centerPoint = this.get('centerPoint'); 

      systems.forEach(function(system) {

        isRequestObject = false;

        if (!isRequestObject && system.get('name') === "Requests") {
          isRequestObject = true;
        }

        if (!isRequestObject) {

          var extensionX = system.get('width') * scaleFactor.width;
          var extensionY = system.get('height') * scaleFactor.height;

          var centerX = system.get('positionX') + extensionX - centerPoint.x;
          var centerY = system.get('positionY') - extensionY - centerPoint.y;          

          var systemMesh = createPlane(system);
          systemMesh.position.set(centerX, centerY, system.get('positionZ'));
          self.get('scene').add(systemMesh);
          system.set('threeJSModel', systemMesh);

          // draw system text label          
          const padding = {
            left: 0.0,
            right: 0.0,
            top: -0.6,
            bottom: 0.0
          };
          const labelMesh = createTextLabel(self.get('font'), 0.3, null, systemMesh,
            padding, 0x00000, {
              width: 0.0,
              height: 0.0
            }, "max", system);

          systemMesh.add(labelMesh);

        }

        const nodegroups = system.get('nodegroups');

        nodegroups.forEach(function(nodegroup) {

          if(!nodegroup.get('visible')) {
              return;
            }

          if (!isRequestObject) {

            extensionX = nodegroup.get('width') * scaleFactor.width;
            extensionY = nodegroup.get('height') * scaleFactor.height;

            centerX = nodegroup.get('positionX') + extensionX - centerPoint.x;
            centerY = nodegroup.get('positionY') - extensionY - centerPoint.y;

            var nodegroupMesh = createPlane(nodegroup);
            nodegroupMesh.position.set(centerX, centerY, nodegroup.get('positionZ') + 0.01);
            self.get('scene').add(nodegroupMesh);
            nodegroup.set('threeJSModel', nodegroupMesh);

          }

          const nodes = nodegroup.get('nodes');

          nodes.forEach(function(node) {

            if(!node.get('visible')) {
              return;
            }

            if (!isRequestObject) {

              extensionX = node.get('width') * scaleFactor.width;
              extensionY = node.get('height') * scaleFactor.height;

              centerX = node.get('positionX') + extensionX - centerPoint.x;
              centerY = node.get('positionY') - extensionY - centerPoint.y;

              var nodeMesh = createPlane(node);
              nodeMesh.position.set(centerX, centerY, node.get('positionZ') + 0.02);
              self.get('scene').add(nodeMesh);
              node.set('threeJSModel', nodeMesh);

            }

            

            const applications = node.get('applications');

            applications.forEach(function(application) {

              if(application.get('name') === "PostgreSQL") {
                console.log("app", application);
              }

              extensionX = application.get('width') * scaleFactor.width;
              extensionY = application.get('height') * scaleFactor.width;

              centerX = application.get('positionX') + extensionX - centerPoint.x;
              centerY = application.get('positionY') - extensionY - centerPoint.y;

              if (!isRequestObject) {

                var applicationMesh = createPlane(application);
                applicationMesh.position.set(centerX, centerY, application.get('positionZ') + 0.03);
                self.get('scene').add(applicationMesh);
                application.set('threeJSModel', applicationMesh);

                // create logos 

                applicationMesh.geometry.computeBoundingBox();

                const logoSize = {
                  width: 0.4,
                  height: 0.4
                };
                const appBBox = applicationMesh.geometry.boundingBox;

                const logoPos = {
                  x: 0,
                  y: 0,
                  z: 0
                };

                const logoRightPadding = logoSize.width * 0.7;

                logoPos.x = appBBox.max.x - logoRightPadding;

                const texturePartialPath = application.get('database') ?
                  'database2' : application.get('programmingLanguage').toLowerCase();

                createPicture(logoPos.x, logoPos.y, logoPos.z,
                  logoSize.width, logoSize.height, texturePartialPath, 
                  applicationMesh, "label");

                // create text labels

                const font = self.get('font');

                let padding = {
                  left: 0.0,
                  right: -logoRightPadding,
                  top: 0.0,
                  bottom: 0.0
                };
                let labelMesh = createTextLabel(font, 0.2, null, applicationMesh,
                  padding, 0xffffff, logoSize, "center", application);

                applicationMesh.add(labelMesh);

                padding = {
                  left: 0.0,
                  right: 0.0,
                  top: 0.0,
                  bottom: 0.2
                };

               labelMesh = createTextLabel(font, 0.2, node.getDisplayName(), nodeMesh,
                  padding, 0xffffff, {
                    width: 0.0,
                    height: 0.0
                  }, "min", node);

                nodeMesh.add(labelMesh);



              } else {
                // draw request logo
                createPicture(centerX, centerY, 0,
                  1.6, 1.6, "requests", self.get('scene'), "label");
              }

            });

          });

        });

      });
    } // END if(systems)

    const appCommunication = emberLandscape.get('applicationCommunication');

    const communicationsAccumulated = [];

    var accum;

    if (appCommunication) {
      appCommunication.forEach((communication) => {

        var points = communication.get('points');

        if (points.length !== 0) {

          const color = self.get('configuration.landscapeColors.communication');

          accum = {
            tiles: [],
            pipeColor: new THREE.Color(color)
          };
          communicationsAccumulated.push(accum);

          for (var i = 1; i < points.length; i++) {

            var lastPoint = points[i - 1];
            var thisPoint = points[i];

            var tile = seekOrCreateTile(lastPoint, thisPoint, communicationsAccumulated, 0.02);
            tile.communications.push(appCommunication);
            tile.requestsCache = tile.requestsCache + communication.get('requests');

            accum.tiles.push(tile);
          }

        }

      });

      addCommunicationLineDrawing(communicationsAccumulated, self.get('scene'));

    }


    // Helper functions //

    function addCommunicationLineDrawing(communicationsAccumulated, parent) {

      const requestsList = [];    

      communicationsAccumulated.forEach((accum) => {

        accum.tiles.forEach((tile) => {
               
          requestsList.push(tile.requestsCache);

          });
      });

      const categories = getCategories(requestsList, true);

      communicationsAccumulated.forEach((accum) => {        
        for (var i = 0; i < accum.tiles.length; i++) {
          var tile = accum.tiles[i];
          tile.lineThickness = 0.07 * categories[tile.requestsCache] + 0.01;
        }

        createAccumLine(accum, parent);

      });


   


      ///
      

      function getCategories(list, linear) {
        const result = [];

        if (list.length === 0) {
          return result;
        }

        list.sort();

        if (linear) {
          const listWithout0 = [];

          list.forEach((entry) => {
            if (entry !== 0){
              listWithout0.push(entry);
            }
          });

          if (listWithout0.length === 0) {
            result.push({0: 0.0});
            return result;
          }        
          useLinear(listWithout0, list, result);
        } 
        else {
          const listWithout0And1 = [];

          let outsideCounter = 0;
          let insideCounter = 0;

          list.forEach((entry) => {
            outsideCounter++;
            if (entry !== 0 && entry !== 1){
              listWithout0And1.push(entry);
              insideCounter++;
            }
          });

          if (listWithout0And1.length === 0) {
            result.push({0: 0.0});
            result.push({1: 1.0});
            return result;
          }

          useThreshholds(listWithout0And1, list, result);
        }

        return result;



        // inner helper functions

        function useThreshholds(listWithout0And1, list, result) {
          let max = 1;

          listWithout0And1.forEach((value) => {
            if (value > max) {
              max = value;
            }
          });

          const oneStep = max / 3.0;

          const t1 = oneStep;
          const t2 = oneStep * 2;

          list.forEach((entry) => {
            let categoryValue = getCategoryFromValues(entry, t1, t2);
            result[entry] = categoryValue;
          });

        }


        function getCategoryFromValues(value, t1, t2) {
          if (value === 0) {
            return 0.0;
          } else if (value === 1) {
            return 1.0;
          }

          if (value <= t1) {
            return 2.0;
          } else if (value <= t2) {
            return 3.0;
          } else {
            return 4.0;
          }
        }


        function useLinear(listWithout0, list, result) {
          let max = 1;
          let secondMax = 1;

          listWithout0.forEach((value) => {
            if (value > max) {
              secondMax = max;
              max = value;
            }
          });   

          const oneStep = secondMax / 4.0;

          const t1 = oneStep;
          const t2 = oneStep * 2;
          const t3 = oneStep * 3;

          list.forEach((entry) => {
            const categoryValue = getCategoryFromLinearValues(entry, t1, t2, t3);
            result[entry] = categoryValue;
          }); 

        }


        function getCategoryFromLinearValues(value, t1, t2, t3) {
          if (value <= 0) {
            return 0;
          } else if (value <= t1) {
            return 1.5;
          } else if (value <= t2) {
            return 2.5;
          } else if (value <= t3) {
            return 4.0;
          } else {
            return 6.5;
          }
        }



      } // END getCategories

      ///
      
    }


    function checkEqualityOfPoints(p1, p2) {
      var x = Math.abs(p1.x - p2.x) <= 0.01;
      var y = Math.abs(p1.y - p2.y) <= 0.01;

      return x && y;
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
      var tile = {
        startPoint: start,
        endPoint: end,
        positionZ: lineZvalue,
        requestsCache: 0,
        communications: []
      };
      return tile;
    }


    function createAccumLine(accum, parent) {

      if (accum.tiles.length !== 0) {

        var firstTile = accum.tiles[0];

        const material = new Meshline.MeshLineMaterial({
          color: accum.pipeColor,
          lineWidth: firstTile.lineThickness * 0.4
        });

        const geometry = new THREE.Geometry();

        geometry.vertices.push(
          new THREE.Vector3(firstTile.startPoint.x - centerPoint.x,
            firstTile.startPoint.y - centerPoint.y, firstTile.positionZ + 0.001)
        );

        accum.tiles.forEach((tile) => {
          geometry.vertices.push(
            new THREE.Vector3(tile.endPoint.x - centerPoint.x,
              tile.endPoint.y - centerPoint.y, tile.positionZ + 0.001)
          );
        });

        const line = new Meshline.MeshLine();
        line.setGeometry(geometry);

        var lineMesh = new THREE.Mesh(line.geometry, material);

        parent.add(lineMesh);

      }
    }


    function createTextLabel(font, size, textToShow, parent, padding, color,
      logoSize, yPosition, model) {

      if(self.get('textLabels')[model.get('id')]) {
        if(self.get('textLabels')[model.get('id')].state === model.get("state")) {
          //console.log("old label");
          return self.get('textLabels')[model.get('id')].mesh;
        }        
      }      

      //console.log("new label");

      const text = textToShow ? textToShow :
        parent.userData.model.get('name');

      let labelGeo = new THREE.TextGeometry(
        text, {
          font: font,
          size: size,
          height: 0
        }
      );

      labelGeo.computeBoundingBox();
      var bboxLabel = labelGeo.boundingBox;
      var labelWidth = bboxLabel.max.x - bboxLabel.min.x;

      //console.log("label", text);

      //console.log("labelMax", bboxLabel.max.x);
      //console.log("labelMin", bboxLabel.min.x);
      //console.log("labelWidth", labelWidth);

      parent.geometry.computeBoundingBox();
      const bboxParent = parent.geometry.boundingBox;

      var boxWidth = Math.abs(bboxParent.max.x) +
        Math.abs(bboxParent.min.x);

      //console.log("pre-boxwidth", boxWidth);

      boxWidth = boxWidth - logoSize.width + padding.left + padding.right;

      //console.log("boxwidth", boxWidth);

      // We can't set the size of the labelGeo. Hence we need to scale it.

      // upper scaling factor
      var i = 1.0;

      // scale until text fits into parent bounding box
      while ((labelWidth > boxWidth) && (i > 0.1)) {
        // TODO time complexity: linear -> Do binary search alike approach?                        
        i -= 0.05;
        labelGeo.scale(i, i, i);
        // update the boundingBox
        labelGeo.computeBoundingBox();
        bboxLabel = labelGeo.boundingBox;
        labelWidth = bboxLabel.max.x - bboxLabel.min.x;
        if (text === "PostgreSQL") {
          //console.log("boxWidth", boxWidth);
          //console.log("labelWidth", labelWidth);
        }
      }

      const labelHeight = bboxLabel.max.y - bboxLabel.min.y;

      if (text === "PostgreSQL") {
        //console.log(labelHeight);
      }
      //console.log("labelHeight", labelHeight);

      let posX = (-labelWidth / 2.0) + padding.left + padding.right;

      let posY = padding.bottom + padding.top;

      if (yPosition === "max") {
        posY += bboxParent.max.y;
      } else if (yPosition === "min") {
        posY += bboxParent.min.y;
      } else if (yPosition === "center") {
        posY -= (labelHeight / 2.0);
      }

      const material = new THREE.MeshBasicMaterial({
        color: color
      });

      const labelMesh = new THREE.Mesh(labelGeo, material);

      labelMesh.position.set(posX, posY, 0.005);

      labelMesh.userData['type'] = 'label';
      labelMesh.userData['model'] = model;

      self.get('textLabels')[model.get('id')] = {"mesh": labelMesh, "state": model.get('state')};

      return labelMesh;
    }


    function createPlane(model) {

      const emberModelName = model.constructor.modelName;

      const material = new THREE.MeshBasicMaterial({
        color: self.get('configuration.landscapeColors.' + emberModelName)
      });

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(model.get('width'), model.get('height')),
        material);      
      plane.userData['model'] = model;
      return plane;
      
    }


    function createPicture(x, y, z, width, height, textureName, parent, model) {
      if(self.get('logos')[textureName]) {

        const material = new THREE.MeshBasicMaterial({
          map: self.get('logos')[textureName],
          transparent: true
        });

        const geo = new THREE.PlaneGeometry(width, height);

        const plane = new THREE.Mesh(geo, material);
        plane.position.set(x, y, z);
        parent.add(plane);
        plane.userData['model'] = model;
        return plane;

      } 
      else {

        new THREE.TextureLoader().load('images/logos/' + textureName + '.png', (texture) => {            

          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
          });
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height),
            material);
          plane.position.set(x, y, z);
          parent.add(plane);
          plane.userData['model'] = model;

          self.get('logos')[textureName] = texture;

          return plane;
        });
      }        
    }

    function calculateLandscapeCenterAndZZoom(emberLandscape) {

      const MIN_X = 0;
      const MAX_X = 1;
      const MIN_Y = 2;
      const MAX_Y = 3;

      const rect = getLandscapeRect(emberLandscape);

      const EXTRA_SPACE_IN_PERCENT = 0.02;

      let requiredWidth = Math.abs(rect.get(MAX_X) - rect.get(MIN_X));
      requiredWidth += requiredWidth * EXTRA_SPACE_IN_PERCENT;

      let requiredHeight = Math.abs(rect.get(MAX_Y) - rect.get(MIN_Y));
      requiredHeight += requiredHeight * EXTRA_SPACE_IN_PERCENT;

      const viewPortSize = self.get('webglrenderer').getSize();

      let viewportRatio = viewPortSize.width / viewPortSize.height;

      const sizeFactor = 0.65;

      const newZ_by_width = (requiredWidth / viewportRatio) * sizeFactor;
      const newZ_by_height = requiredHeight * sizeFactor;

      const camera = self.get('camera');

      const center = new THREE.Vector3(rect.get(MIN_X) + ((rect.get(MAX_X) - rect.get(MIN_X)) / 2.0),
        rect.get(MIN_Y) + ((rect.get(MAX_Y) - rect.get(MIN_Y)) / 2.0), 0);      

      camera.position.z = Math.max(Math.max(newZ_by_height, newZ_by_width), 10.0);
      camera.updateProjectionMatrix();


      return center;

    }


    function getLandscapeRect(emberLandscape) {

      const MIN_X = 0;
      const MAX_X = 1;
      const MIN_Y = 2;
      const MAX_Y = 3;

      let rect = [];
      rect.push(Number.MAX_VALUE);
      rect.push(-Number.MAX_VALUE);
      rect.push(Number.MAX_VALUE);
      rect.push(-Number.MAX_VALUE);

      const systems = emberLandscape.get('systems');

      if (systems.get('length') === 0) {
        rect[MIN_X] = 0.0;
        rect[MAX_X] = 1.0;
        rect[MIN_Y] = 0.0;
        rect[MAX_Y] = 1.0;
      } else {
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
      if (rect[MAX_X] < curX + drawnodeentity.get('width')) {
        rect[MAX_X] = curX + drawnodeentity.get('width');
      }
      if (curY > rect[MAX_Y]) {
        rect[MAX_Y] = curY;
      }
      if (rect[MIN_Y] > curY - drawnodeentity.get('height')) {
        rect[MIN_Y] = curY - drawnodeentity.get('height');
      }

    }


  }, // END populateScene

  initInteraction() {

    const self = this;

    const canvas = this.get('canvas');
    const raycastObjects = this.get('scene').children;
    const camera = this.get('camera');
    const webglrenderer = this.get('webglrenderer');
    const raycaster = this.get('raycaster');

    // init interaction objects

    this.get('interaction').setupInteraction(canvas, camera, webglrenderer, raycaster, 
      raycastObjects);

    // set listeners

    this.get('interaction').on('redrawScene', function() {
      self.cleanAndUpdateScene();
    });

    this.get('interaction').on('showApplication', function(emberModel) {
      // bubble up action to visualization route
      self.sendAction("showApplication", emberModel);
    });



  }, // END initInteraction


  // ONLY FOR DEBUGGIN
  debugPlane(x, y, z, width, height, color1, parent) {

    const material = new THREE.MeshBasicMaterial({
      color: color1,
      opacity: 0.4,
      transparent: true
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height),
      material);
    plane.position.set(x, y, z);
    parent.add(plane);
 
  }





});