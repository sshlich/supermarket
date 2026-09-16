export const FORMAT_VERSION = 1 as const;
export const TIERS = ['bronze', 'silver', 'gold', 'diamond', 'legendary'] as const;
export type Tier = (typeof TIERS)[number];
export type Location = 'board' | 'stash' | 'skills';
export type Scope = 'permanent' | 'run' | 'day' | 'combat' | 'timed' | 'activation';
export type ModifierOp = 'add' | 'percent' | 'multiply' | 'set' | 'min' | 'max';
export type Numbers = Record<string, number>;
export type Payload = Record<string, number | string | boolean>;
export interface Modifier {
  id: string;
  sourceId: string;
  attribute: string;
  op: ModifierOp;
  value: number;
  scope: Scope;
  expires?: number;
  castId?: number;
}
export type Expr =
  | number
  | { ref: 'source' | 'target' | 'owner' | 'enemy' | 'event' | 'counter' | 'tier'; key: string }
  | { count: Selector; distinctTypes?: boolean }
  | { op: 'add' | 'sub' | 'mul' | 'div' | 'min' | 'max'; args: Expr[] };
export interface Predicate {
  field:
    | 'type'
    | 'capability'
    | 'reference'
    | 'size'
    | 'cooldown'
    | 'ammo'
    | 'status'
    | 'attribute'
    | 'relativeSize';
  key?: string;
  value?: string | number | boolean;
  compare?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  not?: boolean;
}
export interface Selector {
  side:
    | 'self'
    | 'owner'
    | 'enemy'
    | 'allyItems'
    | 'enemyItems'
    | 'allItems'
    | 'eventSource'
    | 'eventTargets'
    | 'previous';
  location?: Location[];
  spatial?: 'left' | 'right' | 'adjacent' | 'leftmost' | 'rightmost';
  other?: boolean;
  filters?: Predicate[];
  order?: 'position' | 'random' | 'highest' | 'lowest';
  attribute?: string;
  count?: number;
  preferUnstatus?: string;
  excludeProtected?: string;
}
export interface Condition {
  left: Expr;
  op: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  right: Expr;
}
export interface Trigger {
  event: string;
  relation?: 'any' | 'self' | 'other' | 'owner' | 'enemy';
  source?: Predicate[];
  every?: number;
  first?: number;
  scope?: 'combat' | 'day' | 'run';
  oncePer?: 'parent' | 'batch';
}
export type ActionKind =
  | 'damage'
  | 'shield'
  | 'heal'
  | 'status'
  | 'cleanse'
  | 'charge'
  | 'reload'
  | 'modify'
  | 'forceUse'
  | 'destroy'
  | 'repair'
  | 'transform'
  | 'publish'
  | 'flying'
  | 'resource'
  | 'type'
  | 'meter'
  | 'slot'
  | 'enchant'
  | 'upgrade'
  | 'generate';
