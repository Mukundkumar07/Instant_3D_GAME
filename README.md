# Arena FPS (3D)

A browser-based **first-person arena shooter** against one CPU opponent. Built with [Three.js](https://threejs.org/) (no build step).

## Controls

| Input | Action |
|--------|--------|
| **↑** / **↓** | Move forward / backward |
| **←** / **→** | Turn left / right |
| **Space** | Shoot (release to fire again) |
| **Click “Click to play”** | Start match (requests pointer lock; **Esc** unlocks) |

## Run locally

This project uses **ES modules** and an **import map** for Three.js. Browsers block module loading from `file://`, so serve the folder over HTTP.

```bash
cd /path/to/Instant
python3 -m http.server 8080
```

Open **http://127.0.0.1:8080/** in a modern browser (Chrome, Firefox, Safari, Edge).

Alternative (Node):

```bash
npx --yes serve -p 8080
```

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | Page shell, HUD, import map |
| `styles.css` | UI and crosshair |
| `game.js` | Scene, player, AI, projectiles |

## GitHub: create the repo and push (first time)

1. **Create an empty repository** on GitHub (no README/license if you already have files locally):  
   [https://github.com/new](https://github.com/new)

2. **From this folder**, run (replace `YOUR_USER` and `YOUR_REPO`):

   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial commit: Arena FPS Three.js game"
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

3. If you use **SSH**:

   ```bash
   git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

### Using GitHub CLI (optional)

If you have [GitHub CLI](https://cli.github.com/) installed and logged in (`gh auth login`):

```bash
gh repo create YOUR_REPO --public --source=. --remote=origin --push
```

## Optional: GitHub Pages

After the repo is on GitHub:

1. Repo **Settings → Pages**
2. **Source**: Deploy from branch **main**, folder **/ (root)**
3. Your game will be available at `https://YOUR_USER.github.io/YOUR_REPO/`

---

MIT License — use freely.
