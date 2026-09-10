import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DeskScene, TokenPill } from "@/components/game/DeskScene";
import { LEADERBOARD, TIER_PRIZES } from "@/lib/game-data";
import { useGameState } from "@/lib/game-store";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Season Rating — Weird Wars" },
      {
        name: "description",
        content: "Quarterly leaderboard for Weird Wars: your rank, rating points, season countdown and tier prizes.",
      },
      { property: "og:title", content: "Season Rating — Weird Wars" },
      { property: "og:description", content: "Climb the crayon ladder before the season page is turned." },
    ],
  }),
  component: SeasonScreen,
});

const tierTone: Record<string, string> = {
  gold: "bg-sunshine",
  silver: "bg-sky",
  bronze: "bg-coral",
  paper: "bg-paper-shade",
};

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, target - now);
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

function SeasonScreen() {
  const state = useGameState();
  const [end] = useState(() => Date.now() + 1000 * 60 * 60 * 24 * 37 + 1000 * 60 * 83);
  const c = useCountdown(end);
  const me = LEADERBOARD.find((r) => r.player === "you.kepl")!;

  return (
    <DeskScene
      title="Season 3 · Rating"
      back={{ to: "/", label: "Menu" }}
      hud={<TokenPill tokens={state.tokens} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="sketch-border ink-shadow mb-4 flex flex-wrap items-center justify-between gap-4 bg-weird/15 p-4">
            <div>
              <p className="font-hand text-sm text-muted-foreground">Your standing</p>
              <p className="font-display text-3xl font-extrabold text-ink">
                #{me.rank} <span className="text-weird">{me.points} pts</span>
              </p>
              <p className="font-hand text-sm text-ink">{me.wins} wins · Bronze Stub tier</p>
            </div>
            <div className="text-right">
              <p className="font-hand text-sm text-muted-foreground">Season ends in</p>
              <div className="flex gap-1">
                {[
                  ["d", c.d],
                  ["h", c.h],
                  ["m", c.m],
                  ["s", c.s],
                ].map(([label, v]) => (
                  <span
                    key={label as string}
                    className="sketch-border-alt bg-paper px-2 py-1 font-display text-xl font-extrabold text-ink"
                  >
                    {String(v).padStart(2, "0")}
                    <span className="font-hand text-xs text-muted-foreground">{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="sketch-border overflow-x-auto px-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-paper-shade font-display text-sm text-ink">
                  <th className="p-2">#</th>
                  <th className="p-2">Player</th>
                  <th className="p-2">Tier</th>
                  <th className="p-2 text-right">Wins</th>
                  <th className="p-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="font-hand text-ink">
                {LEADERBOARD.map((r) => (
                  <tr
                    key={r.rank}
                    className={`border-t-2 border-dashed border-ink/20 ${
                      r.player === "you.kepl" ? "bg-mint/40 font-bold" : ""
                    }`}
                  >
                    <td className="p-2 font-display">
                      {r.rank <= 3 ? (
                        <span className="sketch-border-alt inline-flex h-6 w-6 items-center justify-center bg-sunshine text-xs font-bold">
                          {r.rank}
                        </span>
                      ) : (
                        r.rank
                      )}
                    </td>
                    <td className="p-2">{r.player}</td>
                    <td className="p-2">
                      <span className={`sketch-border-alt px-2 py-0.5 text-xs ${tierTone[r.tier]}`}>{r.tier}</span>
                    </td>
                    <td className="p-2 text-right">{r.wins}</td>
                    <td className="p-2 text-right font-display">{r.points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <h2 className="mb-2 font-display text-xl font-extrabold text-ink">Tier prizes</h2>
          <div className="space-y-3">
            {TIER_PRIZES.map((t) => (
              <div
                key={t.tier}
                className={`sketch-border ink-shadow-sm p-3 ${
                  { sunshine: "bg-sunshine/40", sky: "bg-sky/40", coral: "bg-coral/40", mint: "bg-mint/40" }[t.color]
                }`}
              >
                <p className="font-display text-lg font-extrabold text-ink">{t.tier}</p>
                <p className="font-hand text-xs text-muted-foreground">{t.range}</p>
                <p className="font-hand text-sm text-ink">{t.prize}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-hand text-sm text-muted-foreground">
            Rewards are drawn at the end of the quarter and posted straight into your sketchbook.
          </p>
        </aside>
      </div>
    </DeskScene>
  );
}
