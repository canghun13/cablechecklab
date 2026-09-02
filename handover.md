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

- Public HTML total: 60
- Indexable HTML / sitemap URLs: 59; the custom 404 is the only non-indexable HTML page
- Interactive Tools: 28
- Problem workbenches: 6 (`charging`, `cables`, `displays`, `docks`, `usb4-thunderbolt`, and `video-adapters`) plus the main Tools hub
- Standalone Guides: 13 plus the Guides hub
- Focused References: 5 plus the References/method hub
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
- Completed a post-launch trust and UX pass without increasing page count.
- Removed invented charging fallback wattage and speculative multi-port power allocation from tool results.
- Made charging-path, cable-product-type, and troubleshooting-path inputs affect their results.
- Added explicit display-topology limits, a connected Tools hub journey, and refreshed primary-source references.

## Pending work

- Collect enough Search Console query/impression data and GA4 tool-engagement data to distinguish real demand from anecdotal demand.
- Define a compact GA4 event taxonomy for meaningful calculate/change, Copy, Reset, and Guide/Reference transitions before adding custom events; GA4 pageview collection is already present.
- Use query, landing-page, journey, and support evidence to deepen or merge current Tools rather than add page-count or keyword variants.
- Keep device/model charging data, exact dock/eGPU/adapter/MST compatibility, cable-length prediction, and product comparison on HOLD until provenance, stable identifiers, refresh cadence, uncertainty labels, and correction workflows are defined.
- Re-review the public USB-IF, VESA, HDMI, Intel, Microsoft, and Apple boundaries when standards, certification, or operating-system behavior materially changes.

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
- Real browser checks on representative pages and all current tools

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
- First-release implementation commit: `71b39011a71871f91f84836dff0a87e5d52bd374`
- Push result: successful, `main` advanced from `0593966` to `71b3901`
- Verified release local HEAD: `71b39011a71871f91f84836dff0a87e5d52bd374`
- Verified release `origin/main`: `71b39011a71871f91f84836dff0a87e5d52bd374`
- Verified release actual remote `main`: `71b39011a71871f91f84836dff0a87e5d52bd374`
- GitHub Pages: `pages-build-deployment` run #3 (`31474780582`) completed successfully on 2026-08-11
- Production verification: `https://cablechecklab.com/`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200; the public Charge Check recalculated successfully with zero browser console errors
- Post-release handover finalization: committed after the release commit; use `git log -1 --oneline` for the self-referential documentation commit hash
- Final working tree target: clean and synchronized with `origin/main`

## Next real work after launch

Use Search Console queries and GA4 tool usage to decide between a curated dock/display compatibility data model and a device-specific charging requirement directory. Before implementing either, define source provenance, update cadence, model identifiers, uncertainty rules, and a correction workflow.

## 2026-08-11 post-launch trust and UX release

### Start state

- This computer's workspace root contained only an empty, no-commit Git initialization with no remote. It was not treated as the project.
- The repository was cloned non-destructively into a `repository` child directory.
- Start local HEAD: `7e11d791b6e5a8656ed8d86ca5453910ecca9895`
- Start `origin/main`: `7e11d791b6e5a8656ed8d86ca5453910ecca9895`
- Start actual GitHub `main`: `7e11d791b6e5a8656ed8d86ca5453910ecca9895`
- Working tree after clone/fetch: clean; branch `main`; no pull was required.

### Decision

- **No new public page or independent tool.** Inventory remains 15 public HTML files, 14 indexable pages, and five tools.
- The next highest-value work was a quality release for result honesty, input usefulness, and navigation between existing tools.
- Device-specific charging requirements: **HOLD** — still needs a maintained model/source normalization system.
- Exact dock compatibility: **HOLD** — host, GPU, OS, firmware, chipset, MST/DSC, port-combination, and display-count data remain model-specific.
- Cable length limit estimator: **HOLD** — active/passive construction, exact signaling target, certification, and topology still make a standalone estimate falsely precise.
- Product comparator/affiliate layer: **HOLD** — no traffic-driven editorial scope or repeatable verified product-data process yet.
- DP Alt Mode checker, charger selector, cable marking decoder, slow-charging calculator, and dual-monitor checker remain **MERGE** with the existing five-tool journey.
- A charging-protocol fallback-wattage estimator is **REJECT** because a missing PPS or proprietary protocol does not imply one public, deterministic fallback rate.

### Focused research

- USB-IF's current public cable guidance confirms certified C-to-C cable marking around 60 W or 240 W and provides exact-product certification records; legacy 100 W claims must not be presented as current certified branding.
- USB-IF's public Power Delivery overview supports a declared electrical ceiling up to 240 W but does not support inferring a negotiated fallback wattage from a missing protocol checkbox.
- VESA's current public FAQ confirms DisplayPort over USB-C can use two or four high-speed lanes and that adapter, MST, DSC, source, cable, and display capabilities are separate prerequisites.
- Microsoft documents DisplayPort MST support on supported Windows hardware; Apple directs users to model-specific external-display limits. This reinforces keeping universal dock/model verdicts on HOLD.
- The research updated the existing reference/method page; it did not repeat the first-release market study.

### Implementation

- **USB-C Charge Check:** separates the arithmetic electrical ceiling from PPS/vendor-protocol uncertainty; removes the invented 50% fallback; reports multi-port and dock/monitor path verification requirements.
- **Cable Capability Decoder:** uses the selected product type; distinguishes C-to-C, A-to-C, USB-C-to-DisplayPort, and USB-C-to-HDMI products; flags impossible or category-mismatched power/data/video claims; adds a normal legacy/basic A-to-C input path.
- **Display Link Planner:** labels output as a payload estimate and explicitly reports the separate host display-count and MST/Thunderbolt/USB4 topology requirement for multiple streams.
- **Multi-port Power Planner:** removes proportional per-device allocation; reports capped demand, port limits, total-budget shortfall, and the need for the manufacturer's exact occupied-port table.
- **USB-C Troubleshooter:** uses the selected direct/dock/monitor/multi-adapter path to insert the highest-signal bypass test.
- **Tools hub:** adds three suggested journeys so users move between tools only when a separate decision remains.
- **References:** refreshes primary USB-IF, VESA, Microsoft, and Apple sources and aligns calculation notes with actual tool behavior.
- Bumped the shared JavaScript asset query to `20260811b` on all 15 public HTML files to avoid stale cached behavior.

### Changed files

- Logic: `assets/app.js`
- Tool UI/copy: `tools/charge-check/index.html`, `tools/cable-decoder/index.html`, `tools/multiport-planner/index.html`, `tools/troubleshoot/index.html`
- Result-boundary copy only: `tools/display-planner/index.html` behavior comes from shared JavaScript
- Hub/method: `tools/index.html`, `references/index.html`
- Cache-buster only on the remaining public HTML files: `index.html`, `404.html`, About, Contact, Privacy, both guide pages, and both hub pages not otherwise listed above
- Operating record: `handover.md`

### QA

- Automated verifier: PASS for 15 public HTML files and 14 sitemap/indexable pages.
- Internal links/local assets, duplicate IDs, unique titles/descriptions, canonical, Open Graph, one H1, parseable JSON-LD, robots, sitemap parity, CNAME, and GA4 `G-8PFRRXPGEF` exactly once: PASS.
- JavaScript syntax and `git diff --check`: PASS.
- Real browser loaded all 15 public pages with CSS and `app.js?v=20260811b`, one H1, correct canonical behavior (404 intentionally non-indexable), and zero console warnings/errors.
- Five tools: baseline result, changed input, invalid input, no NaN/Infinity, Reset, Copy, and Print: PASS.
- Charge Check: missing PPS preserves the 100 W electrical ceiling and reports protocol uncertainty instead of inventing 50 W; multi-port path note and 65 W bottleneck: PASS.
- Cable Decoder: C-to-C baseline, normal A-to-C, contradictory A-to-C video, USB-C-to-HDMI adapter, invalid length, and Reset: PASS.
- Display Planner: one-stream fit, two-stream over-payload result plus topology boundary, invalid width, and Reset: PASS.
- Multi-port Planner: 25 W shortfall without proportional allocation, 200 W fit, per-port limit, missing active port ceiling, and Reset: PASS.
- Troubleshooter: direct baseline, dock bypass insertion, dual-display dock path, and Reset: PASS.
- Copy clipboard content verified for all five tools; Print invoked for all five without JavaScript error or blocking dialog.
- Horizontal overflow: PASS on Home, Tools hub, and representative two-panel planner at 390, 768, 900, 1024, 1280, and 1440 px.
- Mobile navigation at 390 px: PASS for hidden/open states and `aria-expanded=false/true`.

### Git and deployment

- Start commit: `7e11d791b6e5a8656ed8d86ca5453910ecca9895`
- Implementation commit: `a65fd63f3201c143f034e6515a9c9a38d3c9cad7` (`Harden tool result confidence and journeys`)
- Implementation push: successful; GitHub `main` advanced from `7e11d791` to `a65fd63f`.
- GitHub Pages: `pages build and deployment` run #5 (`31486757211`) completed successfully for `a65fd63f3201c143f034e6515a9c9a38d3c9cad7`.
- Production verification: Charge Check preserved the 100 W electrical ceiling while reporting missing PPS as unverified; Multi-port Planner reported the 25 W shortfall without proportional allocation; the Tools hub showed the new suggested journeys; `app.js?v=20260811b`, `robots.txt`, and `sitemap.xml` were live; representative production pages had zero console warnings/errors.
- Final commit: the commit containing this handover entry; resolve with `git log -1 --format=%H` after the final commit because a commit cannot contain its own hash.
- Handover finalization: commit this operating record after the verified implementation deployment, push `main`, wait for the resulting Pages run, then verify actual remote `main` and a clean synchronized tree.

### Next real work

1. Do not add another tool merely to grow page count.
2. Collect Search Console and GA4 evidence for the five existing tools.
3. If device/model demand is real, define the source-provenance, update cadence, stable identifiers, uncertainty labels, correction workflow, and minimum viable record set before choosing a directory or exact compatibility checker.
4. Re-review external technical sources when standards, operating-system behavior, or tool rules materially change.

## 2026-08-11 structured expansion release

### Start state

- Repository path on this computer: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Branch: `main`; remote: `https://github.com/canghun13/cablechecklab.git`.
- Start local HEAD: `7916830b0f987bd7b806ae7473171bc18ef02879`.
- Start `origin/main`: `7916830b0f987bd7b806ae7473171bc18ef02879`.
- Start actual GitHub `main` from `git ls-remote`: `7916830b0f987bd7b806ae7473171bc18ef02879`.
- Start tree: clean and synchronized; no pull was required.
- Verified starting inventory: 15 public HTML files, 14 indexable pages, five interactive tools, one Tools hub, two guides plus the Guides hub, and one References page.

### Expansion decision

- **GO:** expand around transparent user-entered requirements and bottlenecks, not an exact-model compatibility database.
- **GO implemented:** PPS Range Checker, PD Requirement Builder, Cable Requirement Selector, USB Data Path Checker, DSC Requirement Planner, USB-C Lane Planner, Dock Requirement Builder, and Hub Power Budget.
- **GO implemented:** four problem-centered workbenches for Charging, Cables & Data, Displays, and Docks & Hubs; four focused guides; two focused technical references.
- **MERGE:** a 3 A/5 A calculator belongs inside the PD Requirement Builder; a generic charger selector belongs in the charging journey; a cable marking decoder remains part of Cable Capability Decoder; non-identical/multiple display arithmetic remains in Display Link Planner; a DP Alt Mode checker is represented by Lane Planner plus Dock Requirement Builder; slow charging and adapter-chain isolation remain in Troubleshooter.
- **HOLD:** device/model charging database, exact dock compatibility checker, cable-length limit calculator, and product comparator. Public sources still do not provide complete, stable model-level data, topology, active/passive cable construction, update cadence, or product verification needed for safe verdicts.
- **HOLD:** a generic file-transfer-time calculator and a standalone adapter-chain checker. The first is broadly generic and dominated by unknown workload efficiency; the second does not yet provide enough independent value beyond Cable Decoder, Dock Builder, and Troubleshooter.
- **REJECT:** connector-shape compatibility checker, automatic missing-protocol fallback-wattage calculator, browser e-marker reader, unit-conversion pages, and keyword-variant copies of existing tools. These would create false certainty, require unavailable hardware access, or add thin duplication.

### Research by requested family

#### A. USB-C charging and Power Delivery

- USB-IF public guidance supports current certified C-to-C power markings of 60 W or 240 W, a 5 A e-marked path above 60 W, USB PD up to 240 W, and PPS as a separate programmable capability.
- Search results show standalone PD profile calculators, PPS tester workflows, and charger-budget calculators. This validates long-tail intent around voltage/current/profile matching, while leaving space for requirement-first and range-first tools that preserve negotiation uncertainty.
- Result: PD current/cable requirements and one-APDO PPS range matching are independent from the existing whole-chain Charge Check and were promoted to GO.

#### B. Cable, data-rate, and protocol capability

- USB-IF now emphasizes explicit performance language (USB 5Gbps, 10Gbps, 20Gbps, 40Gbps, and 80Gbps) and separately marked cable power.
- The recurring user problem splits into two intents: “what claims do I need?” and “what does this listing mean?” A full data path adds host, hub, and device limits that the existing cable-only decoder cannot answer.
- Result: requirement-first Cable Selector and path-level Data Bottleneck Checker are GO; generation-name and cable-marking clones are MERGE.

#### C. Display, DisplayPort Alt Mode, DSC, and MST

- VESA documents two- versus four-lane DP over USB-C, DP payload up to 77.37 Gbps, DSC up to about 3:1 in public guidance, and separate adapter/MST/source/sink requirements.
- Competing display bandwidth calculators establish demand, but many collapse uncompressed payload, DSC, lane allocation, and compatibility into one apparent verdict.
- Result: keep the existing uncompressed Display Planner, add a minimum DSC ratio planner and a separate lane-tradeoff planner, and explain topology in a guide/reference.

#### D. Docks, hubs, and adapters

- Microsoft docking guidance explicitly models host delivery plus downstream power allocations and documents DP Alt Mode/dock requirements. Apple directs users to model-specific external-display limits. USB4 and Thunderbolt dynamically tunnel several protocols rather than behaving like a simple conventional Alt Mode lane split.
- Search results and community posts show repeated pre-purchase dock-selection demand, but exact model selectors are catalog-limited and cannot infer missing host/GPU/OS/chipset facts.
- Result: requirements and explicit power arithmetic are GO; an exact dock compatibility verdict remains HOLD.

#### E. Troubleshooting

- Recurring symptoms remain slow/no charge, no/low display mode, second-display failures, data bottlenecks, and intermittent disconnects.
- Result: the existing path-aware Troubleshooter remains the central isolation tool. Charging/data/display workbenches link into it; symptom-specific copies are MERGE.

#### F. Selection and pre-purchase decisions

- The strongest safe selection pattern is requirement-first: derive a minimum specification checklist, reject missing claims, then verify an exact model manually.
- Result: Cable Requirement Selector and Dock Requirement Builder are GO. Manufacturer/device databases and affiliate comparators remain HOLD pending provenance, identifiers, update cadence, and correction workflows.

### Public sources and competition reviewed

- USB-IF Cables and Connectors: `https://www.usb.org/cable_connector`
- USB-IF cable compliance updates: `https://compliance.usb.org/index.asp?Format=Standard&UpdateFile=Cables+and+Connectors`
- USB-IF USB4 overview: `https://www.usb.org/usb4`
- USB-IF PPS public announcement: `https://www.usb.org/node/585`
- VESA DisplayPort FAQ: `https://www.displayport.org/faq/`
- Intel Thunderbolt Technology: `https://www.thunderbolttechnology.net/tech`
- Microsoft Docking: `https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/docking`
- Microsoft Display support: `https://learn.microsoft.com/en-us/windows-hardware/design/component-guidelines/display`
- Apple Connect displays to your Mac: `https://support.apple.com/en-us/102555`
- Competition examples reviewed: Utilities Bunker USB PD Profiles Calculator, 3C Compass Charger Power Budget Calculator, EmbeddedCalc Display Bandwidth Calculator, and Club3D Bandwidth Calculator. These confirm intent and competition; technical rules in this release rely on primary sources above.

### Implementation

- Added eight independent interactive tools:
  1. `tools/pps-range-checker/` — one requested voltage/current point against one PPS APDO range and power ceiling.
  2. `tools/pd-requirement-builder/` — required current, 3 A/5 A cable class, and SPR/EPR boundary from a documented operating point.
  3. `tools/cable-selector/` — minimum power, data, video, and USB4/Thunderbolt cable claims from the intended job.
  4. `tools/data-path-checker/` — weakest declared link across host, cable, hub/adapter, and device with a visible user-selected overhead.
  5. `tools/dsc-requirement-planner/` — minimum arithmetic DSC ratio and a clearly labeled 3:1 planning boundary.
  6. `tools/usb-c-lane-planner/` — conventional two-/four-lane DP Alt Mode tradeoff and native USB 3 preservation.
  7. `tools/dock-requirement-builder/` — OS-aware display topology, host power, data class, PCIe, and USB-graphics shopping checklist.
  8. `tools/hub-power-budget/` — explicit supply, host, dock reserve, and downstream-device arithmetic without invented allocation.
- Added four workbenches: `tools/charging/`, `tools/cables/`, `tools/displays/`, and `tools/docks/`.
- Added four guides: `guides/usb-pd-pps/`, `guides/cable-labels/`, `guides/display-dsc-mst/`, and `guides/dock-buying-checklist/`.
- Added two focused references: `references/power-delivery/` and `references/link-payloads/`.
- Expanded Home, Tools, Guides, References, `llms.txt`, and sitemap navigation/inventory.
- Extended shared `assets/app.js` with eight calculators and changed the shared numeric parser so an empty field is invalid rather than silently becoming zero.
- Bumped the shared JavaScript query to `20260811d` on all public HTML pages.
- Preserved static HTML/CSS/vanilla JavaScript, GitHub Pages, GA4 `G-8PFRRXPGEF`, contact `canghun13@naver.com`, current visual identity, and explicit confidence boundaries.

### Changed files

- Shared behavior: `assets/app.js`.
- New tools: the eight directories listed above.
- New workbenches: the four `tools/` cluster directories listed above.
- New guides: the four `guides/` directories listed above.
- New references: the two `references/` directories listed above.
- Expanded hubs and entry points: `index.html`, `tools/index.html`, `guides/index.html`, `references/index.html`.
- Discovery: `sitemap.xml`, `llms.txt`.
- Cache-buster only: the remaining pre-existing public HTML files.
- Operating record: `handover.md`.

### Final inventory for this implementation

