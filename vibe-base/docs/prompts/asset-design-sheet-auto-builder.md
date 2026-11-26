# Asset Design Sheet Auto-Builder Prompt

You are Codex operating in a local project workspace. Execute this prompt autonomously and produce a reusable official design sheet from a set of generated character/object images.

## Objective
Create an official design sheet that converts inconsistent generated angle images into a stable production specification for future image generation, 3D modeling, and review.

## Inputs
- Source image directory: `{SOURCE_IMAGE_DIR}`
- Output directory: `{OUTPUT_DIR}`
- Asset name: `{ASSET_NAME}`
- Expected views: `front`, `left-side`, `rear`, `action-3q`
- Minimum image count: `4`

## Required Outputs
Create these files in `{OUTPUT_DIR}`:
1. `{ASSET_SLUG}-design-sheet.html`
2. `{ASSET_SLUG}-design-spec.md`
3. `{ASSET_SLUG}-consistency-qa.md`
4. Copied image files using stable names:
   - `front.png`
   - `left-side.png`
   - `rear.png`
   - `action-3q.png`

## Workflow
1. Locate candidate images in `{SOURCE_IMAGE_DIR}`.
2. Sort candidates by `LastWriteTime` descending.
3. Visually classify at least four images into `front`, `left-side`, `rear`, and `action-3q`.
4. Copy selected images into `{OUTPUT_DIR}` using the stable filenames above. Do not delete originals.
5. Extract invariant design traits from the selected image set.
6. Define variable traits that may change between poses without changing identity.
7. Define hard reject conditions that make future generations invalid.
8. Create the official HTML design sheet with image grid, fixed traits, variable traits, hard rejects, generation prompt, and QA summary.
9. Create the Markdown spec with the same production rules in text form.
10. Create the QA file with numeric scores and final acceptance result.
11. Run acceptance checks and report exact pass/fail states.

## Fixed Trait Requirements
The design spec must include at least 10 fixed traits. Cover:
- silhouette
- torso
- head/eye system
- arms
- hands
- legs
- feet
- rear module
- material
- color palette
- surface wear
- personality/readability

## Variable Trait Requirements
The design spec must include at least 5 variable traits. Examples:
- pose
- arm angle
- eye direction
- glow intensity
- scratch pattern
- minor cable routing

## Hard Reject Requirements
The design spec must include at least 8 hard reject conditions. Examples:
- identity silhouette lost
- extra limbs
- generic humanoid robot
- military mech styling
- wrong eye count or layout
- missing hover-wheel feet
- missing backpack module
- unreadable joints
- plastic toy material replacing ceramic-metal
- text/logo artifacts

## QA Requirements
Create a QA table with one row per required view:
- View
- Source file
- Status: `CONFIRMED`
- Identity score: integer 0-10
- Critical fail count: integer
- Notes

Acceptance criteria:
- At least 4 copied images exist in `{OUTPUT_DIR}`.
- HTML contains at least 4 `<img` tags.
- Markdown spec contains headings `Fixed Traits`, `Variable Traits`, and `Hard Rejects`.
- QA contains `Overall: PASS`.
- Each view status is `CONFIRMED`.
- Each identity score is `>= 7/10`.
- Total critical fail count is `0`.

## Debugging Rules
- If image classification is ambiguous, inspect images visually and choose the closest candidate, then mark the ambiguity in QA notes.
- If fewer than 4 suitable images exist, stop and report `BLOCKED: insufficient source images`.
- If output image links break, use relative paths from the HTML file to images in the same directory.
- Do not claim PASS unless all acceptance criteria are met.

## Final Response
Return:
- saved output paths
- acceptance result
- any caveats about consistency
- the next recommended action
