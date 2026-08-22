# ET Flash Cards — Product & Content Specification

## Goal
Engineering Technology lesson notes are converted into small physical revision flash cards that can be studied using a two-bin method and printed from a premium web app.

## Source-of-truth rule
- Every final card must come strictly from the lesson note supplied by the user for that unit.
- Do not invent extra lesson facts, questions, answers, examples, formulas, classifications or wording that are not supported by the supplied note.
- Existing/demo cards are placeholders until the matching complete lesson note is supplied and checked.
- Each lesson must be checked for full coverage before it is marked complete.

## Card structure
- Front: one clear recall prompt/question.
- Back: the exact answer/content supported by the note.
- Show the unit number in a small corner badge on every card.
- Give every card a stable sequential ID such as `05-001`, `05-002`, ... in lesson order.
- Preserve the logical order of the source note.
- Split large topics into multiple small cards when needed for effective recall, while keeping all source content covered.

## Lesson/category structure
- Lessons/units are separate categories.
- Each lesson/unit has its own identifying color.
- App must scale to multiple ET lessons without mixing card numbering or content.

## Study workflow
Physical method:
1. Read the front of a card and answer from memory.
2. If correct/known, put it in the `පුළුවන්` bin.
3. If not known, put it in the `බැරි` bin.
4. Review the `බැරි` cards daily until they can move to the `පුළුවන්` bin.

Digital preview may also expose matching `පුළුවන්` / `බැරි` status controls for revision filtering, but physical printing remains a core workflow.

## Print Studio
- Paper: A4.
- Cards themselves are smaller than A4 and multiple cards must fit on one A4 sheet.
- User can choose preset card sizes and adjust custom width/height in millimetres.
- Support Question side (Front), Answer side (Back), and combined preview.
- Duplex workflow must keep the same card ID aligned on front/back after cutting.
- Back-side layout should mirror positions when needed for A4 portrait duplex printing.
- Include cut guides/borders.
- Allow printing all cards or a filtered set such as difficult/`බැරි` cards.
- Print output should prioritize readability and efficient use of A4 space.

## Visual design
Use the existing Day Papers visual language as the design reference:
- Deep navy / near-black premium background.
- Blue and cyan accents.
- Soft glass-like borders and gradients.
- Rounded modern cards.
- Clear typography with Sinhala-friendly fallback fonts.
- Premium but uncluttered desktop and mobile layouts.
- Each unit retains its own category accent color without losing the Day Papers base theme.

## Main app areas
1. Unit / Lesson dashboard
2. Flash-card study view
3. Print Studio
4. Coverage/status summary per unit

## Current implementation note
The existing Unit 05 data in the current app is not automatically treated as authoritative. It must be replaced/verified against the complete Unit 05 note supplied by the user before finalization.
