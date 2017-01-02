
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 0 );
document.body.appendChild( renderer.domElement );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


camera.position.z = 5;

controls = new THREE.OrbitControls(camera, renderer.domElement);

let selectedCubes = [];


// MAKE CUBES
var bigCubeGeometry = new THREE.BoxGeometry( 3, 3, 3 );
bigCubeGeometry.name = "bigCube";
var bigCubeMaterial = new THREE.MeshBasicMaterial( { visible: false } );
var bigCube = new THREE.Mesh( bigCubeGeometry, bigCubeMaterial );
scene.add( bigCube );

var crossSectionMaterial = new THREE.MeshBasicMaterial( {visible: false});

// make crosssections
let crossSections = [];
var zCrossSectionGeometry = new THREE.BoxGeometry(3,3,1);
zCrossSectionGeometry.name = "zCrossSection";
var yCrossSectionGeometry = new THREE.BoxGeometry(1,3,3);
yCrossSectionGeometry.name = "yCrossSection";
var xCrossSectionGeometry = new THREE.BoxGeometry(3,1,3);
xCrossSectionGeometry.name = "xCrossSection";

let xCrossSections = [];
let yCrossSections = [];
let zCrossSections = [];


for (var y = -1; y <= 1; y++) {
  let newCrossSection = new THREE.Mesh(xCrossSectionGeometry, crossSectionMaterial);
  newCrossSection.position.setY(y);
  scene.add(newCrossSection);
  xCrossSections.push(newCrossSection);
}
for (var x = -1; x <= 1; x++) {
  let newCrossSection = new THREE.Mesh(yCrossSectionGeometry, crossSectionMaterial);
  newCrossSection.position.setX(x);
  scene.add(newCrossSection);
  yCrossSections.push(newCrossSection);
}
for (var z = -1; z <= 1; z++) {
  let newCrossSection = new THREE.Mesh(zCrossSectionGeometry, crossSectionMaterial);
  newCrossSection.position.setZ(z);
  scene.add(newCrossSection);
  zCrossSections.push(newCrossSection);
}

// make cubes
var smallCubeGeometry = new THREE.BoxGeometry(1,1,1);
smallCubeGeometry.name = "smallCubeGeometry"
var color = new THREE.Color().setRGB(1, 0, 0);

var smallCubeMaterials = [
    new THREE.MeshBasicMaterial({color:"orange"}),
    new THREE.MeshBasicMaterial({color:"green"}),
    new THREE.MeshBasicMaterial({color:"pink"}),
    new THREE.MeshBasicMaterial({color:"blue"}),
    new THREE.MeshBasicMaterial({color:"red"}),
    new THREE.MeshBasicMaterial({color:"yellow"})
];

// Create a MeshFaceMaterial, which allows the cube to have different materials on each face
var smallCubeMaterial = new THREE.MeshFaceMaterial(smallCubeMaterials);


let newCubes = [];
let cubeArray = [];
for (var i = 0; i < 27; i++) {
  newCubes.push(new THREE.Mesh(smallCubeGeometry, smallCubeMaterial));
}
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
        for (var z = -1; z <= 1; z++) {
          let cube = newCubes.pop();
          cube.position.setX(x);
          cube.position.setY(y);
          cube.position.setZ(z);
          cubeArray.push(cube);

    }
  }
};
cubeArray.forEach((cube) =>scene.add(cube))



// MOUSE LISTENERS


let dragging = false;
let startX = 0;
let selectStartX = 0;
let selectStartY = 0;
var selectMouse = new THREE.Vector2();

function yesDragging(event){
  dragging = true;


  selectMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  selectMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  selectStartX = ( event.clientX / window.innerWidth ) * 2 - 1;
  selectStartY = - ( event.clientY / window.innerHeight ) * 2 + 1;

  snapper = null;


}

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  if (dragging === true && needToPick === true && Math.abs(selectMouse.y - mouse.y) < 5 && Math.abs(selectMouse.x - mouse.x) < 5){
    yComponent = Math.abs(selectMouse.y - mouse.y);
    xComponent = Math.abs(selectMouse.x - mouse.x);
  }


    raycaster.setFromCamera( selectMouse, camera );
    if (dragging === false){
      intersects = [];
    }

    else if (dragging === true && needToPick === true){
      intersects = raycaster.intersectObjects( scene.children );

        for (var i = 0; i < intersects.length; i++) {
          if (xComponent >= yComponent && needToPick === true && intersects[i].face.normal.y === 0 && intersects[i].object.geometry.name === "xCrossSection"){
            selected = "xCrossSection";
            axis = "x";
            needToSelect = true;
            needToPick = false;
            crossSection = intersects[i].object;
          }
          else if (yComponent > xComponent && needToPick === true && intersects[i].face.normal.x === 0 && intersects[i].object.geometry.name === "yCrossSection"){
            selected = "yCrossSection";
            axis = "y";
            needToSelect = true;
            needToPick = false;
            crossSection = intersects[i].object;
          }
          else if (needToPick === true && intersects[i].face.normal.z === 0 && intersects[i].object.geometry.name === "zCrossSection"){
            selected = "zCrossSection";
            needToPick = false;
            needToSelect = true;
            crossSection = intersects[i].object;
          }
        }
      }
}


