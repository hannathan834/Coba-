import * as THREE from "three";

// ==========================
// SETUP
// ==========================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

scene.fog = new THREE.Fog(
  0x87ceeb,
  30,
  180
);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

camera.position.set(0, 5, 9);
camera.lookAt(0, 2, -20);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
  renderer.domElement
);


// ==========================
// LIGHT
// ==========================

const sunlight = new THREE.DirectionalLight(
  0xffffff,
  2
);

sunlight.position.set(
  20,
  30,
  10
);

sunlight.castShadow = true;

scene.add(sunlight);

const ambient = new THREE.HemisphereLight(
  0xffffff,
  0x557755,
  1.5
);

scene.add(ambient);


// ==========================
// GROUND
// ==========================

const groundGeometry =
  new THREE.BoxGeometry(
    100,
    0.2,
    300
  );

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x4b8f3a
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.position.y = -0.2;
ground.position.z = -100;

ground.receiveShadow = true;

scene.add(ground);


// ==========================
// ROAD
// ==========================

const roadGeometry =
  new THREE.BoxGeometry(
    12,
    0.25,
    300
  );

const roadMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x333333
  });

const road =
  new THREE.Mesh(
    roadGeometry,
    roadMaterial
  );

road.position.y = 0;
road.position.z = -100;

road.receiveShadow = true;

scene.add(road);


// ==========================
// ROAD LINES
// ==========================

const roadLines = [];

for (let z = 5; z > -280; z -= 8) {

  const geometry =
    new THREE.BoxGeometry(
      0.15,
      0.03,
      4
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffffff
    });

  const line =
    new THREE.Mesh(
      geometry,
      material
    );

  line.position.set(
    0,
    0.15,
    z
  );

  scene.add(line);

  roadLines.push(line);
}


// ==========================
// PLAYER
// ==========================

const player =
  new THREE.Group();

scene.add(player);

player.position.set(
  0,
  1.2,
  3
);


// BODY

const body =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.9,
      1.2,
      0.55
    ),
    new THREE.MeshStandardMaterial({
      color: 0x1565c0
    })
  );

body.position.y = 0.4;

body.castShadow = true;

player.add(body);


// HEAD

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.35,
      20,
      20
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffc59a
    })
  );

head.position.y = 1.25;

head.castShadow = true;

player.add(head);


// LEGS

const legMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x222222
  });

const leg1 =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.25,
      0.8,
      0.3
    ),
    legMaterial
  );

const leg2 =
  leg1.clone();

leg1.position.set(
  -0.25,
  -0.55,
  0
);

leg2.position.set(
  0.25,
  -0.55,
  0
);

player.add(leg1);
player.add(leg2);


// ==========================
// LANES
// ==========================

const lanes = [
  -3.5,
  0,
  3.5
];

let currentLane = 1;


// ==========================
// OBSTACLES
// ==========================

const obstacles = [];

function createObstacle() {

  const obstacle =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.4,
        1.5,
        1.4
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd32f2f
      })
    );

  const lane =
    Math.floor(
      Math.random() * 3
    );

  obstacle.position.set(
    lanes[lane],
    0.75,
    -80
  );

  obstacle.castShadow = true;

  scene.add(obstacle);

  obstacles.push(obstacle);
}


// ==========================
// COINS
// ==========================

const coins = [];

function createCoin() {

  const coin =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.35,
        0.1,
        12,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffd600,
        metalness: 0.8,
        roughness: 0.25
      })
    );

  const lane =
    Math.floor(
      Math.random() * 3
    );

  coin.position.set(
    lanes[lane],
    1.5,
    -80
  );

  coin.rotation.x =
    Math.PI / 2;

  scene.add(coin);

  coins.push(coin);
}


// ==========================
// TREES
// ==========================

const trees = [];

function createTree(x, z) {

  const tree =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.25,
        0.3,
        2
      ),
      new THREE.MeshStandardMaterial({
        color: 0x795548
      })
    );

  trunk.position.y = 1;

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.2,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0x2e7d32
      })
    );

  leaves.position.y = 2.3;

  tree.add(trunk);
  tree.add(leaves);

  tree.position.set(
    x,
    0,
    z
  );

  scene.add(tree);

  trees.push(tree);
}


for (let z = 0; z > -250; z -= 15) {

  createTree(-9, z);
  createTree(9, z - 7);

}


// ==========================
// GAME VARIABLES
// ==========================

let speed = 0.35;
let score = 0;
let coinScore = 0;

let jumping = false;
let jumpVelocity = 0;

let gameRunning = true;

