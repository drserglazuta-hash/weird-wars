import pencilArt from "@/assets/creature-pencil.png";
import catArt from "@/assets/creature-cat.png";
import blotArt from "@/assets/creature-blot.png";
import shadowArt from "@/assets/creature-shadow.png";

export type CardFrame = "friend" | "shadow" | "multiverse";
export type CrayonColor = "coral" | "sunshine" | "mint" | "sky" | "weird";

export const CREATURE_ART = {
  pencil: pencilArt,
  cat: catArt,
  blot: blotArt,
  shadow: shadowArt,
};

/* ============================================================
   Stats — six NFT-derived values per friend card
   ATK  strength      SPD  athleticism   MAG  intellect
   AURA charisma      CRT  weirdness     LCK  luck
   HP = 50 + strength * 5.  DEF comes only from Multiverse cards.
   ============================================================ */

export type StatKey = "atk" | "spd" | "mag" | "aura" | "crt" | "lck";
export type CardStats = Record<StatKey, number>;

export const STAT_META: { key: StatKey; short: string; label: string; trait: string; icon: string }[] = [
  { key: "atk", short: "ATK", label: "Attack", trait: "Strength", icon: "⚔" },
  { key: "spd", short: "SPD", label: "Speed", trait: "Athleticism", icon: "⚡" },
  { key: "mag", short: "MAG", label: "Magic", trait: "Intellect", icon: "✦" },
  { key: "aura", short: "AURA", label: "Aura", trait: "Charisma", icon: "◎" },
  { key: "crt", short: "CRT", label: "Crit chance", trait: "Weirdness", icon: "✸" },
  { key: "lck", short: "LCK", label: "Luck", trait: "Luck", icon: "🍀" },
];

export function hpFromStrength(strength: number) {
  return 50 + strength * 5;
}

/* ---------------- Levelling ---------------- */

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 10;

/** stat(L) = base × (1 + 0.08 × (L − 1)) */
export function levelMultiplier(level: number) {
  return 1 + 0.08 * (level - 1);
}

export function statAtLevel(base: number, level: number) {
  return Math.round(base * levelMultiplier(level));
}

/** cost(L) = 25 × L^1.6 — Weird paid to reach level L */
export function levelCost(level: number) {
  return Math.round(25 * Math.pow(level, 1.6));
}

/** Reviving a downed friend inside a chapter. */
export function reviveCost(level: number) {
  return 25 * level;
}

export function scaleStats(base: CardStats, level: number): CardStats {
  return {
    atk: statAtLevel(base.atk, level),
    spd: statAtLevel(base.spd, level),
    mag: statAtLevel(base.mag, level),
    aura: statAtLevel(base.aura, level),
    crt: statAtLevel(base.crt, level),
    lck: statAtLevel(base.lck, level),
  };
}

/* ---------------- Friend cards ---------------- */

export type SpecialId =
  | "gas-flame"
  | "chameleon"
  | "healing-sap"
  | "titanium-skin"
  | "rubber-wall"
  | "static-spark"
  | "magnet-pull"
  | "sticky-trap"
  | "storm-line";

export type FriendCard = {
  id: string;
  name: string;
  title: string;
  frame: "friend";
  color: CrayonColor;
  art: string;
  stats: CardStats;
  special: { id: SpecialId; name: string; text: string };
  flavor: string;
};

