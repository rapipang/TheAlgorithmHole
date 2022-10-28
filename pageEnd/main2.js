import '../style.css'

import * as THREE from 'three';

import {
  OBJLoader
} from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function init() {
  var loader = new OBJLoader();
  loader.load("/media/graphs.obj",

    function (twitr) {
      window.stage = new Stage(twitr);
    });
}

window.onload = init;

//GrannyKnot
class GrannyKnot extends THREE.Curve {

  getPoint(t, optionalTarget = new THREE.Vector3()) {

    const point = optionalTarget;
    t = 2 * Math.PI * t;
    const x = -0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t);
    const y = -0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t);
    const z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);
    return point.set(x, y, z).multiplyScalar(10);
  }
}



function Stage(obj) {

  window.objA = obj.children[0];
  window.objB = obj.children[1];
  window.objC = obj.children[3];

  this.init();
  this.createMesh();

  this.handleEvents();
  window.requestAnimationFrame(this.render.bind(this));
}

Stage.prototype.init = function () {


  this.particleACount = 900;


  this.pointer = new THREE.Vector2();
  this.isPLay = false;

  this.clock = new THREE.Clock();
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
  this.camera.position.setZ(9.83);
  this.camera.position.setY(1.73);
  this.camera.position.setX(0.1);


  this.renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg")
  });

  const raycaster = new THREE.Raycaster();

  // Grid Helper
  // this.gridHelper = new THREE.GridHelper(100, 50);
  // this.scene.add(this.gridHelper);


  // /OrbitalControl
  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.025;
  this.controls.maxDistance = 17;
  this.controls.update();
  this.controls.minDistance = 10;
  this.controls.maxDistance = 10;
  this.controls.minPolarAngle = 1.3962634016;
  this.controls.maxPolarAngle = 1.3962634016;
  // this.controls.autoRotate = true;
  // this.controls.autoRotateSpeed  = 0.8;

  const ambient = new THREE.HemisphereLight(0x53EEEE, 0x111142, 0.5);
  this.scene.add(ambient);
  ambient.intensity = 0.15;
  this.scene.fog = new THREE.Fog(0x071E33, 3, 21);

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setPixelRatio(window.devicePixelRatio);

  //RenderPass
  this.renderScene = new RenderPass(this.scene, this.camera);


  //PostProcessing Bloom
  this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 0, 0);
  this.bloomPass.threshold = 0.002;
  this.bloomPass.strength = 1.4;
  this.bloomPass.radius = 0.4;

  this.composer = new EffectComposer(this.renderer);
  this.composer.addPass(this.renderScene);
  this.composer.addPass(this.bloomPass);


  this.addParticle();
};

Stage.prototype.addParticle = function () {
  this.particles = [];
  this.particlesContainer = new THREE.Object3D();
  for (var i = 0; i < this.particleACount; i++) {
    this.particles.push(new Particle(this.scene, this));
  }
};

Stage.prototype.createMesh = function () {
  //Curves
  this.curve = new GrannyKnot();

  //ParticleA Path
  this.geometry1 = new THREE.TubeBufferGeometry(this.curve, 120, 2, 16, true);
  this.aPath = new THREE.Mesh(this.geometry1, null);
};

Stage.prototype.handleEvents = function () {
  window.addEventListener('resize', this.onResize.bind(this), false);

};

Stage.prototype.onResize = function () {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setPixelRatio(window.devicePixelRatio);
};

Stage.prototype.render = function () {


  this.controls.update();

  ///Particles Update
  for (var i = 0; i < this.particles.length; i++) {
    this.particles[i].update(this);
  }


  // raycastUpdate();
  this.renderer.render(this.scene, this.camera);
  this.renderer.clear();
  this.composer.render();

  window.requestAnimationFrame(this.render.bind(this));
};

function Particle(scene) {

  this.pRRandom = Math.random();
  // this.typeA = new THREE.IcosahedronGeometry(0.15 * (this.pRRandom + 0.3), 0);
  this.typeA = objA.geometry;
  this.typeB = objB.geometry;
  this.typeC = objC.geometry;
  this.diamon = new THREE.OctahedronGeometry(0.15 * (this.pRRandom + 0.3), 0);
  this.tVal = 0;

  //Randomize Geo
  if (this.pRRandom < 0.6 && this.pRRandom >= 0.4) {
    this.pGeo = this.typeA;
    this.pMat = new THREE.MeshBasicMaterial({
      color: 0x0071FF,
      fog: true,
      transparent: true,
      opacity: 1,
    });
  } else if (this.pRRandom <= 0.39) {
    this.pGeo = this.typeB;
    this.pMat = new THREE.MeshPhongMaterial({
      color: 0x004166,
      shininess: 21,
      emissive: 0x3e034f,
      specular: 0xf40101,
      depthWrite: true,
      fog: true,
      transparent: true,
      opacity: 0.8,
    });
  } else if (this.pRRandom >= 0.61) {
    this.pGeo = this.typeC;
    this.pMat = new THREE.MeshPhongMaterial({
      color: 0x004770,
      shininess: 31,
      emissive: 0xa80073,
      specular: 0xffbb00,
      depthWrite: true,
      fog: true,
      transparent: true,
      opacity: 0.9,
    });
  }




  this.pMesh = new THREE.Mesh(this.pGeo, this.pMat);
  this.pMesh.position.set(0, 0, 0);
  this.offset = new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  this.rotate = new THREE.Vector3(-Math.random() * 0.01 + 0.01, Math.random() * 0.005, Math.random() * 0.01);
  scene.add(this.pMesh);

}

Particle.prototype.update = function (stage) {


  this.spdOfset = this.pRRandom + 0.5;
  this.addOfset = this.pRRandom * 1000;
  this.tVal += 0.01;
  this.sin = Math.sin(this.tVal + this.addOfset);

  this.movemnt = new THREE.Vector3(this.sin * 0.2, this.sin * -0.2, this.sin * this.spdOfset / 10);
  // - boost/2 vvv
  this.time = stage.clock.getElapsedTime() * this.spdOfset;
  this.looptime = 150 + this.pRRandom * 70;

  this.t = ((this.time + this.addOfset) % this.looptime) / this.looptime;


  this.pos = stage.aPath.geometry.parameters.path.getPointAt(this.t);

  this.pMesh.position.x = this.pos.x + this.offset.x + this.movemnt.x;
  this.pMesh.position.y = this.pos.y + this.offset.y + this.movemnt.y;
  this.pMesh.position.z = this.pos.z + this.offset.z + this.movemnt.z;

  this.pMesh.rotation.x += this.rotate.x;
  this.pMesh.rotation.y += this.rotate.y;
  this.pMesh.rotation.z += this.rotate.z;

}