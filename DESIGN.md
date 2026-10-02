---
name: FolioCove
description: Premium consumer discovery for private browser PDF tools
colors:
  coral: "#c52949"
  coral-hover: "#aa203e"
  white: "#fff"
  soft-surface: "#f7f7f7"
  ink: "#222"
  muted: "#686868"
  line: "#e7e7e7"
  danger: "#b32339"
  selected-bg: "#fbe8ed"
  selected-ink: "#a9223e"
  success: "#355b43"
typography:
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(28px, 3vw, 42px)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  card-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 700
rounded:
  control: "8px"
  drop: "12px"
  cover: "14px"
  workspace: "16px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.coral-hover}"
  tool-selected:
    backgroundColor: "{colors.selected-bg}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
---

# Design System: FolioCove

## Overview

**Creative North Star: "Airbnb-inspired consumer discovery"**

The owner-pinned direction makes PDF tasks immediately discoverable through a compact header, task search, category navigation and visual document cards. White surfaces, charcoal typography and restrained coral actions establish a premium consumer utility. The existing static HTML/CSS/module stack remains the implementation authority; there is no approved visual comp.

This records the built system in `src/pages/home.html`, `src/styles/launch.css` and `src/app/launch.mjs`, constrained by `PRODUCT.md`. The HTML direction contract is tools immediately → browse a task → open its workspace → select a local document → inspect the result.

**Key Characteristics:**

- Immediate task discovery and a working workspace on the homepage.
- Quiet surfaces, rounded document imagery and consistent Phosphor icons.
- Explicit processing limits and inspectable output states.

Finish evidence supplied for this build: static desktop/mobile screenshots passed review; 24 browser core checks passed; mobile route checks passed 20/20 at 375×812 and 412×915; discovery checks found no page overflow or missing assets. Build and whitespace checks passed. Declared palette contrast calculations were at least 4.5:1 for reviewed text pairs; rendered computed contrast was not independently verified. These checks do not establish a complete accessibility audit.

## Colors

Coral is reserved for identity, primary actions, focus and selected states; pale cover colors give the catalog variety without competing with actions.

- Primary coral uses `--mint` and its legacy alias `--blue`, both mapped to the frontmatter coral value. Hover darkens the processing button.
- White is the page/workspace canvas; soft surface and `#fafafa` distinguish quiet controls, sidebar and upload area. Ink carries headings; muted carries supporting copy; line separates regions.
- Selected controls use selected-bg/selected-ink. Danger marks failures; success marks completed status. State meaning also appears in text.
- Cover backgrounds: merge `#f6e9e5`, split `#eeeae4`, organize/OCR `#e8edf1`, compress `#edeae5`, scan `#edf0e9`, edit `#f4e6e7`, sign `#eee9f2`, redact `#ecebe8`, inspect `#e8efec`.

## Typography

DM Sans is self-hosted as WOFF2 at weights 400, 500, 600 and 700, with `font-display: swap` and sans-serif fallback. Body text is 15px/1.55. The homepage headline uses the frontmatter headline role; workspace headings are 24–26px, weight 600, tracking -.025em. Desktop card titles are 15px/600 and descriptions 13px; mobile uses 14px titles and 12px descriptions. Supporting copy stays compact, with introductory copy limited to 60ch and workspace copy to 58ch. Avoid imposing uppercase display typography on this system.

## Layout

The homepage shell is centered at max-width 1440px with 64px inline padding; above 1440px padding is 48px. The 80px header precedes a left-aligned intro/search row. Discovery uses five equal columns with 22px horizontal and 29px vertical gaps. Covers have aspect ratio 1.22. The workspace follows the grid and uses a 240px sidebar plus a flexible processing region, min-height 530px, with 32px 40px workspace padding.

At ≤1100px, shell padding becomes 32px, grid gaps 16px/22px and sidebar width 215px. At ≤760px, shell padding is 22px, header 76px, intro stacks, search fills width, discovery becomes two columns with 14px/23px gaps and cover ratio 1.12. Category navigation scrolls horizontally within its region. The sidebar stacks above the workspace with a 220px height cap; workspace padding becomes 24px 18px and actions can wrap. Tool routes hide homepage discovery and narrow the shell to 1250px.

## Elevation & Depth

