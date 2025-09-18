// script.js — Minimal generative playground (no gradients).
// Simple cellular automaton (Game of Life-inspired).
// Click/drag to toggle cells. Press space to run/pause, R to randomize, C to clear.

const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d', { alpha: false });

// CSS var reader
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let cellSize = parseInt(cssVar('--cell-size'), 10) || 12;
let running = false;
let cols = 0, rows = 0;
let grid, buffer;

function resize() {
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  // Fit canvas to container size
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cellSize = parseInt(cssVar('--cell-size'), 10) || 12;
  cols = Math.floor(rect.width / cellSize);
  rows = Math.floor(rect.height / cellSize);
  grid = makeGrid(cols, rows);
  buffer = makeGrid(cols, rows);
  draw();
}

function makeGrid(w, h) {
  const arr = new Array(h);
  for (let y = 0; y < h; y++) {
    const row = new Uint8Array(w);
    arr[y] = row;
  }
  return arr;
}

function randomize(density = 0.25) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = Math.random() < density ? 1 : 0;
    }
  }
}

function clearAll() {
  for (let y = 0; y < rows; y++) grid[y].fill(0);
}

function step() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = 0;
      // 8 neighbors (wrap-around for endless plane)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = (x + dx + cols) % cols;
          const ny = (y + dy + rows) % rows;
          n += grid[ny][nx];
        }
      }
      const alive = grid[y][x] === 1;
      buffer[y][x] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0;
    }
  }
  // swap
  const t = grid; grid = buffer; buffer = t;
}

function draw() {
  // Background (black)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cells (white)
  ctx.fillStyle = '#fff';
  const g = parseInt(cssVar('--gap'), 10) || 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x]) {
        ctx.fillRect(x * cellSize + g, y * cellSize + g, cellSize - g*2, cellSize - g*2);
      }
    }
  }
  // Border already via CSS outline for a crisp frame.
}

let raf = null;
const TICK_MS = 120;

function loop(tsPrev = performance.now()) {
  if (!running) return;
  const tick = () => {
    step();
    draw();
    raf = setTimeout(() => requestAnimationFrame(loop), TICK_MS);
  };
  tick();
}

// Controls
const toggleBtn = document.getElementById('toggle');
const randomBtn = document.getElementById('random');
const clearBtn = document.getElementById('clear');

function start() {
  if (running) return;
  running = true;
  toggleBtn.textContent = 'PAUSE';
  toggleBtn.setAttribute('aria-pressed', 'true');
  requestAnimationFrame(loop);
}
function stop() {
  running = false;
  toggleBtn.textContent = 'PLAY';
  toggleBtn.setAttribute('aria-pressed', 'false');
  if (raf) { clearTimeout(raf); raf = null; }
}
function toggleRun() { running ? stop() : start(); }

toggleBtn.addEventListener('click', toggleRun);
randomBtn.addEventListener('click', () => { randomize(0.25); draw(); });
clearBtn.addEventListener('click', () => { stop(); clearAll(); draw(); });

// Pointer interactions
let drawing = false;
let drawValue = 1;

function pointerToCell(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((evt.clientX - rect.left) / cellSize);
  const y = Math.floor((evt.clientY - rect.top) / cellSize);
  return { x: Math.max(0, Math.min(cols - 1, x)), y: Math.max(0, Math.min(rows - 1, y)) };
}

function setCell(x, y, v) {
  grid[y][x] = v;
  // Immediate visual feedback
  ctx.fillStyle = v ? '#fff' : '#000';
  const g = parseInt(cssVar('--gap'), 10) || 0;
  if (v) {
    ctx.fillRect(x * cellSize + g, y * cellSize + g, cellSize - g*2, cellSize - g*2);
  } else {
    // erase with background
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

canvas.addEventListener('mousedown', (e) => {
  stop();
  drawing = true;
  const {x, y} = pointerToCell(e);
  drawValue = grid[y][x] ? 0 : 1;
  setCell(x, y, drawValue);
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const {x, y} = pointerToCell(e);
  setCell(x, y, drawValue);
});
window.addEventListener('mouseup', () => drawing = false);

// Touch support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  stop();
  drawing = true;
  const t = e.touches[0];
  const {x, y} = pointerToCell(t);
  drawValue = grid[y][x] ? 0 : 1;
  setCell(x, y, drawValue);
}, {passive:false});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const t = e.touches[0];
  const {x, y} = pointerToCell(t);
  setCell(x, y, drawValue);
}, {passive:false});
window.addEventListener('touchend', () => drawing = false);

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); toggleRun(); }
  if (e.key.toLowerCase() === 'r') { randomBtn.click(); }
  if (e.key.toLowerCase() === 'c') { clearBtn.click(); }
});

// Init
window.addEventListener('resize', resize);
resize();
randomize(0.18);
draw();
