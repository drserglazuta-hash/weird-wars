import {
  type EnemyAI,
  type SpecialId,
  COLLECTION,
  enemyDef,
  hpFromStrength,
  multiverseDef,
  scaleStats,
  shadowAura,
  shadowCard,
  statAtLevel,
} from "@/lib/game-data";
import type { GameState } from "@/lib/game-store";
import { levelOf } from "@/lib/game-store";

export const COLS = 8;
export const ROWS = 5;

export type Side = "friend" | "blot";

export type BattleUnit = {
  key: string;
  cardId: string;
  side: Side;
  name: string;
  art?: string;
  hp: number;
  maxHp: number;
  shield: number;
  atk: number;
  spd: number;
  mag: number;
  aura: number;
  crt: number;
  lck: number;
  def: number;
  range: number;
  x: number;
  y: number;
  w: number;
  h: number;
  ai?: EnemyAI;
  special?: SpecialId;
  specialName?: string;
  specialText?: string;
  abilityUsed: boolean;
  /** rounds of crowd control left */
  rooted: number;
  /** dodge chance % until next own turn */
  evade: number;
  /** temporary DEF */
  defBonus: number;
  /** rounds this unit forces enemies to target it */
  taunt: number;
  bossCharge: number;
};

/* ---------------- geometry ---------------- */

export function cellsOf(u: { x: number; y: number; w: number; h: number }) {
  const out: { x: number; y: number }[] = [];
  for (let dx = 0; dx < u.w; dx++) for (let dy = 0; dy < u.h; dy++) out.push({ x: u.x + dx, y: u.y + dy });
  return out;
}

export function covers(u: { x: number; y: number; w: number; h: number }, x: number, y: number) {
  return x >= u.x && x < u.x + u.w && y >= u.y && y < u.y + u.h;
}

export function gapBetween(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  const dx = Math.max(a.x - (b.x + b.w - 1), b.x - (a.x + a.w - 1), 0);
  const dy = Math.max(a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1), 0);
  return Math.max(dx, dy);
}

export function living(units: BattleUnit[]) {
  return units.filter((u) => u.hp > 0);
}

export function unitAt(units: BattleUnit[], x: number, y: number) {
  return living(units).find((u) => covers(u, x, y)) ?? null;
}

export function canStand(units: BattleUnit[], self: BattleUnit, x: number, y: number) {
  if (x < 0 || y < 0 || x + self.w > COLS || y + self.h > ROWS) return false;
  return !living(units).some(
    (o) => o.key !== self.key && cellsOf({ x, y, w: self.w, h: self.h }).some((c) => covers(o, c.x, c.y)),
  );
}

/** How far a unit may walk in one turn — scales with SPD. */
export function moveRangeFor(spd: number) {
  return Math.max(1, Math.floor(spd / 4));
}

/* ---------------- derived combat values ---------------- */

/** AURA passively buffs adjacent allies. */
export function auraSupport(unit: BattleUnit, units: BattleUnit[]) {
  return living(units)
    .filter((o) => o.key !== unit.key && o.side === unit.side && gapBetween(unit, o) <= 1)
    .reduce((sum, o) => sum + o.aura, 0);
}

export function effectiveAtk(unit: BattleUnit, units: BattleUnit[]) {
  return unit.atk * (1 + auraSupport(unit, units) / 100);
}

export function effectiveDef(unit: BattleUnit, units: BattleUnit[]) {
  return unit.def + unit.defBonus + Math.round(auraSupport(unit, units) / 2);
}

/** Basic damage = ATK × 100 / (100 + DEF), CRT% chance of ×1.5. */
export function rollBasic(attacker: BattleUnit, target: BattleUnit, units: BattleUnit[]) {
  const raw = (effectiveAtk(attacker, units) * 100) / (100 + effectiveDef(target, units));
  const crit = Math.random() * 100 < attacker.crt;
  return { dmg: Math.max(1, Math.round(raw * (crit ? 1.5 : 1))), crit };
}

