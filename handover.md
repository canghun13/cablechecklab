# Cable Check Lab — Project Handover

This document is the environment-independent operating record for the project. Treat GitHub `origin/main` plus this file as the baseline at the start of every work session. Do not assume that a local checkout is current.

## Project identity

- Project: Cable Check Lab
- Domain: `cablechecklab.com`
- Repository: https://github.com/canghun13/cablechecklab
- Production URL: https://cablechecklab.com/
- Main branch: `main`
- Hosting: GitHub Pages; custom-domain DNS was configured by the owner
- Stack: static HTML, CSS, and vanilla JavaScript; no framework, build system, database, or backend
- Site language/audience: English / global consumers
- GA4 measurement ID: `G-8PFRRXPGEF`
- Contact: `canghun13@naver.com`
- Search Console and DNS ownership: handled separately by the owner; do not change DNS records

## Environment-independent workflow

Never assume a computer name, local path, or existing checkout.

If the repository is absent:

1. Confirm the current directory.
2. Confirm that https://github.com/canghun13/cablechecklab exists.
3. Clone the repository and enter it.
4. Confirm `git remote -v`, branch, HEAD, and working-tree state.
5. Read this file before editing anything.

If the repository is present, begin with:

```text
pwd
git remote -v
git branch --show-current
git status
git log -5 --oneline
git rev-parse HEAD
git ls-remote origin refs/heads/main
git fetch origin main
git rev-parse origin/main
```

Compare the actual remote `main`, `origin/main`, and local HEAD. Use `git pull --ff-only` only when the working tree is clean and the local branch can be safely fast-forwarded. If uncommitted changes exist, inspect and preserve them. Never use reset, restore, checkout overwrite, deletion, or replacement to discard unknown work.

## Project scope

Cable Check Lab is a tool-first site for consumer electronics cable, charger, port, dock, and display compatibility, selection, planning, comparison, and troubleshooting.

### Core users

- People replacing or buying USB-C chargers and cables
- Laptop, phone, and tablet owners diagnosing slow or missing charging
- Users connecting USB-C monitors, hubs, or docks
- Multi-monitor users comparing DP Alt Mode, USB4, Thunderbolt, MST, DSC, and OS limits
- People trying to identify a trustworthy test before replacing hardware

### Included

- USB-C / USB Power Delivery / PPS declared-capability checks
- Cable power, data, video, marking, and length considerations
- Charger–cable–device chain bottlenecks
- Multi-port charger budgets and explicit allocation uncertainty
- Display payload estimates, DP Alt Mode lane allocation, docks, and multi-monitor planning
- Symptom-driven troubleshooting
- Public-source technical references and explicit confidence boundaries

### Excluded

- General electricity cost, solar/ESS, NAS/storage capacity, networking, HVAC, water systems, reliability engineering, packaging/logistics, commercial printing, 3D printing, injection molding, and unrelated calculators
- Claims of live cable/e-marker inspection from an ordinary browser
- Universal model-by-model compatibility claims without verifiable manufacturer data
- Electrical safety certification or reproduction of paid USB-IF, VESA, or Thunderbolt standards

## Market validation

- Research date: 2026-08-11
- Final project decision: **GO**

### Search markets and recurring intent

- “Why is USB-C charging slow with a 100 W charger?”
- Which charger/cable/device combination reaches the target rate?
- Does the phone require PPS or a proprietary fast-charge protocol?
- What does a USB-C cable actually support: charge, data, video, USB4, or Thunderbolt?
- Does a USB-C port support DisplayPort Alt Mode?
- Will a resolution/refresh/color target fit a two-lane or four-lane display path?
- Why does a second display fail through a dock, especially across Windows/macOS differences?
- How does a multi-port charger divide power, and why does connecting another device interrupt charging?
- What changed when charging, video, or a dock began disconnecting?

These are repeated purchase and troubleshooting decisions, not one-off arithmetic questions. Public forum results repeatedly show whole-chain confusion across charger, cable, device, protocol, port allocation, display lanes, and OS support.

### Competitive tools reviewed

