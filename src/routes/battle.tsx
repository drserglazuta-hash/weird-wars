import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton } from "@/components/game/DeskScene";
import { EnemyArt } from "@/components/game/EnemyArt";
import {
  ACTION_HAND,
  CAMPAIGN_LEVELS,
  COLLECTION,
  SHADOW_COMMANDERS,
  enemyDef,
} from "@/lib/game-data";
import { setGameState, useGameState } from "@/lib/game-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Battlefield — Weird Wars" },
      {
        name: "description",
        content:
          "Grid battles inside the sketchbook: move your friends, play action cards and erase multi-cell Blot bosses.",
      },
      { property: "og:title", content: "Battlefield — Weird Wars" },
      {
        property: "og:description",
        content: "Turn-based grid combat with a speed bar, action cards and four-cell bosses.",
      },
    ],
  }),
  component: BattleScreen,
});

type Unit = {
  key: string;
  cardId: string;
  side: "friend" | "blot";
  name: string;
  art?: string;
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const COLS = 8;
const ROWS = 5;

const cells = (u: Unit) => {
  const out: { x: number; y: number }[] = [];
  for (let dx = 0; dx < u.w; dx++) for (let dy = 0; dy < u.h; dy++) out.push({ x: u.x + dx, y: u.y + dy });
  return out;
};

const covers = (u: Unit, x: number, y: number) =>
  x >= u.x && x < u.x + u.w && y >= u.y && y < u.y + u.h;

const gap = (a: Unit, b: Unit) => {
  const dx = Math.max(a.x - (b.x + b.w - 1), b.x - (a.x + a.w - 1), 0);
  const dy = Math.max(a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1), 0);
  return Math.max(dx, dy);
};

