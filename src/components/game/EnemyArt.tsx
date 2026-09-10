import { cn } from "@/lib/utils";

type EnemyArtProps = { id: string; className?: string; title?: string };

const ink = "var(--blot)";
const paper = "var(--paper)";
const pencil = "var(--graphite)";
const red = "var(--coral)";
const green = "var(--stain-green)";
const pink = "var(--eraser-pink)";

export function EnemyArt({ id, className, title }: EnemyArtProps) {
  const common = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const drawing = (() => {
    switch (id) {
      case "blotling":
        return <><path d="M33 66C18 55 24 30 43 29c6-15 30-14 34 3 19 4 21 28 7 37-10 8-40 8-51-3Z" fill={ink}/><circle cx="49" cy="49" r="6" fill={paper}/><circle cx="69" cy="47" r="6" fill={paper}/><path d="M39 68 34 84M76 69l7 15M25 70l-8 11M89 68l11 10" stroke={ink} strokeWidth="7" {...common}/><circle cx="55" cy="52" r="2" fill={ink}/><circle cx="72" cy="50" r="2" fill={ink}/></>;
      case "smudge":
        return <><path d="M11 51c19-17 35-4 52-11 18-8 33 2 46 16-14 12-35 4-52 12-18 8-33-1-46-17Z" fill={ink} opacity=".28"/><path d="M8 58c22-5 36 6 56-2 18-7 31 2 49 0M17 44c25 5 47-13 81 4M22 70c24-8 51 6 75-5" stroke={ink} strokeWidth="8" opacity=".55" {...common}/></>;
      case "splatter":
        return <><path d="m61 10 7 24 19-17-8 24 28-5-22 16 25 12-30 1 13 26-24-18-8 32-6-31-27 20 13-29-31 2 27-15-23-18 31 8-3-29 17 25Z" fill={ink}/><circle cx="59" cy="57" r="22" fill={ink}/><circle cx="51" cy="52" r="4" fill={paper}/><circle cx="69" cy="52" r="4" fill={paper}/></>;
      case "scribble":
        return <><path d="M22 63C2 34 49 20 62 47c12 26-44 31-32 3 11-28 67-22 65 12-1 31-60 35-69 5C16 36 77 21 93 49c17 30-43 55-67 29" stroke={pencil} strokeWidth="5" {...common}/><path d="M25 41c26 5 52 32 69 42M35 88c17-34 29-51 49-61" stroke={pencil} strokeWidth="3" {...common}/></>;
      case "squiggle":
        return <><path d="M10 72c11-39 24 34 38-3s25 30 39-5 18 19 25-4" stroke={pencil} strokeWidth="12" {...common}/><path d="M13 70c11-31 23 27 35-1s26 24 39-5 18 14 23-3" stroke={paper} strokeWidth="2" opacity=".5" {...common}/><circle cx="108" cy="57" r="3" fill={paper}/></>;
      case "hatch":
        return <><path d="M24 85 54 23M35 94 65 17M48 97 77 24M60 98 89 30M72 93l27-52M18 73l81 14M22 57l85 18M28 42l76 17" stroke={pencil} strokeWidth="5" {...common}/><circle cx="54" cy="61" r="4" fill={paper}/><circle cx="72" cy="58" r="4" fill={paper}/></>;
      case "dot":
        return <>{[[28,37,4],[45,28,3],[62,40,5],[80,29,3],[94,47,4],[34,60,5],[53,58,3],[72,65,5],[91,70,3],[46,81,4],[67,88,3],[84,84,5]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={pencil} opacity={.45+(i%3)*.18}/>)}</>;
      case "gray":
        return <><ellipse cx="61" cy="59" rx="46" ry="31" fill={pencil} opacity=".16"/><ellipse cx="57" cy="61" rx="36" ry="25" fill={pencil} opacity=".2"/><path d="M17 49c25-20 56 24 88 2M20 68c25 16 50-18 82 1" stroke={pencil} strokeWidth="9" opacity=".28" {...common}/><circle cx="52" cy="56" r="4" fill={paper}/><circle cx="70" cy="56" r="4" fill={paper}/></>;
      case "eraser-enemy":
        return <><path d="m29 35 55-12 14 58-58 12c-12 2-20-7-18-19Z" stroke={ink} strokeWidth="4" {...common} fill={pink}/><path d="m29 35 18-4 13 58-20 4c-12 2-20-7-18-19Z" fill={paper} opacity=".7"/><circle cx="48" cy="57" r="4" fill={ink}/><circle cx="67" cy="53" r="4" fill={ink}/><path d="M43 72c9 5 18 3 25-4" stroke={ink} strokeWidth="3" {...common}/><path d="m26 99 8-3m8 8 6-4m46-4 7 3" stroke={pink} strokeWidth="5" {...common}/></>;
      case "cross-out":
        return <><path d="M29 33c19-17 48-5 57 15 10 23-9 45-34 43-26-3-39-35-23-58Z" fill={ink} opacity=".78"/><path d="m17 20 86 82M99 19 20 101M9 48l99 30" stroke={red} strokeWidth="9" {...common}/><path d="m20 17 84 87M102 17 18 103" stroke={ink} strokeWidth="3" {...common}/></>;
      case "stain":
        return <><path d="M35 22c21-13 48 4 46 25 25 5 26 35 3 41-19 16-58 6-61-20-14-15-1-39 12-46Z" stroke={ink} strokeWidth="3" {...common} fill={green}/><path d="M45 85c0 15 8 18 8 4M73 86c1 21 10 17 10 3" stroke={green} strokeWidth="9" {...common}/><circle cx="48" cy="55" r="4" fill={ink}/><circle cx="69" cy="53" r="4" fill={ink}/></>;
      case "outline":
        return <><path d="M32 91c-12-26-7-57 16-68 28-13 53 15 46 40-3 11 6 20 11 31-14-5-20 5-31 0-11-4-18 8-28 0-6-5-10 1-14-3Z" stroke={pencil} strokeWidth="5" strokeDasharray="6 4" {...common} fill={paper}/><circle cx="51" cy="54" r="5" stroke={pencil} strokeWidth="3" fill="none"/><circle cx="74" cy="53" r="5" stroke={pencil} strokeWidth="3" fill="none"/></>;
      case "great-stain":
        return <><path d="M5 73c18-14 13-41 36-43C55 8 76 25 80 39c27-5 41 19 25 36 13 18-8 31-27 22-19 17-35-2-49 5C10 111-1 91 5 73Z" fill={ink}/><path d="M18 85 3 105M95 84l20 19M31 39 20 18M86 43l20-20" stroke={ink} strokeWidth="9" {...common}/><circle cx="50" cy="60" r="7" fill={paper}/><circle cx="75" cy="57" r="7" fill={paper}/></>;
      case "scribble-giant":
        return <><path d="M42 110c-12-25 8-39 4-59-4-17 7-38 20-37 16 1 17 21 11 36-6 17 17 35 2 60M47 58 13 73M77 57l31 21M48 108l-19 9M78 108l19 9" stroke={pencil} strokeWidth="10" {...common}/><path d="M35 22c41 3 9 45 37 45 30 0 15-48-15-38-25 8-6 53 23 48" stroke={pencil} strokeWidth="4" {...common}/><circle cx="58" cy="39" r="4" fill={paper}/><circle cx="72" cy="40" r="4" fill={paper}/></>;
      case "blot-mother":
        return <><path d="M16 88c-16-25 3-54 25-53C52 7 86 13 89 41c25 8 25 44 0 52-21 17-58 16-73-5Z" fill={ink}/><circle cx="49" cy="54" r="8" fill={paper}/><circle cx="74" cy="52" r="8" fill={paper}/><path d="M42 77c13 10 28 9 40-2" stroke={paper} strokeWidth="4" {...common}/><circle cx="13" cy="110" r="8" fill={ink}/><circle cx="104" cy="108" r="7" fill={ink}/><circle cx="95" cy="20" r="5" fill={ink}/></>;
      case "chief-eraser":
        return <><path d="m19 32 75-14 18 76-80 14C18 110 8 98 12 83Z" stroke={ink} strokeWidth="5" {...common} fill={pink}/><path d="m57 25 9 22-12 14 14 20-9 21" stroke={ink} strokeWidth="5" {...common}/><path d="M16 71c-9 8-8 21-13 31M101 91c4 14 11 17 17 23" stroke={paper} strokeWidth="11" {...common}/><circle cx="48" cy="56" r="5" fill={ink}/><circle cx="81" cy="50" r="5" fill={ink}/></>;
      case "klaksa":
        return <><path d="M9 83C-1 55 19 37 39 38 42 9 78 1 88 31c31-2 42 31 22 48 12 27-19 43-38 28-18 19-51 8-49-13-12 2-19-2-14-11Z" fill={ink}/><path d="M23 77 2 112M96 79l22 34M43 97l-4 23M82 96l7 24M27 45 7 22M94 39l21-13" stroke={ink} strokeWidth="13" {...common}/><ellipse cx="65" cy="53" rx="15" ry="12" fill="var(--eye-glow)"/><circle cx="68" cy="54" r="5" fill={ink}/><path d="M28 87c27 16 54 12 75-2" stroke="var(--weird)" strokeWidth="3" opacity=".7" {...common}/></>;
      default:
        return <circle cx="60" cy="60" r="34" fill={ink}/>;
    }
  })();

  return <svg viewBox="0 0 120 120" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={cn("overflow-visible", className)}>{drawing}</svg>;
}