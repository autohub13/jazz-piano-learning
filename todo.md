# Todo

Each pass: take the first unchecked item, do it, verify with `npm test` and
`npm run typecheck` (plus a browser check for UI work), then tick it off.

- [x] Clicking a bar on the sheet music plays only that bar.
- [ ] When a note is tied into a bar, the bar it started in stays lit until it ends (clicking bar 2 of the Saints lights bar 1 for a beat first).
- [ ] The chord chart draws a phantom empty 13th bar on minor-blues: `barsOf` in LeadSheet.tsx does `Math.ceil` on a float total of 48.00000000000001 beats.
