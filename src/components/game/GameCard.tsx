import type { FriendCard, MultiverseCard, ShadowCard } from "@/lib/game-data";
import { SHADOW_TRAITS, STAT_META, hpFromStrength, scaleStats, statAtLevel } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const colorBg: Record<string, string> = {
  coral: "bg-coral/45",
  sunshine: "bg-sunshine/45",
  mint: "bg-mint/45",
  sky: "bg-sky/45",
  weird: "bg-weird/45",
};

const statTint: Record<string, string> = {
  atk: "bg-coral",
  spd: "bg-sky",
  mag: "bg-weird/60",
  aura: "bg-sunshine",
  crt: "bg-coral/60",
  lck: "bg-mint",
};

function Stat({ icon, label, value, tint }: { icon: string; label: string; value: number; tint: string }) {
  return (
    <span
      className={cn(
        "sketch-border-alt flex min-w-9 flex-1 items-center justify-center gap-1 px-1 py-0.5 font-display text-[10px] font-bold text-ink",
        tint,
      )}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
      {value}
    </span>
  );
}

const widths = { sm: "w-32", md: "w-44", lg: "w-56" } as const;

export function GameCard({
  card,
  size = "md",
  selected,
  onClick,
  level = 1,
  className,
  downed,
}: {
  card: FriendCard;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  level?: number;
  className?: string;
  downed?: boolean;
}) {
  const stats = scaleStats(card.stats, level);
  const hp = hpFromStrength(stats.atk);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "animate-pop sketch-border ink-shadow paper-grain relative shrink-0 overflow-hidden p-2 text-left transition-transform",
        widths[size],
        onClick && "hover:-translate-y-1.5 hover:rotate-[-1deg]",
        selected && "ring-4 ring-weird ring-offset-2 ring-offset-paper",
        downed && "opacity-55 grayscale",
        className,
      )}
    >
      {downed && (
        <span className="absolute -right-8 top-3 z-10 rotate-45 bg-blot px-8 py-0.5 text-center font-display text-[10px] font-bold text-paper">
          DOWNED
        </span>
      )}

      <div className="flex items-start justify-between gap-1">
        <h3 className="font-display text-sm font-extrabold leading-tight text-ink">{card.name}</h3>
        <span className="sketch-border-alt bg-weird px-1.5 font-display text-[10px] font-bold text-paper">
          Lv{level}
        </span>
      </div>
      <p className="font-hand text-[11px] text-muted-foreground">{card.title}</p>

      <div className={cn("sketch-border-alt my-2 flex items-center justify-center overflow-hidden", colorBg[card.color])}>
        <img
          src={card.art}
          alt={`Child's drawing of ${card.name}`}
          loading="lazy"
          width={768}
          height={768}
          className="h-24 w-full object-contain p-1 md:h-28"
        />
      </div>

      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="sketch-border-alt flex-1 bg-mint px-1 py-0.5 text-center font-display text-[10px] font-bold text-ink">
          ❤ {hp}
        </span>
        <span className="sketch-border-alt flex-1 bg-paper-shade px-1 py-0.5 text-center font-display text-[10px] font-bold text-ink">
          ◆ 0
        </span>
      </div>

      <div className="mb-1 flex items-center justify-between gap-1">
        {STAT_META.slice(0, 3).map((m) => (
          <Stat key={m.key} icon={m.icon} label={`${m.label} (${m.trait})`} value={stats[m.key]} tint={statTint[m.key]!} />
        ))}
      </div>
      <div className="mb-2 flex items-center justify-between gap-1">
        {STAT_META.slice(3).map((m) => (
          <Stat key={m.key} icon={m.icon} label={`${m.label} (${m.trait})`} value={stats[m.key]} tint={statTint[m.key]!} />
        ))}
      </div>

      <div className="sketch-border-alt bg-paper-shade px-2 py-1">
        <p className="font-display text-[11px] font-bold text-weird">{card.special.name}</p>
        <p className="font-hand text-[11px] leading-tight text-ink">{card.special.text}</p>
      </div>

      {size === "lg" && (
        <p className="mt-2 font-hand text-[11px] italic text-muted-foreground">“{card.flavor}”</p>
      )}
    </button>
  );
}

export function ShadowSlotCard({
  card,
  level = 1,
  size = "lg",
  selected,
  onClick,
}: {
  card: ShadowCard;
  level?: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "animate-pop sketch-border ink-shadow relative shrink-0 overflow-hidden bg-blot p-2 text-left transition-transform",
        widths[size],
        onClick && "hover:-translate-y-1.5 hover:rotate-[-1deg]",
        selected && "ring-4 ring-weird ring-offset-2 ring-offset-paper",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-display text-sm font-extrabold leading-tight text-paper">{card.name}</h3>
        <span className="sketch-border-alt bg-weird px-1.5 font-display text-[10px] font-bold text-paper">
          Lv{level}
        </span>
      </div>
      <p className="font-hand text-[11px] text-weird-soft">{card.title}</p>

      <div className="sketch-border-alt my-2 flex items-center justify-center overflow-hidden bg-weird/25">
        <img
          src={card.art}
          alt={`Child's drawing of ${card.name}`}
          loading="lazy"
          width={768}
          height={768}
          className="h-24 w-full object-contain p-1 md:h-28"
        />
      </div>

      <div className="sketch-border-alt space-y-0.5 bg-blot/60 px-2 py-1">
        {SHADOW_TRAITS.map((t) => {
          const value = statAtLevel(card.traits[t.key], level);
          return (
            <p key={t.key} className="flex items-baseline justify-between gap-2 font-hand text-[11px] text-paper">
              <span>{t.label}</span>
              <span className="font-display text-[10px] font-bold text-sunshine">
                {value} → +{(value / 30).toFixed(1)}% {t.grantLabel}
              </span>
            </p>
          );
        })}
      </div>

      <p className="mt-2 font-hand text-[11px] italic text-weird-soft">“{card.flavor}”</p>
      <p className="mt-1 font-hand text-[11px] text-weird-soft">Never steps onto the grid.</p>
    </button>
  );
}

export function MultiverseChip({
  card,
  attached,
  onClick,
}: {
  card: MultiverseCard;
  attached?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "sketch-border-alt paper-grain relative w-[104px] shrink-0 overflow-hidden p-1.5 text-left transition-transform hover:-translate-y-1",
        attached ? "bg-weird/25 ring-2 ring-weird" : "bg-paper-shade/70",
      )}
    >
      <span className="absolute -right-7 top-2 z-10 rotate-45 bg-weird px-7 py-0.5 text-center font-display text-[8px] font-bold text-paper">
        MULTI
      </span>
      <img
        src={card.art}
        alt={`Child's drawing of ${card.name}`}
        loading="lazy"
        width={768}
        height={768}
        className="h-12 w-full object-contain"
      />
      <p className="font-display text-[10px] font-bold leading-tight text-ink">{card.name}</p>
      <p className="font-hand text-[10px] text-ink">{attached ? "attached · +2 DEF" : "+2 DEF"}</p>
    </button>
  );
}

export function EmptySlot({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="sketch-border flex h-[264px] w-44 shrink-0 flex-col items-center justify-center gap-2 border-dashed bg-paper-shade/60 p-2 font-hand text-muted-foreground transition-transform hover:-translate-y-1"
    >
      <span className="font-display text-4xl">+</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
