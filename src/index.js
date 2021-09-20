import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import './component.js';
import * as THREE from 'three';
// import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let local ={};
window.local = local;
local.camera = [];
local.controls = [];
local.heroPosition = '';
var clamp = (num, min, max) => Math.min(Math.max(num, min), max);
local.isEvent = "";
local.isEvent2 = "";
local.nameFirst = "";
local.nameNext = "";
var clock = new THREE.Clock();
// var outlineSize = characterSize * 0.05;

// Track all objects and collisions.

// move
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveRun = false;
// /move

// anim
local.idleAnim = {};
local.idleParam = {};

local.walkAnim = {};
local.walkParam = [];

local.runAnim = {};
local.runParam = [];

local.kickAnim = {};
local.kickParam = [];


local.ground = [];
local.collisions = [];
local.hero = [];
local.positionClick ={};

// Set mouse and raycaster.
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2();

let scene, renderer, camera, controls;
//  stats;
let model, skeleton, mixer;
let idleAction, walkAction, runAction, kickAction;
let idleWeight, walkWeight, runWeight, kickWeight;
local.actions =[];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcccccc );
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(1.5155112310854661, 27.14502531123497, -46.42954147792327);
  camera.lookAt( 0, 5 ,0 );
  local.camera = camera;
  // local.camera.parent = scene.children[4];
  scene.add(camera)


  controls = new OrbitControls( camera, renderer.domElement );
  controls.listenToKeyEvents( window ); // optional
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 5;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2;
  local.controls = controls;
  local.controls.target.set(0,5,0)
  // local.camera.parent = scene.children[4];

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath( '../node_modules/three/examples/js/libs/draco/gltf/' );
  const loader = new GLTFLoader();
  loader.setDRACOLoader( dracoLoader );
  loader.load( 'scene/arena_no_1.glb' , function(gltf){
    model = gltf.scene;
    scene.add( model );
    scene.getObjectByName("ground").visible = false
    scene.getObjectByName("walls").visible = false
    local.collisions = scene.getObjectByName("walls");
    local.ground = scene.getObjectByName("ground");
    model.traverse( function ( object ) {
      if ( object.isMesh ) object.receiveShadow = true;
    } );
    loader.load( 'scene/Girl_animated_ready.glb', function ( gltf ) {
      model = gltf.scene;
      model.scale.set( 0.2, 0.2, 0.2 );
      model.position.set(0, 4.75, 0);
      scene.add( model );
      // local.heroPosition = scene.children[4].position
      local.hero = model ;
      model.traverse( function ( object ) {
        if ( object.isMesh ) object.castShadow = true;
      } );

      skeleton = new THREE.SkeletonHelper( model );
      skeleton.visible = false;
      scene.add( skeleton );
      
      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer( model );
  
      idleAction = mixer.clipAction( animations[ 0 ] );
      walkAction = mixer.clipAction( animations[ 1 ] );
      runAction = mixer.clipAction( animations[ 2 ] );
      kickAction = mixer.clipAction( animations[ 3 ] );

      local.actions = [ idleAction, walkAction, runAction, kickAction ];
      // local.actions.forEach((item) =>{
      //   item.play()
      // })
      local.actions[0].weight = 0;
      // local.actions[1].weight = 0;
      // local.actions[2].weight = 0;
      // local.actions[3].weight = 0;
      local.idleAnim = local.actions[0];
      local.idleParam = {
        name: "heroIdle",
        anim: local.idleAnim,
        weight: 1
      };
      local.walkAnim = local.actions[0];
      local.walkParam = {
        name: "heroIdle",
        anim: local.walkAnim,
        weight: 1
      };
      local.runAnim = local.actions[0];
      local.runParam = {
        name: "heroIdle",
        anim: local.runAnim,
        weight: 1
      };
      // console.log(local.idleParam);
      // console.log(local.walkParam);
      // console.log(local.runParam);
      // console.log(local.kickAnim);
    } );
  })
  // ставим и добавляем освещение
  // hemi
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 20, 0 );
  scene.add( hemiLight );
  // /hemi
  // dir
  const dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( 0.3230237595399805, 22.225286034237925, 29.531061699173936 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = - 2;
  dirLight.shadow.camera.left = - 2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add( dirLight );
  // /dir
  // /ставим и добавляем освещение
  window.scene = scene;
  window.addEventListener( 'resize', onWindowResize );

// move
const onKeyDown = function ( event ) {
  switch ( event.code ) {
    //case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      // console.log(moveForward)
      break;

    //case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      // console.log(moveLeft)
      break;

    //case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      // console.log(moveBackward)
      break;

    //case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      // console.log(moveRight)
      break;

    case 'ShiftLeft':
      moveRun = true;
      // console.log(moveRun)
      break;
  }
};
const onKeyUp = function ( event ) {
  // console.log("qwrety")
  switch ( event.code ) {
   // case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      animationMoveStop()
      // console.log(moveForward)
      break;

   // case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      // console.log(moveLeft)
      break;

   // case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      animationMoveStop()
      // console.log(moveBackward)
      break;

    //case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      // console.log(moveRight)
      break;
    case 'ShiftLeft':
      local.isEvent = false;
      local.isEvent2 = false;
      moveRun = false;
      // console.log(moveRun)
      break;
  }

};

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );
// /move



}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  requestAnimationFrame( animate );
  local.heroPosition = scene.children[4].position;
  local.camera.parent = scene.children[4]
  let mixerUpdateDelta = clock.getDelta();
  mixer.update( mixerUpdateDelta );
  local.camera.updateProjectionMatrix()
  controls.update();
  render();
  move();
}