export const COLLECTION: FriendCard[] = [
  {
    id: "pip",
    name: "Pip the Stub",
    title: "Friend · Scribbler",
    frame: "friend",
    color: "coral",
    art: pencilArt,
    stats: { atk: 12, spd: 9, mag: 14, aura: 6, crt: 12, lck: 10 },
    special: { id: "gas-flame", name: "Gas Flame", text: "Burns every Blot within one tile for 1.5 × MAG." },
    flavor: "Sharpened twice. Scared zero times.",
  },
  {
    id: "kit",
    name: "Paper Kit",
    title: "Friend · Glider",
    frame: "friend",
    color: "sky",
    art: catArt,
    stats: { atk: 10, spd: 16, mag: 8, aura: 5, crt: 22, lck: 14 },
    special: { id: "chameleon", name: "Chameleon", text: "Blends into the paper: 60% dodge until its next turn." },
    flavor: "Folded from a spelling test.",
  },
  {
    id: "mossy",
    name: "Mossy Crayon",
    title: "Friend · Healer",
    frame: "friend",
    color: "mint",
    art: pencilArt,
    stats: { atk: 8, spd: 7, mag: 18, aura: 12, crt: 6, lck: 12 },
    special: { id: "healing-sap", name: "Healing Sap", text: "Heals every friend for 8 + 1.2 × MAG." },
    flavor: "Smells faintly of grass.",
  },
  {
    id: "sunny",
    name: "Sunny Blob",
    title: "Friend · Bruiser",
    frame: "friend",
    color: "sunshine",
    art: catArt,
    stats: { atk: 18, spd: 5, mag: 4, aura: 8, crt: 10, lck: 8 },
    special: { id: "titanium-skin", name: "Titanium Skin", text: "+20 DEF and draws every Blot for one round." },
    flavor: "Left a stain on page 14.",
  },
  {
    id: "eraser",
    name: "Sir Eraser",
    title: "Friend · Guardian",
    frame: "friend",
    color: "coral",
    art: pencilArt,
    stats: { atk: 14, spd: 4, mag: 6, aura: 14, crt: 5, lck: 9 },
    special: { id: "rubber-wall", name: "Rubber Wall", text: "Shields itself and adjacent friends for 6 + MAG." },
    flavor: "Half gone, twice as brave.",
  },
  {
    id: "stitch",
    name: "Stitchy",
    title: "Friend · Scout",
    frame: "friend",
    color: "mint",
    art: pencilArt,
    stats: { atk: 11, spd: 13, mag: 10, aura: 7, crt: 18, lck: 16 },
    special: { id: "static-spark", name: "Static Spark", text: "Chains 0.8 × MAG to the three nearest Blots." },
    flavor: "Sewn from a torn margin.",
  },
  {
    id: "clip",
    name: "Clippy",
    title: "Friend · Hooker",
    frame: "friend",
    color: "sky",
    art: catArt,
    stats: { atk: 13, spd: 11, mag: 9, aura: 9, crt: 14, lck: 11 },
    special: { id: "magnet-pull", name: "Magnet Pull", text: "Drags the nearest Blot beside it and hits for MAG." },
    flavor: "Holds three pages and one grudge.",
  },
  {
    id: "glue",
    name: "Gluey",
    title: "Friend · Trapper",
    frame: "friend",
    color: "mint",
    art: pencilArt,
    stats: { atk: 9, spd: 6, mag: 15, aura: 11, crt: 7, lck: 13 },
    special: { id: "sticky-trap", name: "Sticky Trap", text: "Roots every adjacent Blot for one round." },
    flavor: "Dried in the cap. Still enthusiastic.",
  },
  {
    id: "bolt",
    name: "Bolt Scribble",
    title: "Friend · Striker",
    frame: "friend",
    color: "sunshine",
    art: catArt,
    stats: { atk: 15, spd: 12, mag: 13, aura: 6, crt: 16, lck: 7 },
    special: { id: "storm-line", name: "Storm Line", text: "Strikes every Blot in its row for 1.1 × MAG." },
    flavor: "Drawn during a thunderstorm.",
  },
];

export function friendCard(id: string) {
  return COLLECTION.find((c) => c.id === id) ?? null;
}

/* ---------------- Shadow commander ---------------- */

export type ShadowTraitKey =
  | "power"
  | "shadownimbleness"
  | "umbramind"
  | "shadowIllusions"
  | "transformation"
  | "energyExtraction"
  | "emotionAbsorption";

export type AuraTarget = StatKey | "def";

export const SHADOW_TRAITS: { key: ShadowTraitKey; label: string; grants: AuraTarget; grantLabel: string }[] = [
  { key: "power", label: "Power", grants: "atk", grantLabel: "ATK" },
  { key: "shadownimbleness", label: "Shadownimbleness", grants: "spd", grantLabel: "SPD" },
  { key: "umbramind", label: "Umbramind", grants: "mag", grantLabel: "MAG" },
  { key: "shadowIllusions", label: "Shadow illusions", grants: "aura", grantLabel: "AURA" },
  { key: "transformation", label: "Transformation", grants: "crt", grantLabel: "CRT" },
  { key: "energyExtraction", label: "Energy extraction", grants: "def", grantLabel: "DEF" },
  { key: "emotionAbsorption", label: "Emotion absorption", grants: "lck", grantLabel: "LCK" },
];

