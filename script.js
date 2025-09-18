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
let tickInterval = 120;
let lastTick = 0;
let raf = null;
let needsFullRedraw = true;
const dirtyCells = new Map();
let cellWidth = cellSize;
let cellHeight = cellSize;

const cellBounds = (x, y) => {
  const left = Math.round(x * cellWidth);
  const top = Math.round(y * cellHeight);
  const right = Math.round((x + 1) * cellWidth);
  const bottom = Math.round((y + 1) * cellHeight);
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
};

function resize() {
  const prevCols = cols;
  const prevRows = rows;
  const prevGrid = grid ? grid.map(row => row.slice()) : null;

  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  // Fit canvas to container size
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  cellSize = parseInt(cssVar('--cell-size'), 10) || 12;
  cols = Math.max(1, Math.floor(rect.width / cellSize));
  rows = Math.max(1, Math.floor(rect.height / cellSize));
  const nextGrid = makeGrid(cols, rows);
  if (prevGrid) {
    const copyCols = Math.min(prevCols, cols);
    const copyRows = Math.min(prevRows, rows);
    for (let y = 0; y < copyRows; y++) {
      for (let x = 0; x < copyCols; x++) {
        nextGrid[y][x] = prevGrid[y][x];
      }
    }
  }
  grid = nextGrid;
  buffer = makeGrid(cols, rows);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  cellWidth = cssWidth / cols;
  cellHeight = cssHeight / rows;
  needsFullRedraw = true;
  dirtyCells.clear();
  draw(true);
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
  const clamped = Math.min(1, Math.max(0, density));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = Math.random() < clamped ? 1 : 0;
    }
  }
  needsFullRedraw = true;
  dirtyCells.clear();
}

function clearAll() {
  for (let y = 0; y < rows; y++) grid[y].fill(0);
  needsFullRedraw = true;
  dirtyCells.clear();
}

function step() {
  dirtyCells.clear();
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
      const nextValue = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0;
      buffer[y][x] = nextValue;
      if (nextValue !== alive) {
        markDirty(x, y);
      }
    }
  }
  // swap
  const t = grid; grid = buffer; buffer = t;
}

function markDirty(x, y) {
  dirtyCells.set(y * cols + x, [x, y]);
}

function draw(forceFull = false) {
  const g = parseInt(cssVar('--gap'), 10) || 0;
  const doFull = forceFull || needsFullRedraw;

  if (doFull) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x]) {
          const { left, top, width, height } = cellBounds(x, y);
          const innerLeft = left + g;
          const innerTop = top + g;
          const innerWidth = Math.max(0, width - g * 2);
          const innerHeight = Math.max(0, height - g * 2);
          if (innerWidth > 0 && innerHeight > 0) {
            ctx.fillRect(innerLeft, innerTop, innerWidth, innerHeight);
          }
        }
      }
    }
  } else if (dirtyCells.size) {
    for (const [, [x, y]] of dirtyCells) {
      const { left, top, width, height } = cellBounds(x, y);
      ctx.fillStyle = '#000';
      ctx.fillRect(left, top, width, height);
      if (grid[y][x]) {
        ctx.fillStyle = '#fff';
        const innerLeft = left + g;
        const innerTop = top + g;
        const innerWidth = Math.max(0, width - g * 2);
        const innerHeight = Math.max(0, height - g * 2);
        if (innerWidth > 0 && innerHeight > 0) {
          ctx.fillRect(innerLeft, innerTop, innerWidth, innerHeight);
        }
      }
    }
  }
  dirtyCells.clear();
  needsFullRedraw = false;
}

function loop(timestamp) {
  if (!running) return;
  if (!lastTick) {
    lastTick = timestamp;
  }
  const elapsed = timestamp - lastTick;
  if (elapsed >= tickInterval) {
    lastTick = timestamp - (elapsed % tickInterval);
    step();
    draw();
  }
  raf = requestAnimationFrame(loop);
}

// Controls
const toggleBtn = document.getElementById('toggle');
const randomBtn = document.getElementById('random');
const clearBtn = document.getElementById('clear');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const densityInput = document.getElementById('density');
const densityValue = document.getElementById('density-value');

const getDensityFraction = () => {
  const value = Number.parseInt(densityInput.value, 10);
  return Number.isNaN(value) ? 0 : value / 100;
};

function refreshSpeedLabel() {
  speedValue.textContent = `${tickInterval}ms`;
}

function refreshDensityLabel() {
  const current = Number.parseInt(densityInput.value, 10);
  if (Number.isNaN(current)) {
    densityValue.textContent = '0%';
    return;
  }
  densityValue.textContent = `${current}%`;
}

const initialSpeed = Number.parseInt(speedInput.value, 10);
if (!Number.isNaN(initialSpeed)) {
  tickInterval = initialSpeed;
}
refreshSpeedLabel();
refreshDensityLabel();

speedInput.addEventListener('input', () => {
  const nextSpeed = Number.parseInt(speedInput.value, 10);
  if (!Number.isNaN(nextSpeed)) {
    tickInterval = nextSpeed;
    lastTick = 0;
  }
  refreshSpeedLabel();
});

densityInput.addEventListener('input', () => {
  refreshDensityLabel();
});

function start() {
  if (running) return;
  running = true;
  toggleBtn.textContent = 'PAUSE';
  toggleBtn.setAttribute('aria-pressed', 'true');
  lastTick = 0;
  raf = requestAnimationFrame(loop);
}
function stop() {
  running = false;
  toggleBtn.textContent = 'PLAY';
  toggleBtn.setAttribute('aria-pressed', 'false');
  if (raf) {
    cancelAnimationFrame(raf);
    raf = null;
  }
  lastTick = 0;
}
function toggleRun() { running ? stop() : start(); }

toggleBtn.addEventListener('click', toggleRun);
randomBtn.addEventListener('click', () => {
  randomize(getDensityFraction());
  draw(true);
});
clearBtn.addEventListener('click', () => {
  stop();
  clearAll();
  draw(true);
});

// Pointer interactions
let drawing = false;
let drawValue = 1;

function pointerToCell(evt) {
  const rect = canvas.getBoundingClientRect();
  const relX = evt.clientX - rect.left;
  const relY = evt.clientY - rect.top;
  const x = Math.floor(relX / cellWidth);
  const y = Math.floor(relY / cellHeight);
  return { x: Math.max(0, Math.min(cols - 1, x)), y: Math.max(0, Math.min(rows - 1, y)) };
}

function setCell(x, y, v) {
  if (grid[y][x] === v) return;
  grid[y][x] = v;
  markDirty(x, y);
  draw();
}

canvas.addEventListener('mousedown', (e) => {
  stop();
  drawing = true;
  const {x, y} = pointerToCell(e);
  drawValue = e.shiftKey ? 0 : (grid[y][x] ? 0 : 1);
  setCell(x, y, drawValue);
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const {x, y} = pointerToCell(e);
  const value = e.shiftKey ? 0 : drawValue;
  setCell(x, y, value);
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
randomize(getDensityFraction());
draw(true);