export function dealDamage(units: BattleUnit[], key: string, dmg: number): BattleUnit[] {
  return units.map((u) => {
    if (u.key !== key || u.hp <= 0) return u;
    const absorbed = Math.min(u.shield, dmg);
    const through = dmg - absorbed;
    return { ...u, shield: u.shield - absorbed, hp: Math.max(0, u.hp - through) };
  });
}

export function healUnit(units: BattleUnit[], key: string, amount: number): BattleUnit[] {
  return units.map((u) => (u.key === key && u.hp > 0 ? { ...u, hp: Math.min(u.maxHp, u.hp + amount) } : u));
}

function dodged(target: BattleUnit) {
  return target.evade > 0 && Math.random() * 100 < target.evade;
}

/* ---------------- building the battlefield ---------------- */

export function buildFriends(state: GameState): BattleUnit[] {
  const shadow = shadowCard(state.commander);
  const aura = shadowAura(shadow, state.shadowLevel);
  const mvDef = multiverseDef(state.multiverse);

  const picked = state.squad
    .filter((id): id is string => Boolean(id) && !state.downed.includes(id as string))
    .map((id) => COLLECTION.find((c) => c.id === id))
    .filter((c): c is (typeof COLLECTION)[number] => Boolean(c));

  return picked.slice(0, 7).map((card, i) => {
    const lvl = levelOf(state, card.id);
    const base = scaleStats(card.stats, lvl);
    const atk = Math.round(base.atk * (1 + aura.pct.atk));
    const stats = {
      atk,
      spd: Math.round(base.spd * (1 + aura.pct.spd)),
      mag: Math.round(base.mag * (1 + aura.pct.mag)),
      aura: Math.round(base.aura * (1 + aura.pct.aura)),
      crt: Math.round(base.crt * (1 + aura.pct.crt)),
      lck: Math.round(base.lck * (1 + aura.pct.lck)),
    };
    const maxHp = hpFromStrength(atk);
    return {
      key: `f-${card.id}`,
      cardId: card.id,
      side: "friend" as const,
      name: card.name,
      art: card.art,
      hp: maxHp,
      maxHp,
      shield: 0,
      ...stats,
      def: mvDef + aura.def,
      range: 1,
      x: i < 4 ? 0 : 1,
      y: [1, 2, 3, 0, 1, 2, 3][i] ?? 2,
      w: 1,
      h: 1,
      special: card.special.id,
      specialName: card.special.name,
      specialText: card.special.text,
      abilityUsed: false,
      rooted: 0,
      evade: 0,
      defBonus: 0,
      taunt: 0,
      bossCharge: 0,
    };
  });
}

export function buildEnemies(roster: string[], scale = 1): BattleUnit[] {
  const taken: { x: number; y: number }[] = [];
  const free = (x: number, y: number, w: number, h: number) => {
    if (x < 4 || x + w > COLS || y < 0 || y + h > ROWS) return false;
    for (let dx = 0; dx < w; dx++)
      for (let dy = 0; dy < h; dy++) if (taken.some((t) => t.x === x + dx && t.y === y + dy)) return false;
    return true;
  };

  const foes: BattleUnit[] = [];
  roster.forEach((id, i) => {
    const e = enemyDef(id);
    let spot: { x: number; y: number } | null = null;
    for (let x = COLS - e.w; x >= 4 && !spot; x--)
      for (let y = 0; y <= ROWS - e.h && !spot; y++) if (free(x, y, e.w, e.h)) spot = { x, y };
    if (!spot) return;
    for (let dx = 0; dx < e.w; dx++) for (let dy = 0; dy < e.h; dy++) taken.push({ x: spot.x + dx, y: spot.y + dy });
    const hp = Math.round(e.health * scale);
    foes.push({
      key: `b-${e.id}-${i}`,
      cardId: e.id,
      side: "blot",
      name: e.name,
      hp,
      maxHp: hp,
      shield: 0,
      atk: Math.round(e.attack * scale),
      spd: e.speed,
      mag: 0,
      aura: 0,
      crt: 5,
      lck: 0,
      def: e.def,
      range: e.range,
      x: spot.x,
      y: spot.y,
      w: e.w,
      h: e.h,
      ai: e.ai,
      abilityUsed: false,
      rooted: 0,
      evade: 0,
      defBonus: 0,
      taunt: 0,
      bossCharge: 0,
    });
  });
  return foes;
}

