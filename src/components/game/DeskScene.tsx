import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

function PaintTube({ className, tint }: { className?: string; tint: string }) {
  return (
    <svg viewBox="0 0 60 130" className={className} aria-hidden="true">
      <rect x="14" y="26" width="32" height="86" rx="8" fill={tint} stroke="#1F2A44" strokeWidth="3" />
      <path d="M18 26 L42 26 L38 14 L22 14 Z" fill="#e8e2d5" stroke="#1F2A44" strokeWidth="3" />
      <rect x="24" y="4" width="12" height="12" rx="3" fill="#1F2A44" />
      <path d="M20 46 q10 6 20 0" stroke="#1F2A44" strokeWidth="2.5" fill="none" opacity="0.5" />
    </svg>
  );
}

function Brush({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 160" className={className} aria-hidden="true">
      <rect x="15" y="10" width="10" height="98" rx="5" fill="#c98b52" stroke="#1F2A44" strokeWidth="3" />
      <rect x="12" y="106" width="16" height="16" rx="3" fill="#cfd4da" stroke="#1F2A44" strokeWidth="3" />
      <path d="M13 122 q7 30 14 0 z" fill="#6C5CE7" stroke="#1F2A44" strokeWidth="3" />
    </svg>
  );
}

function WaterJar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 120" className={className} aria-hidden="true">
      <path
        d="M18 20 q37 -10 74 0 l-6 84 q-31 10 -62 0 z"
        fill="rgba(126,200,242,0.45)"
        stroke="#1F2A44"
        strokeWidth="3"
      />
      <path d="M20 58 q35 12 68 0 l-4 46 q-30 9 -60 0 z" fill="rgba(108,92,231,0.35)" />
      <ellipse cx="55" cy="20" rx="37" ry="9" fill="#faf7f0" stroke="#1F2A44" strokeWidth="3" />
      <rect x="60" y="-2" width="7" height="60" rx="3" fill="#c98b52" stroke="#1F2A44" strokeWidth="3" />
    </svg>
  );
}

function Crayon({ className, tint }: { className?: string; tint: string }) {
  return (
    <svg viewBox="0 0 26 110" className={className} aria-hidden="true">
      <rect x="3" y="18" width="20" height="88" rx="6" fill={tint} stroke="#1F2A44" strokeWidth="3" />
      <path d="M3 34 h20 M3 92 h20" stroke="#1F2A44" strokeWidth="2.5" opacity="0.6" />
      <path d="M4 18 L13 2 L22 18 Z" fill={tint} stroke="#1F2A44" strokeWidth="3" />
    </svg>
  );
}

function InkBlot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <path
        d="M28 44 q-14 -26 12 -30 q10 -16 28 -6 q22 -12 30 10 q20 8 8 26 q10 22 -14 24 q-8 18 -28 8 q-20 12 -30 -8 q-22 -4 -6 -24 z"
        fill="#241F33"
        opacity="0.85"
      />
      <circle cx="18" cy="82" r="6" fill="#241F33" opacity="0.7" />
      <circle cx="104" cy="80" r="4" fill="#241F33" opacity="0.6" />
    </svg>
  );
}