- Public HTML files: **33** (up from 15).
- Indexable/sitemap pages: **32** (up from 14); 404 remains non-indexable.
- Interactive tools: **13** (five existing + eight new).
- Problem workbenches: **4** plus the main Tools hub.
- Standalone guides: **6** plus the Guides hub.
- Focused reference pages: **2** plus the References/method hub.
- Comparison/product pages: **0**; no thin affiliate or model-database layer was added.

### Local QA

- Automated verifier: PASS for 33 public HTML files and 32 indexable sitemap URLs.
- Internal links/assets, unique titles, descriptions, canonical URLs, Open Graph, exactly one H1, parseable JSON-LD, duplicate IDs, and GA4 loader/config exactly once: PASS.
- `robots.txt` allows crawling and names the sitemap; `CNAME` is `cablechecklab.com`: PASS.
- Shared JavaScript syntax with the bundled Node runtime and `git diff --check`: PASS.
- Eight new tools: default result, changed-input recalculation, boundary state, empty and zero handling, no NaN/Infinity, Reset, Copy, and Print control: PASS.
- Boundary examples passed: PPS range mismatch; 3 A and outside-SPR PD points; >240 W cable target; data-path bottleneck; DSC no-compression and >3:1 states; two-lane and over-four-lane states; baseline and >240 W dock requirements; exact/tight and short dock power budgets.
- Five existing tools: baseline, changed-input recalculation, empty invalid input where applicable, Reset, and no NaN/Infinity regression: PASS.
- Copy clipboard output verified; shared Print action invoked without a JavaScript error or blocking dialog: PASS.
- Horizontal overflow and mobile navigation: PASS on Home, Tools hub, PPS Range Checker, and Dock Requirement Builder at 390, 768, 900, 1024, 1280, and 1440 px.
- Visual review: PASS for the Dock Requirement Builder at 390 px and DSC Requirement Planner at 1440 px.
- Browser console: zero errors/warnings across all eight new tool routes after the final local code revision.

### Git and deployment

- Start commit: `7916830b0f987bd7b806ae7473171bc18ef02879`.
- Implementation commit: `85c8b815891fa30b646a6ac912cbafb51df4df0e` (`Expand USB-C planning workbenches`).
- Implementation push: successful; GitHub `main` advanced from `7916830b` to `85c8b815`.
- GitHub Pages implementation deployment: `pages build and deployment` run #`31490502499` completed successfully for `85c8b815891fa30b646a6ac912cbafb51df4df0e`.
- Production HTTP verification: Home, sitemap, and robots returned 200; sitemap contained 32 URLs and every URL returned 200; Home referenced `app.js?v=20260811d`.
- Production browser verification: PPS range mismatch, DSC no-compression boundary, dock-power shortfall, and existing Charge Check bottleneck recalculated correctly; Tools hub mobile menu and horizontal overflow passed at 390 px; representative production console warnings/errors: zero.
- Final handover commit: the commit containing this deployment record; resolve with `git log -1 --format=%H` after the final documentation commit because a commit cannot contain its own hash.
- Finalization requirement: push the handover commit, wait for its Pages run, then verify local HEAD, `origin/main`, and actual remote `main` are identical and the working tree is clean. The resolved values belong in the final task report.

### Next real work after this expansion

1. Submit/confirm the expanded sitemap in Search Console and collect query/page data; use GA4 to compare workbench entry, tool starts, and copied results.
2. Improve or merge tools only when behavioral data shows a journey problem; do not chase the eventual 25–35-tool range with keyword clones.
3. If model-level demand becomes strong, first define provenance, stable identifiers, refresh cadence, manufacturer/manual source rules, uncertainty labels, and correction workflow before promoting the device database or exact dock checker from HOLD.
4. Revisit the adapter-chain checker only if search and troubleshooting data show a distinct pre-purchase intent that cannot be served by Cable Decoder, Dock Builder, and Troubleshooter.
5. Re-review USB-IF, VESA, Thunderbolt, Microsoft, and Apple public guidance when standards or OS display behavior materially changes.

## 2026-08-11 USB4, video-adapter, and isolation expansion

### Start state

- Repository path on this computer: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Branch: `main`; remote: `https://github.com/canghun13/cablechecklab.git`.
- Start local HEAD: `9ffcf0721e7d7422d6a3f719b74a07fb24e610c9`.
- Start `origin/main`: `9ffcf0721e7d7422d6a3f719b74a07fb24e610c9`.
- Start actual GitHub `main` from `git ls-remote`: `9ffcf0721e7d7422d6a3f719b74a07fb24e610c9`.
- Start tree: clean and synchronized; no pull was required.
- Verified starting inventory: **33 public HTML files**, **32 indexable/sitemap pages**, **13 interactive tools**, four problem workbenches plus the Tools hub, six standalone guides plus the Guides hub, and two focused references plus the References hub.

### Expansion judgment

- This was not an observation-only stage. Current official documentation and recurring user failures supported a feature-first expansion around USB4/Thunderbolt, directional video conversion, MST topology, exact USB PD profile evidence, and direct-versus-dock isolation.
- The release deliberately avoids product recommendations and exact-model verdicts. Every new tool consumes user-entered public declarations, transparent budgets, or A/B observations and preserves unknowns.
- **29 candidate concepts reviewed: 9 GO, 8 MERGE, 8 HOLD, 4 REJECT.**

#### GO — implemented

1. USB4 Feature Path Checker — weakest declared rate plus explicit display/PCIe/USB/mixed-workload feature states.
2. USB4 Tunnel Budget Planner — transparent display, USB, and PCIe planning budgets with a visible usable-share control.
3. Video Adapter Direction Checker — same-signal, DP++ passive, active conversion, reverse conversion, and USB graphics categories.
4. MST Daisy Chain Checker — OS policy, source/intermediate MST roles, display count, and shared payload.
5. USB PD Fixed Profile Matcher — exact fixed voltage and sufficient current against up to four PDO rows.
6. Multi-port Scenario Comparator — two exact manufacturer-table rows across four ports.
7. Direct vs Dock Isolation Matrix — A/B power, data, and video observations.
8. USB-C Port Capability Decoder — data, power direction, display, PCIe, USB4, contradictions, and preserved unknowns.
9. Video Feature Chain Checker — source/adapter/display support for HDR, VRR, HDCP, audio, and DSC, with an explicit Not required state.

#### MERGE

- A separate Thunderbolt cable selector merges into Cable Requirement Selector plus USB4 Feature Path Checker.
- A USB4/Thunderbolt generation-name decoder merges into Port Capability Decoder and the USB4 reference.
- A mixed-resolution display calculator remains part of Display Link Planner; the formula is not an independent product.
- A high-refresh external-display checker merges into the existing payload/DSC planners plus Adapter Direction and Feature Chain checks.
- Symptom-specific power-only, data-only, and video-only dock pages merge into Direct vs Dock Isolation plus the existing Troubleshooter.
- A standalone 3 A/5 A/EPR calculator remains inside PD Requirement Builder.
- A fixed-profile text decoder is represented by the structured Fixed Profile Matcher instead of a second thin tool.
- A generic dual-monitor dock checker merges into MST Chain Checker and Dock Requirement Builder.

#### HOLD

- Device/model charging database — no maintained, normalized model/source process.
- Exact dock compatibility checker — host/GPU/OS/firmware/chipset/topology data remain model-specific.
- Cable-length limit calculator — exact signaling target and active/passive/certified construction remain decisive.
- Product comparison or affiliate layer — no verified catalog, correction process, or traffic-driven editorial scope.
- Exact USB4/Thunderbolt eGPU or PCIe-enclosure model compatibility database.
- Exact video-adapter model database.
- Exact MST monitor-chain database.
- External-device performance predictor; workload, host controller, storage, tunnel contention, and drivers prevent a safe generic verdict.

#### REJECT

- Connector-only USB4/Thunderbolt compatibility verdict.
- “HDMI version guarantees every feature” checker.
- Browser hardware/e-marker auto-detection; a normal web page cannot inspect the required hardware state.
- Raw unit converters, automatic USB4 allocation prediction, reverse-passive-cable assumptions, and keyword clones.

### Research findings

- USB-IF describes USB4 as carrying multiple simultaneous USB/data/display protocols with dynamic sharing and scaling to mutual capability. This supports feature-path and transparent-budget tools, not a connector-only verdict.
- Microsoft documents USB4 connection-manager tunnel/bandwidth handling, dynamic DisplayPort allocation, and an explicit allocation planning ceiling of 90% of the link in its Windows design model. The Tunnel Budget Planner exposes the percentage and labels 90% as a Windows planning default rather than universal efficiency.
- Microsoft’s USB-C and external-monitor troubleshooting guidance repeatedly recommends a certified/direct cable path and bypassing docks, adapters, and dongles. Community reports repeatedly show charging/Ethernet working while dock video fails, validating a structured A/B isolation matrix.
- VESA states that DisplayPort over USB-C can adapt to DP/HDMI/DVI/VGA; simple DP-to-HDMI/DVI paths depend on DP++ while other paths require protocol conversion. This supports a direction-first tool.
- VESA and Microsoft support ordinary MST planning, while Apple’s model-specific display guidance reinforces keeping universal Mac/dock/display-count verdicts out of the tool.
- USB-IF public PD material distinguishes fixed Source Capabilities, PPS/APDO behavior, EPR up to 240 W, and 60 W/240 W cable markings. Fixed-PDO matching is independent from the existing PPS and whole-chain tools.
- Intel public Thunderbolt 4 and 5 material supplies certification/rate context: Thunderbolt 4 is a 40 Gbps class with documented minimums; Thunderbolt 5 is 80 Gbps bidirectional with a display-heavy 120 Gbps transmit mode. The tools do not treat the 120 mode as symmetric data.
- Competition remains strongest in formula calculators and articles. The clearest gap is user-entered feature paths, direction classification, topology checks, exact table comparisons, and A/B-result interpretation.

### Primary sources reviewed

- USB-IF USB4: `https://www.usb.org/usb4`
- USB-IF USB Power Delivery: `https://www.usb.org/usb-charger-pd`
- USB-IF Cables and Connectors: `https://www.usb.org/cable_connector`
- Microsoft USB4 connection manager: `https://learn.microsoft.com/en-us/windows-hardware/design/component-guidelines/usb4-intro-to-connection-manager`
- Microsoft USB4 PCIe tunneling test: `https://learn.microsoft.com/en-us/windows-hardware/test/hlk/testref/7d627bf0-25f3-4564-b554-b2a3450e2bcf`
- Microsoft USB-C troubleshooting: `https://support.microsoft.com/en-us/windows/hardware/fix-usb-c-problems-in-windows`
- Microsoft external-monitor troubleshooting: `https://support.microsoft.com/en-us/windows/hardware/display-graphics/troubleshoot-external-monitor-connections-in-windows`
- VESA DisplayPort FAQ: `https://www.displayport.org/faq/`
- VESA Get Connected: `https://www.displayport.org/get-connected/`
- HDMI specification overview: `https://www.hdmi.org/spec/hdmi2_1`
- Intel Thunderbolt 4 public deck: `https://www.thunderbolttechnology.net/sites/default/files/intel-thunderbolt4-announcement-press-deck.pdf`
- Intel Thunderbolt 5 brief: `https://www.thunderbolttechnology.net/sites/default/files/Thunderbolt_5_TechBrief_2023_09_12.pdf`
- Apple HDMI connections: `https://support.apple.com/en-us/108928`
- Apple display connections: `https://support.apple.com/102555`

### Implementation

- Added nine independent interactive tools: `tools/usb4-feature-path/`, `tools/usb4-tunnel-budget/`, `tools/video-adapter-direction/`, `tools/mst-chain-checker/`, `tools/pd-fixed-profile-matcher/`, `tools/multiport-scenario-comparator/`, `tools/direct-dock-isolation/`, `tools/port-capability-decoder/`, and `tools/video-feature-chain/`.
- Added two problem workbenches: `tools/usb4-thunderbolt/` and `tools/video-adapters/`.
- Added four standalone guides: `guides/usb4-thunderbolt-planning/`, `guides/video-adapter-direction/`, `guides/mst-daisy-chain/`, and `guides/pd-profiles-port-tables/`.
- Added two focused references: `references/usb4-tunneling/` and `references/video-conversion-features/`.
- Rebuilt the Home, Tools, Charging, Cables, Displays, Docks, Guides, and References hub journeys around six workbenches and 22 tools.
- Extended `assets/app.js` with nine tool controllers; added only the small responsive feature-chain grid extension to `assets/styles.css`.
- Updated `sitemap.xml`, `llms.txt`, metadata/count copy, internal links, and the shared JavaScript cache key to `20260811e` on every public HTML page.
- Preserved static HTML/CSS/vanilla JavaScript, GitHub Pages, GA4 `G-8PFRRXPGEF`, contact `canghun13@naver.com`, and the existing visual identity.

### Changed files

- Shared behavior/style: `assets/app.js`, `assets/styles.css`.
- New pages: the nine Tool, two Workbench, four Guide, and two Reference directories listed above.
- Rebuilt hubs/entry points: `index.html`, `tools/index.html`, `tools/charging/index.html`, `tools/cables/index.html`, `tools/displays/index.html`, `tools/docks/index.html`, `guides/index.html`, `references/index.html`.
- Discovery: `sitemap.xml`, `llms.txt`.
- Cache-key-only edits: remaining pre-existing public HTML files.
- Operating record: `handover.md`.

### Final inventory for this implementation

- Public HTML files: **50** (up from 33).
- Indexable/sitemap pages: **49** (up from 32); 404 remains non-indexable.
- Interactive tools: **22** (13 existing + 9 new).
- Problem workbenches: **6** plus the main Tools hub.
- Standalone guides: **10** plus the Guides hub.
- Focused reference pages: **4** plus the References/method hub.
- Comparison/product pages: **0**; no affiliate catalog or model database was added.

### Local QA

- Automated verifier: PASS for **50 public HTML files** and **49 indexable sitemap URLs**.
- Internal links/assets, duplicate IDs, unique titles, descriptions, canonical URLs, Open Graph, exactly one H1, parseable JSON-LD, sitemap parity, robots sitemap declaration, and GA4 loader/config exactly once: PASS.
- Shared JavaScript syntax with the bundled Node runtime and `git diff --check`: PASS.
- Nine new tools: normal default result, targeted changed-result scenario, empty/zero handling where inputs permit it, explicit failure/boundary result, no NaN/Infinity, Reset, Copy, and Print control: PASS.
- Targeted new-tool states passed: broken USB4 feature path, USB4 budget shortfall, DP++ passive path, blocked MST payload, insufficient fixed-PDO current, port disabled between charger scenarios, direct-pass/dock-fail isolation, conflicting port claims, and blocked video feature chain.
- Video Feature Chain post-QA improvement: explicit `Not required` state added and verified without treating excluded features as supported.
- All 13 existing tools: changed-input recalculation, Reset, and no NaN/Infinity regression: PASS.
- Copy clipboard state verified for all nine new tools. Shared Print handler invoked on representative new tools without JavaScript error or blocking dialog; every new page has exactly one Print control.
- Horizontal overflow: PASS on Home, Tools hub, Video Feature Chain, and Fixed Profile Matcher at 390, 768, 900, 1024, 1280, and 1440 px.
- Mobile navigation: PASS at 390 px with the menu visible/open and `aria-expanded=true`; desktop navigation breakpoint correct at 1024 px and above.
- Visual review: PASS for Video Feature Chain/mobile menu at 390 px and Tools hub at 1440 px.
- Browser console warnings/errors: zero after final local revision.

### Git and deployment

- Start commit: `9ffcf0721e7d7422d6a3f719b74a07fb24e610c9`.
- Implementation commit: `5f7897052d972c57adce74eb0eff7ad50107b32f` (`Expand USB4 and video planning tools`).
- Implementation push: successful; GitHub `main` advanced from `9ffcf072` to `5f789705`.
- GitHub Pages implementation deployment: `pages build and deployment` run #`31494778278` completed successfully for `5f7897052d972c57adce74eb0eff7ad50107b32f`.
- Production HTTP verification: Home, sitemap, and robots returned 200; sitemap contained 49 URLs and every sitemap URL returned 200; Home referenced `app.js?v=20260811e` and displayed 22 tools.
- Production browser verification: USB4 planning shortfall, DP++ passive path, fixed-profile current mismatch, direct-versus-dock isolation, Video Feature Chain Not required, and existing Charge Check bottleneck recalculated correctly. Tools hub mobile menu and horizontal overflow passed at 390 px; representative production console warnings/errors: zero.
- Final handover commit: the commit containing the completed deployment record; resolve with `git log -1 --format=%H` after the documentation commit because a commit cannot contain its own hash.

### Next real work after this expansion

1. Confirm or submit the 49-URL sitemap in Search Console, then let query/page and GA4 journey data accumulate. Use evidence to improve weak workbench-to-tool paths rather than add keyword variants.
2. Add analytics events for meaningful tool interactions (calculate/change, Copy, and outbound Guide/Reference transitions) only after defining a compact event taxonomy; GA4 pageview collection is already present.
3. Keep device/model charging data, exact dock/eGPU/adapter/MST compatibility databases, cable-length prediction, and affiliate comparison on HOLD until provenance, stable identifiers, update cadence, uncertainty labels, and correction workflows are defined.
4. Re-review USB-IF, VESA, HDMI, Intel, Microsoft, and Apple public guidance when standards, certification requirements, or OS display/tunnel behavior materially changes.
5. Use Search Console/GA4 and support feedback to decide whether the next release should deepen one current tool, merge a weak journey, or define a maintainable data product. Do not target a page count by itself.

## 2026-08-11 shared-USB, role, monitor, and failure-isolation expansion

### Start state

- Repository path on this computer: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Branch: `main`; remote: `https://github.com/canghun13/cablechecklab.git`.
- Start local HEAD: `da41758da5d0b3c6fbf93804387cb5622a21b934`.
- Start `origin/main`: `da41758da5d0b3c6fbf93804387cb5622a21b934`.
- Start actual GitHub `main` from `git ls-remote`: `da41758da5d0b3c6fbf93804387cb5622a21b934`.
- Start tree: clean and synchronized after `git fetch origin main`; no pull was required.
- The previously reported `7e11d791b6e5a8656ed8d86ca5453910ecca9895` was correctly treated as historical rather than forced over the newer remote state.
- Verified starting inventory: **50 public HTML files**, **49 indexable/sitemap pages**, **22 interactive tools**, six problem workbenches plus the Tools hub, ten standalone guides plus the Guides hub, and four focused references plus the References hub.

### Expansion judgment

