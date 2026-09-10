import { cn } from "@/lib/utils";

/**
 * Progressive Blot corruption drawn over a sketchbook page.
 * `level` runs 0 (pristine paper) → 1 (drowned in ink).
 * Everything is wobbly and uneven on purpose — as if a child
 * pressed too hard with a leaky pen.
 */
export function CorruptionLayer({ level, className }: { level: number; className?: string }) {
  const l = Math.max(0, Math.min(1, level));
  // lumpy ink blobs: hand-wobbled closed paths, not perfect ellipses
  const blots = [
    { d: "M14 12 q4 -3 8 0 q5 2 3 7 q-1 5 -6 5 q-6 1 -8 -4 q-2 -5 3 -8 Z", at: 0.08 },
    { d: "M80 22 q3 -2 6 1 q3 3 0 6 q-4 3 -7 0 q-2 -4 1 -7 Z", at: 0.16 },
    { d: "M30 72 q6 -4 11 -1 q5 4 2 9 q-3 6 -10 4 q-7 -1 -7 -7 q0 -4 4 -5 Z", at: 0.26 },
    { d: "M63 58 q4 -3 8 0 q4 4 1 8 q-3 5 -9 3 q-5 -2 -4 -7 q1 -3 4 -4 Z", at: 0.4 },
    { d: "M18 38 q7 -5 14 -2 q7 3 5 10 q-2 8 -11 8 q-9 0 -11 -7 q-1 -6 3 -9 Z", at: 0.52 },
    { d: "M85 68 q5 -3 10 0 q5 4 2 9 q-4 5 -10 4 q-6 -2 -6 -8 q0 -3 4 -5 Z", at: 0.62 },
    { d: "M45 22 q8 -6 16 -2 q8 4 5 12 q-3 9 -13 8 q-10 0 -12 -8 q-1 -6 4 -8 Z", at: 0.72 },
    { d: "M70 38 q6 -4 12 -1 q6 4 3 10 q-3 7 -11 6 q-8 -1 -8 -8 q0 -4 4 -6 Z", at: 0.82 },
    { d: "M4 58 q8 -5 16 -1 q8 5 4 13 q-4 8 -14 7 q-10 -1 -11 -9 q0 -6 5 -10 Z", at: 0.9 },
  ].filter((b) => l >= b.at);

  // splatter dots scattered around each blob cluster
  const spatters = [
    { x: 22, y: 24, r: 1.1, at: 0.08 },
    { x: 74, y: 20, r: 0.8, at: 0.16 },
    { x: 40, y: 86, r: 1.3, at: 0.26 },
    { x: 55, y: 68, r: 0.9, at: 0.4 },
    { x: 12, y: 52, r: 1.2, at: 0.52 },
    { x: 92, y: 60, r: 1.4, at: 0.62 },
    { x: 60, y: 16, r: 1.1, at: 0.72 },
    { x: 64, y: 52, r: 1.5, at: 0.82 },
    { x: 18, y: 80, r: 1.7, at: 0.9 },
  ].filter((s) => l >= s.at);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {/* graphite haze — a thumb smudge dragged across the page */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 70% 30%, var(--graphite) 0%, transparent 62%)",
          opacity: l * 0.3,
        }}
      />
      {/* ink creep from the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 90% at 100% 100%, var(--blot) 0%, transparent 46%), radial-gradient(120% 80% at 0% 0%, var(--blot) 0%, transparent 40%)",
          opacity: l * 0.55,
        }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {/* crayon doodles a kid left in the margins — always faintly present */}
        <g stroke="var(--graphite)" fill="none" strokeLinecap="round" opacity={0.18 + l * 0.1}>
          {/* little spiral */}
          <path d="M88 8 q3 -2 4 1 q1 3 -2 4 q-4 1 -5 -2 q-1 -5 4 -6 q6 -1 7 4" strokeWidth={0.7} />
          {/* wonky star */}
          <path d="M6 30 l2 4 l4 0.4 l-3 3 l0.8 4 l-3.8 -2 l-3.6 2.2 l0.6 -4.2 l-3 -3 l4.2 -0.6 Z" strokeWidth={0.6} fill="var(--graphite)" opacity={0.6} />
          {/* wavy underline squiggle */}
          <path d="M30 96 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 q3 -3 6 0" strokeWidth={0.8} />
        </g>
        {/* lumpy ink blobs */}
        {blots.map((b, i) => (
          <path key={i} d={b.d} fill="var(--blot)" opacity={0.35 + l * 0.55} />
        ))}
        {/* splatter dots */}
        {spatters.map((s, i) => (
          <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="var(--blot)" opacity={0.3 + l * 0.5} />
        ))}
        {/* scratchy crossing-out — several angry scribbles, not two neat lines */}
        {l >= 0.5 && (
          <g stroke="var(--coral)" fill="none" strokeLinecap="round" opacity={l * 0.75}>
            <path d="M6 12 Q 24 30 44 50 M42 9 Q 26 32 8 48 M10 30 Q 26 26 40 34" strokeWidth={1.4} />
            <path d="M58 66 Q 76 78 94 92 M92 63 Q 74 78 60 94 M62 80 Q 76 74 90 82" strokeWidth={1.2} />
            <path d="M50 46 q8 -8 16 0 q-8 8 -16 0 Z" strokeWidth={1} opacity={0.8} />
          </g>
        )}
        {/* erased white patches — rubbed hard with an eraser */}
        {l >= 0.35 && (
          <g opacity={0.75} fill="var(--paper)">
            <path d="M52 12 q10 -4 20 0 q4 3 0 6 q-10 4 -20 0 q-4 -3 0 -6 Z" />
            <path d="M8 87 q12 -4 24 0 q4 3 0 5 q-12 3 -24 0 q-4 -2 0 -5 Z" />
          </g>
        )}
        {/* tendrils creeping in */}
        {l >= 0.6 && (
          <path
            d="M100 100 Q 78 84 66 92 Q 52 100 40 86 M0 0 Q 20 14 28 6 Q 40 -4 52 10"
            stroke="var(--blot)"
            strokeWidth={2.4}
            fill="none"
            opacity={l}
            strokeLinecap="round"
          />
        )}
      </svg>
      {/* torn / eaten margin */}
      {l >= 0.7 && (
        <svg viewBox="0 0 100 10" className="absolute inset-x-0 bottom-0 h-6 w-full" preserveAspectRatio="none">
          <path
            d="M0 10 V6 L6 3 L12 7 L18 2 L26 6 L33 2 L41 7 L49 3 L57 7 L64 2 L72 6 L80 2 L88 7 L95 3 L100 6 V10 Z"
            fill="var(--blot)"
            opacity={0.9}
          />
        </svg>
      )}
    </div>
  );
}