export type ShadowCard = {
  id: string;
  name: string;
  title: string;
  frame: "shadow";
  color: CrayonColor;
  art: string;
  traits: Record<ShadowTraitKey, number>;
  flavor: string;
};

export const SHADOW_COMMANDERS: ShadowCard[] = [
  {
    id: "umbra",
    name: "Umbra",
    title: "Shadow · Commander",
    frame: "shadow",
    color: "weird",
    art: shadowArt,
    traits: {
      power: 12,
      shadownimbleness: 8,
      umbramind: 15,
      shadowIllusions: 9,
      transformation: 6,
      energyExtraction: 10,
      emotionAbsorption: 7,
    },
    flavor: "Lives between the pages. Never steps onto one.",
  },
  {
    id: "vela",
    name: "Vela the Quiet",
    title: "Shadow · Commander",
    frame: "shadow",
    color: "weird",
    art: shadowArt,
    traits: {
      power: 7,
      shadownimbleness: 16,
      umbramind: 11,
      shadowIllusions: 14,
      transformation: 12,
      energyExtraction: 5,
      emotionAbsorption: 13,
    },
    flavor: "Never speaks above a whisper.",
  },
];

export function shadowCard(id: string | null) {
  return SHADOW_COMMANDERS.find((c) => c.id === id) ?? null;
}

/** Aura bonus fraction for a trait value: trait / 30. */
export function auraFraction(trait: number) {
  return trait / 30;
}

export type AuraBundle = {
  /** percentage multipliers, keyed by stat */
  pct: Record<StatKey, number>;
  /** flat DEF granted by Energy extraction */
  def: number;
};

export function shadowAura(shadow: ShadowCard | null, level: number): AuraBundle {
  const pct: Record<StatKey, number> = { atk: 0, spd: 0, mag: 0, aura: 0, crt: 0, lck: 0 };
  if (!shadow) return { pct, def: 0 };
  let def = 0;
  for (const t of SHADOW_TRAITS) {
    const value = statAtLevel(shadow.traits[t.key], level);
    if (t.grants === "def") def = Math.round(auraFraction(value) * 10);
    else pct[t.grants] = auraFraction(value);
  }
  return { pct, def };
}

/* ---------------- Multiverse cards (pre-battle resource) ---------------- */

export const MULTIVERSE_MAX = 10;
export const MULTIVERSE_DEF_EACH = 2;

export type MultiverseCard = {
  id: string;
  name: string;
  title: string;
  frame: "multiverse";
  color: CrayonColor;
  art: string;
  flavor: string;
};

export const MULTIVERSE_CARDS: MultiverseCard[] = [
  { id: "mv-loop", name: "Loop-de-Loop", title: "Multiverse · Armour", frame: "multiverse", color: "weird", art: catArt, flavor: "Drawn in a notebook that doesn't exist yet." },
  { id: "mv-jar", name: "Jar of Water", title: "Multiverse · Armour", frame: "multiverse", color: "sky", art: catArt, flavor: "The brushes owe it everything." },
  { id: "mv-tape", name: "Sticky Tape", title: "Multiverse · Armour", frame: "multiverse", color: "sunshine", art: pencilArt, flavor: "Holds the page together." },
  { id: "mv-foil", name: "Foil Sticker", title: "Multiverse · Armour", frame: "multiverse", color: "sky", art: catArt, flavor: "Shiny enough to scare ink." },
  { id: "mv-cork", name: "Cork Board", title: "Multiverse · Armour", frame: "multiverse", color: "coral", art: pencilArt, flavor: "Full of old pinholes." },
  { id: "mv-ruler", name: "Bent Ruler", title: "Multiverse · Armour", frame: "multiverse", color: "mint", art: pencilArt, flavor: "Measures nothing correctly." },
  { id: "mv-cap", name: "Lost Pen Cap", title: "Multiverse · Armour", frame: "multiverse", color: "weird", art: catArt, flavor: "Its pen is in another universe." },
  { id: "mv-clipart", name: "Paper Clip Chain", title: "Multiverse · Armour", frame: "multiverse", color: "sunshine", art: pencilArt, flavor: "Made during a very long lesson." },
  { id: "mv-glitter", name: "Glitter Dust", title: "Multiverse · Armour", frame: "multiverse", color: "coral", art: catArt, flavor: "It will never fully come off." },
  { id: "mv-eye", name: "Klaksa's Eye", title: "Multiverse · Armour", frame: "multiverse", color: "weird", art: blotArt, flavor: "It blinks when you aren't looking." },
];