- The existing 22 Tool controllers and inputs were inspected before candidate selection. The strongest remaining gaps were multi-device sharing, endpoint role direction, fallback/dropout isolation, and the composite one-cable monitor intent—not another thin label decoder or arithmetic clone.
- Search Console and GA4 behavior data are still too young to justify keyword-driven copies, but current official troubleshooting guidance and recurring public problem reports support these six problem-first additions without a private model database.
- **35 candidate concepts reviewed: 6 GO, 14 MERGE, 11 HOLD, 4 REJECT.**

#### GO — implemented

1. USB Hub Shared Bandwidth Planner — adds simultaneous workload demands against one explicit upstream pool and a visible planning share; independent from the single-chain Data Path Checker and USB4 tunnel budget.
2. USB-C Role Match Checker — compares two endpoints and intended power/data/display direction; independent from recording one port's capabilities.
3. USB4 Fallback Speed Isolator — compares intended and observed link classes with host/cable/device declarations, intermediary/direct controls, and operating-system enumeration evidence.
4. High-Refresh Display Failure Isolator — combines exact payload/capacity with lower-mode, direct, dock, and end-to-end feature controls.
5. USB Peripheral Dropout Isolator — ranks direct, external-power, lighter-load, alternate-cable, failure-scope, and idle/wake evidence.
6. One-Cable USB-C Monitor Planner — combines three declared video segments with separate display, laptop-charging, and monitor-USB budgets for a distinct pre-purchase job.

#### MERGE

- USB speed-label decoding stays in Port Capability Decoder and Cable Capability Decoder.
- Charging logo/watt-label interpretation stays in Cable Capability Decoder.
- USB4/Thunderbolt generation naming stays in Port Capability Decoder and the USB4 reference.
- 3 A/5 A/EPR cable requirements stay in PD Requirement Builder.
- Cable claim-consistency screening stays in Cable Capability Decoder.
- Cable feature matrices stay in Cable Requirement Selector.
- Mixed-resolution display splitting stays in Display Link Planner.
- An inverse “maximum refresh” calculator stays merged with the same Display Link Planner arithmetic.
- Dock upstream requirements merge into Dock Requirement Builder and the new shared-bandwidth planner.
- SSD-path bottleneck checking stays in Data Path Checker.
- Bus-powered/self-powered numeric power stays in Hub Power Budget.
- Charger/cable current matching stays in Charge Check and PD Requirement Builder.
- A generic direct-versus-dock high-refresh page merges into the new high-refresh isolator and current display tools.
- Charger disconnects after adding a port remain in Multi-port Scenario Comparator and the central Troubleshooter.

#### HOLD

- Device/model charging database — no maintained normalized model/source process.
- Exact dock compatibility checker — host/GPU/OS/firmware/chipset/topology data remain model-specific.
- Cable-length limit calculator — signaling target plus active/passive/certified construction remains decisive.
- Product comparison or affiliate layer — no verified catalog or traffic-driven editorial scope.
- Exact USB4/Thunderbolt eGPU or PCIe-enclosure model compatibility database.
- Exact video-adapter model database.
- Exact MST monitor-chain database.
- External-device performance predictor.
- Active-cable compatibility database — exact controller, firmware, length, and power behavior need maintained product evidence.
- Automatic host-controller topology mapper — a static browser page lacks the required privileged system telemetry.
- Exact USB-C KVM/monitor compatibility database — exact models, firmware, wake, EDID, and host policy require maintained testing data.

#### REJECT

- Connector-only endpoint-role inference.
- Automatic negotiated USB/USB4 speed detection from an ordinary browser page.
- A universal USB efficiency factor or guaranteed per-port speed promise.
- A standalone raw transfer-time calculator detached from path and workload evidence.

### Research findings

- USB-IF separates power roles (Source/Sink/DRP) from data roles (DFP/UFP/DRD), with USB PD capable of role swaps when products support the policy. This supports an endpoint comparison while ruling out connector-only inference.
- Microsoft states that USB bandwidth is finite, can be shared by multiple client drivers, and is hard to predict exactly. Its USB FAQ documents SuperSpeed storage falling back through a USB 2 hub and separate USB 2/SuperSpeed hub components. This supports a transparent workload budget, not a promised throughput percentage.
- Microsoft USB-C troubleshooting identifies wrong ports, non-USB4 cables, non-USB4 intermediary devices, and insufficient power as distinct failure layers. Windows USB4 settings can expose attached USB4 hubs/devices and capabilities on supported systems.
- Microsoft selective-suspend documentation makes idle/wake a useful controlled clue while not proving one root cause. Community problem reports separately repeat under-load, add-device, and all-functions-drop patterns.
- VESA public material documents higher-refresh DisplayPort configurations and DSC use; Apple separately warns that exact modes/features can depend on the full adapter path. This supports an exact-mode isolator rather than an HDMI/DisplayPort version guarantee.
- Existing competition includes bandwidth articles and catalog-limited dock checkers such as 3C Compass. A transparent shared-device workload planner and evidence-first isolators remain meaningfully independent from catalog matching.

### Primary sources reviewed

- USB-IF USB Type-C System Overview: `https://www.usb.org/sites/default/files/D1T1-2%20-%20USB%20Type-C%20System%20Overview.pdf`
- USB-IF USB4: `https://www.usb.org/usb4`
- Microsoft USB bandwidth allocation: `https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-bandwidth-allocation`
- Microsoft USB FAQ: `https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-faq--introductory-level`
- Microsoft Fix USB-C problems: `https://support.microsoft.com/en-us/windows/hardware/fix-usb-c-problems-in-windows`
- Microsoft USB4 settings enablement: `https://learn.microsoft.com/en-us/windows-hardware/design/component-guidelines/usb4-settings-enablement`
- Microsoft USB selective suspend: `https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-selective-suspend`
- VESA DisplayPort 2.0 high-refresh/DSC overview: `https://www.displayport.org/pr/vesa-publishes-displayport-2-0-video-standard-enabling-support-for-beyond-8k-resolutions-higher-refresh-rates-for-4k-hdr-and-virtual-reality-applications/`
- VESA DisplayPort FAQ: `https://www.displayport.org/faq/`
- Apple HDMI connection guidance: `https://support.apple.com/en-us/108928`
- Apple Adaptive Sync displays: `https://support.apple.com/en-asia/102144`
- 3C Compass USB-C dock monitor checker (competition review): `https://3ccompass.com/tools/usb-c-dock-monitor-checker`

### Implementation

- Added six independent interactive Tools: `tools/usb-hub-bandwidth-planner/`, `tools/usb-c-role-match/`, `tools/usb4-fallback-isolator/`, `tools/high-refresh-display-isolator/`, `tools/usb-peripheral-dropout-isolator/`, and `tools/one-cable-monitor-planner/`.
- Added three supporting Guides: `guides/usb-hub-shared-bandwidth/`, `guides/usb-c-roles-one-cable-monitor/`, and `guides/usb4-fallback-dropout-isolation/`.
- Added one focused Reference: `references/usb-data-roles-fallback/`.
- Extended `assets/app.js` with six controllers. Every result distinguishes entered/calculated evidence from live negotiation or exact-model proof and rejects invalid numeric states without emitting NaN/Infinity.
- Updated Home, Tools, Cables/Data, USB4/Thunderbolt, Displays, Docks/Hubs, Guides, and References journeys. No seventh workbench was added because all six Tools fit existing user systems.
- Updated `sitemap.xml`, `llms.txt`, page-count metadata, and the shared JavaScript cache key from `20260811e` to `20260811f` on all public HTML.
- Preserved static HTML/CSS/vanilla JavaScript, GitHub Pages, GA4 `G-8PFRRXPGEF`, contact `canghun13@naver.com`, visual identity, existing tools, and explicit uncertainty boundaries.

### Changed files

- Shared behavior: `assets/app.js`.
- New pages: the six Tool, three Guide, and one Reference directories listed above.
- Expanded hubs/entry points: `index.html`, `tools/index.html`, `tools/cables/index.html`, `tools/usb4-thunderbolt/index.html`, `tools/displays/index.html`, `tools/docks/index.html`, `guides/index.html`, and `references/index.html`.
- Discovery: `sitemap.xml`, `llms.txt`.
- Cache-key-only edits: remaining pre-existing public HTML files.
- Operating record: `handover.md`.

### Final inventory for this implementation

- Public HTML files: **60** (up from 50).
- Indexable/sitemap pages: **59** (up from 49); 404 remains non-indexable.
- Interactive tools: **28** (22 existing + 6 new).
- Problem workbenches: **6** plus the main Tools hub.
- Standalone guides: **13** plus the Guides hub.
- Focused reference pages: **5** plus the References/method hub.
- Comparison/product pages: **0**; no model database, affiliate catalog, or unsafe exact-product verdict was added.

### Local QA

- Automated verifier: PASS for **60 public HTML files** and **59 indexable sitemap URLs**.
- Internal links/assets, duplicate IDs, unique titles, descriptions, canonical URLs, Open Graph, exactly one H1, parseable JSON-LD, sitemap parity, and GA4 loader/config exactly once: PASS.
- Shared JavaScript syntax with the bundled Node runtime and `git diff --check`: PASS.
- All six new Tools: normal default state, changed-input recalculation, explicit invalid input, Reset, no NaN/Infinity, Copy, and Print handler: PASS.
- Targeted results passed: shared-pool fit/shortfall; role alignment/mismatch; USB4 fallback evidence/target state; direct-pass dock-fail high-refresh isolation; dropout evidence/insufficient controls; one-cable fit/power blocker.
- Copy result text was read back from the browser clipboard. Print was invoked on a representative new Tool without a JavaScript error.
- Full browser regression: all **28** interactive Tool routes produced a non-Ready initial result, no NaN/Infinity, and zero console errors/warnings.
- Horizontal overflow and responsive layout: PASS on the complex One-Cable Monitor Planner at 390, 768, 900, 1024, 1280, and 1440 px; mobile result stacking through 900 px and desktop sticky result from 1024 px behaved as designed.
- Tools hub mobile menu: PASS at 390 px with visible open navigation and `aria-expanded=true`; Tools hub desktop layout and all 34 hub cards fit without overflow at 1440 px.

### Git and deployment

- Start commit: `da41758da5d0b3c6fbf93804387cb5622a21b934`.
- Implementation commit: `2cd48722a660a2302fe2399a58c9b521f8357bb4` (`Complete first-build USB planning tools`).
- Implementation push: successful; GitHub `main` advanced from `da41758d` to `2cd48722`.
- GitHub Pages implementation deployment: `pages build and deployment` run #`31497233863` completed successfully for `2cd48722a660a2302fe2399a58c9b521f8357bb4`.
- Production HTTP verification: Home, sitemap, and robots returned 200; sitemap contained **59** URLs and every URL returned 200; Home displayed 28 tools and referenced `app.js?v=20260811f`.
- Production browser verification: shared-hub fit/shortfall, role mismatch, USB4 fallback, high-refresh isolation, dropout evidence, one-cable power blocking, and existing Charge Check bottleneck all recalculated correctly. All **28** production Tool routes initialized without NaN/Infinity; Tools mobile menu and horizontal overflow passed at 390 px; representative production console warnings/errors: zero.
- Final commit: the final `main` commit containing the completed deployment record; resolve in the final task report because a commit cannot contain its own hash.

### Next real work after this expansion

1. Treat the first build as **complete** after this release; stop page-count expansion and collect Search Console/GA4 journey evidence for the 59 indexable pages.
2. Define a compact GA4 event taxonomy for meaningful calculate/change, Copy, Reset, and Guide/Reference transitions before adding custom events; pageview GA4 is already present.
3. Use query, landing-page, and support evidence to deepen or merge existing Tools. Do not add role, speed-label, high-refresh, or dock keyword variants that duplicate current logic.
4. Keep all eleven maintained-data/exact-model candidates on HOLD until provenance, stable identifiers, refresh cadence, uncertainty labels, and correction workflows exist.
5. Re-review USB-IF, VESA, Thunderbolt, Microsoft, and Apple public guidance when standards, certification, or operating-system behavior materially changes.

## 2026-08-11 first-build final audit

### Start state

- Repository path on this computer: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Branch: `main`; remote: `https://github.com/canghun13/cablechecklab.git`.
- Start local HEAD: `823720d7cad5d0287093c71eea85469d79b52ea4`.
- Start `origin/main`: `823720d7cad5d0287093c71eea85469d79b52ea4`.
- Start actual GitHub `main` from `git ls-remote`: `823720d7cad5d0287093c71eea85469d79b52ea4`.
- Start tree: clean and synchronized after `git fetch origin main`; no pull was required.
- Verified inventory: **60 public HTML files**, **59 indexable/sitemap pages**, **28 interactive Tools**, six problem workbenches plus the Tools hub, 13 standalone Guides plus the Guides hub, five focused References plus the References hub, and five other public pages.

### Audit judgment

- This was a final audit, not an expansion. No new Tool, Guide, Reference, workbench, comparison, or keyword-variant landing page was added.
- All 28 Tool controllers, inputs, default results, boundaries, and neighboring-tool responsibilities were reviewed. No exact functional duplicate or unsafe model-specific claim was found, so no Tool was merged or removed.
- Eight real defect groups were confirmed and fixed: missing-input coercion in Multi-port Planner; EPR uncertainty not surfaced by two composite charging screens; PPS accepting AVS-range voltages; one 390 px reference-table overflow; four weak primary-Tool breadcrumbs; three workbench footers without direct correction contact; incomplete shared navigation/accessibility on 404; and missing favicon/site identity asset.
- Search Console/GA4 data remains the correct gate for the next product/content decision. The audit did not manufacture new scope merely because behavior data is still young.

### Technical research and corrections

- USB-IF's current Power Delivery overview confirms that the pre-EPR ceiling was 100 W at 20 V/5 A and that EPR adds 28 V, 36 V, and 48 V fixed voltages up to 240 W. Charge Check now labels a matching >100 W wattage path as protocol-unverified until source, sink, and 5 A EPR cable support are confirmed; One-Cable Monitor Planner similarly keeps >100 W monitor charging unverified.
- USB-IF's QuadraMAX release record documents PPS manual requests through 21 V and separately identifies SPR AVS APDO support. PPS Range Checker now caps PPS voltage inputs at 21 V, rejects higher programmable-voltage entries as AVS rather than PPS, and the PD/PPS Guide records the PPS-versus-AVS boundary.
- Primary sources: `https://www.usb.org/usb-charger-pd`, `https://www.usb.org/documents?category%5B0%5D=49&tid_2%5B0%5D=60`, and `https://compliance.usb.org/cv/QuadraMAX/Installer/releasenotes.html`.

### Implementation

- `assets/app.js`: rejects empty Multi-port Planner rows instead of coercing them to zero; adds >100 W EPR uncertainty to Charge Check and One-Cable Monitor Planner; rejects PPS/AVS category mixing above 21 V.
- `assets/styles.css`: fixes narrow-screen prose tables with fixed layout and anywhere wrapping at the existing 640 px breakpoint.
- `tools/pps-range-checker/index.html` and `guides/usb-pd-pps/index.html`: clarify PPS APDO scope, 21 V limit, and AVS distinction.
- `tools/charge-check/`, `tools/multiport-planner/`, `tools/cable-decoder/`, and `tools/display-planner/`: restore their primary workbench in breadcrumbs.
- `tools/charging/`, `tools/displays/`, and `tools/docks/`: add the direct correction contact already used elsewhere.
- `404.html`: adds the shared skip link, menu control, and full primary navigation while retaining `noindex`.
- Added `favicon.svg`, linked it from all 60 HTML pages, and advanced shared CSS/JavaScript cache keys to `20260811g` without changing GA4.
- The inventory remains **60 HTML / 59 indexable / 28 Tools / 6 workbenches / 13 Guides / 5 References**.

### Local QA

- Automated verifier: PASS for **60 public HTML files** and **59 indexable sitemap URLs**.
- Internal links/assets, duplicate IDs, unique titles/descriptions, exact canonical and Open Graph routes, one H1, parseable JSON-LD, sitemap parity, robots/CNAME, and GA4 loader/config exactly once: PASS.
- Only `G-8PFRRXPGEF` and `canghun13@naver.com` are used in public HTML; no accidental localhost, filesystem, placeholder, debug, or extra `noindex` content was found.
- JavaScript syntax, `git diff --check`, UTF-8 character scan, and no NaN/Infinity: PASS.
- Real-browser load audit: all **60** pages loaded with one H1; all **28** Tool routes initialized to a non-Ready result; console errors/warnings: zero.
- Full Tool interaction audit across all **28** Tools covered changed-input recalculation, Reset, Copy, Print, and invalid input where applicable. All passed. The four corrected Tools then received a second targeted final-state pass including empty fields, EPR/AVS boundaries, Reset, clipboard read-back, and Print invocation.
- Cross-tool consistency passed for charging/EPR, display payload/DSC/lane/feature chains, USB4 feature/budget/fallback, dock power/bandwidth, and three troubleshooting/isolation paths. A 140 W scenario now yields EPR-required in PD Requirement Builder, a 240 W/5 A e-marked minimum in Cable Selector, and protocol-unverified in Charge Check.
- Responsive audit: **42 checks** covering seven structurally different pages at 390, 768, 900, 1024, 1280, and 1440 px; no horizontal overflow, H1/header overlap, or result-panel overflow. Mobile navigation passed on Home and 404 with `aria-expanded=true` and visible navigation.
- Favicon, cache key `20260811g`, skip link/navigation on 404, corrected breadcrumbs, workbench contact links, and the formerly overflowing reference table were all rechecked in the browser.

### Git and deployment

- Start commit: `823720d7cad5d0287093c71eea85469d79b52ea4`.
- Audit implementation commit: `343482292bdf1c42043de027468b468574828a27` (`Complete first-build final audit`).
- Implementation push: successful; GitHub `main` advanced from `823720d7` to `34348229`.
- GitHub Pages implementation deployment: `pages build and deployment` run #`31501206545` completed successfully for `343482292bdf1c42043de027468b468574828a27`.
- Production HTTP verification: sitemap returned 200 with **59 URLs**, every sitemap URL returned 200, and robots, `favicon.svg`, `styles.css?v=20260811g`, and `app.js?v=20260811g` returned 200.
- Production browser verification: all **60** public HTML routes loaded with one H1, the expected GA4 loader/config, favicon, canonical where indexable, and no console errors/warnings; all **28** Tools initialized to a finite non-Ready result. The four corrected Tool boundary scenarios returned the intended warning/invalid state. The same 42 representative viewport checks passed in production, and 404 mobile navigation opened with `aria-expanded=true` without overflow.
- Final audit verdict: **PASS**. No unresolved release-blocking defect remains in the audited static site scope.
- Final commit: the final `main` commit containing the completed deployment record; resolve in the final task report because a commit cannot contain its own hash.

### Next real work after the final audit