- [EmbeddedCalc Display Bandwidth Calculator](https://embeddedcalc.com/tools/display-bandwidth-calculator/)
- [3C Compass USB-C Charger Power Budget Calculator](https://3ccompass.com/tools/usb-c-charger-calculator)
- [Cable Detective](https://cable-detective.franzai.com/) and [WhatCable](https://www.whatcable.uk/) device-side cable/connection telemetry
- [RetinaDesk Mac Cable Bandwidth Calculator](https://retinadesk.com/tools/cable-bandwidth-calculator/)
- [DVI HDMI Cables tools](https://www.dvihdmicables.com/Tools) for selection, identification, and bandwidth
- [Power Checkers](https://powercheckers.com/) device/charger directory
- [Club3D bandwidth calculator](https://www.club-3d.com/bandwidth-calculator) and other display calculators
- Manufacturer guides, product selectors, and support articles

Representative recurring community problems included [slow charging despite a 100 W charger](https://www.reddit.com/r/UsbCHardware/comments/1u8k2wf/why_is_my_usbc_charging_so_slow_even_with_a_100w/), [multi-port charger distribution](https://www.reddit.com/r/UsbCHardware/comments/10xpjw9/power_distribution_for_multiport_chargers_with/), [dual-monitor dock limitations](https://www.reddit.com/r/UsbCHardware/comments/1u4404m/issues_trying_to_connect_2_monitors_to_usb_dock/), and [DP Alt Mode cable identification](https://www.reddit.com/r/UsbCHardware/comments/yibelu/how_to_know_which_usbc_cable_has_dp_altmode/). Community posts demonstrate recurring questions; they are not treated as normative technical sources.

### Competitive gap

Existing results are fragmented. Calculators typically handle a single bandwidth or wattage formula. Databases require continuous model data. Device-side apps can inspect one operating system but are not pre-purchase web tools. Information articles explain standards without converting the user's complete path into a bounded decision.

Cable Check Lab differentiates through:

- whole-chain inputs rather than connector-only claims;
- separate tools for distinct recurring decisions;
- bottleneck-first output rather than a bare number;
- explicit separation of calculation, declared fit, and facts requiring manuals, certification, telemetry, or hardware testing;
- a connected journey from screening to troubleshooting and purchasing verification.

### Long-tail expansion

The same decision model expands by device type, target wattage, protocol, cable power/data marking, cable length, USB generation, DP link rate, lane allocation, display resolution/refresh/color, dock topology, OS, display count, and symptom. New pages must solve a distinct decision rather than rename an existing calculation.

### Revenue feasibility

Potential long-term models are contextual advertising, clearly disclosed affiliate links on future evidence-based comparison pages, and qualified manufacturer sponsorship that never changes technical results. Traffic and trust come before monetization. Do not add affiliate claims without an explicit disclosure and a real review process.

## Tool candidate decisions

### GO — implemented in the first release

1. **USB-C Charge Check** — repeated pre-purchase and troubleshooting intent; inputs device target, active port output, cable rating, PPS, and proprietary protocol; returns electrical ceiling, bottleneck, and verification boundary.
2. **Cable Capability Decoder** — repeated confusion because USB-C shape does not describe capability; inputs visible claims and use case; returns plausible capability and contradictions without pretending to read the cable.
3. **Display Link Planner** — strong calculation intent but differentiated by usable payload, lane choice, multiple displays, chroma, and uncertainty around timings/DSC/docks.
4. **Multi-port Power Planner** — distinct planning problem; inputs total budget, device targets, and per-port ceilings; returns budget pressure while explicitly deferring to the manufacturer combination table.
5. **USB-C Troubleshooter** — strong recurring symptom intent; returns a shortest-first isolation plan for charging, video, multi-display, and intermittent failures.

### HOLD

- Device-specific charger compatibility database — valuable, but needs a maintained, auditable source and model normalization process.
- Exact dock compatibility checker — valuable, but host, OS, firmware, GPU, chipset, MST/DSC, and output-combination data require a curated database.
- Cable length limit estimator — useful only when tied to cable type, active/passive construction, certification, and target signaling; too prone to false precision as a standalone tool.
- Product comparator and affiliate layer — wait for traffic, editorial policy, and repeatable product-data verification.

### MERGE

- DP Alt Mode checker → Display Link Planner and DP Alt Mode guide.
- Charger selector → Charge Check plus Multi-port Power Planner until a verified product dataset exists.
- Cable marking/icon decoder → Cable Capability Decoder.
- Slow-charging cause calculator → Charge Check plus Troubleshooter.
- Dual-monitor compatibility → Display Link Planner plus Troubleshooter until a model-specific database exists.

### REJECT

- Universal “compatible / not compatible” result based only on connector names.
- Cable capability detection from a photo, connector shape, color, or listing title alone.
- Claimed live e-marker or negotiated-power reading in a generic browser.
- Model recommendations based on invented or stale manufacturer specifications.
- Separate tools that only rename the same minimum-wattage or display-bandwidth formula.

## Information architecture

- Home: `/`
- Tools hub: `/tools/`
- USB-C Charge Check: `/tools/charge-check/`
- Cable Capability Decoder: `/tools/cable-decoder/`
- Display Link Planner: `/tools/display-planner/`
- Multi-port Power Planner: `/tools/multiport-planner/`
- USB-C Troubleshooter: `/tools/troubleshoot/`
- Guides hub: `/guides/`
- USB-C weakest-link guide: `/guides/usb-c-chain/`
- DP Alt Mode guide: `/guides/display-alt-mode/`
- Technical references: `/references/`
- About: `/about/`
- Contact: `/contact/`
- Privacy: `/privacy/`
- Custom 404: `/404.html`
- Search/AI discovery: `/robots.txt`, `/sitemap.xml`, `/llms.txt`

## Current inventory

- Public HTML total: 15
- Indexable HTML: 14
- Tools: 5
- Tool hubs: 1
- Guides: 2
- Guide hubs: 1
- References: 1
- Comparisons: 0
- Other public pages: Home, About, Contact, Privacy, 404

## Completed work

- Reconciled the existing local checkout with GitHub remote `main` without overwriting changes.
- Reused the 2026-08-11 market, competitor, search-intent, community-problem, and public-source research.
- Made the project-level GO decision and recorded all tool-level GO/HOLD/MERGE/REJECT decisions.
- Built the first static site release with an original, tool-first responsive identity.
- Implemented five independent interactive tools in vanilla JavaScript.
- Added result confidence boundaries, invalid-input handling, live recalculation, Reset, Copy, and Print.
- Added two substantive guides and a public technical references/method page.
- Added Home, Tools, Guides, About, Contact, Privacy, and custom 404 pages.
- Added canonical URLs, unique titles/descriptions, Open Graph metadata, H1s, and JSON-LD to indexable pages.
- Added `robots.txt`, `sitemap.xml`, and `llms.txt`.
- Added GA4 measurement ID `G-8PFRRXPGEF` once on every public HTML page, including 404.
- Preserved the existing `CNAME` value `cablechecklab.com`.

## Pending work

- Commit and push the first release to `main`.
- Confirm GitHub Pages serves the pushed revision and custom domain.
- After launch data exists, select the next tool from HOLD based on search impressions and tool engagement rather than page-count targets.

## QA

Required for every material release:

- Broken internal links and missing local assets
- Duplicate IDs
- Unique title and meta description
- Canonical, Open Graph, one H1, and valid JSON-LD on indexable pages
- Sitemap parity with indexable public HTML
- `robots.txt` and `CNAME`
- GA4 ID present exactly once per public HTML page
- JavaScript syntax and browser console errors
- Horizontal overflow at 390, 768, 900, 1024, 1280, and 1440 px
- Mobile navigation and keyboard focus
- Every tool's baseline behavior, input-change recalculation, invalid input, no NaN/Infinity, Reset, Copy, and Print
- Real browser checks on representative pages and all five tools

### 2026-08-11 first-release QA result

- Automated site verifier: PASS for all 15 public HTML files.
- Sitemap parity: PASS for all 14 indexable pages.
- Internal links and local assets: PASS.
- Duplicate IDs: PASS.
- Unique titles, descriptions, canonical URLs, Open Graph, one H1, and parseable JSON-LD: PASS.
- GA4 loader and `gtag('config', 'G-8PFRRXPGEF')` exactly once per public HTML page: PASS.
- JavaScript syntax and `git diff --check`: PASS.
- Real browser: all 15 pages loaded with CSS and JavaScript, one H1, and no horizontal overflow at the normal test viewport.
- Responsive widths: PASS at 390, 768, 900, 1024, 1280, and 1440 px on Home and a representative two-panel tool.
- Mobile menu at 390 px: PASS for hidden/open state and `aria-expanded`.
- Five tools: PASS for baseline result and input-change recalculation.
- Invalid inputs: PASS without `NaN` or `Infinity` output.
- Reset: PASS; defaults and result restored.
- Copy: PASS; clipboard content verified. A navigation-time button-label error found during QA was fixed and regression-tested.
- Print: PASS; print action invoked without JavaScript error or blocking dialog.
- Browser console: PASS with zero errors after revisiting all 15 pages on the fixed revision.

## Git state

- Start commit: `059396612390f4f120b36c5a7a5204bb8904a68d`
- Start local HEAD: `059396612390f4f120b36c5a7a5204bb8904a68d`
- Start `origin/main`: `059396612390f4f120b36c5a7a5204bb8904a68d`
- Start actual remote `main`: `059396612390f4f120b36c5a7a5204bb8904a68d`
- Final commit: pending
- Push result: pending
- Final local HEAD: pending
- Final `origin/main`: pending
- Final actual remote `main`: pending
- Final working tree: pending

## Next real work after launch

Use Search Console queries and GA4 tool usage to decide between a curated dock/display compatibility data model and a device-specific charging requirement directory. Before implementing either, define source provenance, update cadence, model identifiers, uncertainty rules, and a correction workflow.
