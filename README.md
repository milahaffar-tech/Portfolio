# Mila Haffar — Portfolio

Six projects from Mila's notebook, in velvet. Plain HTML, CSS and two small scripts. No build step.

## Direction

From Mila's portfolio direction survey (Ember, October 2026) and her notes on the first velvet version:

- **Velvet:** golden hour after dark. Velvet, film grain, letters in colored ink. She chose it over the Notebook and Stone directions, so those are gone.
- **Separate pages, not one long scroll:** the homepage is a single screen, the work has its own page, and each project has its own page.
- **Her M, for everyone:** the homepage is just the opening, so every visitor sees it: her handwritten M opens into its four letters, each in its own ink, and closes again, twice, then rests as her M.
- **Every project in one place:** the Work page shows all six together, each with its cover (the lid lifts to show its palette and key lines), what it is, a short description and its skills, so a visitor with two minutes can choose. Each opens its own page with the full story.
- **Each project is its own world, unsaid:** no rooms, no doors. Each project has its own light, accent color, title typeface and faint texture. Its page carries them, and pointing at it on the Work page lends the page its light.
- **Less text-heavy case studies:** a line drawing sits beside each part of a case study (the brief, what I did, the solution), in the project's color, and draws itself in like her handwriting.
- **Kept:** covers that open like a box, cream and oxblood, her handwriting, a diary voice.

## Pages

- `index.html`: the opening, one screen: her M comes together, a short note, and the way to the work.
- `work.html`: all six projects in one place.
- `about.html`: "My story", set as a letter with her photo taped on, and signed.
- `contact.html`: email and LinkedIn.
- `work/*.html`: one page per project (brief, what I did, solution). Each takes its project's world and links to the projects on either side; the first and last link back to the Work page.

## Files

- `css/styles.css`: tokens, the six worlds (`[data-world="…"]`), and all page styles.
- `js/mila.js`: the handwritten name, cut from `assets/handwriting/p_*.png`. `Mila.create(el)` returns `set(p, { spread, gesture })`: `spread` is how far apart the four letters sit, `p` is the gesture (0 apart, 1 her M), and `gesture` is `'expand'` while p falls or `'gather'` while it rises. The homepage's open-and-close timeline is `OPEN_CLOSE` in `js/site.js`. `data-mila="static"` draws the joined M with no motion.
- `js/site.js`: fade-ins on every page. On the homepage it plays the M; on the Work page it lends the page a project's light while it's pointed at, and lifts covers on touch screens as they pass; on case pages it draws in the drawings.
- `assets/`: project covers, the handwriting pieces, Mila's portrait (`mila-portrait.jpg`), and `kintsu-cracks.svg` (the Studio Kintsu cover until a photo arrives). The case-study drawings are inline SVG in each `work/*.html`, so they take the project's color.

Motion respects `prefers-reduced-motion`: no grain or drifting, covers fade instead of flipping, the M is shown still, and the drawings appear already drawn.

## Type

Google Fonts. Newsreader is the voice for all text. Each project's title has its own face, loaded only for the letters it uses: Bodoni Moda (MOF), Marcellus (ReSET Studio), Fraunces (YOCA), DM Sans (IthaCard), Cormorant Garamond (Botanic Gardens), Shippori Mincho (Studio Kintsu).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Editing copy

All copy is inline HTML. The opening note is in `index.html`; each project's card (palette, key lines, description, skills) is in `work.html`; each case study is its own file under `work/`.

## Notes

- The opening note, chapter titles and notebook notes are new copy written in Mila's voice from her own case studies and story. She should read them and change anything that doesn't sound like her.
- Studio Kintsu still uses a drawn placeholder cover (`.lid-art`).
- The LinkedIn link is still the generic `https://linkedin.com`.