1. Treat the first build and its final audit as complete. Do not resume page-count expansion without evidence.
2. Confirm or submit the 59-URL sitemap in Search Console, then collect query, landing-page, and GA4 journey evidence.
3. Define a compact GA4 interaction taxonomy before adding calculate/change, Copy, Reset, or Guide/Reference transition events.
4. Use evidence to deepen or merge current journeys. Keep device/model data, exact compatibility databases, cable-length prediction, and comparison/affiliate layers on HOLD until a maintainable evidence model exists.
5. Re-audit public USB-IF/VESA/HDMI/Intel/Microsoft/Apple boundaries only when standards, certification, or operating-system behavior materially changes.

## 2026-08-13 first-expansion gate review

### Start state and inventory

- Repository path: C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository.
- Branch and remote: main at https://github.com/canghun13/cablechecklab.git.
- Start local HEAD, origin/main, and actual GitHub main: 8c8f9f0b66b672dedabfc72a56fc513bc7483a9a.
- Start tree: clean and synchronized after fetch; no pull was required.
- Verified inventory: **60 public HTML files**, **59 indexable/sitemap pages**, **28 interactive Tools**, **6 workbenches**, **13 standalone Guides**, and **5 focused References**.
- The production Tools hub independently exposed the same six workbenches and all 28 direct Tool entries.

### Existing-Tool duplicate audit

All 28 Tool pages and the complete shared controller were inspected before candidate research. Their core responsibilities remain:

- Charging: complete-chain charge fit, fixed PDO matching, PPS range matching, PD requirement building, multi-port allocation, and two-row charger-table comparison.
- Cable/data: requirement selection, cable and port claim decoding, weakest-link data paths, hub shared bandwidth, role matching, and hub power.
- Display/adapters: raw payload, DSC ratio, USB-C lane allocation, MST topology, adapter direction, feature continuity, high-refresh isolation, and one-cable monitor planning.
- USB4/docks: feature-path declarations, tunnel budget, fallback isolation, dock requirement building, direct-versus-dock isolation, dropout isolation, and general troubleshooting.

The audit found no missing explanation severe enough to justify a duplicate landing Tool. The present results consistently distinguish declared/calculated fit from negotiation, exact topology, firmware, and model-specific proof.

### Research scope and sources

- Research date: **2026-08-13**.
- Families searched: power/charging, USB data topology, display topology, USB-C monitors/KVM/switching, docks/hubs, adapters/conversion, troubleshooting, and specification interpretation.
- Candidate set: **35 new workflow candidates**, deliberately excluding old model-database ideas from the count.
- Primary and manufacturer evidence included USB-IF hub interoperability/test material, Microsoft USB topology and bandwidth documentation, Plugable upstream-port guidance, BenQ/Dell monitor-hub guidance, and current ATEN/StarTech/i-tec KVM product requirements.
- Competition included Lightware USB Configurator, ATEN KVM Product Selector, 3C Compass dock/charging tools, existing display calculators, manufacturer selectors, and hardware USB test tools.
- Recurring intent was checked against current support articles and community threads for USB-C KVM selection, monitor upstream/downstream confusion, hub depth, display loss under load, and SSD/Ethernet contention.
- Representative sources:
  - https://www.usb.org/sites/default/files/USB-IFTestProc1_3.pdf
  - https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/usbioctl/ns-usbioctl-_usb_port_connector_properties
  - https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-bandwidth-allocation
  - https://www.lightware.com/en/products/Software/usb20-1gbe-configurator
  - https://kb.plugable.com/en_US/which-usb-c-port-can-be-used-to-connect-to-my-computer
  - https://www.benq.com/en-us/support/downloads-faq/faq/product/application/monitor-faq-kn-00017.html
  - https://www.dell.com/support/kbdoc/en-us/000189810/usb-downstream-ports-on-a-dell-monitor-do-not-work
  - https://eservice.aten.com/eSupport/Common/supportHome/wizard/list.do?lang=en_US&linkId=customerProductWizard

### Candidate decisions

The compact records below cover the required problem/user, inputs/output, intent/competition, difference from existing Tools, technical/maintenance basis, and decision.

| # | Candidate | Problem and user | Inputs → useful output | Intent / competition | Existing difference; basis / maintenance | Decision and reason |
|---:|---|---|---|---|---|---|
| 1 | Charger port-table interpreter | Multi-device buyers reading mode tables | Declared table + loads → viable row | Clear; 3C Compass and charger calculators | Same evidence and result as Multi-port Scenario Comparator; low maintenance | **MERGE** — add parsing help only when evidence warrants it |
| 2 | Power-sharing mode selector | Users choosing which devices occupy which ports | Port modes + device targets → assignment | Repeated buyer intent; strong charger tools | Multi-port Planner already performs the decision; public tables vary | **MERGE** — no independent output |
| 3 | EPR path preflight | Buyers planning >100 W | source/sink/cable voltage-current claims → missing link | Clear EPR intent; many guides | PD Requirement Builder, Cable Selector, and Charge Check already form this chain | **MERGE** — surface a cross-link, not a fourth calculator |
| 4 | AVS range matcher | Advanced PD users checking AVS | requested V/A + APDO bounds → declared fit | Niche technical intent; compliance tools dominate | Natural sibling input mode to PPS Range Checker; public declared bounds suffice | **MERGE** — same range logic |
| 5 | Monitor PD plus peripheral budget | One-cable monitor users | monitor input/output and device loads → power headroom | Clear support intent | One-Cable Monitor Planner plus Hub Power Budget already cover it | **MERGE** — combine journey, not URL |
| 6 | Upstream/downstream power-role conflict | Users confused by powered but inactive ports | port roles + intended power flow → role mismatch | Recurring monitor/dock support issue | USB-C Role Match already returns the mismatch | **MERGE** — add monitor wording |
| 7 | Cable voltage-drop estimator | Long/high-current cable buyers | resistance or AWG/length/current → estimated drop | Calculator competition and lab testers exist | User rarely has conductor resistance; negotiated charging and cable construction prevent safe consumer verdicts | **HOLD** — false precision risk |
| 8 | USB hub tier-depth preflight | AV/desk users chaining hubs/docks/monitors | known intervening hub stages + unknown flags → within five-hub path or cannot determine | Real failures; Lightware visualizes exact topology | Distinct from bandwidth/power; USB-IF supports the limit; hidden internal hubs must remain unknown | **GO candidate** — independent, safe preflight with explicit unknowns |
| 9 | USB2/SuperSpeed dual-bus planner | Users mixing slow and fast peripherals | per-device bus class/demand → two pool summaries | Technical intent; topology viewers compete | Microsoft documents separate USB2 and SuperSpeed hub implementations; best as Hub Shared Bandwidth expansion | **MERGE** — one existing tool should model both pools |
| 10 | Transaction-translator planner | Audio/HID users behind USB2 hubs | speed, periodic load, TT mode/topology → risk note | Low search intent; specialist material | Exact scheduling needs descriptors/topology; Microsoft notes prediction difficulty | **HOLD** — too telemetry-dependent |
| 11 | Multi-hub branch bottleneck | Users with nested branches | tree branches + rates → weakest shared segment | Repeated topology problem | Extension of Data Path + Shared Bandwidth; a separate page would repeat bottleneck math | **MERGE** |
| 12 | Camera + SSD + Ethernet workload planner | Dock users under simultaneous load | three demands + upstream → headroom | Strong problem wording and calculators | Merely a preset for Hub Shared Bandwidth | **MERGE** — keyword scenario, not independent logic |
| 13 | Host-controller topology planner | Power users asking which ports share a controller | live controller/route data → actual shared roots | Real but OS/hardware-specific | Browser cannot inspect it; exact answer needs OS telemetry or maintained model data | **HOLD** |
| 14 | USB endpoint/device-count checker | Users fearing the 127-device ceiling | counts → theoretical limit | Weak consumer decision intent | Simple threshold ignores hubs/endpoints/controller policy | **REJECT** — trivia-level output and misleading confidence |
| 15 | Mixed resolution/refresh payload planner | Multi-monitor users | per-display timing → aggregate demand | Strong; many display calculators | Display Link Planner already supports multiple streams | **MERGE** — improve row inputs if data supports it |
| 16 | MST per-branch allocator | Daisy-chain users | displays per branch + link payload → branch fit | Clear MST intent; strong calculators | MST Checker already consumes display demand and topology | **MERGE** |
| 17 | Ultrawide link planner | Ultrawide buyers | resolution/refresh/bpc/chroma → payload | Clear but crowded | Exact same Display Link equation | **MERGE** — preset/guide wording only |
| 18 | Mirror-versus-extend planner | Users choosing duplicate or extended displays | OS/mode/count → topology requirements | Repeated support question | MST Checker already distinguishes OS/topology; no new calculation | **MERGE** |
| 19 | USB-and-display coexistence planner | USB-C users trading lanes | display demand + USB preservation → lane plan | Strong intent | USB-C Lane Planner is this decision | **MERGE** |
| 20 | HDR/bit-depth/chroma requirement builder | HDR users | mode attributes → bandwidth and feature needs | Strong, crowded | Display Planner plus Video Feature Chain already cover both parts | **MERGE** |
| 21 | DP-to-HDMI feature-loss checker | Adapter buyers | source/adapter/sink features → missing feature | Clear support intent | Video Adapter Direction + Feature Chain already provide the answer | **MERGE** |
| 22 | Chained-adapter planner | Users with conversion chains | ordered adapter claims → direction/feature gaps | Recurring but model claims vary | Add repeatable rows to the existing two adapter Tools if warranted | **MERGE** |
| 23 | USB-C KVM requirement builder | Two-host users sharing displays, USB, and charging | two hosts, displays, peripherals, PD, OS → requirement checklist and unknowns | Strong current community intent; ATEN selector and buying guides compete, but neutral pre-purchase gap remains | Combines two-host switching as a new primary output; public specs can build requirements without naming a compatible model | **GO candidate** — independent requirement workflow, low data maintenance |
| 24 | Dual-host monitor switching planner | Built-in KVM monitor users | host A/B video/data paths → cabling checklist | Clear monitor intent | Subset of candidate 23 plus Role Match/One-Cable Monitor | **MERGE** |
| 25 | KVM EDID/hot-plug behavior checker | Users with rearranged windows/blanking | claimed EDID/HPD behavior + symptoms → evidence state | Real problem; KVM vendors compete on proprietary behavior | Reliable result needs exact implementation/firmware testing | **HOLD** |
| 26 | Monitor upstream requirement checker | Users whose monitor USB ports do not work | video cable + upstream data path → missing connection | Very strong support intent; BenQ/Dell/Plugable articles | Role Match, One-Cable Monitor, and Troubleshooter already solve it | **MERGE** |
| 27 | Monitor downstream USB constraint planner | Monitor-hub users | upstream mode/rate + peripherals → data/power constraint | Recurring support intent | Hub Bandwidth + Hub Power with monitor framing | **MERGE** |
| 28 | Bus-versus-self-powered hub feasibility | Mobile hub users | upstream supply, reserve, loads → feasibility | Strong support intent | Hub Power Budget already produces the decision | **MERGE** |
| 29 | Second downstream hub impact | Users adding another hub | declared stages/pools/loads → added risk | Real topology intent | Tier depth belongs to candidate 8; traffic belongs to existing bandwidth planner | **MERGE** |
| 30 | Display drops under USB load | Dock users with intermittent video | load/direct/dock/reduced-mode evidence → isolation step | Repeated support issue | High-Refresh and Direct/Dock isolators already cover it | **MERGE** |
| 31 | Monitor charges but peripherals fail | One-cable monitor users | power/video/data observations → missing data path | Strong recurring support issue | One-Cable Monitor, Role Match, and Troubleshooter already return it | **MERGE** |
| 32 | Dock works only with external power | Bus-powered dock users | powered/unpowered comparison + load → power evidence | Repeated support issue | Hub Power + Dropout Isolator already cover it | **MERGE** |
| 33 | Ethernet drops during SSD transfer | Dock users with shared-link contention | concurrent demands + isolation evidence → bottleneck test | Clear community/support issue | Hub Shared Bandwidth + Dropout Isolator already solve it | **MERGE** |
| 34 | DisplayLink workload suitability | Users comparing USB graphics with native display paths | OS/workload/content/driver constraints → suitability caveats | Meaningful intent; vendor tools/guides strong | Performance and DRM/latency behavior are workload, OS, driver, and model dependent | **HOLD** |
| 35 | Browser auto-read of cable/port/e-marker | Users wanting automatic detection | browser hardware inspection → exact negotiated facts | Appealing intent | Ordinary browser APIs cannot read cable e-markers or complete negotiated paths | **REJECT** — technically unavailable and unsafe to simulate |

### Gate result and rationale

- Counts: **2 GO candidates / 26 MERGE / 5 HOLD / 2 REJECT = 35**.
- Strong independent Tool count: **2**, below the mandatory minimum of four.
- The two strongest candidates are not a coherent four-Tool cluster by themselves. Manufacturing two more pages from dual-bus bandwidth, monitor upstream checks, or KVM subcases would duplicate existing Tools.
- Existing maintained-data HOLD items remain unchanged: model-specific charger/device, exact dock/KVM/MST/adapter/eGPU compatibility, cable-length prediction, comparison/affiliate, and other product databases were not recycled to satisfy the gate.
- Final first-expansion decision: **NO-GO**.

### Implementation, QA, and inventory

- No Tool, Guide, Reference, Workbench, or public landing page was added.
- No production HTML, CSS, JavaScript, sitemap, robots, metadata, structured data, GA4, or asset file changed. Only this operating record changed.
- Automated verifier: PASS for 60 public HTML files, 59 indexable/sitemap URLs, internal targets, duplicate IDs, metadata, canonical/Open Graph, H1, JSON-LD, and GA4 exactly once. Shared JavaScript syntax and git diff whitespace checks also passed.
- Documentation QA: candidate count/classification arithmetic, 28-Tool inventory comparison, and source-link formatting passed.
- Production read-only verification: the Tools hub returned the expected title, one H1, six workbenches, all 28 direct Tool entries, and zero console errors/warnings. No production rollout was required for a product change.
- Final inventory remains **60 HTML / 59 indexable / 28 Tools / 6 workbenches / 13 Guides / 5 References**.

### Git, deployment, and next real work

- Start commit: 8c8f9f0b66b672dedabfc72a56fc513bc7483a9a.
- Research-decision commit: 8c5619d211533ac53a2fe8fb3226ac189dace742 (Record first expansion no-go review).
- Product-code deployment: **not applicable**; the existing audited release remains live and unchanged.
- Documentation-only GitHub Pages rebuild: run #31703437581 completed successfully for 8c5619d211533ac53a2fe8fb3226ac189dace742.
- Final commit: the final main commit containing the completed push/deployment record; its exact hash is reported externally because a commit cannot contain its own hash.
- Next work:
  1. Collect Search Console query/landing evidence and GA4 journey evidence before reopening expansion.
  2. Define the compact GA4 interaction taxonomy already pending.
  3. Reconsider the two GO candidates only alongside at least two additional independent, evidence-backed workflows; do not split their subcases into separate Tools.
  4. If user/support data strongly selects a MERGE item, deepen the named existing Tool instead of adding another URL.


## 2026-08-19

- 메인 페이지 푸터 아래의 디렉토리 뱃지 영역은 사용자가 직접 관리하는 영역이므로 수정·삭제·리팩터링하지 않는다.- https://findly.tools/ 에 등록 (내가 직접함)

## 2026-08-20 fresh workflow-cluster gate review

### Repository correction, synchronization, and safe start

- The repository already existed at `https://github.com/canghun13/cablechecklab`; no repository was created.
- Working copy used for this session: `C:\Users\song\Documents\ChatGPT\cablechecklab`.
- Branch and remote: `main` at `https://github.com/canghun13/cablechecklab.git`.
- Initial local HEAD: `7e11d791b6e5a8656ed8d86ca5453910ecca9895`.
- Initial `origin/main` and live GitHub `main`: `bd35be6e382c1f8aa05bb67f7fe6bb575bc25e6c`.
- The initial tree was clean, but local `main` was 15 commits behind the remote. `git fetch origin main`, `git ls-remote origin refs/heads/main`, and the local/remote comparison agreed.
- Because there were no uncommitted changes and the histories were fast-forward compatible, `git pull --ff-only origin main` was used. Local HEAD and `origin/main` then both resolved to `bd35be6e382c1f8aa05bb67f7fe6bb575bc25e6c`.
- No reset, restore, checkout-overwrite, force operation, or deletion was used. No pre-existing local change was discarded.

### Scope and exclusion control

- This review asked whether a **completely new workflow cluster** could clear the mandatory launch gate. It was not permission to manufacture keyword variants or expand page count.
- The existing inventory was rechecked before research: **60 public HTML files**, **59 indexable/sitemap URLs**, **28 interactive Tools**, **6 workbenches**, **13 standalone Guides**, **5 focused References**, and no comparison pages.
- All 28 current Tool controllers and their actual inputs/outputs were mapped again. Charging, cable/data/role, display/video, USB4/dock, and isolation responsibilities remain covered as recorded above.
- The 35 candidates from the 2026-08-13 review were treated as a hard exclusion list. None of those candidates, including hub tier depth and the USB-C KVM requirement builder, was counted again.
- Longstanding HOLD exclusions were also not recycled: device/model charger databases, exact dock/KVM/MST/adapter/eGPU compatibility databases, cable-length prediction, and product-comparison/affiliate databases.
- The Search Console USB4 PCIe-tunneling signal was not converted into a new Tool; it belongs to optimization of the existing USB4 reference journey and was outside this cluster review.
- Fresh families researched: HDMI/UVC capture, USB-C and USB Audio, USB MIDI/mobile studio topology, mobile external storage/filesystems, mobile USB transfer modes, tethering, USB Ethernet enterprise behavior, and charge-only/data-control accessories.

### Research evidence and market pattern

