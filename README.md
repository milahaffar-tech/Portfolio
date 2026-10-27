# Mila Haffar — Portfolio

Six projects from Mila's notebook, in velvet. Plain HTML, CSS and two small scripts. No build step.

## Direction

From Mila's portfolio direction survey (Ember, October 2026) and her notes on the first velvet version:

- **Velvet:** golden hour after dark. Velvet, film grain, letters in colored ink. She chose it over the Notebook and Stone directions, so those are gone.
- **Every project in one place:** all six covers sit together right under the opening, so a visitor with two minutes sees everything and can open any project.
- **A story for anyone who keeps scrolling:** below the grid, the projects unfold one at a time as chapters ("On going deeper", "On rest", …), each with a notebook note.
- **Her M, for everyone:** the four handwritten letters gather into her M as soon as the page opens, not only at the bottom. The epilogue plays it once more for people who read to the end.
- **Each project is its own world, unsaid:** no rooms, no doors. Each project has its own light, accent color, title typeface and faint texture. The page's light shifts as its chapter reaches the middle of the screen, or while its cover in the grid is pointed at.
- **Kept:** covers that open like a box, cream and oxblood, her handwriting, a diary voice.

## Pages

- `index.html`: the opening (her M comes together), the work (all six), the six chapters, and an epilogue.
- `about.html`: "My story", set as a letter and signed.
- `contact.html`: email and LinkedIn.
- `work/*.html`: one page per project (brief, what I did, solution). Each takes its project's world and links to the projects on either side.

## Files

- `css/styles.css`: tokens, the six worlds (`[data-world="…"]`), and all page styles.
- `js/mila.js`: the handwritten name, cut from `assets/handwriting/p_*.png`. `Mila.create(el)` returns `set(p, { spread })`: `spread` is how far apart the four letters sit, `p` is the joining gesture (0 apart, 1 her M). `data-mila="static"` draws the joined M with no motion.
- `js/site.js`: fade-ins on every page. On the homepage it also plays the M at the top and in the epilogue, shifts the light between projects, shows which chapter you're in (beside a small M in the top bar), and lifts chapter covers on touch screens.
- `assets/`: project covers, the handwriting pieces, and `kintsu-cracks.svg` (the Studio Kintsu cover until a photo arrives).

Motion respects `prefers-reduced-motion`: no grain or drifting, covers fade instead of flipping, and the M is shown joined.

## Type

Google Fonts. Newsreader is the voice for all text. Each project's title has its own face, loaded only for the letters it uses: Bodoni Moda (MOF), Marcellus (ReSET Studio), Fraunces (YOCA), DM Sans (IthaCard), Cormorant Garamond (Botanic Gardens), Shippori Mincho (Studio Kintsu).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Editing copy

All copy is inline HTML. The grid, the chapters and their notebook notes are in `index.html` (each project appears twice there: once in the grid, once as a chapter); each case study is its own file under `work/`, and its notebook note repeats the one on the homepage.

## Notes

- The opening note, chapter titles, notebook notes and epilogue are new copy written in Mila's voice from her own case studies and story. She should read them and change anything that doesn't sound like her.
- Studio Kintsu still uses a drawn placeholder cover (`.lid-art`).
- The LinkedIn link is still the generic `https://linkedin.com`.