let spawnTimer = 0;
let coinTimer = 0;


// ==========================
// JUMP
// ==========================

function jump() {

  if (!gameRunning) return;

  if (!jumping) {

    jumping = true;

    jumpVelocity = 0.28;
  }
}


// ==========================
// MOVE
// ==========================

function moveLeft() {

  if (currentLane > 0) {

    currentLane--;

  }
}


function moveRight() {

  if (currentLane < 2) {

    currentLane++;

  }
}


// ==========================
// KEYBOARD
// ==========================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "ArrowLeft" ||
      event.key === "a"
    ) {
      moveLeft();
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "d"
    ) {
      moveRight();
    }

    if (
      event.key === "ArrowUp" ||
      event.key === " "
    ) {
      jump();
    }

  }
);


// ==========================
// MOBILE BUTTONS
// ==========================

document
  .getElementById("left")
  .addEventListener(
    "click",
    moveLeft
  );

document
  .getElementById("right")
  .addEventListener(
    "click",
    moveRight
  );

document
  .getElementById("jump")
  .addEventListener(
    "click",
    jump
  );


// ==========================
// COLLISION
// ==========================

function collision(a, b) {

  const boxA =
    new THREE.Box3()
      .setFromObject(a);

  const boxB =
    new THREE.Box3()
      .setFromObject(b);

  return boxA.intersectsBox(boxB);
}


// ==========================
// GAME OVER
// ==========================

function endGame() {

  gameRunning = false;

  document.getElementById(
    "finalScore"
  ).textContent = score;

  document.getElementById(
    "gameover"
  ).style.display = "flex";
}


// ==========================
// RESTART
// ==========================

window.restartGame =
function() {

  location.reload();

};


// ==========================
// ANIMATION
// ==========================

function animate() {

  requestAnimationFrame(
    animate
  );

  if (gameRunning) {

    // SCORE

    score += 0.01;

    document.getElementById(
      "score"
    ).textContent =
      Math.floor(score);


    // SPEED

    speed =
      0.35 +
      Math.floor(score / 100) * 0.04;


    // PLAYER LANE

    const targetX =
      lanes[currentLane];

    player.position.x +=
      (targetX -
       player.position.x) *
      0.15;


    // JUMP

    if (jumping) {

      player.position.y +=
        jumpVelocity;

      jumpVelocity -= 0.018;

      if (
        player.position.y <= 1.2
      ) {

        player.position.y = 1.2;

        jumping = false;

      }

    }


    // RUNNING ANIMATION

    const run =
      Math.sin(
        Date.now() * 0.015
      ) * 0.25;

    leg1.rotation.x = run;
    leg2.rotation.x = -run;


    // ROAD MOVEMENT

    roadLines.forEach(
      line => {

        line.position.z +=
          speed * 2;

        if (
          line.position.z > 10
        ) {

          line.position.z -=
            288;

        }

      }
    );


    // OBSTACLE SPAWN

    spawnTimer++;

    if (spawnTimer > 90) {

      createObstacle();

      spawnTimer = 0;

    }


    // COIN SPAWN

    coinTimer++;

    if (coinTimer > 55) {

      createCoin();

      coinTimer = 0;

    }


    // OBSTACLES

    for (
      let i = obstacles.length - 1;
      i >= 0;
      i--
    ) {

      const obstacle =
        obstacles[i];

      obstacle.position.z +=
        speed * 2;

      obstacle.rotation.y +=
        0.01;


      if (
        collision(
          player,
          obstacle
        ) &&
        player.position.y < 1.9
      ) {

        endGame();

      }


      if (
        obstacle.position.z > 15
      ) {

        scene.remove(obstacle);

        obstacles.splice(i, 1);

      }

    }


    // COINS

    for (
      let i = coins.length - 1;
      i >= 0;
      i--
    ) {

      const coin =
        coins[i];

      coin.position.z +=
        speed * 2;

      coin.rotation.z +=
        0.08;


      if (
        collision(
          player,
          coin
        )
      ) {

        coinScore++;

        score += 10;

        scene.remove(coin);

        coins.splice(i, 1);

      }


      if (
        coin.position.z > 15
      ) {

        scene.remove(coin);

        coins.splice(i, 1);

      }

    }


    // TREES

    trees.forEach(
      tree => {

        tree.position.z +=
          speed * 2;

        if (
          tree.position.z > 15
        ) {

          tree.position.z -=
            250;

        }

      }
    );

  }


  renderer.render(
    scene,
    camera
  );

}

animate();


// ==========================
// RESIZE
// ==========================

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);
