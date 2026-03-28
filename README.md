# Arena FPS (3D)

A browser-based **first-person arena shooter** in an arena against **one CPU opponent**. Built with [Three.js](https://threejs.org/) — **no install or build step**; only a small local web server is required to run it.

---

## If someone shared this code with you — how to run / play

You need a **computer** with **Python 3** *or* **Node.js**, and a **recent browser** (Chrome, Firefox, Safari, or Edge).

### Step 1 — Get the project files

**Option A — Git clone (if they gave you a GitHub link)**

```bash
git clone https://github.com/Mukundkumar07/Instant_3D_GAME.git
cd Instant_3D_GAME
```

Use the branch they told you to use (for example `Instant_3D_GAME` or `main`):

```bash
git checkout Instant_3D_GAME
```

**Option B — ZIP download**

1. On GitHub, open the repo → **Code** → **Download ZIP**.
2. Unzip the folder.
3. Open a terminal and `cd` into that folder (the one that contains `index.html`).

### Step 2 — Start a local web server

You **cannot** open `index.html` by double-clicking it — the game loads Three.js as a module, and browsers block that from `file://`. You must serve the folder over **http://**.

**Using Python (often already installed on Mac/Linux):**

```bash
cd /path/to/the/folder/with/index.html
python3 -m http.server 8080
```

**Using Node (if you have npm):**

```bash
cd /path/to/the/folder/with/index.html
npx --yes serve -p 8080
```

Leave this terminal window **open** while you play.

### Step 3 — Play in the browser

1. Open: **http://127.0.0.1:8080/** (or the URL the `serve` command prints).
2. Choose **Difficulty** (Easy / Medium / Hard).
3. Click **Click to play** — the browser may ask to **hide the cursor**; accept for best experience.
4. Use the controls below. Press **Esc** to unlock the mouse if needed.

### Step 4 — Stop the server

In the terminal where the server is running, press **Ctrl+C**.

---

## Controls

| Input | Action |
|--------|--------|
| **↑** / **↓** | Move forward / backward |
| **←** / **→** | Turn left / right |
| **Space** | Shoot (release Space to fire again) |
| **Click “Click to play”** | Start the match (pointer lock; **Esc** unlocks cursor) |

**HUD:** Health bars and numbers, match timer, difficulty, weapon line, distance to CPU, and a small **compass** showing where the CPU is relative to the way you’re facing (**F** = forward). The crosshair flashes **cyan** when you hit the CPU and **orange/red** when they hit you.

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| Blank page or errors in the console about **CORS** / modules | You opened the file directly. Use **Step 2** (local server), not double‑click `index.html`. |
| **Port 8080 in use** | Pick another port, e.g. `python3 -m http.server 9000` then open **http://127.0.0.1:9000/** |
| Game won’t start | Use a current browser; allow **pointer lock** when prompted, or try **Esc** and click **Click to play** again. |
| `python3` not found (Windows) | Install Python from [python.org](https://www.python.org/) or use **Node** + `npx serve` instead. |

---

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | Page shell, HUD, import map for Three.js |
| `styles.css` | UI, crosshair, compass |
| `game.js` | 3D scene, player, CPU AI, shooting |
| `scripts/push-current-branch.sh` | Helper to `git push` the current branch (optional, for developers) |

---

## Optional: play from GitHub Pages

If the repo owner enabled **GitHub Pages** (Settings → Pages → branch + `/ (root)`), anyone can play **without** installing anything:

`https://Mukundkumar07.github.io/Instant_3D_GAME/`  
(Exact URL depends on username, repo name, and which branch is deployed.)

---

## For developers: clone and push (Git)

```bash
git clone https://github.com/Mukundkumar07/Instant_3D_GAME.git
cd Instant_3D_GAME
git checkout Instant_3D_GAME
# … make changes …
git add .
git commit -m "Your message"
git push -u origin Instant_3D_GAME
```

---

MIT License — use freely.
