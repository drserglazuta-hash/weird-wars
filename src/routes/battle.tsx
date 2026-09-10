import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton } from "@/components/game/DeskScene";
import { EnemyArt } from "@/components/game/EnemyArt";
import { CAMPAIGN_LEVELS, TRAINING_ROSTER, waveRoster, waveScale } from "@/lib/game-data";
import {
  COLS,
  ROWS,
  type BattleUnit,
  beginTurn,
  buildEnemies,
  buildFriends,
  buildQueue,
  covers,
  dropChance,
  endOfRound,
  friendAttack,
  gapBetween,
  living,
  moveRangeFor,
  outcomeOf,
  canStand,
  enemyTurn,
  useSpecial as applySpecial,
} from "@/lib/combat";
import { endRun, lockRun, resetProgression, setGameState, useGameState } from "@/lib/game-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Battlefield — Weird Wars" },
      {
        name: "description",
        content:
          "Turn-based sketchbook tactics: every unit acts in speed order, moves, then attacks or uses its own trait ability.",
      },
      { property: "og:title", content: "Battlefield — Weird Wars" },
      {
        property: "og:description",
        content: "Speed-ordered turns, six-stat friends, Multiverse armour and behaviour-driven Blot AI.",
      },
    ],
  }),
  component: BattleScreen,
});

