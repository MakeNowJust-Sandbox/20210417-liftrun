const app = document.querySelector<HTMLCanvasElement>('#app')!;
const width = 1280;
const height = 720;
const ctx = app.getContext('2d')!;

const line = (stroke: string, x1: number, y1: number, x2: number, y2: number): void => {
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const rect = (stroke: string, x: number, y: number, w: number, h: number): void => {
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();
};

const rectFill = (fill: string, x: number, y: number, w: number, h: number): void => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
};

const text = (fill: string, x: number, y: number, text: string, font: string): void => {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.fillText(text,x, y);
};

const liftW = 50;
const liftH = 30;
const liftR = 200;

const boxW = 10;
const boxH = 10;

const LOCALSTORAGE_KEY = 'liftrun-highscore';
let high = +(localStorage.getItem(LOCALSTORAGE_KEY) ?? 0);

let started = false;
let t = 0;
let forceX = 0;
let selfX = 100;
let key: null | 'left' | 'right' = null;
let boxes: {x: number, y: number}[] = [];

const main = () => {
  t += 1;
  forceX += Math.sqrt(t / 300 + 1) * 2;

  line('#aaa', 0, 420, width, 420);
  rect('#aaa', selfX - 5 - forceX, 420 - 5, 10, 10);

  for (let x = Math.floor(forceX / 100) * 100; x <= forceX + width; x += 100) {
    line('#aaa', x - forceX, 420 - 30, x - forceX, 420 + 30);
    text('#aaa', x - forceX + 5, 420 + 30, `${((x - 100) / 100).toFixed(0)} m`, '18px sans-serif');
  }

  for (let i = 0; i < 4; i++) {
    const theta = (selfX + i * 90) / 180 * Math.PI;
    const x = selfX + liftR * Math.cos(theta) - liftW / 2;
    const y = 420 + liftR * Math.sin(theta) - liftH / 2;
    line('#aaa', selfX - forceX, 420, x - forceX + liftW / 2, y + liftH / 2);
    rect('#000', x - forceX, y, liftW, liftH);
  }

  let hit = false;
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    rectFill('#000', box.x - forceX - boxW/2, box.y - boxH/2, boxW, boxH);
    for (let i = 0; i < 4; i++) {
      const theta = (selfX + i * 90) / 180 * Math.PI;
      const x = selfX + liftR * Math.cos(theta) - liftW / 2;
      const y = 420 + liftR * Math.sin(theta) - liftH / 2;
      if (x <= box.x && box.x <= x + liftW && y <= box.y && box.y <= y + liftH) {
        hit = true;
      }
    }
    if (hit) {
      break;
    }
    if (box.x + boxW < forceX) {
      boxes.splice(i--, 1);
      continue;
    }
    box.x -= Math.sqrt(t / 300 + 1) * 12;
  }

  if (hit || selfX < forceX) { // Game over.
    const score = (selfX - 100) / 100;
    if (high < score) {
      high = score;
      localStorage.setItem(LOCALSTORAGE_KEY, high.toString());
    }
    started = false;
    t = 0;
    forceX = 0;
    selfX = 100;
    key = null;
    boxes = [];
  }

  const highText = `HIGH: ${high.toFixed(1)} m`;
  text('#444', width - highText.length * 16, height - 24, highText, '24px sans-serif');

  if (!started) {
    text('#000', 200, 200, 'LIFTRUN', '64px sans-serif');
    text('#000', 200, 300, 'PRESS ← OR → KEY TO START', '64px sans-serif');
    selfX += Math.sqrt(t / 300 + 1) * 2;
    if (key) { // Start game.
      started = true;
      t = 0;
      forceX = 0;
      selfX = 100;
      boxes = [];
    }
    return;
  }

  const score = (selfX - 100) / 100;
  text('#444', 12, height - 24, `${score.toFixed(1)} m`, '24px sans-serif');

  if (key === 'left') {
    selfX -= Math.sqrt(t / 300 + 1) * 2 * 2 * ((1.5 ** -t) + 1);
  }
  if (key === 'right') {
    selfX += Math.sqrt(t / 300 + 1) * 2 * 2 * ((1.5 ** -t) + 1);
  }
  selfX = Math.max(forceX, Math.min(forceX + width, selfX));

  if (Math.random() <= 0.01 + Math.sqrt(t / 3000000)) {
    boxes.push({x: forceX + width, y: (420 - liftR) + Math.random() * liftR * 2 - boxH /2});
  }
};

app.addEventListener('keydown', ev => {
  if (ev.key === 'ArrowLeft') key = 'left';
  if (ev.key === 'ArrowRight') key = 'right';
});

app.addEventListener('keyup', () => {
  key = null;
});

setInterval(() => {
  ctx.clearRect(0, 0, width, height);
  main();
}, 1000/30);
