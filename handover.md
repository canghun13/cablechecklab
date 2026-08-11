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
- Completed a post-launch trust and UX pass without increasing page count.
- Removed invented charging fallback wattage and speculative multi-port power allocation from tool results.
- Made charging-path, cable-product-type, and troubleshooting-path inputs affect their results.
- Added explicit display-topology limits, a connected Tools hub journey, and refreshed primary-source references.

## Pending work

- Collect enough Search Console query/impression data and GA4 tool-engagement data to distinguish real demand from anecdotal demand.
- Keep the device-specific charger directory, exact dock checker, cable-length estimator, and product-comparison layer on HOLD until their source, maintenance, and correction models are defined.

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