export interface Action {
  kind: ActionKind;
  target: Selector;
  amount?: Expr | 'full';
  attribute?: string;
  op?: ModifierOp;
  scope?: Scope;
  duration?: number;
  status?: string;
  statuses?: string[];
  mode?: 'flat' | 'percent' | 'all';
  cleanses?: boolean;
  bypassShield?: boolean;
  pool?: string;
  event?: string;
  value?: string | boolean;
  critEligible?: boolean;
}
export interface Ability {
  id: string;
  trigger: Trigger;
  locations: Location[];
  conditions?: Condition[];
  priority?: number;
  internalCooldown?: number;
  actions: Action[];
  quest?: { required: number; scope: 'combat' | 'day' | 'run'; repeatable?: boolean; overflow?: boolean };
}
export interface Aura {
  id: string;
  locations: Location[];
  target: Selector;
  attribute: string;
  op: ModifierOp;
  value: number;
  conditions?: Condition[];
}
export interface Enchantment {
  attributes?: Numbers;
  abilities?: Ability[];
  auras?: Aura[];
  capabilities?: string[];
  protections?: string[];
}
export interface Definition {
  id: string;
  name: string;
  text: string;
  pool: string;
  kind: 'item' | 'skill';
  size: 1 | 2 | 3;
  startingTier: Tier;
  types: string[];
  capabilities: string[];
  references: string[];
  tiers: Partial<Record<Tier, Numbers>>;
  abilities: Ability[];
  auras?: Aura[];
  enchantments: Record<string, Enchantment>;
  shop: { enabled: boolean; weight: number; minDay: number };
}
export interface AbilityMemory {
  seen: number;
  fired: number;
  last: number;
  keys: string[];
  progress: number;
  completed: boolean;
}
export interface Instance {
  id: string;
  defId: string;
  tier: Tier;
  enchantment: string | null;
  location: Location;
  position: number;
  acquired: number;
  modifiers: Modifier[];
  addedTypes: string[];
  counters: Numbers;
  memory: Record<string, AbilityMemory>;
  provenance: string;
}
export interface Snapshot {
  version: 1;
  contentVersion: string;
  id: string;
  name: string;
  day: number;
  level: number;
  maxHealth: number;
  regen: number;
  capacity: number;
  items: Instance[];
  skills: Instance[];
  counters: Numbers;
  difficulty: number;
}
export interface Fighter {
  id: string;
  name: string;
  baseMaxHealth: number;
  maxHealth: number;
  health: number;
  shield: number;
  burn: number;
  poison: number;
  regen: number;
  meters: Numbers;
  counters: Numbers;
  capacity: number;
  slots: Record<string, string>;
  modifiers: Modifier[];
}
export interface Entity extends Instance {
  owner: string;
  progress: number;
  ammo: number | null;
  destroyed: boolean;
  flying: boolean;
  statuses: Numbers;
  runtime: Modifier[];
  generation: number;
}
export interface Task {
  seq: number;
  time: number;
  phase: number;
  priority: number;
  owner: number;
  position: number;
  sourceId: string;
  kind: 'signal' | 'ability' | 'questReward' | 'cast' | 'tick' | 'death';
  parent: number | null;
  batch: number | null;
  depth: number;
  event?: SimEvent;
  ability?: Ability;
  cast?: number;
  totalCasts?: number;
  forced?: boolean;
  generation?: number;
  tick?: string;
}
export interface SimEvent {
  id: number;
  time: number;
  kind: string;
  sourceId: string;
  ownerId: string;
  targets: string[];
  parent: number | null;
  batch: number | null;
  depth: number;
  payload: Payload;
  hash: string;
}
export interface CombatState {
  version: 1;
  contentVersion: string;
  seed: string;
  time: number;
  players: Fighter[];
  entities: Entity[];
  rng: Numbers;
  queue: Task[];
  nextSeq: number;
  nextEvent: number;
  outcome: 'ongoing' | 'p0' | 'p1' | 'draw' | 'error';
  error: string | null;
  stormStart: number;
  processed: number;
  persistent: { owner: string; targetId: string; action: Action; amount: number }[];
}
export interface CombatFrame {
  time: number;
  players: Fighter[];
  entities: Entity[];
  outcome: CombatState['outcome'];
}
export interface Replay {
  version: 1;
  contentVersion: string;
  seed: string;
  initial: [Snapshot, Snapshot];
  commands: Command[];
  events: SimEvent[];
  finalHash: string;
  digest: string;
  final: CombatState;
}
export interface CombatResult {
  replay: Replay;
  frames: CombatFrame[];
}
export interface Reward {
  id: string;
  label: string;
  text: string;
  gold?: number;
  xp?: number;
  health?: number;
  income?: number;
  item?: string;
  skill?: string;
  tier?: Tier;
  enchantment?: string;
  target?: 'upgrade' | 'enchant' | 'transform';
}
export interface Encounter {
  id: string;
  name: string;
  text: string;
  category: 'shop' | 'event' | 'free';
  weight: number;
  minDay: number;
  maxDay: number;
  hours: number[];
  exclusion: string;
  prerequisites?: Condition[];
  pool?: string;
  offerCount?: number;
  rerollCost?: number;
  discount?: { type: string; amount: number };
  sellBonus?: number;
  rewards: Reward[];
}
export interface Opponent {
  snapshot: Snapshot;
  minDay: number;
  maxDay: number;
  category: 'monster' | 'rival';
  rewards: Reward[];
  drops: string[];
}
export interface Rules {
  minCooldown: number;
  multicastInterval: number;
  healCleansePercent: number;
  stormStart: number;
  stormInterval: number;
  stormBase: number;
  stormStep: number;
  stormCap: number;
  stormMitigation: 'bypass' | 'shield';
  timeout: number;
  timeoutPolicy: 'draw' | 'highestHealth';
  maxDepth: number;
  maxEvents: number;
  maxEventsPerTime: number;
  wins: number;
  prestige: number;
  xpPerLevel: number;
  hourXp: number;
  startingGold: number;
  startingIncome: number;
  startingHealth: number;
  healthPerLevel: number;
  startingCapacity: number;
  stashCapacity: number;
  lastChancePrestige: number;
  prestigeLossBase: number;
  prestigeLossCap: number;
  shopSilverDay: number;
  shopSilverThreshold: number;
  shopGoldDay: number;
  shopGoldThreshold: number;
  shopEnchantChance: number;
  shopEnchantPremium: number;
  dropCash: number;
  fallbackCash: number;
}
export interface Content {
  version: 1;
  contentVersion: string;
  rules: Rules;
  definitions: Definition[];
  pools: Record<string, string[]>;
  encounters: Encounter[];
  opponents: Opponent[];
  starts: Reward[];
  levels: Record<string, Reward[]>;
  lastChance: Reward[];
}
export interface Offer {
  id: string;
  defId: string;
  tier: Tier;
  enchantment: string | null;
  price: number;
  sold: boolean;
}
export interface Choice {
  reason: string;
  rewards: Reward[];
}
export interface Run {
  version: 1;
  contentVersion: string;
  seed: string;
  revision: number;
  rng: Numbers;
  day: number;
  hour: number;
  wins: number;
  prestige: number;
  lastChanceUsed: boolean;
  gold: number;
  income: number;
  xp: number;
  level: number;
  maxHealth: number;
  regen: number;
  capacity: number;
  items: Instance[];
  skills: Instance[];
  nextId: number;
  counters: Numbers;
  history: string[];
  dayHistory: string[];
  phase: 'start' | 'encounter' | 'shop' | 'choice' | 'combat' | 'result' | 'victory' | 'defeat';
  candidates: string[];
  selected: string | null;
  offers: Offer[];
  pending: Choice[];
  afterChoices: 'advance' | 'encounter' | 'terminal' | 'completeHour' | 'shop';
  activeOpponent: string | null;
  battle: { outcome: CombatState['outcome']; finalHash: string; seed: string } | null;
  log: SimEvent[];
  commands: Command[];
  nextEvent: number;
}
export type Command = { version: 1; revision: number } & (
  | { type: 'start'; choice: string }
  | { type: 'select'; id: string }
  | { type: 'buy'; offer: string }
  | { type: 'sell'; item: string }
  | { type: 'move'; item: string; location: 'board' | 'stash'; position: number }
  | { type: 'reroll' | 'leave' | 'fight' | 'continue' }
  | { type: 'choose'; choice: string; target?: string }
);
export interface Transition {
  state: Run;
  events: SimEvent[];
  hash: string;
  combat?: CombatResult;
}
