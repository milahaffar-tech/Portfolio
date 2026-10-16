# Mila Haffar — Portfolio

Static site built from the Claude Design file `Portfolio v2.dc.html`. Plain HTML, CSS and one small script. No build step.

- `index.html`: hero, selected work (5 projects), contact.
- `css/styles.css`: Modernist design tokens plus page styles. The cover "lid" flip on hover is pure CSS.
- `js/mila.js`: the handwritten "Mila" in the hero. Scrolling at the top of the page pulls the letters together.
- `assets/`: project covers and the handwriting pieces (`assets/handwriting/p_*.png`).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- Type is Freight Display Pro, with Georgia as the fallback. Freight only shows if an Adobe Fonts kit for it is added to `<head>`.
- Project cards and the About link point inside this page until the case-study and About pages are built.
- The LinkedIn link is still the generic `https://linkedin.com`.
