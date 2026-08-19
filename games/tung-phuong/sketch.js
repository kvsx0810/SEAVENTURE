let head, left, right;
let gradient;

let fishImgs = [];
let fishes = [];

let light, mid, dark;
let angleLight = 0;
let angleMid = 0;
let angleDark = 0;

let starImg, coralImg, seaweedImg;
let stars = [];
let corals = [];
let seaweeds = [];

let particles = [];

let holoColors = [
  '#0A69CC',
  '#ED8495'
];

let holoX = 0;
let holoY = 0;

let ambient1;
let ambient2;
let ambient3;
let ambient4;
let audioStarted = false;

function preload() {
  gradient = loadImage('/images/gradient.png');
  head = loadImage('/images/head.png');
  left = loadImage('/images/left.png');
  right = loadImage('/images/right.png');

  fishImgs.push(loadImage('/images/fish1.png'));
  fishImgs.push(loadImage('/images/fish2.png'));
  fishImgs.push(loadImage('/images/fish3.png'));

  light = loadImage('/images/light.png');
  mid = loadImage('/images/mid.png');
  dark = loadImage('/images/dark.png');

  starImg = loadImage('/images/star.png');
  coralImg = loadImage('/images/coral.png');
  seaweedImg = loadImage('/images/seaweed.png');

  ambient1 = loadSound('/sounds/clothes_hook.wav');
  ambient2 = loadSound('/sounds/wind_chime.wav');
  ambient3 = loadSound('/sounds/water_splash.wav');
  ambient4 = loadSound('/sounds/water_drop.wav');
}

function setup() {
  createCanvas(1920, 1080);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  let numFish = int(random(3, 6));
  for (let i = 0; i < numFish; i++) fishes.push(createFish());

  for (let i = 0; i < 3; i++) stars.push(createStarfish(starImg));
  for (let i = 0; i < 1; i++) corals.push(createCoral(coralImg));
  for (let i = 0; i < 3; i++) seaweeds.push(createSeaweed(seaweedImg));
  for (let i = 0; i < 30; i++) particles.push(createParticle());
}

function draw() {
  background(211, 95, 15);
  image(gradient, 1000, 0, 2000, 1080);

  // Holographic circles
  push();
  translate(width / 2 + holoX, height / 2 + holoY);
  let sizes = [1050, 900, 750, 630];

  for (let i = 0; i < 4; i++) {
    let x = sin(frameCount * 0.012 + i * 1.5) * 20;
    let y = cos(frameCount * 0.015 + i * 1.2) * 20;
    let breathing = sin(frameCount * 0.02 + i * 1.5) * 20;
    let c = color(holoColors[i % holoColors.length]);
    c.setAlpha(20);
    fill(c);
    ellipse(x, y, sizes[i] + breathing, sizes[i] + breathing);
  }
  pop();

  // Particles
  updateParticles();
  showParticles();

  // Main character
  image(head, 840, 350, 199, 180);

  // Globe
  radialGradient(width / 2 - 40, height / 2 - 120, 0, width / 2 - 40, height / 2 - 120, 380,
    color(348, 6, 100, 100), color(198, 93, 100, 100));
  ellipse(width / 2, height / 2, 400, 400);
  
  // Rotating schools
  imageMode(CENTER);
  let cx = width / 2, cy = height / 2;

  push();
  translate(cx, cy);
  rotate(angleLight);
  image(light, 0, 0);
  pop();

  push();
  translate(cx, cy);
  rotate(angleMid);
  image(mid, 0, 0);
  pop();

  push();
  translate(cx, cy);
  rotate(angleDark);
  image(dark, 0, 0);
  pop();

  angleLight -= 0.05;
  angleMid += 0.05;
  angleDark -= 0.05;

  // Fish
  for (let f of fishes) {
    f.update();
    f.show();
  }

  for (let i = fishes.length - 1; i >= 0; i--) {
    if (!fishes[i].alive) {
      fishes.splice(i, 1);
      fishes.push(createFish());
    }
  }

  // Sand
  sandGradientArc(width / 2, height / 2 + 90, 280, 0, 180, 0.3, 0.5,
    color(348, 6, 100), color(348, 6, 99));

  // Decorations
  imageMode(CENTER);
  for (let s of stars) image(s.img, s.x, s.y, s.size, s.size);
  for (let c of corals) image(c.img, c.x, c.y, c.size, c.size);
  for (let w of seaweeds) image(w.img, w.x, w.y, w.size, w.size);

  image(left, 818, 560, 199, 264);
  image(right, 1038, 430, 203, 218);
}