/* ---------------- turn order ---------------- */

/** Every round: all living units, SPD descending, ties favour friends. */
export function buildQueue(units: BattleUnit[]) {
  return living(units)
    .slice()
    .sort((a, b) => b.spd - a.spd || (a.side === b.side ? 0 : a.side === "friend" ? -1 : 1))
    .map((u) => u.key);
}

export function outcomeOf(units: BattleUnit[]): "win" | "lose" | null {
  const friends = units.some((u) => u.side === "friend" && u.hp > 0);
  const blots = units.some((u) => u.side === "blot" && u.hp > 0);
  if (!blots) return "win";
  if (!friends) return "lose";
  return null;
}

/* ---------------- friend actions ---------------- */

export type ActionResult = { units: BattleUnit[]; log: string[] };

export function friendAttack(units: BattleUnit[], attackerKey: string, targetKey: string): ActionResult {
  const a = units.find((u) => u.key === attackerKey);
  const t = units.find((u) => u.key === targetKey);
  if (!a || !t) return { units, log: [] };
  if (dodged(t)) return { units, log: [`${t.name} slips out of the way.`] };
  const { dmg, crit } = rollBasic(a, t, units);
  return {
    units: dealDamage(units, t.key, dmg),
    log: [`${a.name} hits ${t.name} for ${dmg}${crit ? " — critical!" : ""}.`],
  };
}

const nearestEnemies = (u: BattleUnit, units: BattleUnit[]) =>
  living(units)
    .filter((o) => o.side !== u.side)
    .sort((a, b) => gapBetween(u, a) - gapBetween(u, b));

