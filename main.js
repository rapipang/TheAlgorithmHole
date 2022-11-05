import './style.css'



import * as THREE from 'three';

import {
  OBJLoader
} from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';



//GrannyKnot
class GrannyKnot extends THREE.Curve {

  getPoint(t, optionalTarget = new THREE.Vector3()) {

    const point = optionalTarget;
    t = 2 * Math.PI * t;
    const x = -0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t);
    const y = -0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t);
    const z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);
    return point.set(x, y, z).multiplyScalar(20);
  }
}


function lerp(v0, v1, amt, maxMove = 0, minDiff = 0.0001) {
  let diff = v1 - v0;
  if (maxMove > 0) {
    diff = Math.min(diff, maxMove);
    diff = Math.max(diff, -maxMove);
  }
  if (Math.abs(diff) < minDiff) {
    return v1;
  }
  return v0 + diff * amt;
};


var checkScrollSpeed = (function (settings) {
  settings = settings || {};

  var lastPos, newPos, timer, delta,
    delay = settings.delay || 2400; // in "ms" (higher means lower fidelity )

  function clear() {
    lastPos = null;
    delta = 0;
  }

  clear();

  return function () {
    newPos = window.scrollY;
    if (lastPos != null) { // && newPos < maxScroll /lastPos != null
      delta = newPos - lastPos;
    }
    lastPos = newPos;
    clearTimeout(timer);
    timer = setTimeout(clear, delay);
    return delta;
  };
})();


function Stage(obj) {

  window.objA = obj.children[5]; //
  window.objB = obj.children[2];
  window.objC = obj.children[3];
  window.wlcm = obj.children[7];
  window.noEscp = obj.children[4];
  window.nless = obj.children[6];
  window.answr = obj.children[0];
  window.hereTxt = obj.children[1];


  this.init();
  this.createMesh();
  window.requestAnimationFrame(this.render.bind(this));



};

Stage.prototype.init = function () {
  this.start = Date.now();
  this.scene = new THREE.Scene();
  this.fxPlayed = false;
  this.modalBox = document.querySelector("#rotatePop");
  this.modalLoad = document.querySelector("#loadContent");

  let isAsk = false;
  this.pointer = new THREE.Vector2();
  this.boost = 0;
  this.EaseVal = 0;
  this.particleACount = 700;


  this.INTERSECTED;
  this.clock = new THREE.Clock();
  this.raycaster = new THREE.Raycaster();

  this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 300);


  this.renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg")
  });

  this.isLandscape = false;
  this.jumpVal = 1;
  this.isNear = false;
  this.rampUpFX = new Audio('/media/rampUp_Sfx.mp3');
  this.rampUpFX.loop = false;
  this.rampUpFX.volume = 0.6;


  this.ambient = new THREE.HemisphereLight(0x53EEEE, 0x111142, 0.5);
  this.scene.add(this.ambient);
  this.ambient.intensity = 0.08;


  this.scene.fog = new THREE.Fog(0x0b1b2d, 1, 20);

  this.renderer.toneMapping = THREE.ReinhardToneMapping;
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.toneMappingExposure = 0.8; 



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

}

Stage.prototype.addParticle = function () {
  this.particles = [];

  for (var i = 0; i < this.particleACount; i++) {
    this.particles.push(new Particle(this.scene, this));
  }
};