function noDragging(event){

  dragging = false;
  reset = false;
  needToPick = true;
  crossSection = null;



if (selected === "xCrossSection"){


    if (snapper.rotation.equals(bigCube.rotation) === false) {
      let distances = [Math.PI, Math.PI/2, -Math.PI/2, 0]
      let index = null;
      let least = 100;
      let distance = null;

      for (var i = 0; i < distances.length; i++) {

        distance = snapper.rotation.y - distances[i];

        if (Math.abs(distance) <= Math.abs(least)){
          least = distance;
          index = i;
        };

      }

      if (snapper.rotation.z === -Math.PI && index === 3){
        snapper.rotation.set(snapper.rotation.x,Math.PI, snapper.rotation.z)
      } else {
        snapper.rotation.set(snapper.rotation.x,distances[index],snapper.rotation.z);
      }

    };
  }
    //
  else if (selected === "yCrossSection"){
    if (snapper.rotation.equals(bigCube.rotation) === false) {
      distances = [Math.PI, Math.PI/2, -Math.PI/2, 0]
      index = null;
      least = 100;
      distance = null;

      for (var i = 0; i < distances.length; i++) {

        distance = snapper.rotation.x - distances[i];

        console.log(distances[i], distance)
        if (Math.abs(distance) <= Math.abs(least)){
          least = distance;
          index = i;
        };

      }
        snapper.rotation.set(distances[index],snapper.rotation.y,snapper.rotation.z);
      }
    }


  else if (selected === "zCrossSection"){
    if (snapper.rotation.equals(bigCube.rotation) === false) {
      distances = [Math.PI, Math.PI/2, -Math.PI/2, 0]
      index = null;
      least = 100;
      distance = null;
      for (var i = 0; i < distances.length; i++) {
        distance = snapper.rotation.z - distances[i];
        if (Math.abs(distance) <= Math.abs(least)){
          least = distance;
          index = i;
        };

      }
        snapper.rotation.set(snapper.rotation.x,snapper.rotation.y,distances[index]);
      }
  };
    selected = null;
}



window.addEventListener( 'mousemove', onMouseMove );
window.addEventListener('mousedown', yesDragging );
window.addEventListener('mouseup', noDragging );




// DRAG CROSS SECTIONS

let rotateAxis = new THREE.Vector3();
let dragXCrossSection = function(obj){
  rotateAxis = new THREE.Vector3(0,1,0);
  if(dragging===true){
    let xDelta = startX - mouse.x;
    if(xDelta < 0){
      obj.rotateOnAxis(rotateAxis, .05);
      startX = mouse.x;
    }
    else if(xDelta > 0){
      obj.rotateOnAxis(rotateAxis,-.05);
      startX = mouse.x;
    }
  }
};

let startY = 0;
let dragYCrossSection = function(obj){
  rotateAxis = new THREE.Vector3(1,0,0);
  let yDelta = startY - mouse.y;
  if(dragging===true){
    if(yDelta > 0){
      obj.rotateOnAxis(rotateAxis, .05);
      startY = mouse.y;
    }
    else if(yDelta < 0){
      obj.rotateOnAxis(rotateAxis,-.05);
      startY = mouse.y;
    }
  }
};


let dragZCrossSection = function(obj){
  let yDelta = startY - mouse.y;
  if(dragging===true){
    if(yDelta > 0){
      obj.rotateZ(-.05);
      startY = mouse.y;
    }
    else if(yDelta < 0){
      obj.rotateZ(.05);
      startY = mouse.y;
    }
  }
};



// BOUNDARY BOXES


let boundaryBoxX = new THREE.Box3();
// boundaryBoxX.setFromObject(xCrossSection);
let boundaryBoxY = new THREE.Box3();
// boundaryBoxY.setFromObject(yCrossSection);
let boundaryBoxZ = new THREE.Box3();
let cubeBoundaryBox = new THREE.Box3();
// cubeBoundaryBox.setFromObject(smallCube);