- Research date: **2026-08-20**. Official platform/driver documentation, manufacturer specifications, current competing calculators/viewers, and recurring support/community intent were checked.
- Capture: UVC can use operating-system class drivers, but actual modes come from device descriptors; source timing, capture timing, pass-through timing, pixel format, USB mode, and HDCP are separate declared constraints. Representative sources: `https://learn.microsoft.com/en-us/windows-hardware/drivers/stream/usb-video-class-driver-overview`, `https://learn.microsoft.com/en-us/windows-hardware/drivers/stream/usb-video-class-implementation`, `https://www.startech.com/en-us/audio-video-products/uvchdcap`, `https://datavideo.com/global/product/CAP-2A/export`, and `https://nerdzap.com/view/`.
- USB Audio: Windows includes a USB Audio Class 2 driver from Windows 10 version 1703, but its supported formats/features have limits and vendor drivers can override it. PCM bitrate calculators are already abundant. Sources: `https://learn.microsoft.com/en-us/windows-hardware/drivers/audio/usb-2-0-audio-drivers`, `https://learn.microsoft.com/en-gb/windows-hardware/drivers/usbcon/supported-usb-classes`, `https://www.usb.org/sites/default/files/audio10.pdf`, and `https://calculator.academy/audio-data-rate-calculator/`.
- USB-C analog/digital audio: Android's implementation guidance and Google/Motorola support material distinguish digital USB audio from passive analog accessory behavior; recurring users cannot tell whether a dongle includes a DAC or whether microphone/call controls will work. Sources: `https://source.android.com/docs/core/interaction/accessories/headset/usb-adapter`, `https://support.google.com/pixelphone/answer/9140284`, and `https://en-us.support.motorola.com/app/answers/detail/a_id/164700/~/usb-c-wired-headset-support`.
- Mobile audio/MIDI: iPad supports audio interfaces and MIDI devices, while Apple explicitly recommends class/Core Audio compliance and powered hubs or self-powered interfaces for larger rigs. The underlying decisions are nevertheless the same host/device-role and hub-power checks already maintained here. Sources: `https://support.apple.com/en-us/108894`, `https://support.apple.com/en-sg/guide/logicpro-ipad/lpip26513101/ipados`, `https://midi.org/basic-of-usb`, and `https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/midi`.
- External storage: Apple requires one data partition, lists supported filesystems, and warns that external drives may require external power. Seagate and Transcend likewise document filesystem/power differences across desktop and mobile hosts. Sources: `https://support.apple.com/en-qa/guide/iphone/iph95baac91f/ios`, `https://support.apple.com/en-ie/guide/ipad/ipad75b7b23f/ipados`, `https://www.seagate.com/manuals/mobile-drive/optional-formatting-and-partitioning/`, and `https://us.transcend-info.com/Support/FAQ-1326`.
- Mobile transfer/accessory modes: Apple documents wired-accessory authorization and PTP/mass-storage import behavior; Android/Windows documentation shows MTP/class-driver choices, but exact menus and failures vary by vendor, OS build, driver, and policy. Sources: `https://support.apple.com/en-us/111806`, `https://support.apple.com/en-ie/118280`, and `https://learn.microsoft.com/en-us/windows-hardware/drivers/portable/the-mtp-setup-information---inf--file`.
- USB networking: USB-C dock Wake-on-LAN, PXE, and MAC pass-through can depend on the exact host BIOS, dock firmware, power state, driver, AC power, and same-vendor extensions. Sources: `https://www.dell.com/support/kbdoc/en-us/000144618/no-wake-on-lan-with-usb-type-c-dock`, `https://www.dell.com/support/kbdoc/en-us/000143263/what-is-mac-address-pass-through`, `https://learn.microsoft.com/en-us/surface/surface-usb4-dock`, and `https://support.hp.com/gb-en/document/ish_13089657-13089709-16`.
- Recurring intent was confirmed for passive-versus-active audio dongles, capture black screens/HDCP/pass-through mismatches, mobile SSDs not mounting despite power, Android USB host-control failures, and USB tethering failures. The demand is real, but most subcases collapse into one composite preflight or require model/OS telemetry rather than supporting four independent calculators.

### Fresh candidate decisions

Each row records the user/problem, meaningful inputs and output, demand/competition, difference from the current 28 Tools, technical/maintenance basis, decision, and cluster fit. These **28 candidates are new to this review** and do not include the prior 35.

| # | Candidate and cluster | User/problem; meaningful inputs → output | Demand / competition | Difference, technical basis, and maintenance | Decision and reason |
|---:|---|---|---|---|---|
| 1 | HDMI/UVC capture-path preflight — Capture | Streamers/AV users with black video or an uncertain purchase; source timing/HDCP, capture input, pass-through, captured output, UVC mode, USB link, host OS → declared-fit map, blockers, and unknowns | Repeated support intent; capture-card product pages and browser UVC viewers exist, but neutral pre-purchase path logic is weak | New source→capture→USB transformation, not a display adapter or ordinary weakest-link path; user-entered specifications avoid a model database | **GO candidate** — independent workflow with bounded claims; anchor of a possible Capture cluster |
| 2 | UVC raw/MJPEG stream bandwidth planner — Capture | Webcam/capture users; width, height, frame rate, pixel format/compression claim, streams, overhead → estimated Mbps and link headroom | Clear intent; generic video/audio bitrate calculators are crowded | Raw formats are calculable, but MJPEG rate is device/content dependent; final link comparison duplicates Data Path Checker and Hub Shared Bandwidth | **MERGE** — make it an input aid inside candidate 1 or the existing bandwidth tools |
| 3 | Capture pass-through versus recording-mode matrix — Capture | Buyers confusing 4K pass-through with capture capability; source modes plus declared pass-through/capture tables → supported-mode matrix | Common product-page confusion; manufacturer tables compete | Useful presentation, but it is the same declared rows and verdict as candidate 1 | **MERGE** — a section of the composite capture preflight, not an independent Tool |
| 4 | HDCP capture-readiness checker — Capture | Console/media users with a black screen; content type, source HDCP state, capture declaration → capture blocked/allowed/unknown | Strong recurring intent; manufacturer help pages answer it | A narrow binary gate inside the capture path; cannot and must not advise protection circumvention | **MERGE** — required safety check in candidate 1, too thin alone |
| 5 | Clean-HDMI camera readiness questionnaire — Capture | Camera users wanting overlays-free output; output enablement, overlays, sleep limit, timing, audio, connector → readiness checklist | Real camera-support intent; vendor compatibility lists dominate | Exact clean output and firmware behavior are model-specific and often absent from public structured data | **HOLD** — needs exact manuals/model evidence; weak maintainability |
| 6 | Capture audio-route planner — Capture | Users separating embedded HDMI audio, analog mic/line, and USB audio; available inputs/outputs and app selection → proposed route and missing conversion | Repeated OBS/capture setup questions; wiring guides compete | Routing is useful but capture-device/app behavior is exact-product specific and belongs beside the video path | **MERGE** — add an audio branch to candidate 1 if that Tool ever launches |
| 7 | UVC class/host format checker — Capture | Users whose device enumerates but offers no desired mode; OS/version, UVC claim, descriptors/formats, vendor driver → class-driver support caveats | Technical intent; Microsoft documentation and device viewers compete | Built-in-driver facts are stable, but exact modes are descriptor-provided; separate page would restate candidate 1 | **MERGE** — host/format evidence row within candidate 1 |
| 8 | Active/passive USB-C audio-adapter checker — USB Audio | Phone/laptop users buying a 3.5 mm dongle; host digital-audio and analog-accessory declarations, adapter DAC claim, headphone/mic need → required adapter type and unresolved controls | Strong repeated confusion; app checkers and product listings exist but neutral pre-purchase guidance is fragmented | New digital-audio versus analog-accessory decision; not covered by cable power/data/video claims | **GO candidate** — independent and low-data if every undeclared host/adapter fact remains unknown; Audio cluster has only one such Tool |
| 9 | USB headset microphone/remote-control compatibility checker — USB Audio | Headset users losing mic/buttons/calls; host, headset class, mic, control, app/call needs → declared function matrix | Real support demand; mostly vendor FAQs | Button mappings, call routing, connector implementation, and firmware are exact-product facts | **HOLD** — cannot provide a reliable generic verdict without maintained product evidence |
| 10 | USB Audio Class driver preflight — USB Audio | Windows/mobile users evaluating an interface; OS/version, UAC version, format, channels, shared/exclusive mode, vendor driver → class-driver fit and caveats | Professional intent; official driver docs, vendor matrices, and diagnostic apps compete | More specific than Data Path Checker, but class compliance alone does not prove the requested controls, latency, app routing, or vendor-driver behavior | **HOLD** — promising logic, but not yet a safe cross-platform consumer Tool |
| 11 | USB audio channel/sample-rate bandwidth planner — USB Audio | Recording users; input/output channels, sample rate, bit depth, overhead → PCM rate and USB share | Search demand exists; many mature calculators already provide the arithmetic | Formula is straightforward and the link comparison is already covered by Hub Shared Bandwidth | **MERGE** — preset/calculation help, not independent product logic |
| 12 | Mobile audio-interface power/topology preflight — USB Audio/MIDI | iPad/phone musicians; host, interface class claim, bus draw, hub supply, charging need, attached devices → powered topology and unknowns | Strong forum intent; Apple and interface setup guides compete | User goal is specialized, but computation is Hub Power Budget plus USB-C Role Match | **MERGE** — deepen the existing power/role journey rather than duplicate it |
| 13 | Simultaneous charging-and-audio splitter checker — USB Audio | Single-port phone/tablet users; PD input, audio endpoint type, splitter roles, host support → topology requirement and unknowns | Common shopping intent; product listings dominate | Same power/data-role validation already handled by Role Match, Charge Check, and Cable Selector | **MERGE** — scenario framing only |
| 14 | USB MIDI host/device role matcher — USB MIDI | Musicians connecting two USB client devices; endpoint host/client claims, class compliance, power → missing host/interface/power step | Repeated confusion; MIDI.org and USB-MIDI host products explain it | MIDI wording is valuable, but the decisive logic is already USB-C Role Match plus power | **MERGE** — existing Tool should own the universal role decision |
| 15 | Multi-device iPad audio/MIDI rig builder — USB Audio/MIDI | Mobile musicians combining interface, controller, storage, and charging; device roles/draw/data → wiring plan and budget | Clear community intent; many setup diagrams and hub recommendations | Composite of candidates 12/14 and existing hub power/bandwidth tools; exact app aggregation can vary | **MERGE** — coherent use case, not independent logic |
| 16 | Cross-platform removable-drive filesystem selector — Mobile storage | Users sharing one drive across Windows, macOS, iPhone/iPad, Android/ChromeOS; host set, read/write, file-size, encryption/journaling needs → recommended format, tradeoffs, and unknown hosts | Persistent search/community demand; support tables exist, but neutral multi-host decision tools are weak | New filesystem/partition decision outside all 28 Tools; a curated OS-capability matrix is small and sourceable if Android is never generalized | **GO candidate** — independent and useful; only strong Tool in a Storage cluster |
| 17 | Mobile external-storage connection preflight — Mobile storage | Phone/tablet users whose drive powers but does not mount; connector, data cable, host mode, partition count, filesystem, drive power → staged blockers/test order | Strong repeated intent; Apple/drive-vendor guides compete | Valuable composite, but filesystem output belongs to candidate 16 and cable/power/role checks already exist | **MERGE** — one storage selector plus existing isolation links is sufficient |
| 18 | Camera/SD import-path builder — Mobile media | iPhone/iPad users importing media; connector, camera transfer mode, card type, file origin/format, adapter/power → Photos versus Files route and caveats | Recurring support intent; Apple has a detailed official procedure | Mostly a platform-specific checklist; compatible media details and device behavior change by OS/app | **HOLD** — stronger as a sourced Guide unless broader cross-platform logic emerges |
| 19 | ProRes-to-external-storage preflight — Mobile media | Phone videographers; phone model/mode, recording format/rate, cable, drive write claim, power → declared recording-path checklist | Visible current buyer intent; Apple and SSD vendors publish compatibility guidance | Exact supported resolutions, rates, storage behavior, and thermal limits are model/OS dependent | **HOLD** — would drift into the excluded model-compatibility database pattern |
| 20 | Mobile USB-mode chooser (MTP/PTP/tethering/MIDI/no-data) — Mobile transfer | Users seeing a charge-only connection; intended task, phone/PC roles, selected USB mode, cable data → correct mode and next isolation step | Very frequent support intent; OS help pages compete | Output is a labeled branch of USB-C Role Match and Troubleshooter, not new hardware reasoning | **MERGE** — add terminology guidance to existing troubleshooting when evidence warrants |
| 21 | Android “USB controlled by” failure wizard — Mobile transfer | Android users seeing “couldn't switch”; goal, cable/port, current mode, OS/vendor, PC recognition → safe isolation sequence | Strong repeated community demand across several years | Causes include vendor UI, kernel/driver state, hardware, policy, cable, and role; no stable browser-visible telemetry | **HOLD** — generic deterministic verdict would overclaim; guide/isolation content only |
| 22 | iOS wired-accessory authorization checker — Mobile transfer/security | Locked-device users whose accessory does not communicate; connector, lock state, Wired Accessories setting, supervised/Lockdown state → authorization step | Officially documented and recurring | Few branches and no arithmetic; a Troubleshooter branch or Guide is enough | **MERGE** — not a standalone Tool |
| 23 | External-drive partition/encryption portability checker — Mobile storage | Users needing one encrypted portable drive; partition count, APFS encryption, host set, third-party driver willingness → portability caveats | Real but narrower intent; filesystem tables and commercial drivers compete | Natural advanced inputs/output of candidate 16 | **MERGE** — keep one filesystem/portability decision surface |
| 24 | USB tethering preflight — Mobile networking | Phone users unable to share data to a PC; OS, carrier allowance, cable, USB mode, host driver/network state → prerequisite checklist and isolation steps | Repeated support demand; platform help pages compete | Cable/mode checks are existing logic; carrier, policy, driver, and OS regressions dominate the remaining answer | **HOLD** — insufficiently deterministic and not cluster-ready |
| 25 | USB Ethernet declared-speed path checker — USB networking | Adapter/dock users getting lower link speed; host USB rate, adapter NIC rate, upstream path, cable/network link → declared ceiling and weakest segment | Clear support intent; OS/network utilities already show negotiated speed | Exactly the existing Data Path Checker with Ethernet labels | **MERGE** — scenario preset only |
| 26 | Dock Wake-on-LAN preflight — Enterprise dock networking | IT users needing remote wake; host BIOS support, dock/NIC claim, sleep/off state, driver, AC power → declared prerequisites and unknowns | Real enterprise need; vendor matrices/docs dominate | Distinct desired outcome, but support varies by exact host, dock revision, firmware, power state, and same-vendor extensions | **HOLD** — unsafe without maintained exact-model evidence |
| 27 | PXE and MAC-pass-through preflight — Enterprise dock networking | IT deployment users; host BIOS, dock/NIC claim, preboot driver, MAC policy, vendor pairing → deployment requirement checklist | Real but niche; OEM support material is authoritative competition | Closely coupled to specific OEM BIOS/dock combinations and network policy | **HOLD** — model/firmware maintenance burden prevents a neutral generic verdict |
| 28 | Public-charging/data-blocker selector — USB security | Travelers wanting charge with no USB data; required charge protocol, adapter/cable data wiring, trust model → suitable physical data-disconnect requirement | Broad awareness; many product pages and security articles compete | Requirement is already “power yes, data no” in Cable Selector/Role Match; richer security claims need hardware certification | **MERGE** — too thin and overlapping for an independent Tool |

### Hard Gate result

- Decision counts: **3 GO candidates / 16 MERGE / 9 HOLD / 0 REJECT = 28**.
- Strong independent new Tool count: **3**: HDMI/UVC Capture-Path Preflight, Active/Passive USB-C Audio-Adapter Checker, and Cross-Platform Removable-Drive Filesystem Selector.
- The mandatory minimum is **at least four** strong independent Tools in one naturally coherent cluster. The review found one strong Tool in each of three different families, not four in one family.
- Capture subcases such as pass-through, HDCP, UVC mode, and audio routing are inputs/sections of one composite capture preflight. Splitting them would create thin, overlapping Tools.
- USB Audio/MIDI arithmetic and mobile rig topology reduce to existing bandwidth, power, and role tools; class-driver and headset-control claims remain too platform/product dependent.
- Mobile storage has one strong selector. Mount troubleshooting, partition/encryption, and import subcases either merge into it/current isolation tools or remain platform-specific Guides/HOLD items.
- Enterprise USB networking requires exact host/dock/firmware/BIOS evidence and therefore cannot safely supply the missing Tools.
- Final decision: **NO-GO**. No new workflow cluster cleared the launch gate.

### Changes, QA, and deployment rule for this NO-GO

- Public product change: **none**. No Tool, Guide, Reference, workbench, comparison, landing page, HTML, CSS, JavaScript, sitemap, robots, metadata, structured data, GA4, or public asset was changed.
- GA4 remains `G-8PFRRXPGEF` on every public HTML page; contact remains `canghun13@naver.com`.
- The user-managed directory-badge area below the main-page footer was not touched.
- Only `handover.md` was changed to preserve the complete research record, candidate matrix, gate rationale, and operating rules.
- Final inventory therefore remains **60 HTML / 59 indexable / 28 Tools / 6 workbenches / 13 Guides / 5 References / 0 comparisons**.
- Local automated verifier: PASS for **60 public HTML files** and **59 indexable sitemap URLs**, including GA4, metadata, JSON-LD, one H1, duplicate IDs, sitemap parity, and internal targets.
- Shared JavaScript syntax using the bundled workspace Node.js runtime, `git diff --check`, candidate-table sequence/count, classification arithmetic, and UTF-8 replacement-character checks: PASS.
- Candidate documentation QA: **28 numbered rows**, first `1`, last `28`, and exact **3 GO / 16 MERGE / 9 HOLD / 0 REJECT** classification count: PASS.
- Production read-only regression before the documentation commit: home, Tools hub, and sitemap returned HTTP 200; all **59 sitemap URLs** returned HTTP 200; the live Tools hub exposed **6 workbenches** and **28 direct Tools**, contained one H1 and the expected GA4 loader/config occurrences.
- Pre-commit remote race check: local HEAD, `origin/main`, and live GitHub `main` still matched at `bd35be6e382c1f8aa05bb67f7fe6bb575bc25e6c`; local versus `origin/main` was `0 0` before staging.

### Git and deployment

- Synchronized start commit: `bd35be6e382c1f8aa05bb67f7fe6bb575bc25e6c`.
- Research-decision commit: `03178353d7b2b06d2af7f8699225632f9fc2a6df` (`Record fresh workflow cluster no-go review`).
- The research-decision push succeeded; local HEAD, `origin/main`, and live GitHub `main` all matched `03178353d7b2b06d2af7f8699225632f9fc2a6df` immediately after the push.
- GitHub Pages documentation rebuild: `pages build and deployment` run `32347129762` completed with `success` for `03178353d7b2b06d2af7f8699225632f9fc2a6df`: `https://github.com/canghun13/cablechecklab/actions/runs/32347129762`.
- Product-code deployment: **not applicable**. The audited public release stayed unchanged; the Pages run only published the documentation commit.
- Final handover-record commit: the final `main` commit that adds this deployment record. Its exact hash and final Pages status are reported externally because a commit cannot contain its own hash/status.

### Work-environment independence rules