/** Each friend's NFT special trait, as a real ability. MAG scales the power. */
export function useSpecial(units: BattleUnit[], key: string): ActionResult {
  const self = units.find((u) => u.key === key);
  if (!self || !self.special) return { units, log: [] };
  let next = units.map((u) => (u.key === key ? { ...u, abilityUsed: true } : u));
  const log: string[] = [];
  const mag = self.mag;

  switch (self.special) {
    case "gas-flame": {
      const dmg = Math.round(mag * 1.5);
      living(next)
        .filter((o) => o.side === "blot" && gapBetween(self, o) <= 1)
        .forEach((o) => {
          next = dealDamage(next, o.key, dmg);
          log.push(`Gas Flame scorches ${o.name} for ${dmg}.`);
        });
      if (log.length === 0) log.push("Gas Flame flickers — nothing close enough.");
      break;
    }
    case "chameleon": {
      next = next.map((u) => (u.key === key ? { ...u, evade: 60 } : u));
      log.push(`${self.name} fades into the paper (60% dodge).`);
      break;
    }
    case "healing-sap": {
      const heal = Math.round(8 + mag * 1.2);
      living(next)
        .filter((o) => o.side === "friend")
        .forEach((o) => {
          next = healUnit(next, o.key, heal);
        });
      log.push(`Healing Sap restores ${heal} HP to every friend.`);
      break;
    }
    case "titanium-skin": {
      next = next.map((u) => (u.key === key ? { ...u, defBonus: u.defBonus + 20, taunt: 1 } : u));
      log.push(`${self.name} hardens: +20 DEF and every Blot turns its way.`);
      break;
    }
    case "rubber-wall": {
      const shield = Math.round(6 + mag);
      living(next)
        .filter((o) => o.side === "friend" && (o.key === key || gapBetween(self, o) <= 1))
        .forEach((o) => {
          next = next.map((u) => (u.key === o.key ? { ...u, shield: u.shield + shield } : u));
        });
      log.push(`Rubber Wall shields nearby friends for ${shield}.`);
      break;
    }
    case "static-spark": {
      const dmg = Math.round(mag * 0.8);
      nearestEnemies(self, next)
        .slice(0, 3)
        .forEach((o) => {
          next = dealDamage(next, o.key, dmg);
          log.push(`Static Spark arcs into ${o.name} for ${dmg}.`);
        });
      break;
    }
    case "magnet-pull": {
      const target = nearestEnemies(self, next)[0];
      if (!target) break;
      const spot = [
        { x: self.x + 1, y: self.y },
        { x: self.x - 1, y: self.y },
        { x: self.x, y: self.y + 1 },
        { x: self.x, y: self.y - 1 },
      ].find((p) => canStand(next, target, p.x, p.y));
      if (spot) next = next.map((u) => (u.key === target.key ? { ...u, x: spot.x, y: spot.y } : u));
      const dmg = Math.round(mag);
      next = dealDamage(next, target.key, dmg);
      log.push(`Magnet Pull drags ${target.name} in for ${dmg}.`);
      break;
    }
    case "sticky-trap": {
      living(next)
        .filter((o) => o.side === "blot" && gapBetween(self, o) <= 1)
        .forEach((o) => {
          next = next.map((u) => (u.key === o.key ? { ...u, rooted: 1 } : u));
          log.push(`${o.name} is stuck fast.`);
        });
      if (log.length === 0) log.push("Sticky Trap sets, but nothing is adjacent.");
      break;
    }
    case "storm-line": {
      const dmg = Math.round(mag * 1.1);
      living(next)
        .filter((o) => o.side === "blot" && o.y <= self.y && self.y < o.y + o.h)
        .forEach((o) => {
          next = dealDamage(next, o.key, dmg);
          log.push(`Storm Line zaps ${o.name} for ${dmg}.`);
        });
      if (log.length === 0) log.push("Storm Line crackles down an empty row.");
      break;
    }
  }
  return { units: next, log };
}

/* ---------------- enemy AI ---------------- */

function stepToward(units: BattleUnit[], self: BattleUnit, target: BattleUnit, steps: number) {
  let cur = self;
  for (let i = 0; i < steps; i++) {
    if (gapBetween(cur, target) <= cur.range) break;
    const options = [
      { x: cur.x + Math.sign(target.x - cur.x), y: cur.y },
      { x: cur.x, y: cur.y + Math.sign(target.y - cur.y) },
    ].filter((p) => (p.x !== cur.x || p.y !== cur.y) && canStand(units, cur, p.x, p.y));
    if (!options.length) break;
    const best = options.reduce((b, p) =>
      gapBetween({ ...cur, ...p }, target) < gapBetween({ ...cur, ...b }, target) ? p : b,
    );
    cur = { ...cur, ...best };
    units = units.map((u) => (u.key === cur.key ? cur : u));
  }
  return { units, self: cur };
}

function stepAway(units: BattleUnit[], self: BattleUnit, target: BattleUnit) {
  const options = [
    { x: self.x - Math.sign(target.x - self.x), y: self.y },
    { x: self.x, y: self.y - Math.sign(target.y - self.y) },
  ].filter((p) => (p.x !== self.x || p.y !== self.y) && canStand(units, self, p.x, p.y));
  if (!options.length) return { units, self };
  const best = options.reduce((b, p) =>
    gapBetween({ ...self, ...p }, target) > gapBetween({ ...self, ...b }, target) ? p : b,
  );
  const moved = { ...self, ...best };
  return { units: units.map((u) => (u.key === self.key ? moved : u)), self: moved };
}

function pickTarget(self: BattleUnit, units: BattleUnit[]) {
  const friends = living(units).filter((u) => u.side === "friend");
  if (!friends.length) return null;
  const taunting = friends.filter((f) => f.taunt > 0);
  const pool = taunting.length ? taunting : friends;
  return pool.reduce((best, f) => (gapBetween(self, f) < gapBetween(self, best) ? f : best), pool[0]!);
}

