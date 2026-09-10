import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { EnemyArt } from "@/components/game/EnemyArt";
import { enemyDef } from "@/lib/game-data";
import { setGameState, useGameState } from "@/lib/game-store";

export const Route = createFileRoute("/duel-ai")({
  head: () => ({
    meta: [
      { title: "Duel vs AI — Weird Wars" },
      {
        name: "description",
        content: "Set the Blot brain's difficulty, board size and stake, then duel the AI inside the sketchbook.",
      },
      { property: "og:title", content: "Duel vs AI — Weird Wars" },
      { property: "og:description", content: "Practise duels against the Blot brain with adjustable difficulty." },
    ],
  }),
  component: DuelAiScreen,
});

const DIFFICULTIES = [
  {
    id: "doodle",
    name: "Doodle",
    blurb: "Slow and smudgy.",
    reward: 80,
    tone: "mint" as const,
    lineup: ["blotling", "blotling", "smudge", "dot"],
  },
  {
    id: "sketch",
    name: "Sketchy",
    blurb: "Thinks one turn ahead.",
    reward: 160,
    tone: "sky" as const,
    lineup: ["scribble", "splatter", "hatch", "gray", "eraser-enemy"],
  },
  {
    id: "inked",
    name: "Fully Inked",
    blurb: "Reads your hand. Rude.",
    reward: 320,
    tone: "coral" as const,
    lineup: ["cross-out", "outline", "stain", "squiggle", "great-stain", "blot-mother"],
  },
];

function DuelAiScreen() {
  const state = useGameState();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("sketch");
  const [stake, setStake] = useState(100);

  return (
    <DeskScene title="Duel vs AI" back={{ to: "/", label: "Menu" }} hud={<TokenPill tokens={state.tokens} />}>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">Choose the Blot brain</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((d) => {
              const tone = { mint: "bg-mint/45", sky: "bg-sky/45", coral: "bg-coral/45" }[d.tone];
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`sketch-border ink-shadow-sm p-3 text-left transition-transform hover:-translate-y-1 ${tone} ${
                    difficulty === d.id ? "ring-4 ring-weird" : ""
                  }`}
                >
                  <p className="font-display text-lg font-extrabold text-ink">{d.name}</p>
                  <p className="font-hand text-sm text-ink/75">{d.blurb}</p>
                  <p className="mt-1 font-hand text-xs text-muted-foreground">Reward ×{d.reward} tokens</p>
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 font-display text-xl font-extrabold text-ink">Stake</h2>
          <div className="sketch-border mt-2 bg-paper-shade/40 p-4">
            <input
              type="range"
              min={0}
              max={500}
              step={50}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full accent-[var(--weird)]"
              aria-label="Token stake"
            />
            <p className="mt-1 font-hand text-sm text-ink">
              Staking <strong>{stake}</strong> tokens. Win and you keep double; lose and the Blot eats them.
            </p>
          </div>

          <h2 className="mt-6 font-display text-xl font-extrabold text-ink">Your opponent's line-up</h2>
          <div className="mt-2 flex flex-wrap gap-3 pb-2">
            {(DIFFICULTIES.find((d) => d.id === difficulty)?.lineup ?? []).map((id, i) => {
              const e = enemyDef(id);
              return (
                <div
                  key={`${id}-${i}`}
                  className="sketch-border-alt flex w-[120px] flex-col items-center gap-1 bg-paper-shade/80 p-2"
                >
                  <EnemyArt id={e.id} title={e.name} className="h-16 w-16" />
                  <p className="text-center font-display text-xs font-bold leading-tight text-ink">{e.name}</p>
                  <p className="text-center font-hand text-[11px] leading-tight text-ink-soft">{e.nameRu}</p>
                  <p className="font-hand text-[11px] text-ink">
                    ⚔{e.attack} ❤{e.health} ⚡{e.speed}
                    {e.w * e.h > 1 ? ` · ${e.w}×${e.h}` : ""}
                  </p>
                  <p className="text-center font-hand text-[10px] leading-tight text-ink-soft">{e.behavior}</p>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="sketch-border paper-grain ink-shadow p-4">
            <h3 className="font-display text-lg font-extrabold text-ink">Duel summary</h3>
            <ul className="mt-2 space-y-1 font-hand text-sm text-ink">
              <li>Mode: Duel vs AI</li>
              <li>Brain: {DIFFICULTIES.find((d) => d.id === difficulty)?.name}</li>
              <li>Stake: {stake} tokens</li>
              <li>Squad: {state.squad.filter(Boolean).length}/7 friends</li>
            </ul>
            <div className="mt-4">
              <SketchButton
                size="lg"
                onClick={() => {
                  setGameState({ mode: "ai" });
                  navigate({ to: "/squad" });
                }}
              >
                Pick squad →
              </SketchButton>
            </div>
          </div>
          <div className="sketch-border bg-sunshine/40 p-4 font-hand text-sm text-ink">
            Tip: the Blot brain always attacks your slowest drawing first. Put Sir Eraser up front.
          </div>
        </aside>
      </div>
    </DeskScene>
  );
}