export function multiverseCard(id: string) {
  return MULTIVERSE_CARDS.find((c) => c.id === id) ?? null;
}

export function multiverseDef(attached: string[]) {
  return Math.min(MULTIVERSE_MAX, attached.length) * MULTIVERSE_DEF_EACH;
}

/* ---------------- Enemy roster ---------------- */

export type EnemyFamily = "ink" | "pencil" | "graphite" | "eraser" | "stationery" | "boss";
export type EnemyAI = "swarm" | "rusher" | "ranged" | "drainer" | "boss";

export type EnemyDef = {
  id: string;
  name: string;
  nameRu: string;
  family: EnemyFamily;
  behavior: string;
  ai: EnemyAI;
  attack: number;
  health: number;
  speed: number;
  def: number;
  range: number;
  /** footprint in grid cells */
  w: number;
  h: number;
  ability: string;
};

export const ENEMY_ROSTER: EnemyDef[] = [
  { id: "blotling", name: "Blotling", nameRu: "Кляксята", family: "ink", behavior: "Swarm", ai: "swarm", attack: 9, health: 55, speed: 5, def: 2, range: 1, w: 1, h: 1, ability: "Piles onto whoever is closest." },
  { id: "smudge", name: "Smudge", nameRu: "Разводы", family: "ink", behavior: "Swarm blocker", ai: "swarm", attack: 12, health: 95, speed: 3, def: 8, range: 1, w: 1, h: 1, ability: "Thick and slow — hard to cut through." },
  { id: "splatter", name: "Splatter", nameRu: "Брызги", family: "ink", behavior: "Ranged", ai: "ranged", attack: 14, health: 62, speed: 6, def: 3, range: 3, w: 1, h: 1, ability: "Spits from three tiles and backs away." },
  { id: "scribble", name: "Scribble", nameRu: "Каляки-маляки", family: "pencil", behavior: "Rusher", ai: "rusher", attack: 15, health: 70, speed: 8, def: 3, range: 1, w: 1, h: 1, ability: "Charges twice as far before striking." },
  { id: "squiggle", name: "Squiggle", nameRu: "Кривули", family: "pencil", behavior: "Rusher", ai: "rusher", attack: 12, health: 85, speed: 7, def: 4, range: 1, w: 1, h: 1, ability: "Coils in fast and holds on." },
  { id: "hatch", name: "Hatch", nameRu: "Штрихи", family: "pencil", behavior: "Swarm", ai: "swarm", attack: 17, health: 78, speed: 5, def: 6, range: 1, w: 1, h: 1, ability: "Bristles with sharp little lines." },
  { id: "dot", name: "Dot", nameRu: "Точки", family: "graphite", behavior: "Swarm", ai: "swarm", attack: 7, health: 45, speed: 9, def: 1, range: 1, w: 1, h: 1, ability: "Fast, tiny and endless." },
  { id: "gray", name: "Gray", nameRu: "Серости", family: "graphite", behavior: "Drainer", ai: "drainer", attack: 13, health: 100, speed: 4, def: 5, range: 1, w: 1, h: 1, ability: "Heals itself with the colour it drains." },
  { id: "eraser-enemy", name: "Eraser", nameRu: "Стирашки", family: "eraser", behavior: "Drainer", ai: "drainer", attack: 20, health: 95, speed: 5, def: 7, range: 1, w: 1, h: 1, ability: "Rubs friends away and grows back." },
  { id: "cross-out", name: "Cross-out", nameRu: "Зачёркиши", family: "stationery", behavior: "Rusher", ai: "rusher", attack: 23, health: 110, speed: 4, def: 8, range: 1, w: 1, h: 1, ability: "Lunges to cross a friend out." },
  { id: "stain", name: "Stain", nameRu: "Помарки", family: "stationery", behavior: "Swarm", ai: "swarm", attack: 15, health: 125, speed: 3, def: 10, range: 1, w: 1, h: 1, ability: "Soaks damage and keeps coming." },
  { id: "outline", name: "Outline", nameRu: "Обводки", family: "stationery", behavior: "Ranged", ai: "ranged", attack: 18, health: 80, speed: 7, def: 4, range: 3, w: 1, h: 1, ability: "Traces friends from a safe distance." },
  { id: "great-stain", name: "Great Stain", nameRu: "Великая Помарка", family: "boss", behavior: "Boss · 2 cells", ai: "boss", attack: 26, health: 300, speed: 4, def: 12, range: 2, w: 2, h: 1, ability: "Every other turn it spreads across the row." },
  { id: "scribble-giant", name: "Scribble Giant", nameRu: "Каляка-Великан", family: "boss", behavior: "Boss · 3 cells", ai: "boss", attack: 30, health: 380, speed: 5, def: 12, range: 2, w: 1, h: 3, ability: "Sweeps everything standing in front of it." },
  { id: "blot-mother", name: "Blot Mother", nameRu: "Клякса-Мать", family: "boss", behavior: "Boss · 3 cells", ai: "boss", attack: 28, health: 420, speed: 4, def: 14, range: 2, w: 3, h: 1, ability: "Spawns a Blotling every second turn." },
  { id: "chief-eraser", name: "Chief Eraser", nameRu: "Главная Стирашка", family: "boss", behavior: "Boss · 4 cells", ai: "boss", attack: 35, health: 470, speed: 6, def: 16, range: 2, w: 2, h: 2, ability: "Erases two friends at once." },
  { id: "klaksa", name: "The Blot", nameRu: "Клякса", family: "boss", behavior: "Final boss · 4 cells", ai: "boss", attack: 44, health: 650, speed: 5, def: 18, range: 2, w: 2, h: 2, ability: "Devours colour and swallows fallen drawings." },
];

