import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

//VARIABLES
const pointsUI = document.querySelector("#points");
let points = 0;

//SCENE SET UP
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -30, 0),
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
camera.position.z = 7;
camera.position.y = 1.5;

//RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//LIGHT
const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // soft white light
directionalLight.position.z = 5;
directionalLight.position.y = 10;
scene.add(directionalLight);

const light = new THREE.AmbientLight(0x404040, 1); // soft white light
scene.add(light);

//GROUND
const platformLength = 10;
const platformWidth = 2;
const platformHeight = 0.5;

const platformTransforms = [
  {
    scale: platformLength / 4,
    position: new THREE.Vector3(5, 0.75, 0),
  },

  {
    scale: platformLength / 4,
    position: new THREE.Vector3(-5, 0.75, 0),
  },

  {
    scale: platformLength,
    position: new THREE.Vector3(0, -1, 0),
  },
];

const platforms = [];

for (let i = 0; i < platformTransforms.length; i++) {
  const groundBody = new CANNON.Body({
    shape: new CANNON.Box(
      new CANNON.Vec3(
        platformTransforms[i].scale / 2,
        platformHeight / 2,
        platformWidth / 2
      )
    ),
  });
  groundBody.position.y = platformTransforms[i].position.y;
  groundBody.position.x = platformTransforms[i].position.x;

  console.log(platformTransforms[i].position.y);
  world.addBody(groundBody); //physics body vs visual?

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(
      platformTransforms[i].scale,
      platformHeight,
      platformWidth
    ), //dims (width, height depth)
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }) //mats
  );

  ground.position.copy(groundBody.position);
  scene.add(ground);
  /*
  const body = new CANNON.Body({
    shape: new CANNON.Box(
      new CANNON.Vec3(
        platformTransforms[i].scale / 2,
        platformHeight / 2,
        platformWidth / 2
      )
    ),
  });

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(
      platformTransforms[i].scale,
      platformHeight,
      platformWidth
    ), //dims (width, height depth)
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }) //mats
  );

  ground.position.x = platformTransforms[i].position.x;
  ground.position.y = platformTransforms[i].position.y;
  body.position.copy(ground);

  world.addBody(body); //physics body vs visual?
  scene.add(ground);
*/
  const groundObject = {
    mesh: ground,
    body: groundBody,
  };

  platforms.push(groundObject);
}

console.log(platforms);

//PLAYER
const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25)),
  fixedRotation: true,
});
world.addBody(playerBody);

const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5), //dims (width, height depth)
  new THREE.MeshStandardMaterial({ color: 0xff0000 }) //mats
);
scene.add(player);

playerBody.addEventListener("collide", (e) => {
  /*
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
  });*/

  platforms.forEach((el) => {
    if (e.body === el.body) {
      canJump = true;
    }
  });
});

//controller
const controls = {
  d: { pressed: false },
  a: { pressed: false },
  " ": { pressed: false },
};

let canJump = false;
const playerMovement = () => {
  if (controls[" "].pressed && canJump) {
    playerBody.velocity.y = 12;
    canJump = false;
  }

  if (controls["a"].pressed) {
    playerBody.position.x -= 0.07;
  }

  if (controls["d"].pressed) {
    playerBody.position.x += 0.07;
  }
};

function animate() {
  requestAnimationFrame(animate);

  playerMovement();

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

window.addEventListener("keydown", (e) => {
  try {
    controls[e.key].pressed = true;
  } catch (err) {
    console.log("invalid key pressed");
  }
});

window.addEventListener("keyup", (e) => {
  try {
    controls[e.key].pressed = false;
  } catch (err) {
    console.log("invalid key pressed");
  }
});
