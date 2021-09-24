import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import './component.js';
import * as THREE from 'three';
// import * as CANNON from 'cannon'
import Stats from 'three/examples/jsm/libs/stats.module';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

window.THREE = THREE;
//local
let local ={};
window.local = local;
local.camera = [];
local.controls = [];
local.heroPosition = '';

// event
local.isEvent = "";
local.isEvent2 = "";
local.positionClick ={};
// /event

// ground and collisions
local.ground = [];
local.collisions = [];
// /ground and collisions

// hero
local.hero = [];
local.heroPosition = '';
// /hero

// comment
// local.nameFirst = "";
// local.nameNext = "";
// /comment

// /local


// scene

let scene, renderer, camera, controls;
let model, skeleton, mixer, stats;
window.raycaster = new THREE.Raycaster()
window.raycaster.ray.direction = new THREE.Vector3(0,-1,0);
var clock = new THREE.Clock();
// /scene
// move
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveRun = false;
// /move

// anim
let idleAction, walkAction, runAction, kickAction;
local.actions =[];
// idel
local.idleAnim = {};
local.idleParam = [];
// /idel

// walk
local.walkAnim = {};
local.walkParam = [];
// /walk

// run
local.runAnim = {};
local.runParam = [];
// /run

// kick
local.kickAnim = {};
local.kickParam = [];
// /kick

// /anim

init();
animate();

function init() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcccccc );
  // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
  // /scene
  // render
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  window.renderer = renderer;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );
  // /render
  // fps
  stats = new Stats();
	document.body.appendChild( stats.dom );
  // /fps

  // camera
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(1.5155112310854661, 27.14502531123497, -46.42954147792327);
  window.camera = camera;
  camera.lookAt( 0, 5 ,0 );
  local.camera = camera;
  scene.add(camera)
  // /camera
  // OrbitControls
  // controls = new OrbitControls( camera, renderer.domElement );
  // window.controls = controls
  // controls.listenToKeyEvents( window ); // optional
  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  // controls.dampingFactor = 0.05;
  // controls.screenSpacePanning = false;
  // controls.minDistance = 7;
  // controls.maxDistance = 7;
  // controls.maxPolarAngle = Math.PI / 3;
  // controls.minPolarAngle = Math.PI / 3;
  // local.controls = controls;
  // local.controls.target.set(0,7,0)
  // /OrbitControls
  // loading model
  // window.world = new CANNON.World();
  // window.world.gravity.set(0, -9.82, 0);
  // console.log(window.world)
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
    scene.getObjectByName("ground").receiveShadow = false;
    scene.getObjectByName("walls").receiveShadow = false;
    
    loader.load( 'scene/Girl_animated_ready.glb', function ( gltf ) {
      model = gltf.scene;
      model.scale.set( 0.2, 0.2, 0.2 );
      model.position.set(0, 4.75, 0);
      scene.add( model );
      local.hero = model ;
      // local.controls.target = local.hero.position;
    //  window.intersectsH =  new THREE.ArrowHelper( window.raycaster.ray.direction, local.hero.position, 10, 0xcccccc);
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
      // local.actions[0].weight = 0;
    },
    function ( xhr ) {

      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      
    },
    // called when loading has errors
    function ( error ) {
  
      console.log( 'An error happened' );
  
    }   
    );
  }
  )
  // /loading model
  // Light
  // hemi
  // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  // hemiLight.position.set( 0, 20, 0 );
  // scene.add( hemiLight );
  // /hemi
  // light
  // color light
  var colorLight1 = new THREE.Color( "rgb(251, 199, 126)" )
  var colorLight2 = new THREE.Color( "rgb(90, 87, 250)" )
  // /color light
  //Create a PointLight and turn on shadows for the light
  const pointLight1 = new THREE.PointLight( colorLight1, 0.7, 0 );
  pointLight1.position.set( 37, 45.5 ,-20 );
  pointLight1.castShadow = true; // default false
  // shadow
  pointLight1.shadow.mapSize.width = 1024; // default
  pointLight1.shadow.mapSize.height = 1024; // default
  pointLight1.shadow.camera.near = 0.5; // default
  pointLight1.shadow.camera.far = 100; 
  // /shadow
  scene.add( pointLight1 );
  const pointLight2 = new THREE.PointLight( colorLight2, 0.7, 0 );
  pointLight2.position.set( -37, 45.5 , 20 );
  pointLight2.castShadow = true; // default false
  // shadow
  pointLight2.shadow.mapSize.width = 1024; // default
  pointLight2.shadow.mapSize.height = 1024; // default
  pointLight2.shadow.camera.near = 0.5; // default
  pointLight2.shadow.camera.far = 100; 
  // shadow
  scene.add( pointLight2 );

  // const dirLight = new THREE.DirectionalLight( 0xffffff );
  // dirLight.position.set( 0.3230237595399805, 22.225286034237925, 29.531061699173936 );
  // dirLight.castShadow = true;
  // dirLight.shadow.camera.top = 2;
  // dirLight.shadow.camera.bottom = - 2;
  // dirLight.shadow.camera.left = - 2;
  // dirLight.shadow.camera.right = 2;
  // dirLight.shadow.camera.near = 0.1;
  // dirLight.shadow.camera.far = 40;
  // scene.add( dirLight );
  // /dir
  // /Light
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

// resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
// /resize
// render-animate
function animate() {
  requestAnimationFrame( animate );
  local.heroPosition = scene.children[4].position;
  local.camera.parent = scene.children[4]
  let mixerUpdateDelta = clock.getDelta();
  mixer.update( mixerUpdateDelta );
  //local.camera.updateProjectionMatrix()
  // controls.update();
  stats.update();
  render();
  move();
  intersects();

  // controls.maxAzimuthAngle =-local.hero.rotation.y%(-Math.PI/2) //- Math.PI*(local.hero.rotation.y / Math.PI);
  // controls.minAzimuthAngle =-local.hero.rotation.y%(-Math.PI/2) //- Math.PI*(local.hero.rotation.y / Math.PI);
}
function intersects(){
  var intersects = window.raycaster.intersectObjects( scene.children[3].children, true );
  if ( intersects.length > 0 ) {
    intersects.forEach(item =>{
      if(item.object.name === "ground"){
        local.hero.position.y = item.point.y
      }
    })
  }
}
function render() {
  renderer.render( scene, camera );
}
// /render-animate
// moveHero
function move(){
  window.raycaster.ray.origin = new THREE.Vector3(local.hero.position.x,local.hero.position.y+1.5,local.hero.position.z);
  var delta = clock.getDelta(); // seconds.
	var moveDistance = 13 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 120;   // pi/2 radians (90 degrees) per second
  if( moveRun === false ){
    // move forwards/backwards/left/right
    if ( moveForward === true ){
      local.hero.translateZ( moveDistance );
      // console.log('walk')
      animationMove(1, 1)
      // local.controls.target.set(local.heroPosition.x, local.heroPosition.y, local.heroPosition.z)
    }
    if ( moveBackward === true ){
      // console.log('back')
      local.hero.translateZ( -moveDistance );
      animationMove(1, -1)
    }
  }
  if( moveRun === true ){
    var moveDistanceRun2 = 52 * delta;
    // move forwards/backwards/left/right
    if ( moveForward === true ){
      local.hero.translateZ(  moveDistanceRun2 );
      // console.log('walk')
      animationMove(2, 1)
      animationMoveRun(2, 1)
      local.hero.position.set(local.heroPosition.x, local.heroPosition.y, local.heroPosition.z)
    }
    if ( moveBackward === true ){
      // console.log('back')
      local.hero.translateZ( -moveDistanceRun2 );
      animationMove(2, -1)
      animationMoveRun(2, -1)
    }
  }

	// rotate left/right/up/down
	// var rotation_matrix = new THREE.Matrix4().identity();
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
}
// /moveHero
// animationMoveHero
local.isEvent = false;
local.isEvent2 = false;
function animationMove(id, time){
  if(local.isEvent == false ){
    local.isEvent = true;
    local.actions.forEach((item)=>{
      item.stop()
    })
    local.actions[id].timeScale = time;
    local.actions[id].play()
  }
}
function animationMoveRun(id, time){
  if(local.isEvent2 == false ){
    local.isEvent2 = true;
    local.actions.forEach((item)=>{
      item.stop()
    })
    local.actions[id].timeScale = time;
    local.actions[id].play()
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
// /moveHero
// /animationMoveHero
//  w - 87 : a - 65 : s - 83 : d - 68s