function BattleScreen() {
  const state = useGameState();
  const navigate = useNavigate();

  const chapter = CAMPAIGN_LEVELS.find((c) => c.id === state.selectedLevel) ?? CAMPAIGN_LEVELS[0]!;
  const roster =
    state.mode === "campaign"
      ? chapter.encounter
      : state.mode === "endless"
        ? waveRoster(state.endlessWave)
        : TRAINING_ROSTER;
  const scale = state.mode === "endless" ? waveScale(state.endlessWave) : 1;

  const label =
    state.mode === "campaign" ? chapter.chapter : state.mode === "endless" ? `Wave ${state.endlessWave}` : "Training";

  const initialUnits = useMemo(() => [...buildFriends(state), ...buildEnemies(roster, scale)], []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => lockRun(state.mode), []);

  const [units, setUnits] = useState<BattleUnit[]>(initialUnits);
  const [queue, setQueue] = useState<string[]>(() => buildQueue(initialUnits));
  const [qi, setQi] = useState(0);
  const [round, setRound] = useState(1);
  const [moveLeft, setMoveLeft] = useState(() => {
    const first = buildQueue(initialUnits)[0];
    const u = initialUnits.find((x) => x.key === first);
    return u ? moveRangeFor(u.spd) : 0;
  });
  const [log, setLog] = useState<string[]>([`${label}: the page trembles. Battle begins!`]);
  const [outcome, setOutcome] = useState<"win" | "lose" | null>(null);
  const [settled, setSettled] = useState(false);
  const timer = useRef<number | null>(null);

  const alive = living(units);
  const activeKey = queue[qi] ?? null;
  const active = units.find((u) => u.key === activeKey && u.hp > 0) ?? null;
  const isFriendTurn = active?.side === "friend";

  const pushLog = (lines: string[]) => setLog((l) => [...lines.slice().reverse(), ...l].slice(0, 8));

  const advance = (u: BattleUnit[]) => {
    const res = outcomeOf(u);
    if (res) {
      setUnits(u);
      setOutcome(res);
      return;
    }
    let list = u;
    let q = queue;
    let i = qi + 1;
    let r = round;
    while (i < q.length && !list.some((x) => x.key === q[i] && x.hp > 0)) i++;
    if (i >= q.length) {
      list = endOfRound(list);
      q = buildQueue(list);
      i = 0;
      r = round + 1;
    }
    const key = q[i]!;
    const started = beginTurn(list, key);
    const next = started.find((x) => x.key === key);
    setUnits(started);
    setQueue(q);
    setQi(i);
    setRound(r);
    setMoveLeft(next ? moveRangeFor(next.spd) : 0);
  };

  /* --- enemy turns run themselves --- */
  useEffect(() => {
    if (outcome || !active || active.side !== "blot") return;
    timer.current = window.setTimeout(() => {
      const r = enemyTurn(units, active.key);
      pushLog(r.log);
      advance(r.units);
    }, 600);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, round, outcome]);

  /* --- a rooted friend loses its turn --- */
  useEffect(() => {
    if (outcome || !active || active.side !== "friend" || active.rooted <= 0) return;
    const freed = units.map((u) => (u.key === active.key ? { ...u, rooted: u.rooted - 1 } : u));
    pushLog([`${active.name} is stuck to the page and loses a turn.`]);
    advance(freed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, round, outcome]);

  const unitAt = (x: number, y: number) => alive.find((u) => covers(u, x, y)) ?? null;

  const onTile = (x: number, y: number) => {
    if (outcome || !active || !isFriendTurn) return;
    const occupant = unitAt(x, y);

    if (occupant?.side === "blot") {
      if (gapBetween(active, occupant) > active.range) {
        pushLog([`${active.name} is too far from ${occupant.name}.`]);
        return;
      }
      const r = friendAttack(units, active.key, occupant.key);
      pushLog(r.log);
      advance(r.units);
      return;
    }

    if (occupant) return;

    const dist = Math.max(Math.abs(x - active.x), Math.abs(y - active.y));
    if (dist > moveLeft) {
      pushLog([`${active.name} cannot walk that far this turn.`]);
      return;
    }
    if (!canStand(units, active, x, y)) return;
    setUnits(units.map((u) => (u.key === active.key ? { ...u, x, y } : u)));
    setMoveLeft(moveLeft - dist);
  };

  const doSpecial = () => {
    if (outcome || !active || !isFriendTurn) return;
    const r = applySpecial(units, active.key);
    pushLog(r.log);
    advance(r.units);
  };

  const skip = () => {
    if (outcome || !active || !isFriendTurn) return;
    pushLog([`${active.name} holds its ground.`]);
    advance(units);
  };

  const restart = () => {
    const fresh = [...buildFriends(state), ...buildEnemies(roster, scale)];
    setUnits(fresh);
    setQueue(buildQueue(fresh));
    setQi(0);
    setRound(1);
    setMoveLeft(moveRangeFor(fresh[0]?.spd ?? 4));
    setOutcome(null);
    setSettled(false);
    setLog(["A fresh page. Try again!"]);
  };

  /* --- settle the result once --- */
  useEffect(() => {
    if (!outcome || settled) return;
    setSettled(true);
    const fallen = units.filter((u) => u.side === "friend" && u.hp <= 0).map((u) => u.cardId);

    if (outcome === "lose") {
      if (state.mode === "campaign" || state.mode === "endless") resetProgression();
      return;
    }

    if (state.mode === "campaign") {
      setGameState((s) => ({
        weird: s.weird + chapter.rewardWeird,
        xp: s.xp + 40,
        unlockedLevels: Math.min(CAMPAIGN_LEVELS.length, Math.max(s.unlockedLevels, s.selectedLevel + 1)),
      }));
    } else if (state.mode === "endless") {
      setGameState((s) => ({
        xp: s.xp + 15 * s.endlessWave,
        downed: Array.from(new Set([...s.downed, ...fallen])),
        endlessBest: Math.max(s.endlessBest, s.endlessWave),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const claim = () => {
    if (state.mode === "campaign") {
      endRun();
      navigate({ to: "/campaign" });
      return;
    }
    if (state.mode === "endless") {
      setGameState((s) => ({ endlessWave: s.endlessWave + 1 }));
      navigate({ to: "/squad" });
      return;
    }
    navigate({ to: "/" });
  };

  const drop = dropChance(units);

  return (
    <DeskScene
      title="Battlefield"
      back={{ to: "/squad", label: "Squad" }}
      hud={
        <>
          <span className="sketch-border-alt bg-paper-shade px-3 py-1 font-hand text-sm">
            {label} · Round {round}
          </span>
          <span className="sketch-border-alt bg-sky px-3 py-1 font-display text-sm font-bold text-ink">
            Steps {isFriendTurn ? moveLeft : 0}
          </span>
        </>
      }
    >
      <div className="relative">
        {/* speed / turn order bar */}
        <div className="sketch-border mb-4 flex items-center gap-2 overflow-x-auto bg-paper-shade/50 p-2">
          <span className="shrink-0 font-display text-sm font-bold text-ink">Speed order →</span>
          {queue
            .map((k) => units.find((u) => u.key === k && u.hp > 0))
            .filter((u): u is BattleUnit => Boolean(u))
            .map((u) => (
              <span
                key={u.key}
                className={cn(
                  "sketch-border-alt flex shrink-0 items-center gap-1 px-2 py-1 font-hand text-xs",
                  u.side === "friend" ? "bg-mint" : "bg-blot text-paper",
                  u.key === activeKey && "ring-2 ring-weird",
                )}
              >
                {u.side === "friend" && u.art ? (
                  <img src={u.art} alt="" width={768} height={768} loading="lazy" className="h-6 w-6 object-contain" />
                ) : (
                  <EnemyArt id={u.cardId} className="h-6 w-6" />
                )}
                {u.name.split(" ")[0]} · ⚡{u.spd}
              </span>
            ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          {/* grid */}
          <div className="sketch-border relative bg-paper-shade/30 p-2">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
              {Array.from({ length: COLS * ROWS }).map((_, idx) => {
                const x = idx % COLS;
                const y = Math.floor(idx / COLS);
                const reachable =
                  isFriendTurn &&
                  active &&
                  !unitAt(x, y) &&
                  Math.max(Math.abs(x - active.x), Math.abs(y - active.y)) <= moveLeft;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onTile(x, y)}
                    className={cn(
                      "aspect-square border-2 border-dashed border-ink/25 transition-colors",
                      (x + y) % 2 === 0 ? "bg-paper" : "bg-paper-shade/50",
                      reachable && "bg-mint/40 hover:bg-mint/60",
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
                  style={{ gridColumn: `${u.x + 1} / span ${u.w}`, gridRow: `${u.y + 1} / span ${u.h}` }}
                  className={cn(
                    "pointer-events-auto relative flex items-center justify-center",
                    u.key === activeKey && "sketch-border-alt bg-weird/15",
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
                    <EnemyArt id={u.cardId} title={u.name} className="animate-wobble h-full w-full p-0.5" />
                  )}
                  <span className="absolute inset-x-1 bottom-0.5 h-1.5 border border-ink bg-paper">
                    <span
                      className={cn("block h-full", u.side === "friend" ? "bg-mint" : "bg-coral")}
                      style={{ width: `${(u.hp / u.maxHp) * 100}%` }}
                    />
                  </span>
                  <span className="absolute left-0.5 top-0.5 font-display text-[10px] font-bold text-ink">{u.hp}</span>
                  {u.shield > 0 && (
                    <span className="absolute right-0.5 top-0.5 font-display text-[10px] font-bold text-sky">
                      ◆{u.shield}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="sketch-border bg-paper-shade/40 p-3">
              <h3 className="font-display text-base font-extrabold text-ink">
                {active ? active.name : "Battle over"}
              </h3>
              <p className="font-hand text-sm text-ink">
                {active
                  ? `⚔ ${active.atk} · ❤ ${active.hp}/${active.maxHp} · ⚡ ${active.spd} · ◆ ${active.def + active.defBonus}`
                  : "—"}
              </p>
              {active && (
                <p className="font-hand text-xs text-muted-foreground">
                  ✦ MAG {active.mag} · ◎ AURA {active.aura} · ✸ CRT {active.crt}% · ◈ LCK {active.lck}
                </p>
              )}
              <p className="mt-1 font-hand text-xs text-muted-foreground">
                {isFriendTurn
                  ? "Walk onto a green tile, then hit an adjacent Blot or use the ability."
                  : "The Blots are moving…"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <SketchButton tone="coral" size="sm" disabled={!isFriendTurn} onClick={skip}>
                  Hold turn ↺
                </SketchButton>
              </div>
            </div>

            {active?.side === "friend" && active.specialName && (
              <div className="sketch-border bg-weird/15 p-3">
                <h3 className="font-display text-base font-extrabold text-weird">{active.specialName}</h3>
                <p className="font-hand text-xs text-ink">{active.specialText}</p>
                <div className="mt-2">
                  <SketchButton tone="weird" size="sm" disabled={!isFriendTurn} onClick={doSpecial}>
                    Use ability ✦
                  </SketchButton>
                </div>
              </div>
            )}

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
                  ? state.mode === "campaign"
                    ? `The Blot dries up and the page turns bright again. +${chapter.rewardWeird} Weird · drop chance ${drop}%.`
                    : state.mode === "endless"
                      ? `Wave ${state.endlessWave} survived. Drop chance ${drop}%.`
                      : "Training done. Nothing won, nothing lost."
                  : state.mode === "training"
                    ? "The ink spread too far — but training costs nothing."
                    : "The ink spread too far. Every level resets and the chapter starts again."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {outcome === "win" ? (
                  <SketchButton tone="mint" onClick={claim}>
                    {state.mode === "endless" ? "Next wave" : "Claim reward"}
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