Stage.prototype.createMesh = function () {
  this.testGeo = new THREE.TorusGeometry(1, 0.2, 8, 50);

  //Wall
  this.curve = new GrannyKnot();
  this.geometry0 = new THREE.TubeBufferGeometry(this.curve, 80, 2.5, 14, true);
  this.material0 = new THREE.MeshStandardMaterial({
    color: "rgb(44, 51, 152)",
    fog: true,

    side: THREE.BackSide
  });
  this.tubeWall = new THREE.Mesh(this.geometry0, this.material0);
  this.scene.add(this.tubeWall);


  //WireFrame
  this.geometry1 = new THREE.TubeBufferGeometry(this.curve, 120, 2, 16, true);
  this.material1 = new THREE.MeshBasicMaterial({
    wireframe: true,
    fog: true,
    color: 0x3b96f7,
    side: THREE.DoubleSide
  });
  this.tubeWire = new THREE.Mesh(this.geometry1, this.material1);
  this.scene.add(this.tubeWire);

  //VideoPlane
  this.video = document.getElementById('video');
  this.vidGeo = new THREE.RingGeometry(0.1, 4, 8);
  this.video.pause();
  this.whtMat = new THREE.MeshBasicMaterial({
    color: 0x5CA9FF
  });
  this.vidMesh = new THREE.Mesh(this.vidGeo, this.whtMat);
  this.scene.add(this.vidMesh);
  this.vidMesh.layers.enable(2);

  //RedMat
  this.redMat = new THREE.MeshBasicMaterial({
    color: 0xff6666
  });

  //PrplMat
  this.prplMat = new THREE.MeshBasicMaterial({
    color: 0x9257ff
  });

  //PBlkMat
  this.blckMat = new THREE.MeshBasicMaterial({
    color: 0x1e0b41
  });


  //WelcomeTxt
  this.wlcmTextGeo = wlcm.geometry;
  this.wlcmTextGeo.scale(1.5, 1.5, 1.5);

  //NoEscape
  this.noXcpGeo = noEscp.geometry;
  this.noXcpGeo.scale(2, 2, 2);

  //Unless
  this.unlessGeo = nless.geometry;
  this.unlessGeo.scale(2, 2, 2);

  //answr
  this.answrGeo = answr.geometry;
  this.answrGeo.scale(2, 2, 2);

  //hereTxt
  this.hereGeo = hereTxt.geometry;
  this.hereGeo.scale(3, 3, 3);


  this.wlcmTextMesh = new THREE.Mesh(this.wlcmTextGeo, this.prplMat);
  this.noXcpMesh = new THREE.Mesh(this.noXcpGeo, this.redMat);
  this.unlessMesh = new THREE.Mesh(this.unlessGeo, this.redMat);
  this.answrMesh = new THREE.Mesh(this.answrGeo, this.redMat);
  this.hereMesh = new THREE.Mesh(this.hereGeo, this.blckMat);

  this.scene.add(this.wlcmTextMesh);
  this.scene.add(this.noXcpMesh);
  this.scene.add(this.unlessMesh);
  this.scene.add(this.answrMesh);
  this.scene.add(this.hereMesh);

};

Stage.prototype.handleEvents = function () {
  window.addEventListener('resize', this.onWindowResize.bind(this));
  window.addEventListener('scroll', this.onScroll.bind(this));

};

Stage.prototype.onWindowResize = function () {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.composer.setSize(window.innerWidth, window.innerHeight);

};



Stage.prototype.onScroll = function () {
  this.scrSpeed = checkScrollSpeed();
  this.EaseVal = lerp(0, this.scrSpeed * 10, 0.0001, 0, 0.00000001);
  this.boost += 1 * this.EaseVal;

};

Stage.prototype.raycastUpdate = function () {
  this.dist = this.camera.position.distanceTo(this.vidMesh.position);
  this.raycaster.setFromCamera(this.pointer, this.camera);
  this.raycaster.layers.set(2);
  this.intersects = this.raycaster.intersectObjects(this.scene.children, true);



  if (this.isNear && video.currentTime < 5) {
    this.jumpVal += 0.05;
    this.ambient.intensity += 0.025;
    this.isAsk = false;
  }

  if (this.intersects.length > 0 && this.dist <= 6) {


    if (!this.fxPlayed) {
      this.isNear = true;
      this.rampUpFX.play();

      this.fxPlayed = true;
    }

    setTimeout(function () {
      this.video.play();;
    }, 3000);



  } else {

    if (this.INTERSECTED);

    this.INTERSECTED = null;



  }
}
Stage.prototype.updateCamera = function () {


  this.looptime = 100;
  if (window.innerHeight < 900 && window.innerWidth < 500) {
    this.camOffset = this.looptime + 53;
  } else {
    this.camOffset = this.looptime + 53.5;
  }



  this.power = Math.pow(this.jumpVal, 2);


  this.prog = this.clock.getElapsedTime();
  this.time = this.prog + this.power + this.boost + this.camOffset;

  this.t = (this.time % this.looptime) / this.looptime;
  this.t2 = ((this.time + 0.2) % this.looptime) / this.looptime;


  this.pos = this.tubeWire.geometry.parameters.path.getPointAt(this.t);
  this.pos2 = this.tubeWire.geometry.parameters.path.getPointAt(this.t2);


  this.camera.position.copy(this.pos);
  this.camera.lookAt(this.pos2);

  this.t3 = ((this.prog + 74) % this.looptime) / this.looptime;
  this.pos3 = this.tubeWire.geometry.parameters.path.getPointAt(this.t3);
  this.vidMesh.position.copy(this.pos3);
  this.vidMesh.rotation.copy(this.camera.rotation);

  this.t4 = ((this.prog + 55) % this.looptime) / this.looptime;
  this.pos4 = this.tubeWire.geometry.parameters.path.getPointAt(this.t4);
  this.wlcmTextMesh.position.copy(this.pos4);
  this.wlcmTextMesh.rotation.copy(this.camera.rotation);



  this.t5 = ((this.prog + 61) % this.looptime) / this.looptime;
  this.pos5 = this.tubeWire.geometry.parameters.path.getPointAt(this.t5);
  this.noXcpMesh.position.copy(this.pos5);
  this.noXcpMesh.rotation.copy(this.camera.rotation);

  this.t6 = ((this.prog + 66) % this.looptime) / this.looptime;
  this.pos6 = this.tubeWire.geometry.parameters.path.getPointAt(this.t6);
  this.unlessMesh.position.copy(this.pos6);
  this.unlessMesh.rotation.copy(this.camera.rotation);

  this.t7 = ((this.prog + 70) % this.looptime) / this.looptime;
  this.pos7 = this.tubeWire.geometry.parameters.path.getPointAt(this.t7);
  this.answrMesh.position.copy(this.pos7);
  this.answrMesh.rotation.copy(this.camera.rotation);

  this.t8 = ((this.prog + 73.2) % this.looptime) / this.looptime;
  this.pos8 = this.tubeWire.geometry.parameters.path.getPointAt(this.t8);
  this.hereMesh.position.copy(this.pos8);
  this.hereMesh.rotation.copy(this.camera.rotation);


  if (this.ambient.intensity > 1.8) {
    this.video.style.opacity = '1';

  }
}

