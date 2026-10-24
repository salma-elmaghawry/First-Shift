# FirstShift

Practice the work. Defend your decisions. Know what to improve.

Practical readiness for frontend graduates: a real work task, a work defense on the graduate's own submission, an evidence report, and a 30-minute human review paid with Paymob.

## What's here

```
brand/
  README.md        brand book: name, logo rules, voice, color, type, components
  tokens.json      design tokens (same values as web/css/tokens.css)
  logos/           SVG lockups, marks and app icon
web/
  index.html       landing page + the 5-screen demo (one page)
  css/tokens.css   colors (light + dark), fonts, spacing, radius
  css/type.css     type scale classes (type-*)
  css/components.css  fs-* components: ticket, chips, evidence, defense, diff, stepper, buttons
  css/site.css     page layout
  js/app.js        demo logic: steps, adaptive defense script, Paymob states
  build_artifact.py   bundles web/ into one self-contained HTML file for sharing
```

## Run it

Open `web/index.html` in a browser. No build step.

Deep links: `index.html#task`, `#submit`, `#defend`, `#report`, `#review` open the demo at that step.

## Where to plug in the real backend

- **Defense questions**: `DEFENSE` in `web/js/app.js` holds the scripted questions and answers. Replace it with calls to the interview engine; keep the `from` field so follow-ups show what triggered them, and `simple` for the "Say it simpler" button.
- **Progress (XP, levels, badges, skill stripes)**: `LEVELS`, `BADGES` and `SKILLS` in `web/js/app.js`; every reward goes through `award(id, xp, title, sub, badgeId)`. Rule: XP rewards effort and honesty and never appears on the evidence report.
- **Paymob**: the `#btn-pay` handler in `web/js/app.js`. Create the payment on your server, redirect to Paymob, and on return poll your order endpoint. Never treat the redirect query string as proof of payment (that's task FS-101 itself).