function BattleScreen() {
  const state = useGameState();
  const navigate = useNavigate();

  const chapter = CAMPAIGN_LEVELS.find((c) => c.id === state.selectedLevel) ?? CAMPAIGN_LEVELS[0]!;
  const roster =
    state.mode === "campaign" ? chapter.encounter : ["blotling", "scribble", "smudge", "eraser-enemy"];

  const initialUnits = useMemo<Unit[]>(() => {
    const friends = state.squad
      .filter(Boolean)
      .map((id) => COLLECTION.find((c) => c.id === id))
      .filter((c): c is (typeof COLLECTION)[number] => Boolean(c));
    const commander = SHADOW_COMMANDERS.find((c) => c.id === state.commander);
    const line = commander ? [commander, ...friends] : friends;
    const mine: Unit[] = line.slice(0, 6).map((c, i) => {
      const lvl = state.cardLevels[c.id] ?? 0;
      return {
        key: `f-${c.id}`,
        cardId: c.id,
        side: "friend" as const,
        name: c.name,
        art: c.art,
        hp: c.health + lvl * 2,
        maxHp: c.health + lvl * 2,
        attack: c.attack + lvl,
        speed: c.speed,
        x: i < 3 ? 0 : 1,
        y: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3,
        w: 1,
        h: 1,
      };
    });

    const taken: { x: number; y: number }[] = [];
    const free = (x: number, y: number, w: number, h: number) => {
      if (x < 4 || x + w > COLS || y < 0 || y + h > ROWS) return false;
      for (let dx = 0; dx < w; dx++)
        for (let dy = 0; dy < h; dy++)
          if (taken.some((t) => t.x === x + dx && t.y === y + dy)) return false;
      return true;
    };

    const foes: Unit[] = [];
    roster.forEach((id, i) => {
      const e = enemyDef(id);
      let spot: { x: number; y: number } | null = null;
      for (let x = COLS - e.w; x >= 4 && !spot; x--)
        for (let y = 0; y <= ROWS - e.h && !spot; y++) if (free(x, y, e.w, e.h)) spot = { x, y };
      if (!spot) return;
      for (let dx = 0; dx < e.w; dx++)
        for (let dy = 0; dy < e.h; dy++) taken.push({ x: spot.x + dx, y: spot.y + dy });
      foes.push({
        key: `b-${e.id}-${i}`,
        cardId: e.id,
        side: "blot",
        name: e.name,
        hp: e.health,
        maxHp: e.health,
        attack: e.attack,
        speed: e.speed,
        x: spot.x,
        y: spot.y,
        w: e.w,
        h: e.h,
      });
    });

    return [...mine, ...foes];
  }, [state.squad, state.commander, state.cardLevels, roster]);

  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [selected, setSelected] = useState<string | null>(null);
  const [ink, setInk] = useState(6);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<string[]>([`${chapter.chapter}: the page trembles. Battle begins!`]);
  const [playedCard, setPlayedCard] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"win" | "lose" | null>(null);

  const alive = units.filter((u) => u.hp > 0);
  const order = [...alive].sort((a, b) => b.speed - a.speed);
  const sel = units.find((u) => u.key === selected && u.hp > 0) ?? null;

  const pushLog = (line: string) => setLog((l) => [line, ...l].slice(0, 6));

  const check = (next: Unit[]) => {
    if (!next.some((u) => u.side === "blot" && u.hp > 0)) setOutcome("win");
    else if (!next.some((u) => u.side === "friend" && u.hp > 0)) setOutcome("lose");
  };

  const unitAt = (x: number, y: number) => alive.find((u) => covers(u, x, y));

  const onTile = (x: number, y: number) => {
    if (outcome) return;
    const occupant = unitAt(x, y);
    if (occupant?.side === "friend") {
      setSelected(occupant.key);
      return;
    }
    if (!sel) return;

    if (occupant?.side === "blot") {
      if (gap(sel, occupant) > 1) {
        pushLog(`${sel.name} is too far from ${occupant.name}.`);
        return;
      }
      const dmg = sel.attack;
      const next = units.map((u) => (u.key === occupant.key ? { ...u, hp: Math.max(0, u.hp - dmg) } : u));
      setUnits(next);
      pushLog(`${sel.name} hits ${occupant.name} for ${dmg}.`);
      check(next);
      return;
    }

    if (alive.some((u) => u.key !== sel.key && covers(u, x, y))) return;
    setUnits(units.map((u) => (u.key === sel.key ? { ...u, x, y } : u)));
    pushLog(`${sel.name} moves.`);
  };

  const endTurn = () => {
    if (outcome) return;
    let next = units.map((u) => ({ ...u }));
    next
      .filter((u) => u.side === "blot" && u.hp > 0)
      .forEach((foe) => {
        const targets = next.filter((u) => u.side === "friend" && u.hp > 0);
        if (!targets.length) return;
        const target = targets.reduce((best, t) => (gap(foe, t) < gap(foe, best) ? t : best), targets[0]!);
        if (gap(foe, target) <= 1) {
          target.hp = Math.max(0, target.hp - foe.attack);
          pushLog(`${foe.name} smears ${target.name} for ${foe.attack}.`);
        } else {
          const step = target.x < foe.x ? -1 : 1;
          const nx = foe.x + step;
          const blocked =
            nx < 0 ||
            nx + foe.w > COLS ||
            next.some(
              (u) =>
                u.key !== foe.key &&
                u.hp > 0 &&
                cells({ ...foe, x: nx }).some((c) => covers(u, c.x, c.y)),
            );
          if (!blocked) foe.x = nx;
        }
      });
    next = next.map((u) => ({ ...u }));
    setUnits(next);
    setTurn((t) => t + 1);
    setInk((i) => Math.min(10, i + 2));
    setPlayedCard(null);
    check(next);
  };

  const playAction = (id: string) => {
    const card = ACTION_HAND.find((a) => a.id === id)!;
    if (ink < card.cost || outcome) return;
    setInk((i) => i - card.cost);
    setPlayedCard(id);
    pushLog(`Played “${card.name}” — ${card.text}.`);
    if (card.id === "a3") {
      const next = units.map((u) => (u.side === "blot" ? { ...u, hp: Math.max(0, u.hp - 3) } : u));
      setUnits(next);
      check(next);
    }
    if (card.id === "a4") {
      setUnits((us) => us.map((u) => (u.side === "friend" ? { ...u, hp: Math.min(u.maxHp, u.hp + 8) } : u)));
    }
  };

  const restart = () => {
    setUnits(initialUnits);
    setOutcome(null);
    setTurn(1);
    setInk(6);
    setSelected(null);
    setLog(["A fresh page. Try again!"]);
  };

  const claim = () => {
    setGameState((s) => ({
      tokens: s.tokens + 200,
      unlockedLevels:
        s.mode === "campaign"
          ? Math.min(CAMPAIGN_LEVELS.length, Math.max(s.unlockedLevels, s.selectedLevel + 1))
          : s.unlockedLevels,
    }));
    navigate({ to: state.mode === "campaign" ? "/campaign" : "/" });
  };

  const actionTone: Record<string, string> = {
    coral: "bg-coral/50",
    sunshine: "bg-sunshine/50",
    mint: "bg-mint/50",
    sky: "bg-sky/50",
    weird: "bg-weird/40",
  };

  return (
    <DeskScene
      title="Battlefield"
      back={{ to: "/squad", label: "Squad" }}
      hud={
        <>
          <span className="sketch-border-alt bg-paper-shade px-3 py-1 font-hand text-sm">
            {state.mode === "campaign" ? chapter.chapter : "Duel"} · Turn {turn}
          </span>
          <span className="sketch-border-alt bg-sky px-3 py-1 font-display text-sm font-bold text-ink">
            🖋 Ink {ink}/10
          </span>
        </>
      }
    >
      <div className="relative">
        {/* speed / turn order bar */}
        <div className="sketch-border mb-4 flex items-center gap-2 overflow-x-auto bg-paper-shade/50 p-2">
          <span className="shrink-0 font-display text-sm font-bold text-ink">Speed order →</span>
          {order.map((u, i) => (
            <span
              key={u.key}
              className={cn(
                "sketch-border-alt flex shrink-0 items-center gap-1 px-2 py-1 font-hand text-xs",
                u.side === "friend" ? "bg-mint" : "bg-blot text-paper",
                i === 0 && "ring-2 ring-weird",
              )}
            >
              {u.side === "friend" && u.art ? (
                <img src={u.art} alt="" width={768} height={768} loading="lazy" className="h-6 w-6 object-contain" />
              ) : (
                <EnemyArt id={u.cardId} className="h-6 w-6" />
              )}
              {u.name.split(" ")[0]} · ⚡{u.speed}
            </span>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          {/* grid */}
          <div className="sketch-border relative bg-paper-shade/30 p-2">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
            >
              {Array.from({ length: COLS * ROWS }).map((_, idx) => {
                const x = idx % COLS;
                const y = Math.floor(idx / COLS);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onTile(x, y)}
                    className={cn(
                      "aspect-square border-2 border-dashed border-ink/25 transition-colors",
                      (x + y) % 2 === 0 ? "bg-paper" : "bg-paper-shade/50",
                      sel && !unitAt(x, y) && "hover:bg-mint/40",
                    )}
                    aria-label={`Tile ${x},${y}`}
                  />
                );
              })}
            </div>

            {/* unit overlay grid */}
            <div
              className="pointer-events-none absolute inset-2 grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0,1fr))`,
              }}
            >
              {alive.map((u) => (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => onTile(u.x, u.y)}
                  style={{
                    gridColumn: `${u.x + 1} / span ${u.w}`,
                    gridRow: `${u.y + 1} / span ${u.h}`,
                  }}
                  className={cn(
                    "pointer-events-auto relative flex items-center justify-center",
                    u.key === selected && "sketch-border-alt bg-weird/15",
                  )}
                  aria-label={`${u.name} ${u.hp}/${u.maxHp} hit points`}
                >
                  {u.side === "friend" && u.art ? (
                    <img
                      src={u.art}
                      alt={u.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="animate-float h-full w-full object-contain p-0.5"
                    />
                  ) : (
                    <EnemyArt
                      id={u.cardId}
                      title={u.name}
                      className="animate-wobble h-full w-full p-0.5"
                    />
                  )}
                  <span className="absolute inset-x-1 bottom-0.5 h-1.5 border border-ink bg-paper">
                    <span
                      className={cn("block h-full", u.side === "friend" ? "bg-mint" : "bg-coral")}
                      style={{ width: `${(u.hp / u.maxHp) * 100}%` }}
                    />
                  </span>
                  <span className="absolute left-0.5 top-0.5 font-display text-[10px] font-bold text-ink">
                    {u.hp}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="sketch-border bg-paper-shade/40 p-3">
              <h3 className="font-display text-base font-extrabold text-ink">
                {sel ? sel.name : "Select a friend"}
              </h3>
              <p className="font-hand text-sm text-ink">
                {sel
                  ? `⚔ ${sel.attack} · ❤ ${sel.hp}/${sel.maxHp} · ⚡ ${sel.speed}`
                  : "Tap one of your drawings, then tap a tile to move or a Blot to attack."}
              </p>
              <div className="mt-2">
                <SketchButton tone="coral" size="sm" onClick={endTurn}>
                  End turn ↺
                </SketchButton>
              </div>
            </div>

            <div className="sketch-border bg-paper p-3">
              <h3 className="font-display text-base font-extrabold text-ink">Battle log</h3>
              <ul className="mt-1 space-y-1 font-hand text-xs text-muted-foreground">
                {log.map((l, i) => (
                  <li key={i} className={i === 0 ? "text-ink" : undefined}>
                    · {l}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* hand */}
        <div className="mt-4">
          <h3 className="mb-1 font-display text-base font-extrabold text-ink">Your hand</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {ACTION_HAND.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => playAction(a.id)}
                disabled={ink < a.cost}
                className={cn(
                  "sketch-border ink-shadow-sm w-36 shrink-0 p-2 text-left transition-transform",
                  actionTone[a.color],
                  ink < a.cost ? "opacity-45" : "hover:-translate-y-2",
                  playedCard === a.id && "ring-4 ring-weird",
                )}
                style={{ transform: `rotate(${(i - 2) * 2}deg)` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-extrabold text-ink">{a.name}</span>
                  <span className="sketch-border-alt bg-paper px-1.5 font-display text-xs">{a.cost}🖋</span>
                </div>
                <p className="font-hand text-xs text-ink">{a.text}</p>
              </button>
            ))}
          </div>
        </div>

        {outcome && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/55 p-4">
            <div className="animate-pop paper-grain sketch-border ink-shadow max-w-md p-6 text-center">
              <h2
                className={cn(
                  "font-display text-5xl font-extrabold",
                  outcome === "win" ? "text-mint" : "text-coral",
                )}
              >
                {outcome === "win" ? "Victory!" : "Defeat…"}
              </h2>
              <p className="mt-2 font-hand text-lg text-ink">
                {outcome === "win"
                  ? "The Blot dries up and the page turns bright again. +200 tokens."
                  : "The ink spread too far. Your drawings need a rest — and a redraw."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {outcome === "win" ? (
                  <SketchButton tone="mint" onClick={claim}>
                    Claim reward
                  </SketchButton>
                ) : (
                  <SketchButton tone="coral" onClick={restart}>
                    Try again
                  </SketchButton>
                )}
                <SketchButton tone="paper" onClick={() => navigate({ to: "/squad" })}>
                  Edit squad
                </SketchButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeskScene>
  );
}
