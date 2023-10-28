import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

//VARIABLES
const pointsUI = document.querySelector("#points");
let points = 0;

const randomRangeNum = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const moveObstacles = (arr, speed, maxX, minX, maxZ, minZ) => {
  //look into forEach
  /*
  arr.forEach((el) => {
    el.body.position.z += speed;
    if (el.body.position.z > camera.position.z) {
      el.body.position.x = randomRangeNum(maxX, minX);
      el.body.position.z = randomRangeNum(maxZ, minZ);
    }
    el.mesh.position.copy(el.body.position);
    el.mesh.quaternion.copy(el.body.quaternion);
  });
  */
};

//SCENE SET UP
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});
const cannonDebugger = new CannonDebugger(scene, world, {
  color: "#AEE2FF",
  scale: 1,
});

//CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4.5;
camera.position.y = 1.5;

//RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//GROUND

//dimensions in cannon is half the size of the 3js dimensions
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(15, 0.5, 15)),
});
groundBody.position.y = -1;
world.addBody(groundBody); //physics body vs visual?

const ground = new THREE.Mesh(
  new THREE.BoxGeometry(30, 1, 30), //dims (width, height depth)
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }) //mats
);
ground.position.y = -1;
scene.add(ground);

//PLAYER
const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25)),
  fixedRotation: true,
});
world.addBody(playerBody);

const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5), //dims (width, height depth)
  new THREE.MeshBasicMaterial({ color: 0xff0000 }) //mats
);
ground.position.y = -1;
scene.add(player);

let canJump = false;

playerBody.addEventListener("collide", (e) => {
  powerups.forEach((el) => {
    if (e.body === el.body) {
      el.body.position.x = randomRangeNum(8, -8);
      el.body.position.z = randomRangeNum(-5, -10);
      el.mesh.position.copy(el.body.position);
      el.mesh.quaternion.copy(el.body.quaternion);
      points += 1;
      pointsUI.textContent = points.toString();
      console.log("yes");
    }
  });
  if (e.body === groundBody) {
    canJump = true;
  }
});

//POWER UP
const powerups = [];

for (let i = 0; i < 10; i++) {
  const posX = randomRangeNum(8, -8);
  const posZ = randomRangeNum(-5, -10);

  const powerup = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 15, 50),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  powerup.scale.set(0.1, 0.1, 0.1);
  powerup.position.x = posX;
  powerup.position.z = posZ;
  powerup.name = "powerup" + [i + 1]; //look into this
  scene.add(powerup);

  const powerupBody = new CANNON.Body({
    shape: new CANNON.Sphere(0.2),
  });
  powerupBody.position.set(posX, 0, posZ);
  world.addBody(powerupBody);

  const powerUpObject = {
    mesh: powerup,
    body: powerupBody,
  };

  powerups.push(powerUpObject);
}

function animate() {
  requestAnimationFrame(animate);

  moveObstacles(powerups, 0.1, 8, -8, -5, -10);

  world.fixedStep();

  player.position.copy(playerBody.position);

  cannonDebugger.update();

  renderer.render(scene, camera);
}

animate();

//EVENT LISTENERS

//Resize screen size
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const userInput = new THREE.Vector3();

window.addEventListener("keydown", (e) => {
  if (e.key === "d" || e.key === "ArrowRight") {
    playerBody.velocity.set(20, 0, 0);
  }

  if (e.key === "a" || e.key === "ArrowLeft") {
    playerBody.velocity.set(-20, 0, 0);
  }

  if (e.key === "r") {
    playerBody.position.x = 0;
    playerBody.position.y = 0;
    playerBody.position.z = 0;
  }

  if (e.key === " " && canJump) {
    playerBody.velocity.set(playerBody.velocity.x, 10, 0);
    canJump = false;
  }

  console.log(userInput);
});
