# Luoqi Li — engineering portfolio

A buildless, responsive portfolio for GitHub Pages. All public content is authored in HTML and remains readable without JavaScript.

## Preview

Requires Node.js, with no package installation:

```sh
node scripts/preview.cjs
```

Open http://127.0.0.1:4173. Stop with Ctrl+C. The server binds only to loopback. Set `PORT` if that port is occupied.

## Active files

```text
index.html                 About, Projects, Experience
projects.html              Smart Fridge detail; preserves #project-1
reflections.html           Retired URL redirects to the homepage
assets/css/main.css        Shared tokens, components and responsive layout
assets/js/main.js          Navigation highlighting, history and image fallback
images/favicon.svg         Site monogram
images/avatar/1.jpg        Existing portrait
images/logos/uw.png         Existing UW logo
images/projects/*.svg      Original conceptual project illustrations
scripts/preview.cjs        Dependency-free local server
scripts/check.cjs          Optional real-browser verification
RESOURCE-NOTICES.md         Resource provenance and retained license notices
```

The deployment workflow `.github/workflows/static.yml` is unchanged: it deploys the repository as static files from `luoqi-web`. The redesign was developed on `redesign/portfolio`. Publication to `luoqi-web` was authorized by the owner after local review. No domain or repository settings were changed.

Original photographs, `_pgbackup/`, editor metadata and historical Font Awesome assets remain available. Public pages do not load the former template, Sass, jQuery, Poptrox, Pinegrow interactions or reflection carousel. The old Reflections URL is retired, with no incoming links from the portfolio.

## Editing content

The About introduction is an editable draft supplied by the owner; the marker exists only in a source comment. Keep degree dates, project claims, contribution scope and results factual. No unsupported completion status, HDL choice, performance or coverage values have been added.

Projects are repeated `article.project-entry` blocks in `index.html`. Copy a block, update the content, alt text and image path, and include links only when a real destination exists. No CSS or JavaScript changes are needed to add a project. Only Smart Fridge currently has a detail page. The shared sidebar is deliberately repeated in the two HTML pages to preserve a buildless, JavaScript-independent site; edit both when updating profile links.

### Georgia Tech logo

Reserved path: **`images/logos/georgia-tech.png`**.

Until an approved image is available, the logo container shows GT without attempting a missing network request. After placing the PNG, replace the GT span in `index.html` with:

```html
<img src="images/logos/georgia-tech.png" width="64" height="64"
     alt="Georgia Tech logo" loading="lazy">
```

The existing `.school-logo img` rule uses `object-fit: contain`, matching UW. Remove the `role="img"` and `aria-label` on this container when using the image's alt text.

### Project media

Current, editable concept diagrams:

- `images/projects/legv8-cpu.svg`
- `images/projects/pipeline-simulator.svg`
- `images/projects/uvm-verification.svg`
- `images/projects/smart-fridge.svg` (also used on the detail page)

To use real screenshots or photos, add e.g. `images/projects/legv8-cpu.png` and update the corresponding HTML `src`, alt text and caption. Keep dimensions or an aspect ratio to prevent layout shifts. No external stock imagery is used. The built-in fallback preserves the visual area if an image fails to load. Concept diagrams are intentionally labeled and are not claims about implementation details or measured results.

### Optional material to add later

- Georgia Tech logo from an appropriate source.
- Actual project diagrams, waveforms, FPGA photos or screenshots.
- Confirmed public source-code URLs and demos for the first three projects.
- Verified HDL for LEGv8; APB/I2C dates and personal contribution scope; measured validation results if available.
- Revised About wording as studies and interests evolve.

## Verification

The browser suite requires an existing Playwright installation and Chrome; it is not a deployment dependency. Set `PLAYWRIGHT_MODULE` to its module path, or install Playwright in a separate development environment. A bundled Codex runtime is detected when available.

```sh
node scripts/check.cjs
```

It checks both pages at 1440, 1024, 768 and 390px; screenshots and JSON results are saved in ignored `.preview-checks/`. Checks cover overflow, broken images, duplicate IDs, local assets and links, hash navigation, the legacy `#experiences` alias, click-highlight stability, history back/forward, bottom highlight, detail return, a 400px-high sidebar, reduced motion, keyboard skip link, missing-image fallback and JavaScript-disabled content.

Final browser results and review notes are in `VERIFICATION.md`. YouTube playback is external and was not verified; the original demo URL is preserved, with a responsive iframe, descriptive title, no autoplay and a direct link.
