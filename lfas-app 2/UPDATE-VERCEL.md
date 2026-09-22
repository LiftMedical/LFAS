# Update your existing LFAS app

This update changes only the scoring guide, Blank/0/N/A behavior and completed LFAS Summary flow. It retains the existing signs, 0–4 scale, domain weighting, rounding, mixed-pattern rule, functional controls, visual design, session-only storage and PWA.

## Your existing GitHub/Vercel setup

Your GitHub repository is `LiftMedical/LFAS`. The uploaded app sits inside **`lfas-app 2`**, and Vercel uses that folder as its Root Directory. Keep that setting.

1. Extract `LFAS-app-update.zip` on your Mac.
2. In GitHub, open your LFAS repository and navigate **inside `lfas-app 2`**.
3. Choose **Add file → Upload files**. Drag the **contents** of the extracted `lfas-app` folder into that GitHub folder. Do not upload the ZIP or create another nested `lfas-app` folder.
4. Commit the updated files to `main`. Vercel's existing Git integration should deploy the update.
5. After Vercel shows Ready, close every open LFAS browser tab and home-screen app window. Open the site online, let it load, then close and reopen once more if it still shows Version 1.0. The updated app shows **VERSION 1.1** in the header. The offline cache version has been changed so old app files can be replaced without reloading an active assessment.

No domain changes, new project, database, or environment variables are required.

## Quick acceptance check

- Score some signs; the domain remains Incomplete while a blank remains.
- Enter four numeric scores in a domain and mark its other signs N/A; verify the mean uses only those four scores.
- Change a fourth numeric score to N/A; verify the domain is blocked for insufficient assessable items.
- Finish all four domains; LFAS Summary should open automatically.
- Edit, copy into Jane, and use New Assessment to clear the entries after confirmation.

This package is prepared for upload. It does not itself change your live deployment.