function render() {
  renderer.render( scene, camera );
}
function move(){
  var delta = clock.getDelta(); // seconds.
	var moveDistance = 35 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 120;   // pi/2 radians (90 degrees) per second
  if( moveRun === false ){
    // move forwards/backwards/left/right
    if ( moveForward === true ){
      local.hero.translateZ(  moveDistance );
      // console.log('walk')
      animationMove(1, 1)
      local.controls.target.set(local.heroPosition.x, local.heroPosition.y, local.heroPosition.z)
    }
    if ( moveBackward === true ){
      // console.log('back')
      local.hero.translateZ( -moveDistance );
      animationMove(1, -1)
    }
  }
  if( moveRun === true ){
    var moveDistanceRun = 70 * delta;
    var moveDistanceRun2 = 43 * delta;
    // move forwards/backwards/left/right
    if ( moveForward === true ){
      local.hero.translateZ(  moveDistanceRun );
      // console.log('walk')
      animationMove(2, 1)
      animationMoveRun(2, 1)
      local.controls.target.set(local.heroPosition.x, local.heroPosition.y, local.heroPosition.z)
    }
    if ( moveBackward === true ){
      // console.log('back')
      local.hero.translateZ( -moveDistanceRun2 );
      animationMove(2, -1)
      animationMoveRun(2, -1)
    }
  }

	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
  if( moveBackward === true){
    if ( moveLeft === true )
    local.hero.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
    if ( moveRight === true )
    local.hero.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
  }else{
    if ( moveLeft === true )
      local.hero.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
    if ( moveRight === true )
      local.hero.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
  }


	var relativeCameraOffset = new THREE.Vector3(0,50,200);

	// var cameraOffset = relativeCameraOffset.applyMatrix4( local.hero.matrixWorld );

	// camera.position.x = cameraOffset.x;
	// camera.position.y = cameraOffset.y;
	// camera.position.z = cameraOffset.z;
	// camera.lookAt( local.hero.position );
}
function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false );

window.addEventListener('click', event =>{
  // Grab the coordinates.
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

  // Use the raycaster to detect intersections.
  raycaster.setFromCamera( mouse, camera );

  // Grab all objects that can be intersected.
  var intersects = raycaster.intersectObjects( scene.children[3].children, true );
  if ( intersects.length > 0 ) {
    // console.log(intersects)
    intersects.forEach(item =>{
      if(item.object.name === "ground"){
        // console.log(item)
        local.positionClick = item.point;
        // console.log(local.positionClick)
      }
    })
  }
})


local.isEvent = false;
local.isEvent2 = false;
function animationMove(id, time){
  // if(local.isEvent == false ){
  //   local.actions.forEach((item) =>{
  //     local.isEvent = true;
  //     console.log(item._clip.name)
  //     if (item._clip.name != local.nameFirst || item._clip.name != local.nameNext){
  //       item.weight = 0;
  //     }
  //   })
  // } 
  if(local.isEvent == false ){
    local.isEvent = true;
    local.actions.forEach((item)=>{
      item.stop()
    })
    local.actions[id - 1].play()
    local.actions[id].timeScale = time;
    local.actions[id].play()
    console.log('Ходьба 1')
  }
  // blendTo(0, 1) 
}
function animationMoveRun(id, time){
  if(local.isEvent2 == false ){
    local.isEvent2 = true;
    local.actions.forEach((item)=>{
      item.stop()
    })
    local.actions[id].timeScale = time;
    local.actions[id].play()
    // console.log('бег 1')
  }
}
function animationMoveStop(){
  local.isEvent = false;
  local.isEvent2 = false;
  local.actions.forEach((item)=>{
    item.stop()
    item.timeScale = 1;
  })
  local.actions[0].play()
}

function BlendAnims(blend) {
  //idle
  local.actions[0].weight = 1 - clamp(blend, 0, 1);
  local.idleParam.anim.setWeightForAllAnimatables(local.idleParam.weight);
  //walk
  local.walkParam.weight = 1 - Math.abs(blend - 1);
  local.walkParam.anim.setWeightForAllAnimatables(local.walkParam.weight);
  //run
  local.runParam.weight = clamp(blend - 1, 0, 1);
  local.runParam.anim.setWeightForAllAnimatables(local.runParam.weight);
  //heroSpeed
  // local.curSpeed = local.runParam.weight * local.RSpeed + local.walkParam.weight * local.WSpeed;
  // if (blend < 0.01) {
  //   local.curSpeed = 0
  // } //можэет сработает может нет надо затестить
}

function blendTo(animFirst, animNext) {
  var delta2 = clock.getDelta();
  var deltaBlend = 10 * delta2; 


  if (local.actions[animFirst].weight === 1 ||  local.actions[animFirst].weight > 0.1) {
    console.log('ghbdtn')
    local.actions[animFirst].weight -= (1 / deltaBlend);
    local.actions[animNext].weight += (1 / deltaBlend);
    local.nameFirst = local.actions[animFirst]._clip.name;
    console.log(nameFirst)
    local.nameNext = local.actions[animNext]._clip.name;
    console.log(nameNext)
    // local.actions.forEach((item) =>{
    //   console.log(item._clip.name)
    //   if (item._clip.name != nameFirst || item._clip.name != nameNext){
    //     item.weight = 0;
    //   }
    // })
  }
}
//  w - 87 : a - 65 : s - 83 : d - 68 