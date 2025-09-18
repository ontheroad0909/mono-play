# MONO / PLAY
> Monochrome generative playground (no gradients). Uses 갈무리체(Galmuri).

## Preview
- Black & white only.
- Crisp pixel feel with Galmuri font.
- Cellular-automaton animation (toggle with **PLAY/PAUSE**).

## Run locally
Open `index.html` in your browser. No build step.

## Deploy to GitHub Pages
1. Create a new GitHub repository (e.g., `mono-play`).
2. Add these files and push to the `main` branch.
3. In **Settings → Pages**, set **Source** to “Deploy from a branch”, pick `main` and `/ (root)`.
4. Wait for deployment, then visit `https://<your-username>.github.io/<your-repo>/`.

**Tip**: Keep an empty file named `.nojekyll` in the repo root to prevent Jekyll from altering assets.

## Customize
- Change cell density: in `script.js`, adjust `randomize(0.25)` on init.
- Change cell size: in `styles.css`, modify `--cell-size`.
- Typography: Galmuri family is included via jsDelivr. Pick `Galmuri14` or `Galmuri11` in CSS.

## Licenses
- **Code**: MIT (see `LICENSE`).
- **Font**: 갈무리체(Galmuri) — SIL Open Font License 1.1, loaded via CDN (no files redistributed here).