function LooseCard({ className, tint }: { className?: string; tint: string }) {
  return (
    <svg viewBox="0 0 90 130" className={className} aria-hidden="true">
      <rect x="4" y="4" width="82" height="122" rx="8" fill="#FAF7F0" stroke="#1F2A44" strokeWidth="3" />
      <rect x="13" y="14" width="64" height="60" rx="6" fill={tint} stroke="#1F2A44" strokeWidth="2.5" />
      <path d="M16 88 h58 M16 100 h44 M16 112 h32" stroke="#1F2A44" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

type BackTo = "/" | "/campaign" | "/squad" | "/battle" | "/season" | "/duel-ai" | "/duel-human";

export function DeskScene({
  children,
  title,
  back,
  hud,
}: {
  children: ReactNode;
  title?: string;
  back?: { to: BackTo; label: string };
  hud?: ReactNode;
}) {
  return (
    <div className="desk-wood relative min-h-screen w-full overflow-hidden px-3 py-6 md:px-8 md:py-10">
      {/* desk clutter */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <PaintTube className="animate-float absolute left-[1%] top-[6%] h-24 w-12 md:h-32 md:w-16" tint="#FF7A5C" />
        <PaintTube className="absolute left-[5%] top-[30%] h-20 w-10 rotate-12 md:h-28 md:w-14" tint="#7BE0AD" />
        <Brush className="absolute left-[2%] bottom-[8%] h-36 w-10 -rotate-12 md:h-48" />
        <WaterJar className="absolute right-[2%] top-[8%] h-24 w-24 md:h-32 md:w-32" />
        <Crayon className="absolute right-[4%] top-[46%] h-24 w-6 rotate-[24deg] md:h-32" tint="#FFD166" />
        <Crayon className="absolute right-[9%] top-[52%] h-20 w-6 -rotate-[14deg] md:h-28" tint="#7EC8F2" />
        <InkBlot className="absolute left-[8%] bottom-[34%] h-16 w-20 opacity-80 md:h-24 md:w-28" />
        <InkBlot className="absolute right-[6%] bottom-[10%] h-14 w-16 rotate-45 opacity-70 md:h-20 md:w-24" />
        <LooseCard className="absolute left-[3%] top-[58%] h-24 w-16 -rotate-[18deg] md:h-32 md:w-24" tint="#CFC7FB" />
        <LooseCard className="absolute right-[3%] bottom-[30%] h-24 w-16 rotate-[14deg] md:h-32 md:w-24" tint="#FFD166" />
      </div>

      {/* sketchbook */}
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="paper-grain sketch-border relative rounded-[14px] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:p-8">
          {/* spiral binding */}
          <div className="pointer-events-none absolute -top-3 left-8 right-8 flex justify-between">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="h-5 w-2 rounded-full border-2 border-ink bg-paper-shade"
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              />
            ))}
          </div>

          {(title || back || hud) && (
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dashed border-ink/30 pb-4 pt-2">
              <div className="flex items-center gap-3">
                {back && (
                  <Link
                    to={back.to}
                    className="sketch-border-alt ink-shadow-sm bg-paper-shade px-3 py-1 font-hand text-sm text-ink transition-transform hover:-translate-y-0.5"
                  >
                    ← {back.label}
                  </Link>
                )}
                {title && (
                  <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{title}</h1>
                )}
              </div>
              <div className="flex items-center gap-2">{hud}</div>
            </header>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

export function TokenPill({ tokens }: { tokens: number }) {
  return (
    <span className="sketch-border-alt ink-shadow-sm flex items-center gap-2 bg-sunshine px-3 py-1 font-display text-sm font-bold text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#FF7A5C" stroke="#1F2A44" strokeWidth="2.5" />
        <path d="M9 12h6" stroke="#1F2A44" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {tokens.toLocaleString()}
    </span>
  );
}

export { InkBlot, Crayon, LooseCard };

export function SketchButton({
  children,
  onClick,
  tone = "weird",
  className,
  disabled,
  size = "md",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "weird" | "coral" | "mint" | "sky" | "sunshine" | "paper";
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
}) {
  const tones: Record<string, string> = {
    weird: "bg-weird text-paper",
    coral: "bg-coral text-ink",
    mint: "bg-mint text-ink",
    sky: "bg-sky text-ink",
    sunshine: "bg-sunshine text-ink",
    paper: "bg-paper-shade text-ink",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-xl",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "sketch-border ink-shadow font-display font-bold transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
        !disabled && "hover:-translate-y-0.5 hover:rotate-[-0.6deg]",
        disabled && "cursor-not-allowed opacity-45",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
