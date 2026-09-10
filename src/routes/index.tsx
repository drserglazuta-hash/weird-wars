import type { ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeskScene, SketchButton, TokenPill } from "@/components/game/DeskScene";
import { setGameState, useGameState } from "@/lib/game-store";
import { CREATURE_ART } from "@/lib/game-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weird Wars — Wake the Drawings, Fight the Blot" },
      {
        name: "description",
        content:
          "A hand-drawn card-strategy game living inside a child's sketchbook. Connect Keplr, build a squad of friends and shadows, and battle the Blot.",
      },
      { property: "og:title", content: "Weird Wars — Wake the Drawings, Fight the Blot" },
      {
        property: "og:description",
        content: "Card-strategy battles in a living sketchbook. Campaign, duels and seasonal ranking.",
      },
    ],
  }),
  component: MenuScreen,
});

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="8" cy="9" r="5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M11 12 L20 20 M17 17 l2.5 -2.5 M14 14.5 l2 -2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <path d="M3 8 l9 -4 l9 4 l8 -4 v20 l-8 4 l-9 -4 l-9 4z" fill="none" stroke="#1F2A44" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M12 4 v20 M21 8 v20" stroke="#1F2A44" strokeWidth="2" />
      <path d="M6 18 q5 -5 9 0" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  );
}

function DuelIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <path d="M5 27 L20 8 l3 -4 l4 4 l-4 3 L8 27z" fill="none" stroke="#1F2A44" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M27 27 L12 8 L9 4 L5 8 l4 3 L24 27z" fill="none" stroke="#1F2A44" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
      <rect x="6" y="10" width="20" height="16" rx="5" fill="none" stroke="#1F2A44" strokeWidth="2.4" />
      <path d="M16 10 V4 M12 4h8" stroke="#1F2A44" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12.5" cy="17" r="2" fill="#6C5CE7" />
      <circle cx="19.5" cy="17" r="2" fill="#6C5CE7" />
      <path d="M12 22 q4 3 8 0" fill="none" stroke="#1F2A44" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ModeCard({
  title,
  blurb,
  tone,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  blurb: string;
  tone: "coral" | "mint" | "sky";
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const bg = { coral: "bg-coral/40", mint: "bg-mint/40", sky: "bg-sky/40" }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`sketch-border ink-shadow animate-pop w-full p-4 text-left transition-transform ${bg} ${
        disabled ? "opacity-45" : "hover:-translate-y-1 hover:rotate-[-0.8deg]"
      }`}
    >
      <span className="block h-9 w-9" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-1 font-display text-xl font-extrabold text-ink">{title}</h3>
      <p className="font-hand text-sm text-ink/75">{blurb}</p>
    </button>
  );
}

function MenuScreen() {
  const state = useGameState();
  const navigate = useNavigate();

  const connect = () => {
    setGameState({ connected: true, address: "weird1q…8fz2" });
  };

  return (
    <DeskScene
      hud={
        state.connected ? (
          <>
            <span className="sketch-border-alt bg-mint px-3 py-1 font-hand text-sm text-ink">
              {state.address}
            </span>
            <TokenPill tokens={state.tokens} />
          </>
        ) : null
      }
    >
      <div className="grid items-center gap-8 py-4 md:grid-cols-2">
        <div>
          <p className="font-hand text-lg text-weird">a sketchbook that fights back</p>
          <h1 className="font-display text-6xl font-extrabold leading-[0.9] text-ink md:text-8xl">
            Weird
            <br />
            <span className="text-weird">Wars</span>
          </h1>
          <svg viewBox="0 0 300 20" className="mt-1 h-5 w-64" aria-hidden="true">
            <path
              d="M4 12 q40 -9 80 0 t80 0 t80 -2 t52 4"
              fill="none"
              stroke="#FF7A5C"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-4 max-w-md font-hand text-2xl text-ink">
            Wake the drawings. Fight the Blot.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!state.connected ? (
              <SketchButton size="lg" onClick={connect}>
                <span className="inline-flex items-center gap-2">
                  <KeyIcon /> Connect Keplr
                </span>
              </SketchButton>
            ) : (
              <span className="sketch-border ink-shadow bg-mint px-5 py-2 font-display font-bold text-ink">
                ✓ Wallet connected
              </span>
            )}
            <span className="font-hand text-sm text-muted-foreground">
              {state.connected ? "Pick a mode →" : "Your cards live on-chain, your crayons don't."}
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <ModeCard
              title="Campaign"
              blurb="Follow the map, free every page."
              tone="coral"
              icon={<MapIcon />}
              disabled={!state.connected}
              onClick={() => {
                setGameState({ mode: "campaign" });
                navigate({ to: "/campaign" });
              }}
            />
            <ModeCard
              title="Duel vs Human"
              blurb="Real opponent, real mess."
              tone="mint"
              icon={<DuelIcon />}
              disabled={!state.connected}
              onClick={() => {
                setGameState({ mode: "human" });
                navigate({ to: "/duel-human" });
              }}
            />
            <ModeCard
              title="Duel vs AI"
              blurb="Practise against the Blot brain."
              tone="sky"
              icon={<BotIcon />}
              disabled={!state.connected}
              onClick={() => {
                setGameState({ mode: "ai" });
                navigate({ to: "/duel-ai" });
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/season" })}
            className="mt-4 font-hand text-base text-weird underline decoration-wavy underline-offset-4"
          >
            View season rating & prizes →
          </button>
        </div>

        <div className="relative hidden min-h-[420px] md:block">
          <img
            src={CREATURE_ART.pencil}
            alt="Pip the pencil stub, drawn in crayon"
            width={768}
            height={768}
            className="animate-float absolute left-4 top-2 h-56 w-56 object-contain"
          />
          <img
            src={CREATURE_ART.cat}
            alt="Paper Kit, a folded paper creature"
            loading="lazy"
            width={768}
            height={768}
            className="animate-wobble absolute right-2 top-24 h-48 w-48 object-contain"
          />
          <img
            src={CREATURE_ART.blot}
            alt="The Blot, an ink monster"
            loading="lazy"
            width={768}
            height={768}
            className="animate-wobble absolute bottom-2 left-24 h-44 w-44 object-contain"
          />
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d="M40 250 q60 -40 120 -10 t140 -30"
              fill="none"
              stroke="#1F2A44"
              strokeWidth="3"
              strokeDasharray="10 12"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </div>
      </div>
    </DeskScene>
  );
}
