import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { EmptySlot, GameCard } from "@/components/game/GameCard";
import { COLLECTION, SHADOW_COMMANDERS, CAMPAIGN_LEVELS } from "@/lib/game-data";
import { setGameState, useGameState } from "@/lib/game-store";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "Squad Setup — Weird Wars" },
      {
        name: "description",
        content: "Pick seven friend cards and one shadow commander, spend tokens to level them up, then start the battle.",
      },
      { property: "og:title", content: "Squad Setup — Weird Wars" },
      { property: "og:description", content: "Deck builder for your seven friends and one shadow commander." },
    ],
  }),
  component: SquadScreen,
});

const LEVEL_COST = 250;

function SquadScreen() {
  const state = useGameState();
  const navigate = useNavigate();
  const [detailId, setDetailId] = useState<string | null>("pip");
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const [pickingCommander, setPickingCommander] = useState(false);

  const all = [...COLLECTION, ...SHADOW_COMMANDERS];
  const detail = all.find((c) => c.id === detailId) ?? null;
  const bonus = (id: string) => state.cardLevels[id] ?? 0;
  const filled = state.squad.filter(Boolean).length;
  const levelName = CAMPAIGN_LEVELS.find((l) => l.id === state.selectedLevel)?.name ?? "Skirmish";

  const assign = (cardId: string) => {
    if (pickingCommander) {
      setGameState({ commander: cardId });
      setPickingCommander(false);
      return;
    }
    if (pickingSlot === null) {
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

  const levelUp = (id: string) => {
    if (state.tokens < LEVEL_COST) return;
    setGameState((s) => ({
      tokens: s.tokens - LEVEL_COST,
      cardLevels: { ...s.cardLevels, [id]: (s.cardLevels[id] ?? 0) + 1 },
    }));
  };

  const commander = SHADOW_COMMANDERS.find((c) => c.id === state.commander);

  return (
    <DeskScene
      title="Squad Setup"
      back={{ to: state.mode === "campaign" ? "/campaign" : "/", label: "Back" }}
      hud={
        <>
          <span className="sketch-border-alt bg-sky px-3 py-1 font-hand text-sm text-ink">{levelName}</span>
          <TokenPill tokens={state.tokens} />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-extrabold text-ink">
              Friends <span className="font-hand text-base text-muted-foreground">({filled}/7 slots)</span>
            </h2>
            {(pickingSlot !== null || pickingCommander) && (
              <span className="animate-pop font-hand text-sm text-weird">
                Pick a card from the collection below ↓
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {state.squad.map((id, i) => {
              const card = COLLECTION.find((c) => c.id === id);
              return card ? (
                <div key={i} className="relative">
                  <GameCard
                    card={card}
                    levelBonus={bonus(card.id)}
                    selected={detailId === card.id}
                    onClick={() => setDetailId(card.id)}
                  />
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
                </div>
              ) : (
                <EmptySlot key={i} label={`Friend slot ${i + 1}`} onClick={() => setPickingSlot(i)} />
              );
            })}
          </div>

          <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-ink">Shadow Commander</h2>
          <div className="flex flex-wrap items-start gap-3">
            {commander ? (
              <GameCard
                card={commander}
                size="lg"
                levelBonus={bonus(commander.id)}
                selected={detailId === commander.id}
                onClick={() => setDetailId(commander.id)}
              />
            ) : (
              <EmptySlot label="Shadow slot" onClick={() => setPickingCommander(true)} />
            )}
            <SketchButton tone="paper" size="sm" onClick={() => setPickingCommander(true)}>
              Swap commander
            </SketchButton>
          </div>

          <h2 className="mb-2 mt-6 font-display text-xl font-extrabold text-ink">Collection</h2>
          <div className="sketch-border flex gap-3 overflow-x-auto bg-paper-shade/40 p-3">
            {(pickingCommander ? SHADOW_COMMANDERS : COLLECTION).map((card) => (
              <GameCard
                key={card.id}
                card={card}
                size="sm"
                levelBonus={bonus(card.id)}
                selected={state.squad.includes(card.id) || state.commander === card.id}
                onClick={() => assign(card.id)}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="sketch-border paper-grain ink-shadow p-4">
            <h3 className="font-display text-lg font-extrabold text-ink">Card details</h3>
            {detail ? (
              <>
                <p className="font-display text-2xl font-extrabold text-weird">{detail.name}</p>
                <p className="font-hand text-sm text-muted-foreground">{detail.title}</p>
                <dl className="mt-3 space-y-1 font-hand text-sm text-ink">
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>Attack</dt>
                    <dd>{detail.attack + bonus(detail.id)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>Health</dt>
                    <dd>{detail.health + bonus(detail.id) * 2}</dd>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>Speed</dt>
                    <dd>{detail.speed}</dd>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-ink/25">
                    <dt>Cost</dt>
                    <dd>{detail.cost} ink</dd>
                  </div>
                </dl>
                <p className="mt-3 font-display text-sm font-bold text-weird">{detail.ability.name}</p>
                <p className="font-hand text-sm text-ink">{detail.ability.text}</p>
                <p className="mt-2 font-hand text-xs italic text-muted-foreground">“{detail.flavor}”</p>
                <div className="mt-4">
                  <SketchButton
                    tone="sunshine"
                    size="sm"
                    disabled={state.tokens < LEVEL_COST}
                    onClick={() => levelUp(detail.id)}
                  >
                    Level up · {LEVEL_COST} tokens
                  </SketchButton>
                  <p className="mt-1 font-hand text-xs text-muted-foreground">
                    +1 attack, +2 health per level.
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
              {filled < 3 ? "Bring at least 3 friends to the page." : "Your drawings are awake and twitching."}
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