1. Never assume the repository path from a previous computer. Discover it with the current working directory and `git rev-parse --show-toplevel`; record the resolved path for that session only.
2. Before any edit, inspect `git remote -v`, branch, status, recent log, local HEAD, `origin/main`, and live `refs/heads/main`. Fetch before comparing.
3. If local changes exist, inspect `git status`, `git diff`, and `git diff --cached`. Preserve user changes; do not reset, restore, overwrite, or delete them to make the tree convenient.
4. Pull only when the tree is safe and the update is fast-forwardable, using `git pull --ff-only`. Never force-push `main`.
5. Use repository-relative links and static assets; do not embed machine-specific paths in public files. Keep the static HTML/CSS/vanilla-JavaScript/GitHub-Pages architecture unless the user explicitly changes it.
6. Preserve GA4 `G-8PFRRXPGEF`, contact `canghun13@naver.com`, canonical domain `https://cablechecklab.com`, `CNAME`, robots, sitemap parity, and one analytics loader/config per public page.
7. Do not modify the main-page footer directory-badge area; the user owns that block.
8. Re-run the repository verifier, syntax/encoding/diff checks, and proportional browser/production QA after any public change. For a documentation-only NO-GO, still verify the unchanged public inventory and production availability without editing public files.
9. Commit only the scoped files, push `main`, confirm GitHub Pages success when a rebuild occurs, verify local HEAD equals live remote `main`, and finish with a clean working tree.

### Next evidence-backed work

1. Do not split the three GO candidates into sub-tools merely to satisfy the count.
2. Reopen a cluster only if fresh query/support evidence identifies at least four independent decisions in the **same** family.
3. If the capture family later produces genuinely independent needs beyond the one composite preflight, it is the closest cluster to reconsider; HDCP/pass-through/UVC-format rows alone do not count separately.
4. Treat filesystem selection and active/passive audio as isolated future candidates until each has at least three additional coherent peers.
5. Prefer a focused Guide or a MERGE into the named existing Tool when the output is a checklist, preset, or terminology translation rather than new calculation/decision logic.

## 2026-08-20 search-signal USB4 optimization and interaction measurement

### Start state and evidence boundary

- Working copy used for this session: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Branch and remote: `main` at `https://github.com/canghun13/cablechecklab.git`.
- Initial local HEAD was `f17c48a`; live GitHub `main` was newer at `157477c257e97780e995fc56fea351afa9ba4083`. The initial tree was clean, so `git fetch origin main` and `git pull --ff-only` safely synchronized local HEAD and `origin/main` to the live remote. No reset, restore, force operation, or user-file deletion was used.
- Synchronized start commit: `157477c257e97780e995fc56fea351afa9ba4083`.
- Verified start inventory: **60 public HTML files / 59 indexable sitemap pages / 28 Tools / 6 workbenches / 13 Guides / 5 References / 0 comparisons**.
- No Search Console or GA4 export was present in the repository, surrounding workspace, or supplied attachments. The available in-app Search Console session was not authenticated, so no current numeric impression, click, CTR, position, or event-volume claim was made.
- The latest recorded small search signal was the query group `usb4 pcie tunneling`, `pcie tunneling`, `what is pcie tunneling`, and `pcie tunneling over usb4` landing on `/references/usb4-tunneling/`. A much smaller Charge Check/cable-bottleneck hint was not strong enough to justify another edit.

### Decision and current research check

- **GO — strengthen the existing USB4 tunneling Reference.** Its old H1, “USB4 rates, tunnels, and confidence boundaries,” did not answer the recorded query directly. This was a search-intent and answer-depth issue on an existing relevant URL, not evidence for a new page or Tool.
- **GO — add a minimal common interaction taxonomy.** The repeated measurement gap could be closed safely in shared JavaScript with stable route-derived identifiers and no user-entered values.
- **HOLD — Charge Check content/title changes.** The recorded sample is too small to distinguish a durable intent from noise.
- **NO CHANGE — new PCIe tunneling page/Tool, canonical/URL migration, new cluster, or design overhaul.** The existing Reference, USB4 workbench, Feature Path Checker, Tunnel Budget Planner, and planning Guide already form the correct journey.
- Current primary-source checks supported the revised boundary: USB-IF describes PCIe protocol traffic tunneled over the USB4 fabric while the PCIe topology remains visible to software; Microsoft documents PCIe tunneling support requirements and uses such as external graphics and high-performance storage. The page continues to treat link rate, tunnel support, device function, authorization, and application throughput as separate claims.
- Sources used: `https://www.usb.org/sites/default/files/D1T1-3%20-%20USB4%20System%20Overview.pdf`, `https://www.usb.org/document-library/usb4tm-configuration-layer-usb3-tunneling-dp-tunneling-and-pcie-tunneling`, `https://learn.microsoft.com/en-us/windows-hardware/test/hlk/testref/7d627bf0-25f3-4564-b554-b2a3450e2bcf`, and `https://learn.microsoft.com/en-us/windows-hardware/design/component-guidelines/usb4-intro-to-connection-manager`.

### Implementation

- Reworked `/references/usb4-tunneling/` around the direct H1 **“What is PCIe tunneling over USB4?”**, a short answer, PCIe-versus-USB distinction, common uses, four separate claim types, an end-to-end verification sequence, 40 Gbps/performance limits, absent-device troubleshooting, and explicit fallback language.
- Updated that page's title, description, Open Graph copy, TechArticle headline, and `dateModified` while preserving its URL and canonical.
- Strengthened the route into and out of the Reference from the References hub, USB4 & Thunderbolt workbench, USB4 Feature Path Checker, USB4 Tunnel Budget Planner, and USB4 planning Guide.
- Added common GA4 events in `assets/app.js`: `tool_run`, `tool_result`, `reset_tool`, `copy_result`, `print_result`, and `workbench_to_tool_click`.
- Event parameters are limited to stable context: `tool_id`, `workbench`, `result_state`, and `source_context`. No form field, numeric input, free text, clipboard content, email, or other user-entered value is sent. Copy is recorded only after clipboard success; passive input/change recalculation is deliberately not recorded.
- Advanced the shared `app.js` cache key from `20260811g` to `20260820a` on all 60 public HTML files. The stylesheet and all other assets were unchanged.
- No public page, Tool, Guide, Reference, Workbench, comparison, sitemap URL, robots rule, framework, backend, or database was added. The user-managed directory-badge area below the home-page footer was not modified.

### Changed files and QA

- Semantic changes: `assets/app.js`, `references/usb4-tunneling/index.html`, `references/index.html`, `tools/usb4-thunderbolt/index.html`, `tools/usb4-feature-path/index.html`, `tools/usb4-tunnel-budget/index.html`, and `guides/usb4-thunderbolt-planning/index.html`.
- Mechanical cache-key change: all 60 public HTML files. This operating record adds `handover.md`.
- Repository verifier: PASS for **60 public HTML files** and **59 indexable sitemap URLs**, including internal targets, duplicate IDs, canonical, title/description, Open Graph, one H1, JSON-LD, sitemap parity, and one GA4 loader/config per page.
- JavaScript syntax, `git diff --check`, exact GA4 ID scan (`G-8PFRRXPGEF` only), cache-key coverage (60/60), and removal of temporary QA hooks/files: PASS.
- Isolated event fixture: PASS for all six events and their expected stable parameters. The event payload contained no form values. Workbench-to-Tool attribution recorded the destination Tool and source workbench.
- Full Tool browser regression: all **28 Tools** loaded and initialized, explicit submit worked, input changes recalculated, numeric invalid input returned the invalid/bad state where applicable, Reset recalculated, Copy succeeded, Print invoked, no NaN/Infinity appeared, no horizontal overflow appeared at 390 px, and no page JavaScript error occurred.
- Changed Reference and representative USB4 Tool: PASS at **390 / 768 / 900 / 1024 / 1280 / 1440** with no horizontal overflow or H1/header collision. Mobile navigation opened with `aria-expanded=true`. Local in-app browser inspection found the new direct answer and no site-script console error.

### Git and deployment

- Start commit: `157477c257e97780e995fc56fea351afa9ba4083`.
- Implementation commit: `186f8cbfe8d1159ff0fc339ceca6d0ee0be61727` (`Improve USB4 search journey and analytics`).
- The implementation push succeeded; GitHub `main` advanced from `157477c257e97780e995fc56fea351afa9ba4083` to `186f8cbfe8d1159ff0fc339ceca6d0ee0be61727`.
- GitHub Pages `pages build and deployment` run `32370771827` completed with `success` for the implementation commit: `https://github.com/canghun13/cablechecklab/actions/runs/32370771827`.
- The original 2026-08-20 session could not complete post-deployment production inspection because its execution environment blocked further domain access. The 2026-08-24 follow-up below closed that verification gap.
- Final implementation-record commit: `d6e4459f6b497b7cd79fe239f8196a656245ba8e` (`Record USB4 optimization deployment`).
- The final implementation-record push succeeded, and GitHub Pages run `32722241665` completed with `success` for `d6e4459f6b497b7cd79fe239f8196a656245ba8e`: `https://github.com/canghun13/cablechecklab/actions/runs/32722241665`.
- Final closeout commit: the final `main` commit containing the follow-up production record; resolve in the final task report because a commit cannot contain its own hash.

### 2026-08-24 follow-up closure

- Before the follow-up push, the working tree was clean; local `main` was exactly one commit ahead of `origin/main`, and live GitHub `main` still matched `186f8cbfe8d1159ff0fc339ceca6d0ee0be61727`. The pending `d6e4459` commit was therefore a safe fast-forward push.
- Production Reference inspection: PASS for the title **“What Is PCIe Tunneling over USB4? Requirements & Limits”**, direct H1, short answer, canonical, one GA4 loader/config, and `app.js?v=20260820a`. Browser console warnings/errors: zero.
- Production responsive inspection: `/references/usb4-tunneling/` and `/tools/usb4-feature-path/` passed at **390 / 768 / 900 / 1024 / 1280 / 1440** with no horizontal overflow or H1/header collision.
- Production representative Tool behavior: PCIe workload input change, explicit result, Copy, Reset, Print, finite output, and 390 px mobile navigation all passed. The mobile menu opened with `aria-expanded=true`.
- Production crawl: sitemap returned HTTP 200 with **59 URLs**; all 59 returned HTTP 200. `robots.txt` returned HTTP 200 and referenced the canonical sitemap.
- Immediately before this closeout documentation change, local HEAD, `origin/main`, and live GitHub `main` all matched `d6e4459f6b497b7cd79fe239f8196a656245ba8e`; the working tree was clean and branch divergence was `0 0`.

### Current state and next real work

- Inventory remains **60 HTML / 59 indexable / 28 Tools / 6 workbenches / 13 Guides / 5 References / 0 comparisons**.
- Treat this as an optimization and measurement release, not a new cluster release.
- After enough impressions and interactions accumulate, compare the PCIe-tunneling query group's landing performance and the six event families by Tool/workbench. Do not infer meaningful demand from one or two events.
- Revisit Charge Check wording only if a larger query set establishes a durable cable-bottleneck intent.
- Keep the three isolated GO candidates from the fresh cluster review on HOLD unless their own coherent families meet the established launch gate; do not split subcases into thin Tools.

## 2026-08-26 aggressive new workflow-cluster expansion

### Repository synchronization and start state

- Working copy used: `C:\Users\cangh\OneDrive\문서\ChatGPT\cablechecklab\repository`.
- Remote and branch: `https://github.com/canghun13/cablechecklab.git`, `main`.
- Local `HEAD`, fetched `origin/main`, and live `git ls-remote origin refs/heads/main` all matched `4a992497dc937e62cd7a0f02520328e749342847` at the safe start. The working tree was clean and no pull was needed.
- No reset, restore, checkout overwrite, deletion, force operation, IDE launch, tool installation, or repository recreation was used.
- Start inventory was reverified as **60 public HTML / 59 indexable / 28 Tools / 6 workbenches / 13 Guides / 5 References / 0 Comparisons**.
- `handover.md` was read end to end before candidate selection.

### Recent Exclusion Set

- The exclusion set contains the full responsibility map of all **28 current Tools**, all **35 candidates from 2026-08-13**, all **28 candidates from 2026-08-20**, and every longstanding HOLD/model-database restriction. This is **91 explicitly enumerated current-or-reviewed items**, plus the implicit variants already owned by those Tools.
- Existing responsibility groups excluded from reuse: charging-chain/PDO/PPS/PD requirements/multi-port allocation; cable and port claim decoding; USB data bottlenecks, roles, hub bandwidth and power; display payload/DSC/lanes/MST/high-refresh/one-cable-monitor; video adapter direction and feature chains; USB4 features/tunnel budget/fallback; dock requirements/direct isolation/dropout/general troubleshooting.
- The 2026-08-13 exclusions include the 35 recorded charger-table, EPR/AVS, hub-depth, mixed-display, KVM, monitor-hub, DisplayLink, cable-length, and related MERGE/HOLD/REJECT candidates. The 2026-08-20 exclusions include all 28 capture, USB audio/MIDI, mobile storage/filesystem, mobile USB mode, tethering/networking, and public-charging candidates.
- Longstanding exclusions remain in force: model-specific charger/device databases; exact dock/KVM/MST/adapter/eGPU compatibility databases; active-cable/product databases; cable-length or real-performance prediction; product comparison/affiliate databases; host-controller telemetry mapping.
- The recently strengthened PCIe-tunneling journey and common GA4 interaction taxonomy were also excluded from new-candidate counting. The user-managed home-page badge block remained untouched.

### Phase A — broad discovery: 54 genuinely new workflow/search targets

The rows below are outside the named recent candidate lists. `GO` means strong enough at broad-screen level; it does not override the cluster-level four-Tool gate.

| # | New target | Problem / likely Tool | Repeatability, overlap, search opportunity | Decision |
|---:|---|---|---|---|
| 1 | HDMI routing device class | Switch vs splitter vs matrix vs multiviewer selector | Repeated buying question; article-heavy SERP; new topology decision | GO |
| 2 | HDMI matrix size | Sources, zones, spare ports → minimum I/O | Repeated system-sizing intent; vendor articles, no neutral calculator surfaced | GO |
| 3 | HDMI route-table generator | Source-to-zone crosspoint worksheet | Useful, but capacity output belongs with matrix sizing | MERGE |
| 4 | Mixed-display EDID plan | 4K/1080p displays, EDID policy, scaler → fit | Strong recurring failure intent and vendor-product SERP | GO |
| 5 | Per-output scaling requirement | Which output needs processing | Same inputs and decision as mixed-display EDID | MERGE |
| 6 | HDMI distribution audio route | ARC/eARC/HDMI/optical/extractor path | Repeated buying and troubleshooting intent; fragmented vendor answers | GO |
| 7 | HDMI-CEC control scope | Power/volume/input-control propagation | Real pain, but exact firmware/device behavior dominates | HOLD |
| 8 | HDMI distribution fault scope | Direct/all-output/one-source/one-zone A/B isolator | Recurring support workflow; product troubleshooting is non-interactive | GO |
| 9 | ARC/eARC path checker | TV-originated audio return | Strong demand, but natural branch of distribution audio routing | MERGE |
| 10 | Home-theater audio-format chain | Codec across source/TV/sink | Useful, but same audio path and exact-codec evidence | MERGE |
| 11 | Optical vs ARC/eARC selector | Choose TV-to-sound-system transport | Same actionable output as audio route planner | MERGE |
| 12 | TV lip-sync test/isolator | Audio-video delay test | Several strong free browser tools already rank | REJECT |
| 13 | TV high-bandwidth port allocator | Reserve eARC and gaming ports | Valuable but port assignments are exact-model data | HOLD |
| 14 | AVR bypass topology | Source→TV vs source→AVR | Natural audio/video routing branch, not an independent Tool | MERGE |
| 15 | Case front-USB/header matcher | Case I/O plugs vs motherboard headers | Repeated PC-builder intent; no neutral interactive checker surfaced | GO |
| 16 | Internal USB-header allocator | Coolers/controllers/front I/O vs headers/hubs | Repeated current demand; user-entered inventory is maintainable | GO |
| 17 | Type-E adapter requirement | Front USB-C without Type-E header | A branch of front-USB/header matching | MERGE |
| 18 | HD Audio vs AC'97 checker | Case audio plug vs board header | Distinct physical/signaling decision with public documentation | GO |
| 19 | PCIe USB expansion preflight | Slot, lanes, power, internal header | Exact board/card layout and driver details weaken generic accuracy | HOLD |
| 20 | PC switch/LED header mapper | Power/reset/LED wiring | Header layouts can be board- and case-specific | HOLD |
| 21 | TRRS headset wiring checker | CTIA/OMTP/mic need → adapter class | Repeated consumer problem; narrow but independent | GO |
| 22 | Balanced/unbalanced audio selector | TRS/XLR/TS source and sink → cable class | Repeated buying intent; article-heavy SERP | GO |
| 23 | TRS/TS stereo/mono checker | Interpret one 1/4-inch or 3.5-mm path | Cosmetic subdivision of balanced/unbalanced workflow | MERGE |
| 24 | TRS MIDI A/B checker | Type A/B endpoints → adapter/cable need | Repeated confusion and stable public pinout concepts | GO |
| 25 | MIDI routing visualizer | Multi-device MIDI graph | Strong free apps and web tools already exist | REJECT |
| 26 | M.2 key/protocol matcher | Drive key/protocol/form factor vs enclosure | A strong current free compatibility checker already exists | REJECT |
| 27 | External enclosure interface selector | NVMe/SATA enclosure transport choice | Useful, but crowded and adjacent to existing data-path logic | HOLD |
| 28 | Bridge feature checker | UASP/SMART/TRIM through enclosure | Exact chipset/OS/driver behavior is required | HOLD |
| 29 | SD/UHS reader path selector | Card bus vs reader vs host ceiling | Mostly an existing Data Path Checker preset | MERGE |
| 30 | Printer cable selector | Legacy/USB-B/device-side connector | Repeated identification queries but too thin for a Tool | REJECT |
| 31 | USB print-server suitability | Print vs scan/status functions | Exact printer/server compatibility lists dominate | HOLD |
| 32 | Scanner network-sharing preflight | MFP print works but scanning fails | Exact driver/server behavior prevents a generic verdict | HOLD |
| 33 | Multi-webcam USB bandwidth | Several UVC streams on one controller | Existing hub-bandwidth logic owns the calculation | MERGE |
| 34 | BYOD conference topology | Room PC/laptop/camera/audio/display switching | Real repeated commercial intent; one strong new planner | GO |
| 35 | Conference USB-extension preflight | Table-to-display USB path and host switching | Exact extender/product limits dominate | HOLD |
| 36 | Wired VR connection preflight | GPU display path, USB, power, direct wiring | Model/GPU routing and runtime requirements change by headset | HOLD |
| 37 | Console HDMI-switch selector | Multiple consoles to one high-rate display | New scenario but core device class belongs to HDMI selector | MERGE |
| 38 | 4K120/VRR switch chain | Console/router/display feature pass-through | Existing feature chain plus HDMI routing; not independent | MERGE |
| 39 | Gaming-accessory USB topology | Controllers/headsets/capture on hubs | Existing role, power, and shared-bandwidth workflows | MERGE |
| 40 | Wired CarPlay path checker | Phone/cable/vehicle data port | Exact vehicle/phone compatibility database required | HOLD |
| 41 | Android Auto cable diagnostic | Bad cable/port/data path | Android Auto already exposes an on-device diagnostic | REJECT |
| 42 | Qi/Qi2 claim checker | Phone, magnetic profile, charger class | Exact device/case/vendor fast-charge behavior requires data | HOLD |
| 43 | Wireless-pad supply planner | Adapter input vs wireless output requirement | Existing charging requirement logic owns the decision | MERGE |
| 44 | Power-bank pass-through planner | Simultaneous input/output and UPS-like continuity | Exact model thermal/priority/switchover behavior dominates | HOLD |
| 45 | Desk connection-map generator | Draw devices, ports, and cables | Multiple current drag-and-drop and cable-map tools exist | REJECT |
| 46 | Setup cable-inventory generator | Audit a desk before migration | Repeatability exists, but search/tool intent is modest | HOLD |
| 47 | Printable cable-label generator | Generate endpoint labels | Strong free label tools and templates already exist | REJECT |
| 48 | Dock migration diff planner | Old vs new laptop port/feature gaps | Mostly the existing Dock Requirement Builder with two columns | MERGE |
| 49 | HDMI/HDBaseT extender preflight | Distance, cable category, mode, remote power | Exact transmitter/receiver product declarations dominate | HOLD |
| 50 | AV-over-IP bandwidth planner | Streams/codecs/network → bandwidth | Established professional calculators and tools already compete | REJECT |
| 51 | Projector input-path selector | Phone/laptop/console to projector | Existing adapter-direction and feature-chain workflow | MERGE |
| 52 | USB descriptor decoder | Local/WebUSB descriptor interpretation | Strong current free viewers/decoders exist | REJECT |
| 53 | EDID decoder | Hex/file → timings, audio, HDR blocks | Several mature free readers and decoders exist | REJECT |
| 54 | HDMI InfoFrame decoder | Raw report → video/audio metadata | Raw capture is hardware-dependent and technical tools compete | REJECT |

