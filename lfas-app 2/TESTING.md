# Validation · 21 September 2026

## Executed successfully

- 13 automated scoring tests: exact sign counts, blank/partial state, zero and maximum inputs, equal domain weighting, rounding order, inclusive 0.5 boundary, non-chained mixed grouping, secondary ties, no zero-score secondary, independent functional modifiers, incomplete functional export, invalid inputs.
- In-app browser: all 135 score buttons plus 12 functional buttons rendered; minimum 44-pixel control dimensions measured.
- Responsive layout checked at 1194, 1024, 834, 390, and 320 pixels; no horizontal document overflow at observed sizes.
- Full 27-sign entry produced domain averages 3.0, 3.0, 1.0, 2.0, overall 2.3, and a two-domain mixed pattern.
- Functional Yes/No controls operated without changing morphological scores.
- Copy Results displayed successful clipboard-write feedback. The host browser’s clipboard readback did not expose the copied string; text content was verified through the automated export tests.
- Reset confirmation, cleared scores, disabled Copy Results on incomplete assessment, keyboard arrow selection, and clearing on reload observed.
- No JavaScript error entries reported by the in-app browser.

## Remaining deployment/device checks

A physical iPad/Safari session was unavailable. Home-screen installation, offline reopening, and pasting into the actual EMR must be checked on that device after HTTPS deployment. Automated standalone Chrome launch was blocked by the local environment; UI verification used the app’s browser instead. Clipboard denial fallback is implemented but was not forced in the in-app browser.

1. Open the HTTPS app in Safari and score a full assessment by touch.
2. Copy and paste into a blank EMR note; verify all four means, overall, mixed/driver wording, and positive modifiers.
3. Add to Home Screen; confirm the LFAS icon and standalone launch.
4. After one complete online load, close the app, enable airplane mode, reopen, and confirm scoring works.
5. Reset between assessments; confirm all 27 signs and six modifiers clear.
6. Test portrait/landscape rotation and reopening after backgrounding.
