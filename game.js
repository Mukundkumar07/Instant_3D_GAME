import * as THREE from "three";

const HALF = 22;
const WALL_HALF = 25;
const PLAYER_R = 0.45;
const ENEMY_R = 0.55;
const MOVE_SPEED = 14;
const TURN_SPEED = 2.4;
const PROJ_SPEED = 95;
const PROJ_RADIUS = 0.22;
const MAX_HP = 100;
const ENEMY_MOVE_SPEED = 9;
const ENEMY_SHOOT_COOLDOWN = 0.85;
const ENEMY_SHOOT_RANGE = 38;

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const endScreen = document.getElementById("end-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const crosshair = document.getElementById("crosshair");
const playerHpEl = document.getElementById("player-hp");
const enemyHpEl = document.getElementById("enemy-hp");
const endTitle = document.getElementById("end-title");
const endMsg = document.getElementById("end-msg");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e14);
scene.fog = new THREE.Fog(0x0c0e14, 35, 95);

const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const hemi = new THREE.HemisphereLight(0x8aa4ff, 0x1a1a24, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2e0, 1.1);
sun.position.set(18, 40, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 120;
sun.shadow.camera.left = -45;
sun.shadow.camera.right = 45;
sun.shadow.camera.top = 45;
sun.shadow.camera.bottom = -45;
scene.add(sun);

function makeArena() {
  const group = new THREE.Group();

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1e2434,
    roughness: 0.85,
    metalness: 0.08,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(WALL_HALF * 2, WALL_HALF * 2),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const grid = new THREE.GridHelper(WALL_HALF * 2, 28, 0x3a4a6a, 0x252b3a);
  grid.position.y = 0.02;
  group.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2a3348,
    roughness: 0.7,
    metalness: 0.15,
  });
  const wallH = 10;
  const t = 1.2;

  const wallZ = new THREE.BoxGeometry(WALL_HALF * 2 + t * 2, wallH, t);
  const north = new THREE.Mesh(wallZ, wallMat);
  north.position.set(0, wallH / 2, -WALL_HALF);
  north.castShadow = true;
  north.receiveShadow = true;
  const south = north.clone();
  south.position.z = WALL_HALF;
  group.add(north, south);

  const wallX = new THREE.BoxGeometry(t, wallH, WALL_HALF * 2);
  const west = new THREE.Mesh(wallX, wallMat);
  west.position.set(-WALL_HALF, wallH / 2, 0);
  west.castShadow = true;
  west.receiveShadow = true;
  const east = west.clone();
  east.position.x = WALL_HALF;
  group.add(west, east);

  return group;
}

scene.add(makeArena());

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

let playerHp = MAX_HP;
let enemyHp = MAX_HP;
let enemyShootTimer = 0;
let gameActive = false;
let spaceConsumed = false;

const playerPos = new THREE.Vector3(0, 0, 10);
let yaw = Math.PI;

const enemy = {
  mesh: null,
  pos: new THREE.Vector3(0, 0, -12),
  yaw: 0,
};

function createEnemyMesh() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(ENEMY_R, 1.1, 6, 12),
    new THREE.MeshStandardMaterial({
      color: 0xd94a4a,
      roughness: 0.45,
      metalness: 0.25,
    })
  );
  body.position.y = 1.1;
  body.castShadow = true;
  g.add(body);
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(ENEMY_R * 1.4, 0.22, 0.35),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      emissive: 0xff4422,
      emissiveIntensity: 0.35,
    })
  );
  visor.position.set(0, 1.45, ENEMY_R * 0.85);
  g.add(visor);
  return g;
}

enemy.mesh = createEnemyMesh();
enemy.mesh.position.copy(enemy.pos);
scene.add(enemy.mesh);

const projectiles = [];