// Start audio after user interaction
function mousePressed() {
  if (!audioStarted) {
    userStartAudio().then(() => {
      ambient1.setVolume(0.15);
      ambient2.setVolume(0.30);
      ambient3.setVolume(0.03);
      ambient4.setVolume(0.01);
      ambient1.loop();
      ambient2.loop();
      ambient3.loop();
      ambient4.loop();
      audioStarted = true;
    });
  }
}

// Random point inside circle
function randomPointInCircle(cx, cy, radius) {
  let angle = random(360);
  let distance = sqrt(random());
  return {
    x: cx + cos(angle) * distance * radius,
    y: cy + sin(angle) * distance * radius
  };
}

// Starfish
function createStarfish(img) {
  let size = random(10, 30);
  let p = randomPointInCircle(width / 2, height / 2, 160);
  return { img, x: p.x, y: p.y, size };
}

// Coral
function createCoral(img) {
  let size = random(70, 130), x, y;
  do {
    let p = randomPointInCircle(width / 2, height / 2, 120);
    x = p.x;
    y = p.y;
  } while (y < height / 2 + 40);
  return { img, x, y, size };
}

// Seaweed
function createSeaweed(img) {
  let size = random(90, 130), x, y;
  do {
    let p = randomPointInCircle(width / 2, height / 2, 120);
    x = p.x;
    y = p.y;
  } while (y < height / 2 + 40);
  return { img, x, y, size };
}

// Fish
function createFish() {
  let img = random(fishImgs);
  let size = random(40, 100);
  let y;

  do {
    y = random(height / 2 - 150, height / 2 + 150);
  } while (dist(width / 2, height / 2, width / 2 - 140, y) > 150);

  let direction = random() < 0.5 ? 1 : -1;
  let x = direction > 0 ? width / 2 - 140 : width / 2 + 140;
  let speed = random(0.1, 0.6) * direction;

  return new Fish(img, size, x, y, speed);
}

// Fish class
class Fish {
  constructor(img, size, x, y, speed) {
    this.img = img;
    this.size = size;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.alive = true;
  }

  update() {
    this.x += this.speed;

    let d = dist(this.x, this.y, width / 2, height / 2);
    let globeRadius = 200;
    let fishRadius = this.size / 2;
    let safeRadius = globeRadius - fishRadius;

    if (d > safeRadius) this.alive = false;
  }

  show() {
    if (!this.alive) return;

    let aspect = this.img.height / this.img.width;
    let w = this.size;
    let h = this.size * aspect;

    push();
    translate(this.x, this.y);
    if (this.speed < 0) scale(-1, 1);
    imageMode(CENTER);
    image(this.img, 0, 0, w, h);
    pop();
  }
}

// Particles
function createParticle() {
  return {
    x: random(width),
    y: random(height),
    size: random(3, 7),
    speed: random(0.1, 0.4),
    drift: random(0.2, 0.8),
    opacity: random(40, 100),
    offset: random(1000)
  };
}

function updateParticles() {
  for (let p of particles) {
    p.y -= p.speed;
    p.x += sin(frameCount * 0.01 + p.offset) * p.drift;

    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
  }
}

function showParticles() {
  noStroke();
  for (let p of particles) {
    fill(0, 0, 100, p.opacity);
    circle(p.x, p.y, p.size);
  }
}

// Globe gradient
function radialGradient(sX, sY, sR, eX, eY, eR, colorS, colorE) {
  let gradient = drawingContext.createRadialGradient(sX, sY, sR, eX, eY, eR);
  gradient.addColorStop(0, colorS);
  gradient.addColorStop(1, colorE);
  drawingContext.fillStyle = gradient;
}

// Sand gradient
function sandGradientArc(x, y, r, startAngle, endAngle, verticalScale, horizontalScale, c1, c2) {
  beginShape();

  for (let a = startAngle; a <= endAngle; a += 5) {
    let inter = map(a, startAngle, endAngle, 0, 1);
    let c = lerpColor(c1, c2, inter);
    fill(c);

    let rx = x + r * horizontalScale * cos(a);
    let ry = y + r * verticalScale * sin(a);
    vertex(rx, ry);
  }

  let steps = 20;
  let x1 = x + r * horizontalScale * cos(endAngle);
  let y1 = y + r * verticalScale * sin(endAngle);
  let x2 = x + r * horizontalScale * cos(startAngle);
  let y2 = y + r * verticalScale * sin(startAngle);

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let bx = lerp(x1, x2, t);
    let by = lerp(y1, y2, t);
    let n = noise(frameCount * 0.05, i * 0.5);
    let offset = map(n, 0, 1, -2, 2);
    vertex(bx, by + offset);
  }

  endShape(CLOSE);
}