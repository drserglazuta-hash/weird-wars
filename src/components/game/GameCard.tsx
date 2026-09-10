import type { GameCardData } from "@/lib/game-data";
import { cn } from "@/lib/utils";

const colorBg: Record<string, string> = {
  coral: "bg-coral/45",
  sunshine: "bg-sunshine/45",
  mint: "bg-mint/45",
  sky: "bg-sky/45",
  weird: "bg-weird/45",
};

function Stat({ icon, value, tint }: { icon: string; value: number; tint: string }) {
  return (
    <span
      className={cn(
        "sketch-border-alt flex min-w-9 items-center justify-center gap-1 px-1.5 py-0.5 font-display text-xs font-bold text-ink",
        tint,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {value}
    </span>
  );
}

export function GameCard({
  card,
  size = "md",
  selected,
  onClick,
  levelBonus = 0,
  className,
}: {
  card: GameCardData;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  levelBonus?: number;
  className?: string;
}) {
  const isShadow = card.frame === "shadow";
  const isMulti = card.frame === "multiverse";
  const widths = { sm: "w-32", md: "w-44", lg: "w-56" };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "animate-pop sketch-border ink-shadow relative shrink-0 overflow-hidden p-2 text-left transition-transform",
        widths[size],
        isShadow ? "bg-blot" : "paper-grain",
        onClick && "hover:-translate-y-1.5 hover:rotate-[-1deg]",
        selected && "ring-4 ring-weird ring-offset-2 ring-offset-paper",
        className,
      )}
    >
      {isMulti && (
        <span className="absolute -right-8 top-3 z-10 rotate-45 bg-weird px-8 py-0.5 text-center font-display text-[10px] font-bold text-paper">
          MULTIVERSE
        </span>
      )}

      <div className="flex items-start justify-between gap-1">
        <h3
          className={cn(
            "font-display text-sm font-extrabold leading-tight",
            isShadow ? "text-paper" : "text-ink",
          )}
        >
          {card.name}
        </h3>
        <span className="sketch-border-alt bg-weird px-1.5 font-display text-[10px] font-bold text-paper">
          Lv{card.level + levelBonus}
        </span>
      </div>
      <p className={cn("font-hand text-[11px]", isShadow ? "text-weird-soft" : "text-muted-foreground")}>
        {card.title}
      </p>

      <div
        className={cn(
          "sketch-border-alt my-2 flex items-center justify-center overflow-hidden",
          isShadow ? "bg-weird/25" : colorBg[card.color],
        )}
      >
        <img
          src={card.art}
          alt={`Child's drawing of ${card.name}`}
          loading="lazy"
          width={768}
          height={768}
          className="h-24 w-full object-contain p-1 md:h-28"
        />
      </div>

      <div className="mb-2 flex items-center justify-between gap-1">
        <Stat icon="⚔" value={card.attack + levelBonus} tint="bg-coral" />
        <Stat icon="❤" value={card.health + levelBonus * 2} tint="bg-mint" />
        <Stat icon="⚡" value={card.speed} tint="bg-sky" />
      </div>

      <div className={cn("sketch-border-alt px-2 py-1", isShadow ? "bg-blot/60" : "bg-paper-shade")}>
        <p
          className={cn(
            "font-display text-[11px] font-bold",
            isShadow ? "text-sunshine" : "text-weird",
          )}
        >
          {card.ability.name}
        </p>
        <p className={cn("font-hand text-[11px] leading-tight", isShadow ? "text-paper" : "text-ink")}>
          {card.ability.text}
        </p>
      </div>

      {size === "lg" && (
        <p
          className={cn(
            "mt-2 font-hand text-[11px] italic",
            isShadow ? "text-weird-soft" : "text-muted-foreground",
          )}
        >
          “{card.flavor}”
        </p>
      )}
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