export function enemyDef(id: string) {
  return ENEMY_ROSTER.find((e) => e.id === id) ?? ENEMY_ROSTER[0]!;
}

/* ---------------- Endless waves ---------------- */

const WAVE_POOL = [
  ["blotling", "blotling", "dot"],
  ["blotling", "smudge", "dot", "dot"],
  ["scribble", "scribble", "splatter"],
  ["hatch", "squiggle", "gray"],
  ["eraser-enemy", "outline", "blotling", "dot"],
  ["cross-out", "stain", "splatter"],
  ["great-stain", "blotling", "dot"],
  ["gray", "gray", "outline", "hatch"],
  ["scribble-giant", "scribble"],
  ["blot-mother", "splatter", "blotling"],
  ["chief-eraser", "eraser-enemy"],
  ["klaksa", "blot-mother"],
];

export function waveRoster(wave: number): string[] {
  const base = WAVE_POOL[(wave - 1) % WAVE_POOL.length]!;
  const extra = Math.floor((wave - 1) / WAVE_POOL.length);
  return extra > 0 ? [...base, ...Array.from({ length: Math.min(3, extra) }, () => "blotling")] : [...base];
}

/** Enemies get tougher every loop of the wave pool. */
export function waveScale(wave: number) {
  return 1 + 0.12 * (wave - 1);
}

export const TRAINING_ROSTER = ["blotling", "dot", "scribble"];

/* ---------------- Ten-chapter campaign ---------------- */

