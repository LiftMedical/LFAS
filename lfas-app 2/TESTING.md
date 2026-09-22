# Validation · Version 1.1 · 22 September 2026

## Executed successfully

- All 21 automated scoring tests pass: sign counts, blanks, zeros, maximum inputs, equal domain weighting, rounding, mixed patterns, secondary ties, independent functional modifiers, invalid input, N/A exclusions, minimum four numeric scores per domain, all-N/A blocking, clearing, and exported exclusions.
- JavaScript syntax check passed.
- Browser workflow: four numeric scores plus four N/A entries gave Structural Support 2.0. Replacing the fourth numeric score with N/A blocked the domain; restoring zero recovered it.
- Completing all domains automatically opened LFAS Summary with averages 2.0, 3.0, 1.0, 2.0; overall 2.0; Mobility primary; tied Structural Support and Envelope secondary.
- Functional Yes selection appeared in the summary without changing the morphological scores.
- Edit Assessment preserved entries. Clearing a score removed the domain mean and overall, and disabled copying. Restoring the score remained in the assessment view; View Summary reopened the summary.
- Copy LFAS Summary reported successful clipboard writing. Export content is covered by automated tests; actual pasting into Jane was not tested.
- New Assessment cancellation preserved the assessment; confirmation cleared all score and functional selections.
- Keyboard End selected N/A.
- Landscape iPad-sized assessment and summary visually inspected at 1194 × 834. No horizontal overflow observed at 1194, 390, and 320 pixels. Numeric and N/A targets measured at least 44 pixels in height and width at the mobile sizes.

## Remaining device/deployment checks

A physical iPad/Safari session was unavailable. After deployment:

1. Score an assessment on the iPad; verify blank, zero and N/A controls.
2. Copy the summary into Jane and confirm scores, driver wording, N/A exclusions and functional modifiers.
3. Close all existing LFAS tabs/home-screen windows, reopen online, and confirm VERSION 1.1. A second close/reopen may be needed while the new offline cache installs.
4. Check Home Screen launch and offline reopening after a complete online load.
5. Test portrait/landscape rotation and background/resume.

Clipboard-denial fallback is implemented but was not forced in the browser. No live deployment was changed during this update.