function strike(units: BattleUnit[], self: BattleUnit, target: BattleUnit, mult = 1): ActionResult {
  if (dodged(target)) return { units, log: [`${self.name} swipes at ${target.name} and misses.`] };
  const { dmg, crit } = rollBasic(self, target, units);
  const total = Math.max(1, Math.round(dmg * mult));
  return {
    units: dealDamage(units, target.key, total),
    log: [`${self.name} hits ${target.name} for ${total}${crit ? " — critical!" : ""}.`],
  };
}

/** One enemy turn, driven by its behaviour field. */
export function enemyTurn(units: BattleUnit[], key: string): ActionResult {
  let self = units.find((u) => u.key === key);
  if (!self || self.hp <= 0) return { units, log: [] };
  const log: string[] = [];
  let next = units;

  if (self.rooted > 0) {
    next = next.map((u) => (u.key === key ? { ...u, rooted: u.rooted - 1 } : u));
    return { units: next, log: [`${self.name} is stuck and cannot move.`] };
  }

  const behaviour: EnemyAI = self.ai ?? "swarm";
  const speed = moveRangeFor(self.spd);

  if (behaviour === "boss") {
    const charge = self.bossCharge + 1;
    next = next.map((u) => (u.key === key ? { ...u, bossCharge: charge } : u));
    self = next.find((u) => u.key === key)!;
    if (charge % 2 === 0) {
      const hitList = living(next).filter((o) => o.side === "friend" && gapBetween(self!, o) <= self!.range);
      if (hitList.length) {
        hitList.forEach((o) => {
          const r = strike(next, self!, o, 0.7);
          next = r.units;
        });
        log.push(`${self.name} unleashes a sweeping blow on ${hitList.length} friend(s).`);
        return { units: next, log };
      }
    }
  }

  const target = pickTarget(self, next);
  if (!target) return { units: next, log };

  const steps = behaviour === "rusher" ? speed * 2 : speed;

  if (behaviour === "ranged") {
    if (gapBetween(self, target) < self.range) {
      const away = stepAway(next, self, target);
      next = away.units;
      self = away.self;
    } else if (gapBetween(self, target) > self.range) {
      const moved = stepToward(next, self, target, speed);
      next = moved.units;
      self = moved.self;
    }
  } else {
    const moved = stepToward(next, self, target, steps);
    next = moved.units;
    self = moved.self;
  }

  const live = next.find((u) => u.key === target.key)!;
  if (gapBetween(self, live) <= self.range) {
    const r = strike(next, self, live, 1);
    next = r.units;
    log.push(...r.log);
    if (behaviour === "drainer") {
      const before = live.hp;
      const after = next.find((u) => u.key === live.key)!.hp;
      const drained = Math.round((before - after) * 0.5);
      if (drained > 0) {
        next = healUnit(next, self.key, drained);
        log.push(`${self.name} drains ${drained} HP back.`);
      }
    }
  } else {
    log.push(`${self.name} creeps closer.`);
  }

  return { units: next, log };
}

/* ---------------- start of a unit's turn ---------------- */

export function beginTurn(units: BattleUnit[], key: string): BattleUnit[] {
  return units.map((u) => (u.key === key ? { ...u, evade: 0, abilityUsed: false } : u));
}

export function endOfRound(units: BattleUnit[]): BattleUnit[] {
  return units.map((u) => ({
    ...u,
    taunt: Math.max(0, u.taunt - 1),
    defBonus: u.taunt > 0 ? u.defBonus : 0,
  }));
}

/* ---------------- rewards ---------------- */

/** LCK never touches combat — it only decides the post-battle drop. */
export function dropChance(units: BattleUnit[]) {
  const luck = living(units)
    .filter((u) => u.side === "friend")
    .reduce((sum, u) => sum + u.lck, 0);
  return Math.min(90, Math.round(luck));
}

export { statAtLevel };