function spawnProjectile(origin, dir, owner) {
  const geo = new THREE.SphereGeometry(PROJ_RADIUS, 10, 10);
  const mat = new THREE.MeshStandardMaterial({
    color: owner === "player" ? 0x44ffcc : 0xff6644,
    emissive: owner === "player" ? 0x22aa88 : 0xaa3311,
    emissiveIntensity: 0.6,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(origin);
  mesh.castShadow = true;
  scene.add(mesh);
  const v = dir.clone().normalize().multiplyScalar(PROJ_SPEED);
  projectiles.push({ mesh, v, owner });
}

function clampToArena(x, z, r) {
  const lim = HALF - r;
  return {
    x: THREE.MathUtils.clamp(x, -lim, lim),
    z: THREE.MathUtils.clamp(z, -lim, lim),
  };
}

function updateHpBars() {
  const pf = playerHp / MAX_HP;
  const ef = enemyHp / MAX_HP;
  playerHpEl.style.transform = `scaleX(${Math.max(0, pf)})`;
  enemyHpEl.style.transform = `scaleX(${Math.max(0, ef)})`;
}

function resetGame() {
  playerHp = MAX_HP;
  enemyHp = MAX_HP;
  playerPos.set(0, 0, 10);
  yaw = Math.PI;
  enemy.pos.set(0, 0, -12);
  enemy.yaw = 0;
  enemy.mesh.position.set(enemy.pos.x, enemy.pos.y, enemy.pos.z);
  enemyShootTimer = 0;
  for (const p of projectiles) {
    scene.remove(p.mesh);
    p.mesh.geometry.dispose();
    p.mesh.material.dispose();
  }
  projectiles.length = 0;
  updateHpBars();
}

function endGame(won) {
  gameActive = false;
  document.exitPointerLock?.();
  crosshair.classList.remove("active");
  endTitle.textContent = won ? "You win" : "You lose";
  endMsg.textContent = won
    ? "You eliminated the CPU opponent."
    : "The CPU won this round.";
  endScreen.classList.remove("hidden");
}

function tryHitPlayer() {
  if (!gameActive) return;
  playerHp = Math.max(0, playerHp - 18);
  updateHpBars();
  if (playerHp <= 0) endGame(false);
}

function tryHitEnemy() {
  if (!gameActive) return;
  enemyHp = Math.max(0, enemyHp - 22);
  updateHpBars();
  if (enemyHp <= 0) endGame(true);
}

function horizontalDir(angle) {
  return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
}

function shortestAngleDiff(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function updateEnemy(dt) {
  const toP = new THREE.Vector3(
    playerPos.x - enemy.pos.x,
    0,
    playerPos.z - enemy.pos.z
  );
  const dist = toP.length();
  if (dist > 0.01) toP.multiplyScalar(1 / dist);

  const wantYaw = Math.atan2(toP.x, toP.z);
  enemy.yaw += shortestAngleDiff(enemy.yaw, wantYaw) * Math.min(1, 7 * dt);

  let move = toP.clone();
  if (dist < 9) move.multiplyScalar(-0.65);
  else if (dist > 16) move.multiplyScalar(1);
  else move.multiplyScalar(0.35);

  const step = move.multiplyScalar(ENEMY_MOVE_SPEED * dt);
  const nx = enemy.pos.x + step.x;
  const nz = enemy.pos.z + step.z;
  const c = clampToArena(nx, nz, ENEMY_R);
  enemy.pos.x = c.x;
  enemy.pos.z = c.z;
  enemy.mesh.position.set(enemy.pos.x, enemy.pos.y, enemy.pos.z);
  enemy.mesh.rotation.y = enemy.yaw;

  enemyShootTimer -= dt;
  if (enemyShootTimer <= 0 && dist < ENEMY_SHOOT_RANGE && dist > 2) {
    const aim = new THREE.Vector3(
      playerPos.x - enemy.pos.x,
      1.25,
      playerPos.z - enemy.pos.z
    ).normalize();
    const origin = new THREE.Vector3(
      enemy.pos.x + Math.sin(enemy.yaw) * ENEMY_R,
      1.25,
      enemy.pos.z + Math.cos(enemy.yaw) * ENEMY_R
    );
    spawnProjectile(origin, aim, "enemy");
    enemyShootTimer = ENEMY_SHOOT_COOLDOWN;
  }
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.mesh.position.addScaledVector(p.v, dt);

    const o = p.mesh.position;
    if (
      Math.abs(o.x) > WALL_HALF - 0.5 ||
      Math.abs(o.z) > WALL_HALF - 0.5 ||
      o.y > 12 ||
      o.y < -2
    ) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      projectiles.splice(i, 1);
      continue;
    }

    if (p.owner === "player") {
      const ex = enemy.pos.x;
      const ez = enemy.pos.z;
      const dx = o.x - ex;
      const dz = o.z - ez;
      if (dx * dx + dz * dz < (ENEMY_R + PROJ_RADIUS) * 1.2 && o.y < 2.4 && o.y > 0.2) {
        tryHitEnemy();
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        projectiles.splice(i, 1);
      }
    } else {
      const dx = o.x - playerPos.x;
      const dz = o.z - playerPos.z;
      if (dx * dx + dz * dz < (PLAYER_R + PROJ_RADIUS) * 1.3 && o.y < 2.2 && o.y > 0.2) {
        tryHitPlayer();
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        projectiles.splice(i, 1);
      }
    }
  }
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) yaw += TURN_SPEED * dt;
  if (keys.ArrowRight) yaw -= TURN_SPEED * dt;

  const dir = horizontalDir(yaw);
  let move = new THREE.Vector3();
  if (keys.ArrowUp) move.add(dir);
  if (keys.ArrowDown) move.sub(dir);
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(MOVE_SPEED * dt);

  const nx = playerPos.x + move.x;
  const nz = playerPos.z + move.z;
  const c = clampToArena(nx, nz, PLAYER_R);
  playerPos.x = c.x;
  playerPos.z = c.z;

  camera.position.set(playerPos.x, 1.65, playerPos.z);
  camera.rotation.y = yaw;

  if (keys.Space && !spaceConsumed && gameActive) {
    spaceConsumed = true;
    const shotDir = new THREE.Vector3();
    camera.getWorldDirection(shotDir);
    shotDir.y = 0;
    shotDir.normalize();
    const origin = camera.position.clone();
    origin.y = 1.35;
    spawnProjectile(origin, shotDir, "player");
  }
}

