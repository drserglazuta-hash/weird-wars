import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { CREATURE_ART } from "@/lib/game-data";
import { useGameState } from "@/lib/game-store";

export const Route = createFileRoute("/duel-human")({
  head: () => ({
    meta: [
      { title: "Duel vs Human — Weird Wars" },
      {
        name: "description",
        content: "Matchmaking for player-versus-player duels: search the desk for an opponent and accept the match.",
      },
      { property: "og:title", content: "Duel vs Human — Weird Wars" },
      { property: "og:description", content: "Waiting room for live duels against another sketchbook." },
    ],
  }),
  component: DuelHumanScreen,
});

function DuelHumanScreen() {
  const state = useGameState();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [found, setFound] = useState(false);
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    if (!searching) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [searching]);

  useEffect(() => {
    if (searching && seconds >= 6) {
      setFound(true);
      setSearching(false);
    }
  }, [seconds, searching]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <DeskScene title="Duel vs Human" back={{ to: "/", label: "Menu" }} hud={<TokenPill tokens={state.tokens} />}>
      <div className="flex flex-col items-center py-8 text-center">
        <div className="relative h-48 w-48">
          <img
            src={CREATURE_ART.pencil}
            alt="Your pencil friend, waiting"
            width={768}
            height={768}
            className="animate-float h-full w-full object-contain"
          />
          {!found && (
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="#6C5CE7"
                strokeWidth="4"
                strokeDasharray="14 18"
                strokeLinecap="round"
                className="origin-center animate-spin [animation-duration:6s]"
              />
            </svg>
          )}
        </div>

        <h2 className="mt-4 font-display text-4xl font-extrabold text-ink">
          {found ? "Opponent found!" : "Looking for an opponent…"}
        </h2>
        <p className="mt-1 max-w-md font-hand text-lg text-muted-foreground">
          {found
            ? "crayon_king wants to scribble on your page. 25 seconds to accept."
            : "Searching other desks for someone with a sketchbook and a grudge."}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <span className="sketch-border-alt bg-paper-shade px-3 py-1 font-display text-xl font-bold text-ink">
            {mmss}
          </span>
          <span className="font-hand text-sm text-muted-foreground">
            {found ? "match ready" : "average wait 00:14"}
          </span>
        </div>

        <div className="mt-6 grid w-full max-w-2xl gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="sketch-border ink-shadow-sm bg-mint/40 p-4">
            <p className="font-display text-lg font-extrabold text-ink">{state.address ?? "you.kepl"}</p>
            <p className="font-hand text-sm text-ink">3410 pts · Bronze Stub</p>
            <p className="font-hand text-sm text-ink">{state.squad.filter(Boolean).length}/7 friends ready</p>
          </div>
          <div className="flex items-center justify-center font-display text-3xl font-extrabold text-weird">
            VS
          </div>
          <div
            className={`sketch-border ink-shadow-sm p-4 ${found ? "bg-coral/40" : "border-dashed bg-paper-shade/50"}`}
          >
            {found ? (
              <>
                <p className="font-display text-lg font-extrabold text-ink">crayon_king</p>
                <p className="font-hand text-sm text-ink">4610 pts · Gold Crayon</p>
                <p className="font-hand text-sm text-ink">7/7 friends ready</p>
              </>
            ) : (
              <p className="font-hand text-sm text-muted-foreground">empty chair…</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {found ? (
            <>
              <SketchButton size="lg" tone="mint" onClick={() => navigate({ to: "/squad" })}>
                Accept duel ⚔
              </SketchButton>
              <SketchButton
                tone="paper"
                onClick={() => {
                  setFound(false);
                  setSeconds(0);
                  setSearching(true);
                }}
              >
                Search again
              </SketchButton>
            </>
          ) : (
            <SketchButton tone="coral" onClick={() => navigate({ to: "/" })}>
              Cancel search
            </SketchButton>
          )}
        </div>
      </div>
    </DeskScene>
  );
}
