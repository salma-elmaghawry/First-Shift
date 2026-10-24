FirstShift is practical job readiness for frontend graduates. A graduate takes a realistic work task, defends the decisions behind it in a live follow-up, and leaves with an evidence report and a focused 30-minute review with a working engineer. Training providers run it across a cohort to see who needs what next.

**Promise:** Practice the work. Defend your decisions. Know what to improve.
**Arabic:** اتمرّن على الشغل. دافع عن قراراتك. اعرف هتتحسّن في إيه.
**Thesis line:** A project can be copied. Understanding has to be defended.

## The idea: a work order

FirstShift is your first shift at work, before the job. The brand borrows from the places real work happens: tickets with IDs, code diffs, timestamps, review status, the hi-vis vest of a shift worker. It never looks like a quiz, a course or a game. When in doubt, ask "would this appear on a real ticket or a real code review?" If not, leave it out.

## Name and logo

- Write the name **FirstShift**: one word, capital F and S, like a component name. Never "First Shift", "Firstshift" or "FIRSTSHIFT".
- **The mark is the Shift Stripe**: the keyboard Shift arrow cut by one band, like the reflective tape on a hi-vis vest. It means *shift up* and *on shift*.
- Use `firstshift-lockup-ink.svg` on `desk` and `paper`; `firstshift-lockup-paper.svg` on `night` and dark grounds. Use `firstshift-app-icon.svg` for favicons and avatars, `firstshift-mark.svg` alone only where the name is already on screen.
- The wordmark is Archivo SemiExpanded ExtraBold converted to outlines. Don't retype it in a font.
- Keep clear space of one mark-width around the lockup. Minimum sizes: lockup 96px wide, mark 16px.
- Don't recolor the wordmark orange, put the mark on a `hivis` fill, rotate it, outline it, or add shadows or gradients.

## Voice

Plain, specific and calm, like a good senior engineer reviewing a PR. Talk to learners as "you"; talk about them to providers as "learners" or "graduates".

| Write | Don't write |
| --- | --- |
| Identified redirect-only success as unsafe. | Great job! You nailed security 🎉 |
| Did not address duplicate webhook delivery. | Weak on webhooks. |
| Pending mentor review | Processing… |
| This report describes performance on one task. | Certified job-ready |
| You can use AI tools. Tell us what they helped with. | AI use is strictly prohibited. |
| Badge unlocked: Honest unknown | Wrong answer! −20 XP |
| Quest unlocked: FS-102 · Duplicate webhooks | Failed: idempotency |

- **No percentages, no pass marks.** Never write "Job ready: 92%". Report what was observed, with a source.
- **Evidence states are exactly three words:** Observed, Partial, Not shown. Not "failed", "wrong" or "missing".
- Every finding cites a source in a `fs-ref`: `diff +1 to +3`, `Defense Q2 · 01:48`, `Test plan 2–4`.
- Name the gap as a skill ("Idempotency and uncertain provider outcomes"), and the next practice as an action ("Add a safe retry and duplicate-event strategy.").
- Never claim to detect cheating or prove unaided work. Ask for an AI usage note instead.
- Sentence case for headings, buttons and chips. Uppercase only in `type-label`.
- Buttons say what happens: "Submit and start defense", "Pay 300 EGP with Paymob". Not "Continue" or "OK".
- Money is `300 EGP`, durations `30 min`, times 24-hour Cairo time (`Sun 26 Oct, 18:00`). Task IDs are `FS-101`.
- No emoji.

## Color

Cool desk, white paper tickets, ink type, and one hi-vis orange. **Light only**: the product always renders on the light desk, and there is no dark theme.

- **Grounds:** `desk` is the page; `paper` is tickets, panels, inputs and the alternate landing bands; `sunk` is code blocks, inset wells and hint bodies. `scrim` sits behind dialogs.
- **Ink:** `ink` for headings, body and the primary button fill; `ink-soft` for secondary copy; `ink-muted` for meta, labels and timestamps. All three pass 4.5:1 on `desk`, `paper` and `sunk`.
- **Lines:** `line` for hairlines and card borders (decorative); `line-strong` for input and control borders (3:1).
- **Orange marks the next move.** `hivis` fills at most one thing per screen besides the logo: the commitment button (Start the demo task, Pay with Paymob) or a `Live` chip. Use `hivis-text` when orange is text, and `hivis-tint` behind gaps and partial evidence. Text on a `hivis` fill is `on-hivis`.
- **Evidence and status** always pair an icon and a word with the color: `proof` for observed and confirmed, `review` for human review and pending, `hivis-text` for partial and unknown, `alert` for failed or declined. Each has a `-tint` for chip backgrounds.
- `focus` (an alias of `review`) is a solid 2px ring with a 2px offset, 3:1 or better on every ground.
- XP fills are `hivis` with `sheen` stripes over them, like hi-vis tape.

## Type