export type CampaignLevel = {
  id: number;
  /** "Глава N" */
  chapter: string;
  name: string;
  nameRu: string;
  blurb: string;
  difficulty: "easy" | "normal" | "hard" | "boss";
  reward: string;
  rewardWeird: number;
  /** 0 = pristine paper, 1 = drowned in ink */
  corruption: number;
  /** hand-drawn trail path in a 100×62 viewBox */
  trail: string;
  /** stop positions along the trail, in % of the page box */
  stops: { x: number; y: number }[];
  encounter: string[];
};

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    id: 1,
    chapter: "Глава 1",
    name: "The Pencil Case",
    nameRu: "Пенал",
    blurb: "A clean new page. Something small and inky is already hiding in the corner.",
    difficulty: "easy",
    reward: "120 Weird",
    rewardWeird: 120,
    corruption: 0,
    trail: "M 8 50 Q 26 34 42 46 Q 58 58 74 40 Q 86 28 94 34",
    stops: [{ x: 8, y: 50 }, { x: 25, y: 41 }, { x: 42, y: 46 }, { x: 74, y: 40 }, { x: 94, y: 34 }],
    encounter: ["blotling", "blotling"],
  },
  {
    id: 2,
    chapter: "Глава 2",
    name: "Spilled Ink Pond",
    nameRu: "Чернильная лужа",
    blurb: "A pen leaked overnight. The puddle learned to walk.",
    difficulty: "easy",
    reward: "160 Weird",
    rewardWeird: 160,
    corruption: 0.12,
    trail: "M 6 20 Q 22 44 40 26 Q 56 10 70 32 Q 84 52 96 44",
    stops: [{ x: 6, y: 20 }, { x: 24, y: 38 }, { x: 40, y: 26 }, { x: 70, y: 32 }, { x: 96, y: 44 }],
    encounter: ["blotling", "blotling", "smudge"],
  },
  {
    id: 3,
    chapter: "Глава 3",
    name: "Crayon Ridge",
    nameRu: "Восковой хребет",
    blurb: "Wax hills keep the pencil scribbles out. Mostly.",
    difficulty: "normal",
    reward: "200 Weird",
    rewardWeird: 200,
    corruption: 0.22,
    trail: "M 10 54 L 24 24 L 38 52 L 52 22 L 66 50 Q 82 36 94 48",
    stops: [{ x: 10, y: 54 }, { x: 24, y: 24 }, { x: 38, y: 52 }, { x: 66, y: 50 }, { x: 94, y: 48 }],
    encounter: ["scribble", "scribble", "squiggle"],
  },
  {
    id: 4,
    chapter: "Глава 4",
    name: "Eraser Dunes",
    nameRu: "Стирательные дюны",
    blurb: "Pink crumbs everywhere. Whole shapes have gone missing.",
    difficulty: "normal",
    reward: "260 Weird",
    rewardWeird: 260,
    corruption: 0.34,
    trail: "M 5 44 Q 20 20 34 44 Q 48 66 62 42 Q 76 18 96 38",
    stops: [{ x: 5, y: 44 }, { x: 20, y: 32 }, { x: 34, y: 44 }, { x: 62, y: 42 }, { x: 96, y: 38 }],
    encounter: ["eraser-enemy", "hatch", "blotling", "smudge"],
  },
  {
    id: 5,
    chapter: "Глава 5",
    name: "The Great Stain",
    nameRu: "Великая Помарка",
    blurb: "One old spot on the page has been growing for years.",
    difficulty: "boss",
    reward: "320 Weird",
    rewardWeird: 320,
    corruption: 0.44,
    trail: "M 8 34 Q 30 52 46 30 Q 62 8 78 34 Q 88 50 96 30",
    stops: [{ x: 8, y: 34 }, { x: 28, y: 44 }, { x: 46, y: 30 }, { x: 78, y: 34 }, { x: 96, y: 30 }],
    encounter: ["great-stain", "splatter", "blotling"],
  },
  {
    id: 6,
    chapter: "Глава 6",
    name: "Grey Fog Margin",
    nameRu: "Серый туман",
    blurb: "The colours are draining out toward the margin.",
    difficulty: "hard",
    reward: "400 Weird",
    rewardWeird: 400,
    corruption: 0.55,
    trail: "M 4 50 Q 18 28 32 46 Q 46 62 58 40 Q 72 16 84 40 Q 92 54 98 42",
    stops: [{ x: 4, y: 50 }, { x: 18, y: 34 }, { x: 32, y: 46 }, { x: 58, y: 40 }, { x: 98, y: 42 }],
    encounter: ["gray", "dot", "dot", "outline"],
  },
  {
    id: 7,
    chapter: "Глава 7",
    name: "Scribble Giant",
    nameRu: "Каляка-Великан",
    blurb: "Every loose pencil loop on the page rolled into one tall thing.",
    difficulty: "boss",
    reward: "480 Weird",
    rewardWeird: 480,
    corruption: 0.66,
    trail: "M 6 26 L 20 50 L 34 24 Q 52 44 64 24 Q 80 44 96 26",
    stops: [{ x: 6, y: 26 }, { x: 20, y: 50 }, { x: 34, y: 24 }, { x: 64, y: 24 }, { x: 96, y: 26 }],
    encounter: ["scribble-giant", "scribble", "hatch"],
  },
  {
    id: 8,
    chapter: "Глава 8",
    name: "Torn Page Cliffs",
    nameRu: "Рваные утёсы",
    blurb: "The paper is ripped here. Something crosses out whatever crosses it.",
    difficulty: "hard",
    reward: "580 Weird",
    rewardWeird: 580,
    corruption: 0.76,
    trail: "M 8 46 Q 22 18 38 40 L 52 18 Q 68 44 80 22 Q 90 40 96 24",
    stops: [{ x: 8, y: 46 }, { x: 22, y: 26 }, { x: 38, y: 40 }, { x: 80, y: 22 }, { x: 96, y: 24 }],
    encounter: ["cross-out", "cross-out", "stain", "outline"],
  },
  {
    id: 9,
    chapter: "Глава 9",
    name: "Chief Eraser",
    nameRu: "Главная Стирашка",
    blurb: "A cracked giant eraser is rubbing the whole chapter away.",
    difficulty: "boss",
    reward: "700 Weird",
    rewardWeird: 700,
    corruption: 0.87,
    trail: "M 5 30 Q 24 54 40 30 Q 56 6 72 32 Q 84 52 96 34",
    stops: [{ x: 5, y: 30 }, { x: 22, y: 46 }, { x: 40, y: 30 }, { x: 72, y: 32 }, { x: 96, y: 34 }],
    encounter: ["chief-eraser", "eraser-enemy", "eraser-enemy", "dot"],
  },
  {
    id: 10,
    chapter: "Глава 10",
    name: "Klaksa, the Blot",
    nameRu: "Клякса",
    blurb: "The last page is almost black. One glowing eye is waiting in the puddle.",
    difficulty: "boss",
    reward: "900 Weird",
    rewardWeird: 900,
    corruption: 1,
    trail: "M 6 44 Q 18 16 32 40 Q 44 60 56 34 Q 70 10 82 38 Q 90 56 98 40",
    stops: [{ x: 6, y: 44 }, { x: 19, y: 28 }, { x: 32, y: 40 }, { x: 56, y: 34 }, { x: 98, y: 40 }],
    encounter: ["klaksa", "blot-mother", "splatter", "blotling"],
  },
];

