# Verification — portfolio redesign

Checked locally on 2026-10-15 using headless Chrome through Playwright and visual screenshot review.

| Page | Viewport widths | Result |
| --- | --- | --- |
| Home | 1440, 1024, 768, 390px | No horizontal overflow, broken images or duplicate IDs |
| Smart Fridge detail | 1440, 1024, 768, 390px | No horizontal overflow, broken images or duplicate IDs |

- Desktop sidebar: measured 240px at 1440 and 1024px.
- Tablet and mobile: compact top identity/navigation; single-column project layout.
- Homepage sections: exactly About, Projects, Experience; no Reflections or Contact section or navigation entry.
- Existing portrait and UW logo render correctly; GT text fallback does not request an absent file.
- Four project diagrams preserve aspect ratio, are marked as concept diagrams, and do not imply measured results.
- Local links, hash targets and active assets return successfully; no placeholder `href="#"` links.
- Navigation remains highlighted on the clicked target throughout smooth scrolling; Experience is active at the page bottom.
- Direct About, Projects, Experience and legacy Experiences anchors pass; browser back/forward and detail-to-home Projects return pass.
- Reduced motion, keyboard skip link, 1024×400 short-screen sidebar access, JavaScript-disabled content and simulated missing-project-image fallback pass.
- No page JavaScript exceptions or console errors in the suite.
- JavaScript syntax checks and `git diff --check` pass.
- Existing GitHub Pages workflow is unchanged. At the time of local verification, no push, merge or publishing had been performed. The owner subsequently authorized publication. Repository settings remain unchanged.

Screenshot and machine-readable artifacts are saved locally in `.preview-checks/` (ignored by Git). The repeatable check is `scripts/check.cjs`; see README for runtime requirements.

## Verification limits

The original YouTube demo URL and responsive embed are preserved. Playback itself was not verified: the separate external-video inspection was not authorized. The page also offers a direct YouTube link. Email, GitHub and LinkedIn destinations were verified against the pre-existing repository, not against remote account ownership or delivery status.