- Broad-screen classification: **12 GO / 16 MERGE / 15 HOLD / 11 REJECT = 54**.
- Demand signals combined current Google/Bing-style SERP composition, long-tail query variation, repeated Reddit/support questions, vendor FAQ/manual frequency, and the presence or absence of actual interactive free tools. No numeric keyword volume was invented.

### Phase B — mid-list: 14 cluster families

| Cluster | Strong independent breadth after de-duplication | Mid-list result |
|---|---:|---|
| HDMI routing & distribution | 5 | FINALIST |
| PC internal/front-panel connectivity | 3 | FINALIST |
| TV audio return & format paths | 3 | FINALIST |
| Conference-room BYOD USB/AV | 2 | FINALIST |
| Analog headset/audio connectors | 3 | HOLD — good isolated tools, insufficient cluster breadth |
| Storage enclosure/interface paths | 1 | HOLD/REJECT — competition and exact bridge behavior |
| Printer/scanner sharing | 0 | HOLD — exact-product database burden |
| Wired VR peripherals | 1 | HOLD — model/GPU/runtime dependence |
| Gaming HDMI/accessories | 0 new | MERGE into HDMI/existing feature and USB workflows |
| Car infotainment wired paths | 0 | HOLD/REJECT — exact vehicle data and built-in diagnostics |
| Wireless charging/pass-through | 0 | HOLD/MERGE — exact-product policy or existing charging logic |
| Desk migration/documentation | 1 | HOLD/REJECT — mature competition and weaker decision intent |
| Long-run AV/projector paths | 1 | HOLD/MERGE — exact extenders or existing adapter logic |
| Local report/descriptor decoders | 0 | REJECT — strong free tools and acquisition constraints |

### Phase C — four finalists, scoring, and Tool-level competition

Scoring uses Demand 20 / long-tail 15 / Tool intent 15 / competitive gap 15 / independent breadth 15 / static feasibility 10 / accuracy-maintenance 10.

| Finalist | Score | Independent Tool breadth | Tool-level SERP and gate result |
|---|---:|---:|---|
| HDMI routing & distribution | **91/100** | **5** | Routing selector, matrix sizing, mixed-display EDID, audio routing, and fault isolation have separate queries/actions. SERPs were dominated by product pages, manuals, and articles; no vendor-neutral no-login workbench spanning these decisions surfaced. **GO**. |
| PC internal/front-panel connectivity | 78/100 | 3 | Front-USB/header match, internal USB allocation, and HD Audio/AC'97 are strong; Type-E is a subcase and PCIe/front-panel mapping needs exact board evidence. **HOLD: fails four-Tool breadth**. |
| TV audio return & format paths | 76/100 | 3 | ARC/eARC route, format chain, and CEC/lip-sync demand recur, but optical selection and format checks merge into one path while lip-sync has strong free tools and CEC is firmware-specific. **MERGE/HOLD: fails independent breadth**. |
| Conference-room BYOD USB/AV | 67/100 | 2 | Topology and extension/host switching are valuable, but vendor design calculators and exact extender/platform products dominate. **HOLD: fails breadth and maintainability**. |

Representative research evidence:

- HDMI device-class and matrix-sizing SERPs returned current vendor explanations and product pages rather than a neutral interactive planner. Repeated community questions asked whether a switch, splitter, or matrix was required and how to route multiple displays.
- Mixed-display searches repeatedly exposed 4K/1080p EDID conflicts. Public matrix/splitter documentation distinguishes lowest-common-denominator, copied/fixed EDID, and exact-model per-output downscaling.
- Audio searches repeatedly separated eARC, ARC, ordinary HDMI inputs, optical extraction, and audio-only HDMI outputs. HDMI Licensing Administrator's public eARC page documents the high-bitrate transport class, while Dolby's public endpoint guidance distinguishes TV/receiver/source topologies and EDID effects.
- Distribution troubleshooting searches were mostly vendor step lists. They consistently use all-output vs one-zone scope, direct connection, short known-good cables, lower modes, and one-segment-at-a-time substitutions—the inputs used in the new isolator.
- Current free competition found during pruning included dedicated lip-sync testers, MIDI routers, an M.2 compatibility checker, EDID and USB descriptor decoders, cable-map/label generators, and AV-over-IP calculators. Those markets were not treated as gaps.
- Primary/public sources retained in the product Reference include `https://www.hdmi.org/spec2sub/ultrahdmicables`, `https://www.hdmi.org/spec21sub/enhancedaudioreturnchannel`, `https://professionalsupport.dolby.com/s/article/Endpoint-Device-Testing-for-Streaming-Services`, `https://www.extron.com/product/software/edidmanager30`, and `https://support.pulse-eight.com/support/solutions/articles/30000052411-neo-matrix-no-signal-blank-picture-troubleshooting`.

### Hard Gate and final decision

- **GO — HDMI Routing & Distribution**. Five independent Tools passed all 13 mandatory checks: distinct from the original 28 and recent exclusions; repeated problems and separate search intent; stronger as interactive workflows than articles; long-tail breadth; weak neutral free-tool coverage; vendor-neutral differentiation; static implementation; public user-entered evidence; no maintained product database; actionable results; no cosmetic logic splits.
- Routing selection changes the purchased device class. Matrix sizing changes required I/O capacity. Mixed-display checking changes EDID/scaler requirements. Audio routing changes connection topology and extractor/receiver requirements. Failure isolation changes the next physical A/B test. These are different decisions, not keyword variants.
- Potential sixth pages for HDCP, CEC, per-output scaling, route tables, and ARC-only checks were deliberately MERGED or HELD. The implementation does not advise HDCP bypass or stripping.

### Implementation and integration

- Added one Workbench: **HDMI Routing & Distribution** (`/tools/hdmi-routing/`).
- Added five Tools:
  1. **HDMI Routing Device Selector** (`/tools/hdmi-routing-selector/`)
  2. **HDMI Matrix Size Planner** (`/tools/hdmi-matrix-size-planner/`)
  3. **HDMI Mixed-Display EDID Checker** (`/tools/hdmi-mixed-display-checker/`)
  4. **HDMI Audio Route Planner** (`/tools/hdmi-audio-route-planner/`)
  5. **HDMI Distribution Failure Isolator** (`/tools/hdmi-distribution-isolator/`)
- Added one Guide: **HDMI Switch, Splitter & Matrix Planning Guide** (`/guides/hdmi-routing-distribution/`).
- Added one Reference: **HDMI Routing, EDID & eARC Reference** (`/references/hdmi-routing-distribution/`).
- Added five new vanilla-JavaScript controllers to `assets/app.js`, registered the new workbench for the existing `workbench_to_tool_click` event, and inherited `tool_run`, `tool_result`, `reset_tool`, `copy_result`, and `print_result`. Event parameters remain stable route/context fields only; no user-entered values are sent.
- Integrated the cluster into Home, Tools, Guides, References, related links, `sitemap.xml`, and `llms.txt`; updated public counts and search-intent metadata.
- Advanced the shared JavaScript cache key from `20260820a` to `20260826a` across all public HTML. No CSS redesign, framework, backend, database, comparison page, robot rule, domain, GA4 ID, or contact address changed.
- Semantic/public files: the 8 new pages, `assets/app.js`, `index.html`, `tools/index.html`, `guides/index.html`, `references/index.html`, `sitemap.xml`, and `llms.txt`. Mechanical cache-key coverage touched existing HTML pages. This section updates `handover.md`.
- The home-page user-managed Findly badge block below the footer was not modified, moved, or reformatted.

### Local QA before commit

- Repository verifier: **PASS — 68 public HTML, 67 indexable/sitemap URLs**, internal targets, duplicate IDs, title/description, canonical, Open Graph, one H1, valid JSON-LD, and GA4 loader/config exactly once.
- JavaScript syntax with the bundled workspace Node.js runtime: PASS. `git diff --check`: PASS. CNAME remains `cablechecklab.com`; robots remains allow-all with the canonical sitemap. Shared cache-key coverage: **68/68**.
- New Tool behavior: default, input change/recalculation, invalid/boundary or impossible combinations, Reset, Copy, and Print invocation passed. No result emitted `NaN` or `Infinity`.
- Observed state transitions included matrix→splitter→invalid→Reset; 5×3 matrix capacity→invalid→Reset; EDID conflict→scaler required→1080p common fallback→Reset; lossless eARC path→optical mismatch→stereo route→Reset; and output-leg→mixed-display EDID→direct-baseline failure→Reset.
- Copy returned the visible status/headline/summary/details and the button changed to `Copied`. Print invocation completed. The existing Charge Check still initialized, recalculated, and Reset after the shared-script change.
- Browser QA on all 8 new pages at **390 / 768 / 900 / 1024 / 1280 / 1440**: zero horizontal overflow, one H1, expected mobile-menu breakpoint, no clipped layout in visual inspection, and no console errors/warnings. Mobile navigation opened with flex layout. Print CSS remains the shared result-only layout.
- Tools hub rendered **7 workbench cards + 33 direct Tool cards**, including the new HDMI workbench, with zero horizontal overflow.

### Inventory, Git, deployment, and remaining work

- Final inventory after implementation: **68 public HTML / 67 indexable / 33 Tools / 7 workbenches / 14 Guides / 6 References / 0 Comparisons**.
- Start commit: `4a992497dc937e62cd7a0f02520328e749342847`.
- Implementation commit, push, Pages run, production checks, final hash equality, divergence, and clean-tree state are recorded in the closeout subsection added after deployment. A commit cannot contain its own final hash, so the exact last closeout hash is also reported externally.
- Strong future candidates: PC internal/front-panel connectivity (three strong Tools; needs one more genuinely independent, safe workflow), analog consumer audio connectors (three isolated strong Tools but weaker cluster cohesion), and conference-room BYOD topology (two strong workflows; exact extender/product behavior remains a HOLD constraint).
- Do not reopen the implemented HDMI cluster as thin CEC, HDCP, ARC-only, scaler-only, or route-table pages. Improve the five Tools from real query/event evidence instead.

### 2026-08-26 deployment closeout

- Implementation commit: `0d63098b6115f03b29af2cf9156684425b746cc7` (`Add HDMI routing and distribution workbench`).
- Push: succeeded as a fast-forward from `4a992497dc937e62cd7a0f02520328e749342847` to `0d63098b6115f03b29af2cf9156684425b746cc7` on GitHub `main`.
- GitHub Pages run `32966154314` completed with `success` for the implementation commit: `https://github.com/canghun13/cablechecklab/actions/runs/32966154314`.
- Production crawl: `sitemap.xml` returned HTTP 200 with **67 URLs**, and all 67 returned HTTP 200. `robots.txt` returned HTTP 200 and retained the canonical sitemap directive.
- Production workbench and representative Tool returned HTTP 200, contained the new H1/controller, loaded `app.js?v=20260826a`, and had one GA4 loader for `G-8PFRRXPGEF`.
- Production browser QA: the Mixed-Display Tool recalculated from `MIXED-MODE CONFLICT` to `SCALER REQUIRED`; Copy returned the rendered result; Reset restored the default; Print invoked; 390 px mobile navigation opened with `aria-expanded=true`; the Tool at 390 px and Workbench at 1440 px had zero horizontal overflow; console errors/warnings were zero.
- Immediately before this closeout documentation edit, local `HEAD`, `origin/main`, and live GitHub `main` all matched `0d63098b6115f03b29af2cf9156684425b746cc7`; ahead/behind was `0 0` and the working tree was clean.
- Final closeout commit: the final `main` commit containing this subsection. Its exact hash, final Pages status, local/origin/live equality, divergence, and clean-tree result are reported externally because a commit cannot contain its own hash.

## 2026-09-02 aggressive new workflow-cluster expansion

### Start state and repository safety

- Existing local repository was reused at `C:\Users\song\Documents\ChatGPT\cablechecklab`; no repository was created and no existing change was reset, restored, deleted, or overwritten.
- Initial local `HEAD` was `157477c257e97780e995fc56fea351afa9ba4083`; the working tree was clean on `main` and the configured origin was `https://github.com/canghun13/cablechecklab.git`.
- `git ls-remote origin refs/heads/main` found the newer remote commit `20e9751baf1e96463fbaef513fbe61d9330b694c`. After `git fetch origin main`, local was behind by five commits and not ahead. A safe `git pull --ff-only origin main` synchronized local `HEAD`, `origin/main`, and live GitHub `main` at `20e9751baf1e96463fbaef513fbe61d9330b694c` before research or edits.
- The full existing handover, all 33 Tools, seven workbenches, and every prior candidate/rejection set were restored before discovery. The existing HDMI and USB4 follow-up work was not repeated.

### Exclusion set carried forward

- Excluded all existing 33 Tool intents, existing workbench logic, and thin variants of USB-C charging, USB PD/PPS, cable claims, USB data, USB4/Thunderbolt, video adapters, displays/MST/DSC, docks/hubs, and HDMI routing/distribution.
- Excluded the 35 charger/PD/hub/KVM/display/dock/fallback candidates from 2026-08-13; the 28 capture/audio/MIDI/mobile-storage/mobile-USB/tethering/Ethernet/public-charging candidates from 2026-08-20; and the 54 broad candidates from 2026-08-26.
- Continued to exclude exact-model charger/dock/KVM/MST/adapter/eGPU/cable databases, cable-length or real-performance prediction, affiliate comparison databases, host-controller telemetry, descriptor/EDID/InfoFrame decoders, PC front-panel work, conference BYOD, analog connector variants, consumer storage bridges, printer/scanner, webcam, VR, gaming HDMI, car infotainment, wireless charging, desk labeling, long-run AV, and all recently held HDMI subpages.

### Phase A — 60 genuinely new broad targets

Each item was screened for a separate user decision, interactive form, repeat/search intent, overlap, and static maintainability. `GO` below means it survived broad discovery into the winning family, not that every page was automatically built.

1. PoE Type/Class requirement matcher — GO.
2. PoE switch/injector/splitter/extender selector — GO.
3. PoE switch per-port plus total-budget planner — GO, with crowded calculator competition noted.
4. PoE-powered downstream/pass-through topology planner — GO.
5. Passive-versus-IEEE PoE preflight — GO.
6. PoE failure isolator — GO.
7. T568A/B endpoint mapper — HOLD; useful but overlaps a wiremap checker.
8. Ethernet wiremap tester-result decoder — HOLD; strong diagnostic intent.
9. Partial-pair speed failure checker — MERGE with wiremap diagnostics.
10. Ethernet category/speed/run requirement builder — HOLD.
11. Patch-panel/keystone/plug termination planner — HOLD; fourth-Tool strength is marginal.
12. Shield/grounding topology preflight — HOLD; installation/code boundary.
13. MoCA topology-readiness checker — HOLD.
14. MoCA splitter-frequency path checker — HOLD.
15. MoCA point-of-entry filter placement planner — HOLD.
16. Coax path-loss budget planner — HOLD; existing calculators.
17. DOCSIS/satellite coexistence preflight — HOLD; provider-frequency uncertainty.
18. MoCA failure isolator — HOLD.
19. Fiber connector/polish matcher — HOLD.
20. Single-mode/multimode wavelength path checker — HOLD.
21. SFP port/transceiver form-factor matcher — HOLD; exact-vendor coding risk.
22. BiDi wavelength-pair checker — HOLD.
23. Fiber polarity planner — HOLD; strong hardware-vendor tools.
24. Optical link-budget planner — REJECT; mature free-calculator SERP.
25. DTE/DCE/null-modem selector — HOLD.
26. RS-232/RS-422/RS-485/TTL electrical-standard selector — HOLD.
27. Serial settings matcher — HOLD; current free references/tools.
28. Flow-control/handshake planner — HOLD.
29. DB9 continuity/pinout decoder — HOLD; non-standard vendor pinouts.
30. USB-to-serial preflight — HOLD; specialist and driver/product dependent.
31. Powered-versus-passive speaker connection selector — HOLD.
32. Amplifier/speaker nominal-load planner — REJECT; saturated calculator SERP.
33. Speaker wire gauge/loss planner — REJECT; saturated calculator SERP.
34. Subwoofer input-route planner — HOLD; only one especially strong workflow.
35. 70 V/100 V tap/amplifier planner — REJECT; mature free tools.
36. Instrument-versus-speaker-versus-patch cable checker — HOLD.
37. Guitar-pedal power compatibility checker — REJECT; strong database-backed incumbent.
38. Pedal daisy-chain current/polarity planner — REJECT; bundled by incumbents.
39. Isolated-output/ground-loop planner — HOLD; safety and rig-specific behavior.
40. Four-cable-method connection planner — HOLD; strong article intent but weak cluster gap.
41. Raceway/tray fill planner — REJECT; existing calculators and code context.
42. Bundle/grommet diameter estimator — REJECT; existing calculators.
43. Bend-radius preflight — HOLD; product-construction dependency.
44. Connector pull/clearance planner — HOLD; measurement-dependent niche.
45. In-wall/plenum-rating requirement builder — HOLD; regional code/safety burden.
46. Replacement DC-adapter electrical/plug matcher — REJECT; strong incumbent and damage risk.
47. DC polarity-symbol decoder — MERGE with replacement-adapter matching.
48. Barrel-plug measurement matcher — REJECT; physical measurement uncertainty.
49. Multi-device DC splitter-load planner — HOLD; unsafe without exact supply/wiring evidence.
50. IR repeater/blaster selector — HOLD.
51. IR carrier-frequency compatibility preflight — HOLD; exact-device documentation burden.
52. Multi-zone IR emitter planner — HOLD; narrow demand.
53. IR failure isolator — HOLD; only two to three strong independent Tools.
54. IP-versus-analog camera cabling selector — HOLD; partly general networking/security design.
55. BNC/balun path planner — HOLD; analog surveillance niche.
56. Camera power-drop planner — HOLD; electrical installation/safety burden.
57. Camera cabling failure isolator — MERGE with PoE or analog path-specific guidance.
58. Laptop lock-slot type selector — HOLD; exact-model slot database pressure.
59. Keyed/combo/anchor requirement builder — HOLD; purchasing guide rather than repeated tool.
60. Dock/lock-cable topology planner — REJECT; fewer than four independent Tools.

