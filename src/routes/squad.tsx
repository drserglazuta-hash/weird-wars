import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { EmptySlot, GameCard, MultiverseChip, ShadowSlotCard } from "@/components/game/GameCard";
import {
  CAMPAIGN_LEVELS,
  COLLECTION,
  LEVEL_MAX,
  MULTIVERSE_CARDS,
  MULTIVERSE_MAX,
  SHADOW_COMMANDERS,
  SHADOW_TRAITS,
  STAT_META,
  hpFromStrength,
  levelCost,
  multiverseDef,
  reviveCost,
  scaleStats,
  shadowAura,
  shadowCard,
  statAtLevel,
} from "@/lib/game-data";
import { levelOf, replaceDowned, reviveFriend, setGameState, useGameState } from "@/lib/game-store";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "Squad Setup — Weird Wars" },
      {
        name: "description",
        content:
          "Pick seven friend cards, set your shadow commander in its side slot, attach Multiverse armour and spend Weird on levels.",
      },
      { property: "og:title", content: "Squad Setup — Weird Wars" },
      {
        property: "og:description",
        content: "Six-stat friend cards, a commander that never enters the grid, and Multiverse armour before the fight.",
      },
    ],
  }),
  component: SquadScreen,
});

function SquadScreen() {
  const state = useGameState();
  const navigate = useNavigate();
  const [detailId, setDetailId] = useState<string | null>("pip");
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const [pickingCommander, setPickingCommander] = useState(false);
  const [replacingFor, setReplacingFor] = useState<string | null>(null);

  const locked = state.runActive;
  const detail = COLLECTION.find((c) => c.id === detailId) ?? null;
  const filled = state.squad.filter(Boolean).length;
  const levelName =
    state.mode === "campaign"
      ? (CAMPAIGN_LEVELS.find((l) => l.id === state.selectedLevel)?.name ?? "Chapter")
      : state.mode === "endless"
        ? `Endless · wave ${state.endlessWave}`
        : "Training";

  const commander = shadowCard(state.commander);
  const aura = shadowAura(commander, state.shadowLevel);
  const armourDef = multiverseDef(state.multiverse);

  const assign = (cardId: string) => {
    if (pickingCommander) {
      setGameState({ commander: cardId });
      setPickingCommander(false);
      return;
    }
    if (replacingFor) {
      replaceDowned(replacingFor, cardId);
      setReplacingFor(null);
      setDetailId(cardId);
      return;
    }
    if (pickingSlot === null || locked) {
      setDetailId(cardId);
      return;
    }
    const squad = [...state.squad];
    const existing = squad.indexOf(cardId);
    if (existing !== -1) squad[existing] = null;
    squad[pickingSlot] = cardId;
    setGameState({ squad });
    setPickingSlot(null);
    setDetailId(cardId);
  };

  const nextLevelCost = (id: string) => levelCost(levelOf(state, id) + 1);

  const levelUp = (id: string) => {
    if (locked) return;
    const current = levelOf(state, id);
    if (current >= LEVEL_MAX || current >= state.shadowLevel) return;
    const cost = levelCost(current + 1);
    if (state.weird < cost) return;
    setGameState((s) => ({
      weird: s.weird - cost,
      cardLevels: { ...s.cardLevels, [id]: current + 1 },
    }));
  };

  const levelUpShadow = () => {
    if (locked || state.shadowLevel >= LEVEL_MAX) return;
    const cost = levelCost(state.shadowLevel + 1);
    if (state.weird < cost) return;
    setGameState((s) => ({ weird: s.weird - cost, shadowLevel: s.shadowLevel + 1 }));
  };

  const toggleMultiverse = (id: string) => {
    setGameState((s) => {
      if (s.multiverse.includes(id)) return { multiverse: s.multiverse.filter((m) => m !== id) };
      if (s.multiverse.length >= MULTIVERSE_MAX) return {};
      return { multiverse: [...s.multiverse, id] };
    });
  };

  const detailStats = detail ? scaleStats(detail.stats, levelOf(state, detail.id)) : null;

  return (
    <DeskScene
      title="Squad Setup"
      back={{ to: state.mode === "campaign" ? "/campaign" : "/", label: "Back" }}
      hud={
        <>
          <span className="sketch-border-alt bg-sky px-3 py-1 font-hand text-sm text-ink">{levelName}</span>
          <TokenPill tokens={state.weird} />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-extrabold text-ink">
              Friends <span className="font-hand text-base text-muted-foreground">({filled}/7 slots)</span>
            </h2>
            {(pickingSlot !== null || pickingCommander || replacingFor) && (
              <span className="animate-pop font-hand text-sm text-weird">
                Pick a card from the collection below ↓
              </span>
            )}
          </div>

          {locked && (
            <p className="sketch-border-alt mb-3 bg-paper-shade px-3 py-2 font-hand text-sm text-ink">
              You are inside {levelName}. Living friends cannot be swapped and nobody can be levelled until the
              chapter is over. A downed friend may be revived with Weird, or replaced once — the replaced friend
              stays down for the rest of the chapter.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {state.squad.map((id, i) => {
              const card = COLLECTION.find((c) => c.id === id);
              const isDowned = Boolean(id && state.downed.includes(id));
              return card ? (
                <div key={i} className="relative">
                  <GameCard
                    card={card}
                    level={levelOf(state, card.id)}
                    downed={isDowned}
                    selected={detailId === card.id}
                    onClick={() => setDetailId(card.id)}
                  />
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => {
                        const squad = [...state.squad];
                        squad[i] = null;
                        setGameState({ squad });
                      }}
                      className="sketch-border-alt absolute -right-2 -top-2 h-7 w-7 bg-coral font-display text-sm font-bold text-ink"
                      aria-label={`Remove ${card.name}`}
                    >
                      ✕
                    </button>
                  )}
                  {isDowned && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      <SketchButton
                        tone="mint"
                        size="sm"
                        disabled={state.weird < reviveCost(levelOf(state, card.id))}
                        onClick={() => reviveFriend(card.id, reviveCost(levelOf(state, card.id)))}
                      >
                        Revive · {reviveCost(levelOf(state, card.id))} Weird
                      </SketchButton>
                      <SketchButton tone="paper" size="sm" onClick={() => setReplacingFor(card.id)}>
                        Replace
                      </SketchButton>
                    </div>
                  )}
                </div>
              ) : (
                <EmptySlot
                  key={i}
                  label={locked ? "Locked this chapter" : `Friend slot ${i + 1}`}
                  onClick={() => !locked && setPickingSlot(i)}
                />
              );
            })}
          </div>

          <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-ink">
            Commander slot <span className="font-hand text-base text-muted-foreground">· never on the grid</span>
          </h2>
          <div className="flex flex-wrap items-start gap-3">
            {commander ? (
              <ShadowSlotCard
                card={commander}
                level={state.shadowLevel}
                selected={pickingCommander}
                onClick={() => setPickingCommander(true)}
              />
            ) : (
              <EmptySlot label="Shadow slot" onClick={() => setPickingCommander(true)} />
            )}
            <div className="sketch-border bg-paper-shade/50 p-3">
              <h3 className="font-display text-base font-extrabold text-ink">Aura granted to every friend</h3>
              <ul className="mt-1 space-y-0.5 font-hand text-sm text-ink">
                {SHADOW_TRAITS.map((t) => {
                  const value = commander ? statAtLevel(commander.traits[t.key], state.shadowLevel) : 0;
                  return (
                    <li key={t.key} className="flex justify-between gap-4 border-b border-dashed border-ink/20">
                      <span>
                        {t.label} → {t.grantLabel}
                      </span>
                      <span className="font-display text-xs font-bold text-weird">
                        {t.grants === "def" ? `+${aura.def} DEF` : `+${(value / 30).toFixed(1)}%`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SketchButton
                  tone="sunshine"
                  size="sm"
                  disabled={locked || state.shadowLevel >= LEVEL_MAX || state.weird < levelCost(state.shadowLevel + 1)}
                  onClick={levelUpShadow}
                >
                  Level shadow → {Math.min(LEVEL_MAX, state.shadowLevel + 1)} ·{" "}
                  {levelCost(Math.min(LEVEL_MAX, state.shadowLevel + 1))} Weird
                </SketchButton>
                <span className="font-hand text-xs text-muted-foreground">
                  Shadow is level {state.shadowLevel}. No friend may go past it.
                </span>
              </div>
            </div>
          </div>

          <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-ink">
            Multiverse armour{" "}
            <span className="font-hand text-base text-muted-foreground">
              ({state.multiverse.length}/{MULTIVERSE_MAX} attached · +{armourDef} DEF to every friend)
            </span>
          </h2>
          <div className="sketch-border flex gap-2 overflow-x-auto bg-paper-shade/40 p-3">
            {MULTIVERSE_CARDS.map((m) => (
              <MultiverseChip
                key={m.id}
                card={m}
                attached={state.multiverse.includes(m.id)}
                onClick={() => toggleMultiverse(m.id)}
              />
            ))}
          </div>

          <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-ink">
            {pickingCommander ? "Shadow commanders" : "Collection"}
          </h2>
          <div className="sketch-border flex gap-3 overflow-x-auto bg-paper-shade/40 p-3">
            {pickingCommander
              ? SHADOW_COMMANDERS.map((card) => (
                  <ShadowSlotCard
                    key={card.id}
                    card={card}
                    size="sm"
                    level={state.shadowLevel}
                    selected={state.commander === card.id}
                    onClick={() => assign(card.id)}
                  />
                ))
              : COLLECTION.map((card) => (
                  <GameCard
                    key={card.id}
                    card={card}
                    size="sm"
                    level={levelOf(state, card.id)}
                    downed={state.downed.includes(card.id)}
                    selected={state.squad.includes(card.id)}
                    onClick={() => assign(card.id)}
                  />
                ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="sketch-border paper-grain ink-shadow p-4">
            <h3 className="font-display text-lg font-extrabold text-ink">Card details</h3>
            {detail && detailStats ? (
              <>
                <p className="font-display text-2xl font-extrabold text-weird">{detail.name}</p>
                <p className="font-hand text-sm text-muted-foreground">{detail.title}</p>
                <dl className="mt-3 space-y-1 font-hand text-sm text-ink">
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>HP (50 + ATK × 5)</dt>
                    <dd>{hpFromStrength(detailStats.atk)}</dd>
                  </div>
                  {STAT_META.map((m) => (
                    <div key={m.key} className="flex justify-between border-b border-dashed border-ink/25">
                      <dt>
                        {m.short} · {m.trait}
                      </dt>
                      <dd>
                        {detailStats[m.key]}
                        {aura.pct[m.key] > 0 && (
                          <span className="ml-1 text-xs text-weird">+{Math.round(aura.pct[m.key] * 100)}%</span>
                        )}
                      </dd>
                    </div>
                  ))}
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>DEF (armour + aura)</dt>
                    <dd>{armourDef + aura.def}</dd>
                  </div>
                </dl>
                <p className="mt-3 font-display text-sm font-bold text-weird">{detail.special.name}</p>
                <p className="font-hand text-sm text-ink">{detail.special.text}</p>
                <p className="mt-2 font-hand text-xs italic text-muted-foreground">“{detail.flavor}”</p>
                <div className="mt-4">
                  <SketchButton
                    tone="sunshine"
                    size="sm"
                    disabled={
                      locked ||
                      levelOf(state, detail.id) >= LEVEL_MAX ||
                      levelOf(state, detail.id) >= state.shadowLevel ||
                      state.weird < nextLevelCost(detail.id)
                    }
                    onClick={() => levelUp(detail.id)}
                  >
                    Level up → {Math.min(LEVEL_MAX, levelOf(state, detail.id) + 1)} · {nextLevelCost(detail.id)} Weird
                  </SketchButton>
                  <p className="mt-1 font-hand text-xs text-muted-foreground">
                    Every stat ×1.08 per level, up to level {LEVEL_MAX} and never above the shadow's level.
                  </p>
                </div>
              </>
            ) : (
              <p className="font-hand text-sm text-muted-foreground">Tap a card to inspect it.</p>
            )}
          </div>

          <div className="sketch-border bg-mint/40 p-4">
            <h3 className="font-display text-lg font-extrabold text-ink">Ready?</h3>
            <p className="font-hand text-sm text-ink">
              {filled < 3
                ? "Bring at least 3 friends to the page."
                : `Your drawings are awake and twitching. Armour: +${armourDef} DEF each.`}
            </p>
            <div className="mt-3">
              <SketchButton size="lg" disabled={filled < 3} onClick={() => navigate({ to: "/battle" })}>
                Start Battle ⚔
              </SketchButton>
            </div>
          </div>
        </aside>
      </div>
    </DeskScene>
  );
}
