# Weird Wars: Ten-Chapter Campaign and Enemy Roster

## Goal
Turn the existing seven-stop campaign into a ten-page illustrated sketchbook campaign, add the complete enemy roster, and make chapter battles use progressively harder lineups including multi-cell bosses.

## Campaign book
- Replace the all-at-once map with one chapter page at a time: `Глава 1` through `Глава 10`, each with its own title, short encounter trail, reward, difficulty, and enemy preview.
- Add previous/next page controls and a tactile page-flip transition. Locked chapters remain visible but cannot be entered; winning a battle unlocks the next page.
- Give every page a distinct hand-drawn trail composition rather than reusing one path.
- Increase visible corruption page by page: clean paper in Chapter 1, then ink drops, graphite smears, crossed-out marks, torn corners, erased patches, creeping tendrils, and dense splatter by Chapter 10.
- Preserve the existing Campaign → Squad → Battle → Campaign flow and show the chosen chapter consistently in squad setup and battle.

## Enemy artwork and data
- Add a reusable hand-drawn SVG enemy renderer with unique artwork for all requested families:
  - Ink: Blotling, Smudge, Splatter
  - Pencil: Scribble, Squiggle, Hatch
  - Graphite: Dot, Gray
  - Eraser: Eraser
  - Stationery: Cross-out, Stain, Outline
  - Bosses: Great Stain, Scribble Giant, Blot Mother, Chief Eraser, and final boss Klaksa
- Keep the artwork intentionally naive and tactile: irregular crayon/pencil strokes, ink drips, eraser crumbs, misaligned eyes, visible stroke variation, and simple childlike silhouettes.
- Extend enemy data with family, footprint, combat stats, behavior labels, and bilingual display names where supplied.
- Define ten escalating chapter encounter rosters so early pages introduce Blotlings and pencil creatures, middle pages mix families and chapter bosses, and Chapter 10 culminates in the four-cell Klaksa.

## Battlefield integration
- Build battle enemies from the selected campaign chapter instead of the current fixed four-enemy loop; duel mode continues to use a representative enemy lineup.
- Extend units with width and height footprints and add shared footprint helpers for occupied-cell lookup, target selection, collision checks, and placement.
- Render units as grid overlays spanning `2×1`, `1×3`, or `2×2` cells while keeping health, selection, hit detection, speed order, action-card damage, victory checks, and enemy turns tied to one logical unit.
- Prevent movement into any cell covered by another living unit and allow attacks by clicking any covered boss cell.
- Scale and frame boss art so it reads as one creature across its full footprint without duplicating the image in each cell.

## Visual polish and validation
- Add semantic style tokens/utilities for corruption layers, page tears, graphite haze, ink creep, and the page-turn animation while preserving the established desk-and-sketchbook direction.
- Keep controls usable on mobile and desktop, including chapter navigation, encounter previews, and the 8×5 battlefield.
- Verify chapter flipping, locked/unlocked progression, chapter-specific enemy loading, every roster illustration, all boss footprints, attacks on covered cells, collision behavior, victory unlock through Chapter 10, and duel compatibility.
- Run focused type checks and browser-based visual/interaction checks, then inspect the latest build and runtime logs.
