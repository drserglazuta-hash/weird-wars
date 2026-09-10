import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { CorruptionLayer } from "@/components/game/CorruptionLayer";
import { EnemyArt } from "@/components/game/EnemyArt";
import { CAMPAIGN_LEVELS, enemyDef } from "@/lib/game-data";
import { setGameState, useGameState } from "@/lib/game-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaign")({
  head: () => ({
    meta: [
      { title: "Campaign Book — Weird Wars" },
      {
        name: "description",
        content:
          "Ten hand-drawn chapters of a child's sketchbook. Flip page by page as the Blot stains the paper darker.",
      },
      { property: "og:title", content: "Campaign Book — Weird Wars" },
      {
        property: "og:description",
        content: "Flip through ten chapters, from a clean pencil case to the four-cell Klaksa.",
      },
    ],
  }),
  component: CampaignScreen,
});

const diffTone: Record<string, string> = {
  easy: "bg-mint",
  normal: "bg-sky",
  hard: "bg-coral",
  boss: "bg-weird text-paper",
};

function CampaignScreen() {
  const state = useGameState();
  const navigate = useNavigate();
  const [page, setPage] = useState(() => Math.min(state.unlockedLevels, CAMPAIGN_LEVELS.length) - 1);
  const [flip, setFlip] = useState<"next" | "prev" | null>(null);

  const chapter = CAMPAIGN_LEVELS[page]!;
  const unlocked = chapter.id <= state.unlockedLevels;
  const cleared = chapter.id < state.unlockedLevels;

  const go = (dir: "next" | "prev") => {
    const target = dir === "next" ? page + 1 : page - 1;
    if (target < 0 || target >= CAMPAIGN_LEVELS.length) return;
    setFlip(dir);
    setPage(target);
    window.setTimeout(() => setFlip(null), 450);
  };

  return (
    <DeskScene
      title="Campaign Book"
      back={{ to: "/", label: "Menu" }}
      hud={
        <>
          <span className="sketch-border-alt bg-paper-shade px-3 py-1 font-hand text-sm">
            {state.unlockedLevels}/{CAMPAIGN_LEVELS.length} chapters woken
          </span>
          <TokenPill tokens={state.tokens} />
        </>
      }
    >
      <div className="flex items-center justify-between gap-2 pb-3">
        <SketchButton tone="paper" onClick={() => go("prev")} disabled={page === 0}>
          ← Previous page
        </SketchButton>
        <div className="flex flex-wrap justify-center gap-1">
          {CAMPAIGN_LEVELS.map((c, i) => {
            const open = c.id <= state.unlockedLevels;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`${c.chapter}: ${c.name}`}
                className={cn(
                  "h-7 w-7 border-2 border-ink font-display text-xs font-bold transition-transform hover:-translate-y-0.5",
                  i === page ? "bg-weird text-paper" : open ? "bg-sunshine text-ink" : "bg-paper-shade text-ink/40",
                )}
              >
                {c.id}
              </button>
            );
          })}
        </div>
        <SketchButton
          tone="paper"
          onClick={() => go("next")}
          disabled={page === CAMPAIGN_LEVELS.length - 1}
        >
          Next page →
        </SketchButton>
      </div>

      <div
        key={chapter.id}
        className={cn(
          "sketch-border relative overflow-hidden bg-paper p-4 md:p-6",
          flip === "next" && "animate-page-next",
          flip === "prev" && "animate-page-prev",
        )}
      >
        <CorruptionLayer level={chapter.corruption} />

        <div className="relative">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-hand text-sm text-ink-soft">{chapter.chapter}</p>
              <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
                {chapter.name} <span className="font-hand text-lg text-ink-soft">· {chapter.nameRu}</span>
              </h2>
            </div>
            <span className={cn("sketch-border-alt px-3 py-1 font-display text-xs font-bold", diffTone[chapter.difficulty])}>
              {chapter.difficulty.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 max-w-2xl font-hand text-base text-ink">{chapter.blurb}</p>

          {/* hand-drawn trail */}
          <div className="relative mt-4">
            <svg viewBox="0 0 100 62" className="h-[210px] w-full md:h-[280px]" preserveAspectRatio="none">
              <path
                d={chapter.trail}
                fill="none"
                stroke="var(--wood-dark)"
                strokeWidth="1.2"
                strokeDasharray="2.6 2.2 1.2 2.4"
                strokeLinecap="round"
                opacity={0.85}
              />
              {chapter.stops.map((s, i) => {
                const wobble = ((i * 37 + chapter.id * 13) % 9) - 4; // -4..4° tilt, deterministic
                const last = i === chapter.stops.length - 1;
                return (
                  <g key={i} transform={`rotate(${wobble} ${s.x} ${s.y})`}>
                    <path
                      d={`M ${s.x - 2.1} ${s.y + 0.2} q 2 -1.8 4.2 0.1 q 2.1 1.6 0 3.3 q -2.2 1.7 -4.2 -0.2 q -1.9 -1.8 0 -3.2 Z`}
                      fill={last ? "var(--weird)" : "var(--sunshine)"}
                      stroke="var(--ink)"
                      strokeWidth="0.55"
                    />
                    <path
                      d={`M ${s.x} ${s.y - 1.6} q 0.4 -3 -0.3 -6.4 l 6.2 1.6 l -5.9 2.4`}
                      fill={last ? "var(--weird)" : "var(--coral)"}
                      stroke="var(--ink)"
                      strokeWidth="0.55"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* encounter preview */}
          <div className="mt-3">
            <h3 className="font-display text-base font-extrabold text-ink">Who is on this page</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {chapter.encounter.map((id, i) => {
                const e = enemyDef(id);
                return (
                  <div
                    key={`${id}-${i}`}
                    className="sketch-border-alt flex w-[104px] flex-col items-center gap-1 bg-paper-shade/80 p-2"
                  >
                    <EnemyArt id={e.id} title={e.name} className="h-14 w-14" />
                    <p className="text-center font-display text-xs font-bold leading-tight text-ink">{e.name}</p>
                    <p className="text-center font-hand text-[11px] leading-tight text-ink-soft">{e.nameRu}</p>
                    <p className="font-hand text-[11px] text-ink">
                      ⚔{e.attack} ❤{e.health} {e.w * e.h > 1 ? `· ${e.w}×${e.h}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-dashed border-ink/30 pt-3">
            <p className="font-hand text-sm text-ink">
              Reward: <span className="font-display font-bold">{chapter.reward}</span>
              {cleared && <span className="ml-2 font-display text-xs font-bold text-mint">✓ cleared</span>}
            </p>
            {unlocked ? (
              <SketchButton
                tone="weird"
                onClick={() => {
                  setGameState({ selectedLevel: chapter.id, mode: "campaign" });
                  navigate({ to: "/squad" });
                }}
              >
                Set up squad
              </SketchButton>
            ) : (
              <span className="sketch-border-alt bg-paper-shade px-3 py-2 font-hand text-sm text-ink-soft">
                🔒 Win {CAMPAIGN_LEVELS[chapter.id - 2]?.chapter ?? "the previous chapter"} to wake this page
              </span>
            )}
          </div>
        </div>
      </div>
    </DeskScene>
  );
}