- **Display:** Archivo at `font-stretch: 112%` (SemiExpanded), weights 700–800. Use `type-display-xl` once per page (the hero), `type-display-l` for section heads, `type-title` for screen titles and ticket titles. Tight tracking, balanced wrapping.
- **Text:** IBM Plex Sans: `type-heading`, `type-body-lg`, `type-body`, `type-body-sm`. IBM Plex Sans Arabic is next in the stack, so Arabic copy matches without extra work.
- **Utility:** IBM Plex Mono for everything that comes from the machine: `type-label` (uppercase, tracked) for eyebrows and field meta, `type-ref` for source citations and IDs, `type-code` for code.
- Keep running text near 65 characters wide.

## Shape, space and elevation

- 4px grid: `space-1` to `space-18`. Lay out with flex or grid `gap`, not margins.
- `radius-s` for chips, refs and inputs; `radius-m` for buttons, cards and code blocks; `radius-l` for tickets and panels; `radius-pill` for status chips.
- Only tickets float, with `shadow-ticket`. Panels and everything else sit flat with a `line` border.

## Signature elements

- **The ticket** (`fs-ticket`): a task, a pilot offer or an order summary. It has a mono ID, a meta line, a body and, when there's a second part, a perforation (`fs-ticket__perf`) with two punched notches before the stub. The notches are painted in `desk`; on a `paper` band set `--ticket-ground: var(--paper)`.
- **Refs** (`fs-ref`): small mono citations that tie a claim to a line, a timestamp or a document.
- **Keycaps** (`fs-key`): step numbers and the level number sit in a key-shaped box with a thicker bottom edge, an echo of the Shift key. Use numbers only for real sequences.
- **The shift log**: a timeline of mono timestamps and plain lines, ending on the moment that matters.

## Progress and rewards

Gamify the effort, never the judgment.

- **XP** comes from doing the work and being honest about it: Clocked in +20, Shipped it +100, Owned your AI +30, each defense answer +50, Held the line +50, Honest unknown +40, Gap hunter +60, Booked a pro +80. A task shows what it pays in an `fs-reward` chip ("Up to 450 XP").
- **Levels:** 1 First shift (0 XP), 2 Regular (300), 3 Shift lead (800), 4 On call (1500). The level number sits in a hivis `fs-key`; the bar is `fs-xp`.
- **Badges** are hex patches with the Shift Stripe band (`fs-badge`). Locked badges stay visible with how to earn them, so they read as goals.
- **Skill stripes** (`fs-stripes`): one per task where an evidence report shows the skill, up to three. A skill with no stripes names the quest it unlocked.
- **Gaps unlock quests.** The next task is built from the gap and shown as a ticket marked Unlocked, with its reward.
- **Never on the report.** XP, levels and badges never appear on an evidence report or a provider view. Say so wherever they appear.
- **Good news only.** No XP is ever taken away, nothing is "failed", and hints are free.
- **Celebrate in proportion:** a toast per badge, one end-of-shift summary with the XP tally, a stamp when a badge lands. No confetti, no sounds.
- **The HUD** (level, XP, badge count) lives in the app bar and opens the locker: level, all badges and skill stripes.

## Guidance

- Every screen says what happens next and roughly how long it takes (the shift plan: Read 5 min · Change 25 · Explain 10 · Defend 5).
- Offer up to three free hints (`fs-hint`), from a nudge to a near-answer, and count how many were opened.
- Each defense question has a "Say it simpler" rewording. Answers have no timer.
- Use one `fs-tip` per screen at most, next to the action it helps.
- After a report, every Partial or Not shown item has a "How to practice this" hint.

## Iconography

- Inline SVG on a 24px grid, `1.75` stroke, round caps and joins, `currentColor`. Size 20px (`fs-icon`) or 14px in chips (`fs-icon--sm`).
- State icons encode state by shape as well as color: a check circle (observed, confirmed), a half-filled circle (partial), a dashed circle (not shown), a clock (pending), a crossed circle (failed), a question circle (unknown).
- AI is shown with a terminal prompt icon, never sparkles.
- No emoji, no illustrations of people, no stock photos.

## Motion

Quiet, with one kind of celebration. A `Live` chip's dot pulses; transcript entries rise 6px as they arrive; payment confirmation shows a determinate bar. The XP bar fills over 0.9s, a new badge stamps in, toasts slide in and out, and the HUD bumps when XP lands. Nothing starts invisible. Respect `prefers-reduced-motion` by removing all of it.

## Using it in code

The website keeps the same values in `web/css/tokens.css`, the type classes in `web/css/type.css`, and the components in `web/css/components.css` (this system's `bundle.css`). Class names use the `fs-` prefix, BEM-style (`fs-ticket__perf`, `fs-chip--observed`). Load the three Google families: Archivo (wdth 100–125, wght 600–800), IBM Plex Sans (400–600) and IBM Plex Mono (400–600).