/* ---------------- Season ---------------- */

export type LeaderRow = {
  rank: number;
  player: string;
  points: number;
  wins: number;
  tier: "gold" | "silver" | "bronze" | "paper";
};

export const LEADERBOARD: LeaderRow[] = [
  { rank: 1, player: "inkwitch.kepl", points: 4820, wins: 132, tier: "gold" },
  { rank: 2, player: "crayon_king", points: 4610, wins: 128, tier: "gold" },
  { rank: 3, player: "papercut", points: 4402, wins: 121, tier: "gold" },
  { rank: 4, player: "doodle.doom", points: 3990, wins: 110, tier: "silver" },
  { rank: 5, player: "mrs_smudge", points: 3841, wins: 104, tier: "silver" },
  { rank: 6, player: "glitterfang", points: 3620, wins: 98, tier: "silver" },
  { rank: 7, player: "you.kepl", points: 3410, wins: 91, tier: "bronze" },
  { rank: 8, player: "tinytiger", points: 3180, wins: 84, tier: "bronze" },
  { rank: 9, player: "wax.melter", points: 2905, wins: 77, tier: "bronze" },
  { rank: 10, player: "notebook9", points: 2740, wins: 70, tier: "paper" },
];

export const TIER_PRIZES = [
  { tier: "Gold Crayon", range: "Top 1–3", prize: "50 000 Weird, paid at the end of the quarter", color: "sunshine" as const },
  { tier: "Silver Pencil", range: "Top 4–20", prize: "20 000 Weird, paid at the end of the quarter", color: "sky" as const },
  { tier: "Bronze Stub", range: "Top 21–100", prize: "8 000 Weird, paid at the end of the quarter", color: "coral" as const },
  { tier: "Paper Club", range: "Everyone else", prize: "1 500 Weird, paid at the end of the quarter", color: "mint" as const },
];