Stage.prototype.updateWin = function () {
  if (this.video.currentTime >= 57 && !this.isAsk) {
    this.rampUpFX.volume = 0;
    this.isAsk = true;

    this.video.pause();
    if (confirm("Are You Sure Want To Log Out?")) {
      if (confirm("Are You Sure?")) {
        const millis = Date.now() - this.start;
        alert('Wow! You have spend ' + Math.floor(millis / 1000) + ' seconds in this page!');
        window.location.href = "./pageEnd/index2.html";
      } else {
        this.video.play();
      }

    } else {
      this.video.play();
    }
  }

  if (this.rampUpFX.currentTime < 0.0) {
    this.fxPlayed = true;
  }
}

Stage.prototype.jumpBlink = function () {


}

Stage.prototype.render = function () {

  this.vh = window.innerHeight;
  this.vw = window.innerWidth;

  if (this.vh > this.vw) {
    this.modalBox.style.opacity = '1';
  } else {
    this.modalBox.style.opacity = '0';
  }



  if (this.video.readyState === 4) {
    this.modalLoad.style.opacity = "0"
    if (this.video.currentTime < 15) {
      this.updateCamera();
      this.raycastUpdate();
    }

    this.handleEvents();
    this.updateWin();
    ///Particles Update
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this);
    }


    this.renderer.render(this.scene, this.camera);
    // this.renderer.clear();
    this.composer.render();
  } else {
    this.modalLoad.style.opacity = "1"
  }

  window.requestAnimationFrame(this.render.bind(this));
};

function Particle(scene) {
  this.pRRandom = Math.random();
  this.typeA = objA.geometry;
  this.typeB = objB.geometry;
  this.typeC = objC.geometry;
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
      color: 0xa150f2,
      shininess: 21,
      emissive: 0xa22a5e,
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
      emissive: 0x5618b4,
      specular: 0xffbb00,
      depthWrite: true,
      fog: true,
      transparent: true,
      opacity: 0.9,
    });
  }



  this.addOfset = this.pRRandom * 1000;
  this.pMesh = new THREE.Mesh(this.pGeo, this.pMat);
  this.offset = new THREE.Vector3((Math.random() - 0.5) * 2 * (Math.random() + 0.5), (Math.random() - 0.5) * 3 * Math.random(), (Math.random() - 0.5) * 2);
  this.rotate = new THREE.Vector3(-Math.random() * 0.01 + 0.01, Math.random() * 0.005, Math.random() * 0.01);
  this.pMesh.position.set(0, 0, 0);
  this.pMesh.rotation.set(this.addOfset / 10, this.addOfset / 10, this.addOfset / 10);
  scene.add(this.pMesh);

}

Particle.prototype.update = function (stage) {
  this.spdOfset = this.pRRandom + 0.5;
  this.tVal += 0.01;
  this.sin = Math.sin(this.tVal + this.addOfset);

  this.movemnt = new THREE.Vector3(this.sin * 0.2, this.sin * -0.2, this.sin * this.spdOfset / 10);

  this.time = stage.clock.getElapsedTime() * this.spdOfset;
  this.looptime = 150 + this.pRRandom * 70;

  this.t = ((this.time + this.addOfset) % this.looptime) / this.looptime;

  this.pos = stage.tubeWire.geometry.parameters.path.getPointAt(this.t);

  this.pMesh.position.x = this.pos.x + this.offset.x + this.movemnt.x;
  this.pMesh.position.y = this.pos.y + this.offset.y + this.movemnt.y;
  this.pMesh.position.z = this.pos.z + this.offset.z + this.movemnt.z;

  this.pMesh.rotation.x += this.rotate.x;
  this.pMesh.rotation.y += this.rotate.y;
  this.pMesh.rotation.z += this.rotate.z;

}


function init() {
  window.scrollTo(0, 0);
  var loader = new OBJLoader();
  loader.load("/media/graphs.obj",

    function (twitr) {
      window.stage = new Stage(twitr);
    });

}
window.onload = init;