// SELECT CUBES

let reset = false;
let ySwitched = false;
let xSwitched = true;



let selectCubesX = function(xCrossSection){
  cubeArray.forEach( (cube) => {

    boundaryBoxX.setFromObject(xCrossSection);
    cubeBoundaryBox.setFromObject(cube);

    if (boundaryBoxX.containsPoint(cubeBoundaryBox.getCenter()) === true){
      selectedCubes << cube;

        THREE.SceneUtils.detach( cube, cube.parent, bigCube );
        THREE.SceneUtils.attach( cube, bigCube, xCrossSection );
        cubeBoundaryBox.setFromObject(cube);
        reset = true;
        xSwitched = true;
        ySwitched = false;
        needToSelect = false;
      }
  });
};


let selectCubesY = function(yCrossSection){
  cubeArray.forEach( (cube) => {
    boundaryBoxY.setFromObject(yCrossSection);
    cubeBoundaryBox.setFromObject(cube);
    // boundaryBoxY.union(cubeBoundaryBox);

    if (boundaryBoxY.containsPoint(cubeBoundaryBox.getCenter()) === true){
      selectedCubes << cube;


        THREE.SceneUtils.detach( cube, cube.parent, bigCube );
        THREE.SceneUtils.attach( cube, bigCube, yCrossSection );
        cubeBoundaryBox.setFromObject(cube);

        reset = true;
        ySwitched = true;
        xSwitched = false;
        needToSelect = false;
    }
  });
};


let selectCubesZ = function(zCrossSection){
  cubeArray.forEach( (cube) => {
    boundaryBoxZ.setFromObject(zCrossSection);
    cubeBoundaryBox.setFromObject(cube);

    if (boundaryBoxZ.containsPoint(cubeBoundaryBox.getCenter()) === true){


        THREE.SceneUtils.detach( cube, cube.parent, scene );
        THREE.SceneUtils.attach( cube, scene, zCrossSection );
        cubeBoundaryBox.setFromObject(cube);
        needToSelect = false;
    }
  });
};

let pivot = null;
let createPivot = function(crossSection){
  pivot = new THREE.Mesh(crossSection.geometry, crossSection.material);
  pivot.position.setY(crossSection.position.y);
  pivot.position.setX(crossSection.position.x);
  pivot.position.setZ(crossSection.position.z);
  scene.add(pivot);
};

// SNAP

function snap(crossSection, axis){
    let axes = ["x","y","z"];

    if (crossSection.rotation.equals(bigCube.rotation) === false) {
      let distances = [Math.PI, Math.PI/2, -Math.PI/2, 0]
      let index = null;
      let least = 100;
      let distance = null;
      for (var i = 0; i < distances.length; i++) {
        let value = `crossSection.rotation.${axis}`;
        distance = eval(value) - distances[i];

        console.log(distances[i], distance)
        if (Math.abs(distance) <= Math.abs(least)){
          least = distance;
          index = i;
        };

      }


    let order = axes.indexOf(axis);
    let angles = [crossSection.rotation.x,crossSection.rotation.y,crossSection.rotation.z];
    angles[order] = distances[index];
    crossSection.rotation.set(angles[0], angles[1], angles[2]);
  };
}

// RENDER
let snapper = null;
let selected = null;
let intersects = [];
let axis = null;
let needToSelect = false;
let needToPick = true;
let xComponent = 0;
let yComponent = 0;
let crossSection = null;

var render = function () {
  controls.enableRotate = false;

  requestAnimationFrame( render );


  renderer.render(scene, camera);

    snapper = crossSection;
      if( selected === "xCrossSection" && needToSelect === true){

          selectCubesX(crossSection);
          dragXCrossSection(crossSection);

      }
      else if( selected === "yCrossSection" && needToSelect === true){
          selectCubesY(crossSection);
          dragYCrossSection(crossSection);

      }
      else if( selected === "zCrossSection" && needToSelect === true){
          selectCubesZ(crossSection);
          dragZCrossSection(crossSection);
      }
      else if( selected === "xCrossSection" && needToSelect === false ){
          dragXCrossSection(crossSection);
        }
      else if( selected === "yCrossSection" && needToSelect === false){
          dragYCrossSection(crossSection);
      }
      else if(selected === "zCrossSection" && needToSelect === false){
          dragZCrossSection(crossSection);
      }



  if (intersects.length === 0){
    controls.enableRotate = true;
  };
  controls.update();
  bigCube.updateMatrixWorld();
};

render();
