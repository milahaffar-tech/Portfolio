# Mila Haffar — Portfolio

A diary in six rooms. Plain HTML, CSS and two small scripts. No build step.

## Direction

From Mila's portfolio direction survey (Ember, October 2026):

- **Big idea:** unity in individuality, carried through the whole site. Her separate handwritten letters gather as you walk through the rooms and join into her signature at the end.
- **Journey:** one continuous story, chapter by chapter. Each project is a room with its own chapter title ("On going deeper", "On rest", …).
- **Each project is its own world:** every room has its own light, accent color, title typeface and a faint texture.
- **Feel:** golden hour after dark, velvet, film grain and ceramic; a diary entry, not a museum label; a handwritten note. Closest feel: Aman.
- **Kept from the last site:** the handwritten "Mila", covers that open like a box, cream and oxblood.

## Pages

- `index.html`: the story. Prologue, contents, six rooms, epilogue.
- `about.html`: "My story", set as a letter and signed.
- `contact.html`: email and LinkedIn.
- `work/*.html`: one page per room (brief, what I did, solution). Each takes its room's world and links to the rooms on either side.

## Files

- `css/styles.css`: tokens, the six worlds (`[data-world="…"]`), and all page styles.
- `js/mila.js`: the handwritten name, cut from `assets/handwriting/p_*.png`. `Mila.create(el)` returns `set(p, { spread })`: `spread` is how far apart the four letters sit, `p` is the joining gesture (0 apart, 1 signed). `data-mila="static"` draws the joined signature with no motion.
- `js/site.js`: fade-ins on every page. On the story page it also switches the light as each room reaches the middle of the screen, lifts covers on touch screens, and drives the name: apart in the prologue, closer room by room in the top bar, joined in the epilogue.
- `assets/`: project covers, the handwriting pieces, and `kintsu-cracks.svg` (the Studio Kintsu cover until a photo arrives).

Motion respects `prefers-reduced-motion`: no grain or drifting, covers fade instead of flipping, and the signature is shown joined.

## Type

Google Fonts. Newsreader is the voice for all text. Each room's title has its own face, loaded only for the letters it uses: Bodoni Moda (MOF), Marcellus (ReSET Studio), Fraunces (YOCA), DM Sans (IthaCard), Cormorant Garamond (Botanic Gardens), Shippori Mincho (Studio Kintsu).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Editing copy

All copy is inline HTML. Room cards and notebook notes are in `index.html`; each case study is its own file under `work/`, and its notebook note repeats the one on the homepage.

## Notes

- The prologue, chapter titles, notebook notes and epilogue are new copy written in Mila's voice from her own case studies and story. She should read them and change anything that doesn't sound like her.
- Studio Kintsu still uses a drawn placeholder cover (`.lid-art`).
- The LinkedIn link is still the generic `https://linkedin.com`.