Borders and pale backgrounds provide most separation. Search uses a subtle `0 3px 12px #22222209` shadow, upload icon `0 3px 12px #2222220b`, and preview papers a `0 9px 7px #3c29251b` drop shadow. Paper rotation and overlap create tactile depth. Fine-pointer hover lifts the primary preview 4px over 240ms with `cubic-bezier(.23,1,.32,1)`; processing actions transition over 140ms and upload state over 160ms. Active buttons/cards scale to .98; focus-active controls suppress that transform.

## Shapes

Use 8px corners for controls/file rows, 12px for the dashed upload zone, 14px for covers/icon tiles, and 16px for workspace/card links. Search, badges and the guide link are pills; cover action markers are circles. Keep imagery inside clipped covers rather than introducing full-card borders or heavy shadows.

## Components

- **Discovery cards:** 35 linked core and extended tasks; decorative synthetic preview papers, title, short description and Phosphor action marker. Cards navigate to a tool route. Capability badges include English, Experimental and Read only. `/previews/` imagery is synthetic PDF preview material, not customer documents or proof of actual output quality; retain the visible provenance note.
- **Categories and search:** All tools, Organize, Edit & sign, Scan & OCR and Privacy buttons expose `aria-pressed`. Category selection and case-insensitive title/description substring search intersect. Search also forwards its query to workspace tool search. An empty result message appears when no discovery card matches.
- **Workspace catalog:** Defaults to ten core tools, with broader catalog/filter and local recent/favorite controls retained. Active tools use the selected palette and weight 700. Phosphor SVG assets are local; decorative images use empty alt text.
- **Upload and processing:** Dashed drop zone supports file selection, drag feedback and visible keyboard focus. Selected files use compact rows with removal controls; options appear for the current task. Primary processing starts disabled until usable. Running jobs expose progress/cancel and make sidebar/options/files inert; errors and completion appear in textual status. Cancel confirms a reload that clears unsaved selections.
- **Trust and limits:** On-device badge and task-specific notices remain adjacent to processing. Redaction stays experimental and verified sanitization stays disabled. Do not turn these into broad security certification claims.
- **Keyboard and motion:** Skip link targets the workspace. Interactive elements receive a 3px coral focus outline with 4px offset; search uses a focus-within border/ring and upload uses focus-within outline. Reduced-motion preference removes transitions/animations, smooth scrolling and active transforms. Hidden content is removed from layout.

## Do's and Don'ts

### Expanded catalog refinement

The expanded catalog uses six additional real synthetic PDFs rendered as preview images: letter, spreadsheet, landscape slide, form, concise brief and Markdown text. Short discovery descriptions complement full capability copy in the workspace; badges expose text-only, approximate, image-slide and browser-dependent limits. The 35 discovery cards share the same cover, title, description and Phosphor action treatment.

`src/styles/catalog.css` owns the catalog refinement and workspace option layout. Inputs are grouped with labels above them, in three desktop columns and two mobile columns. Long text/file inputs and drawing canvases span the grid. Comparison previews use two columns on desktop and one on mobile. Mobile form inputs are 16px to avoid browser zoom.

Supplemental format labels use dark blue `#354c68`, green `#355846` and brown `#824d3d` solely to identify document formats; coral retains authority over interactive actions. Quiet catalog backgrounds include `#f2e9e5`, `#e9edf2`, `#e8eeea`, `#ebeef2` and adjacent low-chroma tones. Type roles include 9–10px capability badges, 12px labels, 13px descriptions and 15px desktop titles; mobile format tags use 6px corners. These are deliberate additions to the incumbent system.

Export libraries load as local split modules when their tool runs. Keyboard activation of a catalog card moves focus to the workspace heading without animation. Existing core routes, job controls, processing limits and on-device behavior remain intact.

Current verification: desktop 1440×1080 and mobile 390×844 inspection found 35 cards, no horizontal overflow, no missing images, and no page errors. Category/search/empty-result behavior and form selection were exercised. The mechanical detector ran in degraded regex mode and reported documentation advisories; it did not evaluate computed contrast or establish a complete accessibility audit.

- Do keep task discovery and file processing immediately available.
- Do preserve local assets, keyboard focus, responsive grids and explicit capability notices.
- Do label synthetic document previews and distinguish processing success from output quality.
- Don't introduce a marketing detour, invented customer evidence or an Airbnb affiliation.
- Don't replace the static stack or remove working tool states for visual polish.
- Don't claim rendered contrast or comprehensive accessibility validation from the recorded checks.


