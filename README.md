# ET Flash Cards — Print Studio

Engineering Technology revision cards print කරගැනීම සඳහා සාදන ලද static web app එකකි.

## Live app

https://et-flash-cards.vercel.app

## Current content

- Unit 05 — චලිත පරිවර්තන යාන්ත්‍රණය හා ජව සම්ප්‍රේෂණ පද්ධති
- Unit badge on every card (`UNIT 05`)
- Sequential card IDs (`05-001`, `05-002`, ...)
- Search
- Question + Answer / Question only / Answer only print modes
- Small: 70 × 45 mm
- Medium: 85 × 55 mm
- Large: 100 × 65 mm
- Custom width/height in millimetres
- A4 sheet automatically arranges multiple small cards
- Dashed cut-line border for trimming printed cards

## Adding future units

Each future ET lesson can be added to the `units` array in `app.js` with its own unit number, title, color and flash-card question/answer pairs.