### Phase B — 12-family shortlist

Scores are a comparative research rubric, not search-volume claims: demand/long-tail 25, free interactive gap 20, four-Tool naturalness 20, repeat use 10, static accuracy 10, non-overlap 10, maintenance 5.

| Family | Score | Decision | Main reason |
|---|---:|---|---|
| IEEE/passive Power over Ethernet | 92 | FINALIST / GO | Six separate decisions, strong public standards evidence, repeat deployment and failure workflows; only the generic budget subtool is crowded. |
| Copper Ethernet termination and tester results | 84 | FINALIST / HOLD | Strong wiremap demand and physical-cable fit, but termination, partial-pair, and component pages collapse toward one diagnostic workflow; fourth/fifth Tool quality is weaker. |
| MoCA/coax home networking | 78 | FINALIST / HOLD | Natural consumer connectivity fit and several recurring problems, but a new free decision lab already covers topology, filters, adapter count, and troubleshooting together. |
| Serial links and adapters | 72 | FINALIST / HOLD | Several technical workflows, but specialist intent, non-standard pinouts, existing references, and driver/vendor dependence reduce breadth. |
| Fiber/SFP physical paths | 70 | HOLD | Six plausible checks, but exact-vendor coding and strong link-budget/polarity tools create maintenance and competition risk. |
| Guitar/pedalboard connectivity | 67 | HOLD | Repeated power and routing questions, but current free builders already combine pedal databases, power, chain order, and cable routing. |
| Physical cable routing/install | 63 | HOLD | Repeat installation need, but calculators exist and regional construction/code rules weaken a globally static result. |
| Passive speakers/distributed audio | 61 | HOLD | Natural calculations but impedance, wire, and 70/100 V SERPs are already saturated; also adjacent to the recent analog-audio HOLD. |
| IR control extension | 57 | HOLD | Static and safe when documented, but only two to three strong recurring actions. |
| CCTV cabling | 56 | HOLD | Potential breadth, but mixes PoE, analog video, voltage drop, outdoor installation, and security design into an incohesive cluster. |
| Replacement DC power | 48 | REJECT | High consequence, exact plug/polarity uncertainty, and a strong dedicated incumbent. |
| Laptop locks/security cables | 43 | REJECT | Exact-model slot mapping pressure and fewer than four durable interactive workflows. |

### Phase C — finalist Tool-level validation

#### 1. Power over Ethernet — 92 / GO

- **Type/Class Compatibility Checker:** repeated questions distinguish 802.3af/at/bt, Type, Class, PSE power, and PD-available power. Public Ethernet Alliance class tables support static logic. Current SERPs are mainly articles/tables; neutral direct compatibility interaction is weak.
- **Equipment Selector:** switch versus injector versus splitter versus extender changes the physical architecture and purchase class. Results found vendor articles and product pages, not a strong neutral workflow that starts from source/endpoint/data/count/distance.
- **Switch Power Budget Planner:** strong repeat deployment intent and many free calculators. Kept only as one cluster component; it does not justify the family alone.
- **PoE Pass-through Planner:** PoE-powered switches consume input power before serving downstream PDs, and their output changes by exact input mode. Repeated community questions and vendor-specific tables exist, but a neutral input/self-use/output boundary tool is scarce.
- **Passive PoE Preflight:** proprietary always-on power is materially different from IEEE detection. Repeated 24 V/48 V compatibility questions and damage concerns make voltage/pair/polarity evidence a separate pre-connection action.
- **Failure Isolator:** vendor guides use detection/classification, known-good cable/port, lower load, and compatible injector comparisons. A structured next-test workflow is distinct from planning or arithmetic.
- Hard Gate result: **6/6 natural Tools pass**. Each changes a different next action. No exact-model database, live telemetry, framework, backend, or paid-standard reproduction is required.

#### 2. Copper Ethernet termination/test — 84 / HOLD

- Fluke Networks publicly distinguishes open, short, reversed pair, crossed pair, and split pair, and recurring home-network questions show tester-result confusion.
- A wiremap decoder is strong, and a category/speed requirement builder is plausible. T568A/B endpoint mapping and partial-pair diagnosis are better merged into wiremap; patch-component selection is closer to a guide; grounding/shielding adds installation boundaries.
- Hard Gate result: **3 strong independent Tools plus 1 marginal**. Hold until a fourth repeated action is demonstrated without splitting one tester workflow.

#### 3. MoCA/coax — 78 / HOLD

- MoCA Alliance and vendor sources support topology, splitter, filter, amplifier, length, and coexistence checks. Recurring home-network questions confirm demand.
- Current competition includes `https://no-dead-zones.com/backhaul/moca-backhaul-decision-lab/`, which already combines readiness, adapter count, filter placement, and troubleshooting, plus a separate coax-loss calculator.
- Hard Gate result: technically 4–5 possible pages, but topology, splitter, filter, and coexistence inputs are better as one integrated preflight. The remaining free-tool gap is not strong enough for aggressive implementation now.

#### 4. Serial links — 72 / HOLD

- DTE/DCE/null-modem, electrical standard, settings, flow control, and pin continuity are real questions. Existing tools include `https://www.nictools.dev/tools/serial-reference`, `https://bogpeople.com/networking/SerialComms/rs232pinouts.shtml`, and `https://www.protocolvisualizer.com/`.
- Non-standard RJ/DB pinouts, USB-serial driver behavior, and industrial equipment manuals make general browser verdicts less reliable. Hard Gate breadth exists on paper, but the consumer/cable-planning fit and neutral gap are weaker than PoE.

### Research evidence retained

- IEEE 802.3bt scope: `https://standards.ieee.org/ieee/802.3bt/6749/`.
- Ethernet Alliance public Type/Class and PSE/PD power overview: `https://ethernetalliance.org/wp-content/uploads/2019/12/WP_EA_Overview8023bt_V2p1_FINAL.pdf`.
- Ethernet Alliance certification distinction between IEEE and proprietary powering: `https://ethernetalliance.org/poecert/program-overview/`.
- Cisco detection/classification, LLDP, and budget behavior: `https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/infra/poe/poe-configuration-guide/g-poe/c-poe-and-switch.html`.
- Current PoE budget competitors included `https://www.lvtoolbox.com/poe-calculator`, `https://www.roomplot.com/free-tools/poe-calculator`, `https://networktools.io/hardware-tools/poe-budget-calculator/`, and `https://ecparts.cc/calculators/communication/poe-power-calculator/`. Their presence reduced the budget Tool gap score but did not cover the other five actions.
- Fluke wiremap evidence: `https://www.flukenetworks.com/blog/cabling-chronicles/wire-map-testing-it-s-not-all-about-color`, `https://www.flukenetworks.com/knowledge-base/microscanner2/diagnosing-wiremap-faults-microscanner2`, and `https://www.flukenetworks.com/support/knowledge-base/linkiq/split-pair-identification`.
- MoCA sources: `https://mocalliance.org/technology/Final_Best-Practices-for-Installation-of-MoCA_170516rev01.pdf`, `https://en-us.support.motorola.com/app/answers/detail/a_id/176961/~/coax-network-considerations-for-moca/`, and `https://account.scte.org/standards/library/catalog/scte-235-coexistence-of-docsis3-1-signals-and-moca-signals-in-the-home-environment/`.
- Strong free pedalboard competition included `https://www.guitarchalk.com/pedal-power-calculator/`, `https://pedalrig.com/pedalboard/builder`, and `https://pedalmap.app/`; speaker competition included multiple impedance, wire-gauge, and 70/100 V calculators; physical-install competition included `https://cablemgmtlab.com/cable-calculator/` and `https://electrical.design/tools/bundle-diameter`.

### Final decision and implementation

- **GO — Power over Ethernet Planning**. The cluster is new relative to all exclusion sets, fits Cable Check Lab’s physical connection/power mission, and passes the four-Tool Hard Gate with six genuinely separate actions.
- Added one Workbench: **Power over Ethernet** (`/tools/poe/`).
- Added six Tools:
  1. **PoE Class Compatibility Checker** (`/tools/poe-class-checker/`)
  2. **PoE Equipment Selector** (`/tools/poe-equipment-selector/`)
  3. **PoE Switch Power Budget Planner** (`/tools/poe-power-budget-planner/`)
  4. **PoE Passthrough Power Planner** (`/tools/poe-passthrough-planner/`)
  5. **Passive PoE Compatibility Preflight** (`/tools/passive-poe-preflight/`)
  6. **PoE Failure Isolator** (`/tools/poe-failure-isolator/`)
- Added one Guide: **Power over Ethernet Planning & Troubleshooting** (`/guides/poe-planning/`).
- Added one Reference: **PoE Types, Classes & Power Boundaries** (`/references/power-over-ethernet/`).
- Added six vanilla-JavaScript controllers to `assets/app.js`, registered `poe` for existing `workbench_to_tool_click`, and inherited `tool_run`, `tool_result`, `reset_tool`, `copy_result`, and `print_result`. Analytics event parameters remain stable route/context/status fields only; no entered voltage, wattage, topology, or diagnostic response is sent.
- Integrated the cluster into Home, Tools, Guides, References, `sitemap.xml`, and `llms.txt`. Public counts are now **77 HTML / 76 indexable / 39 direct Tools / 8 workbenches / 15 Guides / 7 References / 0 Comparisons**.
- GA4 remains `G-8PFRRXPGEF` exactly once on every public page. Contact remains `canghun13@naver.com`. CNAME, robots rules, static GitHub Pages architecture, visual identity, and the user-managed Findly block below the home footer were not changed.

### Local QA before commit

- Repository verifier: **PASS — 77 public HTML files / 76 indexable pages**, sitemap parity, internal targets, duplicate IDs, title, description, canonical, Open Graph, exactly one H1, valid JSON-LD, and exactly one GA4 loader/config per public HTML.
- Bundled Node.js `--check assets/app.js`: PASS. `git diff --check`: PASS.
- Browser functional QA: all six Tools initialized and changed state correctly. Verified Class fit→mismatch, budget fit→exceeded, pass-through fit→shortfall, passive declared match→unsafe mode mismatch, and isolation baseline→cable-layer narrowing. Equipment Selector defaulted to an IEEE midspan injector for one IEEE PD behind non-PoE Ethernet.
- Copy returned visible result text; Reset restored defaults; shared Print control remains wired through the tested common controller. Mobile Menu opened with `aria-expanded=true` and visible navigation.
- Responsive browser QA covered all nine new pages at **390 / 768 / 900 / 1024 / 1280 / 1440**: **54/54 checks passed** with zero horizontal overflow and no header/H1 collision. Console errors/warnings: zero.
- Final commit, push, Pages deployment, production crawl/browser checks, hash equality, divergence, and clean-tree state are recorded in the closeout subsection after deployment.

### 2026-09-02 deployment closeout

- Implementation commit: `03fcdcc90798e4a4ecfa498d472b7427ad8769b3` (`Build Power over Ethernet planning cluster`).
- Push: succeeded as a fast-forward from `20e9751baf1e96463fbaef513fbe61d9330b694c` to `03fcdcc90798e4a4ecfa498d472b7427ad8769b3` on GitHub `main`.
- GitHub Pages run `33576736944` completed with `success` for the implementation commit: `https://github.com/canghun13/cablechecklab/actions/runs/33576736944`.
- Production crawl: `sitemap.xml` returned HTTP 200 with **76 URLs**, and all 76 returned HTTP 200. `robots.txt` returned HTTP 200 and retained the canonical sitemap directive.
- Production Workbench and representative Class Tool returned HTTP 200. The Tool contained the new H1 and `data-tool="poeclass"`, loaded `app.js?v=20260902a`, and contained exactly one GA4 loader for `G-8PFRRXPGEF`. The Workbench linked all six Tools.
- Production browser QA: Class Tool initialized at `DECLARED CLASS FIT`, changed to `CLASS MISMATCH` for Type 1 / Class 8, Copy returned the rendered result, Reset restored the default, and Print invoked without console errors or warnings. At 390 px the Tool had zero horizontal overflow and mobile navigation opened with `aria-expanded=true`; at 1440 px the Workbench rendered eight cards with zero horizontal overflow.
- Immediately before this closeout edit, local `HEAD`, `origin/main`, and live GitHub `main` all matched `03fcdcc90798e4a4ecfa498d472b7427ad8769b3`; ahead/behind was `0 0` and the working tree was clean.
- Final closeout commit: the final `main` commit containing this subsection. Its exact hash, final Pages result, local/origin/live equality, divergence, and clean-tree result are reported externally because a commit cannot contain its own hash.

## 2026-09-02 PoE field-control sizing regression fix

### Scope and diagnosis

- Start commit: `58cc4c7aa200ecf8cf187a9a5eb2a2f7e13153a6`; local `main`, `origin/main`, and live GitHub `main` matched with `0 0` divergence and a clean worktree.
- Scope was limited to `/tools/poe-failure-isolator/` and `/tools/poe-passthrough-planner/`. No Tool, page, research, calculator logic, shared event logic, content, navigation, sitemap, `llms.txt`, CNAME, robots rule, or user-managed Findly/footer block was added or changed.
- Production reproduction covered 390, 768, 900, 1024, 1280, and 1440 px. At affected desktop widths, a long wrapping label made its parent grid row taller; the sibling `.field` then used the default `align-content: normal`, stretching its implicit label/control tracks and expanding an otherwise 46 px control to 58.8 px. The pass-through page uses number inputs rather than selects, but had the same grid-track cause.
- The fix scopes `align-content: end` to `.field` elements under `main[data-tool="poeisolation"]` and `main[data-tool="poepassthrough"]`. It preserves the shared 46 px minimum, 1 px border, 9 px vertical padding, `border-box`, row layout, and natural label wrapping without a fixed-height override. Only the two affected pages received the new `styles.css?v=20260902b` cache key.

### Local QA before commit

- After the fix, every form input/select on both pages measured exactly 46 px at 390 / 768 / 900 / 1024 / 1280 / 1440, with zero horizontal overflow. Header/menu breakpoint behavior, result panels, action buttons, notes, and footer remained present; both mobile menus opened with `aria-expanded=true` and visible navigation.
- Failure Isolator: default `MORE EVIDENCE NEEDED / Detection path first`, cable-change `FAILURE LAYER NARROWED / Cable channel first`, Reset, Copy, and Print passed. Every select retains a valid selected option, and rendered results contained no `NaN` or `Infinity`.
- Passthrough Planner: default fit, 40 W shortfall, exact 35 W tight boundary, invalid 0 W `CHECK INPUT`, Reset, Copy, and Print passed. Rendered results contained no `NaN` or `Infinity`.
- Related regression QA covered PoE Class Checker, Equipment Selector, Power Budget Planner, and Passive PoE Preflight at 390 / 768 / 1024 / 1440 plus default-result smoke checks. All had zero horizontal overflow and finite results. Passive PoE's pre-existing 58.8 px `pvSourceV` control at 768 px matched the current production baseline exactly and was not changed by this scoped fix.
- Repository verifier: PASS — 77 public HTML files / 76 indexable pages, sitemap parity, internal targets, duplicate IDs, metadata, H1, JSON-LD, and one GA4 loader/config (`G-8PFRRXPGEF`) per public page. Bundled Node.js `--check assets/app.js`, CSS brace balance, and `git diff --check` passed. Shared analytics and calculator JavaScript were unchanged, so existing `tool_run`, `tool_result`, `reset_tool`, `copy_result`, and `print_result` wiring remains intact.
- Implementation commit, push, Pages deployment, production browser QA, final hash equality, divergence, and clean-tree state are recorded in the closeout subsection below.

### Deployment closeout

- Implementation commit: `754ce84fcb4e07d00eb0b65c94c706b51ab217d5` (`Fix PoE field control sizing regression`), pushed as a fast-forward from `58cc4c7aa200ecf8cf187a9a5eb2a2f7e13153a6` to GitHub `main`.
- GitHub Pages run `33579492396` completed successfully for the implementation commit: `https://github.com/canghun13/cablechecklab/actions/runs/33579492396`.
- Production loaded `/assets/styles.css?v=20260902b` on both modified pages. At 390 / 768 / 900 / 1024 / 1280 / 1440, every target input/select measured 46 px, scoped `.field` elements computed to `align-content: end`, horizontal overflow was zero, mobile/desktop menu breakpoints were correct, and the footer remained present.
- Production functional QA passed Failure Isolator default, cable-layer change, Reset, Copy, and Print; Passthrough Planner default fit, 40 W shortfall, exact 35 W tight boundary, invalid 0 W input, Reset, Copy, and Print. Results contained no `NaN` or `Infinity`; browser console errors/warnings were zero. Both pages retained exactly one GA4 loader and one `G-8PFRRXPGEF` config.
- Final closeout commit: the final `main` commit containing this subsection. Its exact hash, final Pages result, local/origin/live equality, divergence, and clean-tree state are reported externally because a commit cannot contain its own hash.