const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (gameActive) {
    updatePlayer(dt);
    updateEnemy(dt);
    updateProjectiles(dt);
  }
  renderer.render(scene, camera);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") e.preventDefault();
  if (e.code === "ArrowUp") keys.ArrowUp = true;
  if (e.code === "ArrowDown") keys.ArrowDown = true;
  if (e.code === "ArrowLeft") keys.ArrowLeft = true;
  if (e.code === "ArrowRight") keys.ArrowRight = true;
  if (e.code === "Space") keys.Space = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowUp") keys.ArrowUp = false;
  if (e.code === "ArrowDown") keys.ArrowDown = false;
  if (e.code === "ArrowLeft") keys.ArrowLeft = false;
  if (e.code === "ArrowRight") keys.ArrowRight = false;
  if (e.code === "Space") {
    keys.Space = false;
    spaceConsumed = false;
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function startPlaying() {
  overlay.classList.remove("visible");
  overlay.classList.add("hidden");
  endScreen.classList.add("hidden");
  resetGame();
  gameActive = true;
  crosshair.classList.add("active");
  canvas.requestPointerLock?.();
}

startBtn.addEventListener("click", startPlaying);
restartBtn.addEventListener("click", () => {
  startPlaying();
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) return;
  if (gameActive) {
    gameActive = false;
    crosshair.classList.remove("active");
  }
});

updateHpBars();
tick();
