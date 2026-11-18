export interface CodeProjectData {
  files: Record<string, string>;
  activeFile: string;
}

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Mi Juego</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <canvas id="game" width="480" height="320"></canvas>
  <script src="script.js"></script>
</body>
</html>
`;

export const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #07060d;
}

#game {
  background: #100e1c;
  border: 2px solid #8b2fe0;
  border-radius: 8px;
}
`;

export const DEFAULT_JS = `const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 40, y: 280, size: 24, speed: 4 };
const keys = {};

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

function update() {
  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += player.speed;
  if (keys["ArrowUp"] || keys["KeyW"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["KeyS"]) player.y += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function draw() {
  ctx.fillStyle = "#07060d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#a855f7";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
console.log("Juego iniciado. Usa WASD o las flechas para moverte.");
`;

export function createDefaultCodeProject(): CodeProjectData {
  return {
    files: {
      "index.html": DEFAULT_HTML,
      "style.css": DEFAULT_CSS,
      "script.js": DEFAULT_JS,
    },
    activeFile: "index.html",
  };
}

const LANG_BY_EXT: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  ts: "typescript",
  json: "json",
};

export function languageForFile(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return LANG_BY_EXT[ext] ?? "plaintext";
}

/** Inlines <link rel="stylesheet" href="x.css"> and <script src="x.js"> references against the in-memory file map, and injects a console bridge that forwards logs/errors to the parent window via postMessage. */
export function buildPreviewHtml(files: Record<string, string>, entry = "index.html"): string {
  let html = files[entry] ?? "<!doctype html><html><body>No index.html</body></html>";

  html = html.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const content = files[href.replace(/^\.?\//, "")];
    if (content === undefined) return match;
    return `<style>\n${content}\n</style>`;
  });

  html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    const content = files[src.replace(/^\.?\//, "")];
    if (content === undefined) return match;
    return `<script>\n${content}\n</script>`;
  });

  const consoleBridge = `<script>
(function () {
  const post = (level, args) => {
    try {
      window.parent.postMessage({ source: "playverse-console", level, args: args.map(String) }, "*");
    } catch (e) {}
  };
  ["log", "warn", "error", "info"].forEach((level) => {
    const original = console[level];
    console[level] = function (...args) {
      post(level, args);
      original.apply(console, args);
    };
  });
  window.onerror = function (message, source, lineno, colno) {
    post("error", [message + " (línea " + lineno + ")"]);
  };
})();
</script>`;

  if (html.includes("<head>")) html = html.replace("<head>", `<head>${consoleBridge}`);
  else html = consoleBridge + html;

  return html;
}
