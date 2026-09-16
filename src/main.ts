import './style.css';
import { content } from '../packages/content';
import { clone, hash } from '../packages/sim/src/determinism';
import { definition } from '../packages/sim/src/geometry';
import { abilities, attribute, traits } from '../packages/sim/src/evaluate';
import { entityFrom, makeCombatState, simulate } from '../packages/sim/src/combat';
import {
  commandOptions,
  dispatch,
  importReplay,
  importSnapshot,
  loadRun,
  newRun,
  prestigeLoss,
  runContext,
  runSnapshot,
  saveRun,
  upgradeTarget,
} from '../packages/sim/src/run';
import { validateContent } from '../packages/sim/src/validation';
import type {
  CombatFrame,
  CombatResult,
  CombatState,
  Entity,
  Instance,
  Numbers,
  Reward,
  SimEvent,
  Snapshot,
  Transition,
} from '../packages/sim/src/model';
import { art, icon } from './art';
import { mountEffects } from './board';
import { installDragging } from './drag';
import { enchantmentLines } from './descriptions';
import {
  commitDrop,
  dragItem,
  offeredInstance,
  rewardFor,
  sellPrice,
  type Destination,
  type DragSource,
  type InputCommand,
} from './interactions';

validateContent(content);
const storageKey = 'night-market-save-v1';
let run = newRun(content, 'lantern-47'),
  battle: CombatResult | undefined,
  initialFrame: CombatFrame | undefined;
let practice = false,
  cursor = -1,
  playing = false,
  playTime = 0,
  speed = 1,
  lastFrame = 0;
let imported: Snapshot | undefined,
  filter = '',
  inspected: string | undefined,
  resumeAfterInspect = false;
let undo: InputCommand[] = [],
  toastTimer: ReturnType<typeof setTimeout> | undefined;
const app = document.querySelector<HTMLDivElement>('#app')!;
const $ = (id: string) => document.getElementById(id)!;
const esc = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const fmt = (key: string, value: number) =>
  key === 'cooldown'
    ? `${(value / 1000).toFixed(2).replace(/0$/, '')}s`
    : ['crit', 'lifesteal'].includes(key)
      ? `${value / 100}%`
      : String(value);
const statIcon: Record<string, string> = {
  damage: 'sword',
  shield: 'shield',
  heal: 'heart',
  regen: 'heart',
  burn: 'flame',
  poison: 'poison',
  cooldown: 'clock',
};
const canArrange = () => !battle && !['start', 'combat', 'victory', 'defeat'].includes(run.phase);
app.innerHTML = `
  <div class="market-backdrop" aria-hidden="true"></div>
  <header class="topbar"><div class="wordmark">${icon('moon')}<span>NIGHT<span class="wordmark-bottom">MARKET</span></span></div><div id="journey"></div><div class="top-resources"><div id="gold"></div><button class="icon-button" data-action="menu" aria-label="Open run menu">${icon('menu')}</button></div></header>
  <main class="game-space"><section id="stage" aria-live="polite"></section>
    <section id="worktable"><div class="player-line"><div class="player-emblem">${icon('moon')}</div><div id="player-vitals" data-entity="p0"></div><div id="skills"></div><div class="table-actions"><button id="undo" data-action="undo" title="Undo rearrangement · Ctrl+Z">${icon('undo')} Undo</button></div></div>
      <div class="board-caption"><span>Your board <small id="capacity"></small></span><span id="board-instruction">Drag to arrange <i>·</i> Right-click for details</span></div><div id="player-board" class="item-tray" data-drop-location="board"></div>
      <div id="storage-line"><div class="stash-wrap"><div class="stash-caption">${icon('bag')} STASH <span>Items here usually sit out combat</span></div><div id="stash" class="item-tray stash-tray" data-drop-location="stash"></div></div><div id="sell-zone" aria-label="Drop an owned item here to sell"><span class="sell-bowl">${icon('coin')}</span><strong>Sell an item</strong><small>Drag here · release to sell</small></div></div>
      <div id="playback" hidden><div class="playback-main"><button data-action="pause" class="primary" aria-label="Pause combat"></button><select id="speed" aria-label="Playback speed">${[0.5, 1, 2, 4, 8].map((v) => `<option value="${v}" ${v === 1 ? 'selected' : ''}>${v}×</option>`).join('')}</select><span id="combat-time">0.0s</span><input id="timeline" type="range" min="0" max="1000" step="1" value="0" aria-label="Combat timeline"><button data-action="finish-playback">Skip to result ${icon('arrow')}</button><button id="continue" data-action="continue" class="primary" hidden>Continue ${icon('arrow')}</button></div><div class="playback-secondary"><span><kbd>Space</kbd> pause / play</span><button data-action="step">Step event</button><button data-action="next-use">Next activation</button><button data-action="restart-replay">Replay</button><button data-action="inspector">${icon('eye')} Battle inspector</button></div></div>
    </section>
  </main><footer><span>Take your time. The market can wait.</span><span id="save-status">Local solo run</span></footer>
  <div id="phaser-effects" aria-hidden="true"></div><div id="notice" role="status" aria-live="polite" hidden></div><div id="drag-hint" class="drag-hint" role="status" hidden></div>
  <dialog id="item-dialog" aria-labelledby="detail-name"><button class="dialog-close icon-button" data-action="close-detail" aria-label="Close item details">${icon('close')}</button><div id="item-detail"></div></dialog>
  <dialog id="menu-dialog" aria-labelledby="menu-title"><button class="dialog-close icon-button" data-action="close-menu" aria-label="Close menu">${icon('close')}</button><span class="eyebrow">YOUR EVENING</span><h2 id="menu-title">A moment at the stall</h2><p>Every decision is saved on this device.</p><div class="menu-grid"><button data-action="save">Save now</button><button data-action="resume">Resume saved run</button><button data-action="export-save">Export save</button><button data-action="export-snapshot">Export build</button><button data-action="import">Import JSON</button><button data-action="new">New run</button></div><div class="control-guide"><b>Make yourself at home</b><p>Drag objects to move, buy, upgrade or sell. Right-click any object for its detailed view. Escape cancels a drag or closes a window. Ctrl+Z undoes rearrangements. Space pauses combat.</p></div><p class="muted">Original content · local deterministic simulation</p></dialog>
  <dialog id="new-dialog" aria-labelledby="new-title"><span class="eyebrow">ANOTHER EVENING</span><h2 id="new-title">Start a new run?</h2><p>This replaces the local autosave. Export your current run first if you want to keep it.</p><label>Run seed<input id="seed" value="lantern-47" maxlength="80"></label><div class="dialog-actions"><button data-action="cancel-new">Keep playing</button><button data-action="begin" class="primary">Begin evening</button></div></dialog>
  <aside id="inspector" hidden aria-label="Battle inspector"><div class="inspector-head"><span class="eyebrow">BATTLE INSPECTOR</span><button class="icon-button" data-action="inspector" aria-label="Close battle inspector">${icon('close')}</button></div><h2>Cause & effect</h2><label>Find an event<input id="event-filter" placeholder="damage, ammo, failed…"></label><div class="inspector-actions"><button data-action="export-replay">Export replay</button><button data-action="verify">Verify replay</button></div><div id="event-detail"></div><div id="event-list"></div></aside>
  <input type="file" id="import-file" accept=".json,application/json" hidden>`;
const effects = mountEffects();
function notify(message: string, error = false): void {
  if (!message) return;
  clearTimeout(toastTimer);
  $('notice').textContent = message;
  $('notice').className = error ? 'toast error' : 'toast';
  $('notice').hidden = false;
  toastTimer = setTimeout(
    () => {
      $('notice').hidden = true;
    },
    error ? 5500 : 2800,
  );
}
function autoSave(): boolean {
  try {
    localStorage.setItem(storageKey, saveRun(content, run));
    $('save-status').textContent = '✓ Saved on this device';
    return true;
  } catch {
    notify('Could not autosave. Export your save from the menu.', true);
    return false;
  }
}
function setupBattle(result: CombatResult, isPractice = false) {
  battle = result;
  practice = isPractice;
  cursor = -1;
  playTime = 0;
  playing = !isPractice;
  undo = [];
  const state = makeCombatState(content, result.replay.initial, result.replay.seed);
  initialFrame = { time: 0, players: state.players, entities: state.entities, outcome: 'ongoing' };
  ($('timeline') as HTMLInputElement).max = String(result.replay.final.time);
  effects.clear();
}
function accept(result: Transition, command?: InputCommand) {
  run = result.state;
  if (result.combat) setupBattle(result.combat);
  else if (command?.type === 'continue') {
    battle = undefined;
    playing = false;
    $('inspector').hidden = true;
    effects.clear();
  }
  autoSave();
  render();
}
function send(command: InputCommand): boolean {
  try {
    const result = dispatch(content, run, { version: 1, revision: run.revision, ...command });
    undo = [];
    accept(result, command);
    return true;
  } catch (error) {
    notify((error as Error).message, true);
    return false;
  }
}
function dropped(source: DragSource, destination: Destination) {
  try {
    const item = dragItem(content, run, source);
    const inverse: InputCommand | undefined =
      source.kind === 'owned' && destination.location !== 'sell' && item && item.location !== 'skills'
        ? { type: 'move', item: item.id, location: item.location, position: item.position }
        : undefined;
    if (inverse && destination.location === inverse.location && destination.position === inverse.position)
      return;
    const message =
      source.kind === 'owned'
        ? destination.location === 'sell'
          ? `Sold ${definition(content, item!.defId).name} for ${sellPrice(content, run, item!)} gold.`
          : ''
        : source.kind === 'offer'
          ? `Collected ${definition(content, item!.defId).name}.`
          : 'Reward applied.';
    const result = commitDrop(content, run, source, destination);
    if (inverse) undo.push(inverse);
    else undo = [];
    accept(result);
    notify(message);
  } catch (error) {
    notify((error as Error).message, true);
  }
}
const dragging = installDragging(app, {
  content,
  run: () => run,
  locked: () => !canArrange(),
  commit: dropped,
  notify,
});
function undoMove() {
  if (!canArrange() || !undo.length) return;
  const command = undo.at(-1)!;
  try {
    const result = dispatch(content, run, { version: 1, revision: run.revision, ...command });
    undo.pop();
    accept(result);
    notify('Rearrangement undone.');
  } catch (error) {
    undo = [];
    notify((error as Error).message, true);
    render();
  }
}
function frame(): CombatFrame | undefined {
  return battle ? (cursor < 0 ? initialFrame : battle.frames[cursor]) : undefined;
}
function context(): CombatState {
  const f = frame();
  return battle && f
    ? { ...battle.replay.final, time: f.time, players: f.players, entities: f.entities }
    : runContext(content, run);
}
const visibleAttributes = [
  'damage',
  'shield',
  'heal',
  'burn',
  'poison',
  'regen',
  'cooldown',
  'crit',
  'lifesteal',
  'ammo',
];
function values(item: Instance, state: CombatState): Numbers {
  const entity = state.entities.find((e) => e.id === item.id) ?? entityFrom(item, 'p0');
  return Object.fromEntries(
    visibleAttributes.map((key) => [key, attribute({ content, state, source: entity }, entity, key).value]),
  );
}
function itemCard(
  item: Instance,
  inspectKey: string,
  options: {
    source?: DragSource;
    state?: CombatState;
    small?: boolean;
    owned?: boolean;
    runtime?: Entity;
  } = {},
): string {
  const def = definition(content, item.defId),
    v = values(item, options.state ?? context());
  const outputs = ['damage', 'shield', 'burn', 'poison', 'heal', 'regen'].filter((k) => v[k] > 0).slice(0, 2);
  return `<div class="item-card tier-${item.tier} ${options.small ? 'mini-card' : ''} ${item.enchantment ? 'enchanted' : ''}" tabindex="0" role="img" aria-label="${esc(def.name)}, ${item.tier}, ${def.size} slots. Right-click for details." data-inspect="${esc(inspectKey)}" data-def="${item.defId}" ${options.owned ? `data-owned-id="${item.id}"` : ''} ${options.runtime ? `data-entity="${item.id}"` : ''} ${options.source ? `data-drag-kind="${options.source.kind}" data-drag-id="${options.source.id}"` : ''} style="--size:${def.size};grid-column:${item.position + 1}/span ${def.size}">
    <div class="item-numbers">${outputs.map((k) => `<span class="value-${k}" data-stat="${k}" title="${k}">${icon(statIcon[k])}<b>${v[k]}</b></span>`).join('')}</div>${art(item.defId)}<div class="item-caption"><strong>${esc(def.name)}</strong><span class="item-subtitle">${item.enchantment ? esc(item.enchantment) : def.types[0]} ${v.cooldown ? `<i>· ${fmt('cooldown', v.cooldown)}</i>` : ''}</span></div><div class="charge-track"><i></i></div><div class="runtime-badges"></div></div>`;
}
function tray(items: Instance[], capacity: number, state: CombatState, owner?: string): string {
  return `${Array.from({ length: 10 }, (_, i) => `<div class="board-slot ${i >= capacity ? 'locked' : ''}" data-slot="${i}" style="grid-column:${i + 1}"><span>${i >= capacity ? '◇' : i + 1}</span></div>`).join('')}${items.map((item) => itemCard(item, owner ? `combat:${item.id}` : `owned:${item.id}`, { state, ...(owner ? { runtime: item as Entity } : { source: canArrange() ? { kind: 'owned' as const, id: item.id } : undefined, owned: true }) })).join('')}`;
}
function renderHeader() {
  $('journey').innerHTML =
    `<div class="day-label">DAY <b>${run.day}</b><span> ${run.phase === 'start' ? 'The market opens' : ['First light', 'Open stalls', 'Monster crossing', 'Evening trade', 'Last call', 'Rival crossing'][run.hour]}</span></div><div class="hour-path">${Array.from({ length: 6 }, (_, i) => `<span class="hour ${i === run.hour ? 'current' : i < run.hour ? 'passed' : ''}" title="Hour ${i + 1}: ${i === 2 ? 'monster' : i === 5 ? 'rival' : 'market'}">${icon(i === 2 ? 'sword' : i === 5 ? 'trophy' : 'star')}</span>`).join('')}</div>`;
  $('gold').innerHTML =
    `<div class="coin-count">${icon('coin')}<b>${run.gold}</b></div><small>+${run.income} each day</small>`;
}
function vitals(player?: CombatFrame['players'][number]): string {
  const current = Math.max(0, player?.health ?? run.maxHealth),
    max = player?.maxHealth ?? run.maxHealth;
  return `<div class="vital-heading"><strong>${player?.id === 'p1' ? esc(player.name) : 'Your caravan'}</strong><span>${icon('heart')} <b>${current}</b> / ${max}</span>${player?.id === 'p1' ? '' : `<span class="level-badge">Lv ${run.level}<small>${run.xp}/${content.rules.xpPerLevel} XP</small></span>`}</div><div class="health-track"><i style="width:${Math.min(100, (current / max) * 100)}%"></i></div><div class="vital-bottom">${
    player
      ? ['shield', 'burn', 'poison', 'regen']
          .filter((k) => player[k as 'shield'] > 0)
          .map((k) => `<span class="value-${k}">${icon(statIcon[k])} ${player[k as 'shield']} ${k}</span>`)
          .join('')
      : `<span class="wins">${icon('trophy')} ${run.wins} / ${content.rules.wins} wins</span><span>${icon('shield')} ${run.prestige} Prestige</span><span>${run.lastChanceUsed ? 'Last chance spent' : 'Last chance available'}</span>`
  }</div>`;
}
function renderTable() {
  $('worktable').hidden = run.phase === 'start';
  const state = context(),
    f = frame();
  $('player-vitals').innerHTML = vitals(f?.players[0]);
  $('capacity').textContent = `${run.capacity} slots`;
  $('board-instruction').textContent = battle
    ? 'Board locked · Right-click any item for details'
    : 'Drag to arrange · Right-click for details';
  $('undo').hidden = !!battle;
  ($('undo') as HTMLButtonElement).disabled = !undo.length;
  $('player-board').innerHTML = tray(
    f
      ? f.entities.filter((e) => e.owner === 'p0' && e.location === 'board')
      : run.items.filter((i) => i.location === 'board'),
    run.capacity,
    state,
    f ? 'p0' : undefined,
  );
  $('stash').innerHTML = tray(
    run.items.filter((i) => i.location === 'stash'),
    content.rules.stashCapacity,
    runContext(content, run),
  );
  $('storage-line').hidden = !!battle;
  $('playback').hidden = !battle;
  $('sell-zone').classList.toggle('unavailable', !canArrange());
  $('skills').innerHTML =
    `<span class="skills-label">SKILLS</span>${run.skills.length ? run.skills.map((i) => `<div class="skill-medallion tier-${i.tier}" tabindex="0" role="img" data-inspect="skill:${i.id}" aria-label="${esc(definition(content, i.defId).name)}. Right-click for details.">${art(i.defId)}</div>`).join('') : '<small>Discover your first skill</small>'}`;
}
function choiceArt(id: string) {
  return `<div class="choice-art">${art(id)}</div>`;
}
function rewardCard(r: Reward, start = false): string {
  const itemId = r.item ?? r.skill,
    illustration =
      itemId ??
      (r.gold || r.income
        ? 'coins'
        : r.target === 'enchant'
          ? 'prism-box'
          : r.target === 'upgrade'
            ? 'sealed-star'
            : r.target === 'transform'
              ? 'prism-box'
              : 'return-token');
  const draggable = !start && (r.target || r.item);
  return `<article class="choice-card reward-card ${draggable ? 'draggable-reward' : ''}" ${draggable ? `data-drag-kind="reward" data-drag-id="${r.id}"` : ''} ${itemId ? `data-inspect="reward:${r.id}" tabindex="0"` : ''}><span class="eyebrow">${start ? (r.skill ? 'A LITTLE WISDOM' : r.income ? 'A LITTLE FORTUNE' : 'A LITTLE MAGIC') : r.target ? `${r.target.toUpperCase()} AN ITEM` : 'YOUR REWARD'}</span>${choiceArt(illustration)}<h3>${esc(r.label)}</h3><p>${esc(r.text)}</p>${draggable ? `<div class="drag-invitation">${icon('mouse')} ${r.target ? 'Drag onto an eligible item' : upgradeTarget(run, r.item!) ? 'Drag onto your matching item' : 'Drag onto board or stash'}</div>` : `<button class="primary" data-action="${start ? 'start' : 'choose'}" data-id="${r.id}">${start ? 'Begin with this' : 'Accept reward'} ${icon('arrow')}</button>`}</article>`;
}
function merchant() {
  return `<div class="merchant"><img src="/art/merchant.png" alt="A silver-haired curiosity dealer holding a copper kettle" draggable="false"><div class="merchant-name">Morrow<small>KEEPER OF UNLIKELY THINGS</small></div></div>`;
}
function renderStage() {
  const stage = $('stage');
  app.classList.toggle('starting', run.phase === 'start');
  app.classList.toggle('in-combat', !!battle);
  if (battle) {
    const f = frame()!,
      state = context();
    stage.innerHTML = `<div class="battle-stage"><div class="opponent-vitals" id="opponent-vitals" data-entity="p1">${vitals(f.players[1])}</div><div id="opponent-board" class="item-tray enemy-tray">${tray(
      f.entities.filter((e) => e.owner === 'p1' && e.location === 'board'),
      f.players[1].capacity,
      state,
      'p1',
    )}</div><div class="battle-middle"><span class="eyebrow">${practice ? 'PRACTICE CROSSING' : run.hour === 2 ? 'MONSTER CROSSING' : 'RIVAL CROSSING'}</span><h2 id="battle-result">Let your curiosities do the talking.</h2><p id="battle-caption">Automatic combat · right-click to inspect and pause</p></div></div>`;
    updateCombat();
    return;
  }
  if (run.phase === 'start') {
    stage.innerHTML = `<div class="opening">${merchant()}<div class="opening-content"><span class="eyebrow">A STALL. A HANDFUL OF GOLD. A LITTLE POSSIBILITY.</span><h1>Every good evening<br>starts with a curious find.</h1><p class="stage-subtitle">Collect oddities. Find unexpected combinations. Earn ten victories.</p><div class="choices">${content.starts.map((r) => rewardCard(r, true)).join('')}</div></div></div>`;
    return;
  }
  if (run.phase === 'victory' || run.phase === 'defeat') {
    stage.innerHTML = `<div class="terminal">${art(run.phase === 'victory' ? 'sealed-star' : 'sand-hourglass')}<div><span class="eyebrow">${run.phase === 'victory' ? 'TEN VICTORIES · RUN COMPLETE' : 'DEFEAT · THE MARKET CLOSES'}</span><h1>${run.phase === 'victory' ? 'A collection worth remembering.' : 'Another evening, another story.'}</h1><p>${run.wins} wins · ${run.day} days · ${run.counters.fights ?? 0} crossings</p><button data-action="new" class="primary">Begin another evening ${icon('arrow')}</button><button data-action="export-snapshot">Keep this build</button></div></div>`;
    return;
  }
  if (run.phase === 'shop') {
    const shop = content.encounters.find((e) => e.id === run.selected)!;
    stage.innerHTML = `<div class="market-scene">${merchant()}<div class="shop-content"><div class="stage-heading"><div><span class="eyebrow">MORROW'S COLLECTION</span><h1>${esc(shop.name)}</h1></div><div class="shop-actions"><button data-action="reroll" ${run.gold < (shop.rerollCost ?? 2) ? 'disabled' : ''}>↻ New finds <span>${shop.rerollCost} ${icon('coin')}</span></button><button class="primary" data-action="leave">Onward ${icon('arrow')}</button></div></div><p class="stage-subtitle">${esc(shop.text)} <span>Drag a find to your board or stash to buy it.</span></p><div class="offer-row">${run.offers
      .map((o) => {
        const item = offeredInstance(content, o.id, o.defId, o.tier, o.enchantment),
          upgrade = upgradeTarget(run, o.defId);
        return `<div class="offer ${o.sold ? 'sold' : ''} ${run.gold < o.price ? 'unaffordable' : ''}" style="--size:${definition(content, o.defId).size}">${o.sold ? '<div class="sold-sign">Taken home</div>' : ''}${itemCard(item, `offer:${o.id}`, { source: o.sold ? undefined : { kind: 'offer', id: o.id } })}<div class="price-tag">${icon('coin')} <strong>${o.price}</strong></div><span class="offer-note">${o.sold ? 'SOLD' : upgrade ? `↑ Upgrade your ${upgrade.tier} copy` : `${o.tier} · ${definition(content, o.defId).size} slot${definition(content, o.defId).size > 1 ? 's' : ''}`}</span></div>`;
      })
      .join(
        '',
      )}</div><div class="shop-footnote">${icon('mouse')} Right-click a find to see every detail${shop.sellBonus ? `<span>Trade bonus: +${shop.sellBonus} gold per sale</span>` : ''}</div></div></div>`;
    return;
  }
  if (run.phase === 'choice') {
    stage.innerHTML = `<div class="choice-scene"><div class="center-heading"><span class="eyebrow">${run.pending[0]?.reason === 'Last chance' ? 'ONE MORE CHANCE' : 'SOMETHING FOR THE ROAD'}</span><h1>${esc(run.pending[0]?.reason)}</h1><p class="stage-subtitle">${run.pending.length > 1 ? `${run.pending.length} rewards to resolve · ` : ''}Take one. Make it part of your story.</p></div><div class="choices">${commandOptions(
      content,
      run,
    )
      .map((r) => rewardCard(r))
      .join('')}</div></div>`;
    return;
  }
  if (run.phase === 'result') {
    stage.innerHTML = `<div class="center-heading"><span class="eyebrow">CROSSING COMPLETE</span><h1>${run.battle?.outcome === 'p0' ? 'Victory at the crossing.' : run.battle?.outcome === 'draw' ? 'A shared finish.' : 'A difficult crossing.'}</h1><p>Your saved result is ready. Its detailed playback is in your separately exported replay.</p><button class="primary" data-action="continue">Continue journey ${icon('arrow')}</button></div>`;
    return;
  }
  const opponents = run.candidates
    .map((id) => content.opponents.find((o) => o.snapshot.id === id))
    .filter((o) => !!o);
  if (opponents.length) {
    stage.innerHTML = `<div class="choice-scene"><div class="center-heading"><span class="eyebrow">${run.hour === 2 ? 'MONSTER CROSSING' : 'CURATED RIVALS'}</span><h1>Who will you face?</h1><p class="stage-subtitle">${run.hour === 2 ? 'A loss costs no Prestige. A win brings gold, XP and a find.' : `A win brings you closer to ten. A loss costs ${prestigeLoss(content, run.day)} Prestige.`}</p></div><div class="choices opponent-choices">${opponents.map((o) => `<article class="opponent-card"><div class="opponent-heading"><span class="opponent-seal">${icon(o.category === 'monster' ? 'sword' : 'trophy')}</span><div><span class="eyebrow">DIFFICULTY ${o.snapshot.difficulty}</span><h3>${esc(o.snapshot.name)}</h3><span>${icon('heart')} ${o.snapshot.maxHealth} <small>Health · ${o.snapshot.regen} Regen</small></span></div></div><div class="opponent-preview">${o.snapshot.items.map((i) => `<div class="preview-object tier-${i.tier}" tabindex="0" data-inspect="opponent:${o.snapshot.id}/${i.id}" aria-label="${esc(definition(content, i.defId).name)}. Right-click for details." style="flex:${definition(content, i.defId).size}">${art(i.defId)}<small>${esc(definition(content, i.defId).name)}</small></div>`).join('')}</div><div class="opponent-skills">Skills: ${o.snapshot.skills.length ? o.snapshot.skills.map((i) => `<span tabindex="0" data-inspect="opponent-skill:${o.snapshot.id}/${i.id}">${esc(definition(content, i.defId).name)}</span>`).join(' · ') : 'none'}</div><p class="opponent-loot">${o.category === 'monster' ? `Win: ${o.rewards.map((r) => `${r.gold ?? 0} gold · ${r.xp ?? 0} XP`).join(' / ')}<small>Drops: ${o.drops.map((id) => definition(content, id).name).join(', ')}</small>` : 'Win: +1 victory toward your ten-win journey'}</p><button class="primary" data-action="challenge" data-id="${o.snapshot.id}">Face this ${o.category === 'monster' ? 'monster' : 'rival'} ${icon('arrow')}</button></article>`).join('')}</div></div>`;
    return;
  }
  stage.innerHTML = `<div class="choice-scene"><div class="center-heading"><span class="eyebrow">HOUR ${run.hour + 1} · THE MARKET IS YOURS</span><h1>Follow your curiosity.</h1><p class="stage-subtitle">Three paths through the lanternlight. Where next?</p></div><div class="choices encounter-choices">${run.candidates
    .map((id) => {
      const e = content.encounters.find((e) => e.id === id)!;
      return `<button class="encounter-card" data-action="select" data-id="${e.id}"><span class="eyebrow">${e.category === 'shop' ? 'MERCHANT' : e.category === 'free' ? 'A LUCKY FIND' : 'ENCOUNTER'}</span>${choiceArt(e.category === 'shop' ? (e.id === 'glass-stall' ? 'prism-box' : 'copper-ledger') : e.category === 'free' ? 'coins' : 'survey-kit')}<h3>${esc(e.name)}</h3><p>${esc(e.text)}</p><span class="encounter-preview">${e.category === 'shop' ? `${e.offerCount} finds · ${e.rerollCost} gold to refresh` : e.rewards.map((r) => r.label).join(' / ')}</span><span class="encounter-link">Step inside ${icon('arrow')}</span></button>`;
    })
    .join(
      '',
    )}</div>${imported ? `<button class="spar-button" data-action="spar">Practice against ${esc(imported.name)}</button>` : ''}</div>`;
}
function render() {
  dragging?.cancel();
  renderHeader();
  renderStage();
  renderTable();
  if (battle) updateCombat();
}

function inspect(key: string) {
  dragging.cancel();
  const split = key.indexOf(':'),
    kind = key.slice(0, split),
    id = key.slice(split + 1);
  let item: Instance | undefined,
    state = context();
  if (kind === 'skill' && battle) item = state.entities.find((e) => e.id === `p0:${id}`);
  else if (kind === 'owned' || kind === 'skill')
    item = [...run.items, ...run.skills].find((i) => i.id === id);
  else if (kind === 'combat') item = frame()?.entities.find((i) => i.id === id);
  else if (kind === 'offer') {
    const o = run.offers.find((o) => o.id === id);
    if (o) item = offeredInstance(content, o.id, o.defId, o.tier, o.enchantment);
  } else if (kind === 'reward') {
    const r = rewardFor(content, run, id);
    if (r?.item || r?.skill)
      item = offeredInstance(content, r.id, (r.item ?? r.skill)!, r.tier, r.enchantment ?? null);
  } else if (kind.startsWith('opponent')) {
    const [snapshotId, itemId] = id.split('/'),
      snapshot = content.opponents.find((o) => o.snapshot.id === snapshotId)?.snapshot;
    if (snapshot) {
      state = makeCombatState(content, [runSnapshot(content, run), snapshot], run.seed);
      item = state.entities.find((e) => e.id === `p1:${itemId}`);
    }
  }
  if (!item) return;
  inspected = key;
  resumeAfterInspect = playing;
  playing = false;
  updatePlayback();
  const entity = state.entities.find((e) => e.id === item!.id) ?? entityFrom(item, 'p0'),
    def = definition(content, item.defId),
    ctx = { content, state, source: entity },
    tags = traits(content, entity);
  const keys = [
    ...new Set([
      ...Object.keys(def.tiers[item.tier] ?? {}),
      ...entity.modifiers.map((m) => m.attribute),
      ...entity.runtime.map((m) => m.attribute),
    ]),
  ].filter((k) => !['buy', 'sell'].includes(k));
  const upgrade = kind === 'offer' ? upgradeTarget(run, item.defId) : undefined;
  let comparison = '';
  if (upgrade && run.gold >= (run.offers.find((o) => o.id === id)?.price ?? Infinity)) {
    try {
      const after = dispatch(content, run, {
        version: 1,
        revision: run.revision,
        type: 'buy',
        offer: id,
      }).state;
      const next = after.items.find((i) => i.id === upgrade.id)!;
      const beforeValues = values(upgrade, runContext(content, run)),
        afterValues = values(next, runContext(content, after));
      comparison = `<div class="upgrade-comparison"><span class="eyebrow">PURCHASE PREVIEW · ${upgrade.tier} → ${next.tier}</span>${
        visibleAttributes
          .filter((k) => beforeValues[k] !== afterValues[k])
          .map(
            (k) =>
              `<div><span>${esc(k)}</span><span>${fmt(k, beforeValues[k])}</span><b>→ ${fmt(k, afterValues[k])}</b></div>`,
          )
          .join('') || '<p>The tier improves; these displayed attributes stay the same.</p>'
      }</div>`;
    } catch {
      comparison = '<p class="detail-note">This purchase cannot currently resolve.</p>';
    }
  }
  const addedEffects = enchantmentLines(ctx);
  const extraDetails = `${addedEffects.length ? `<div class="enchantment-effects"><span class="eyebrow">ADDED BY ${esc(item.enchantment)}</span>${addedEffects.map((line) => `<p>${esc(line)}</p>`).join('')}</div>` : ''}${abilities(
    content,
    entity,
  )
    .filter((a) => a.quest)
    .map(
      (a) =>
        `<div class="quest-progress">Quest: ${entity.memory[a.id]?.completed ? 'Complete' : `${entity.memory[a.id]?.progress ?? 0} / ${a.quest!.required}`} · ${a.quest!.scope}</div>`,
    )
    .join('')}${comparison}`;
  $('item-detail').innerHTML =
    `<div class="detail-hero tier-${item.tier}">${art(item.defId)}<div><span class="eyebrow">${item.tier.toUpperCase()} ${def.kind.toUpperCase()} ${def.kind === 'item' ? `· ${def.size} SLOT${def.size > 1 ? 'S' : ''}` : ''}</span><h1 id="detail-name">${esc(def.name)}</h1><div class="detail-types">${tags.types.map((t) => `<span>${esc(t)}</span>`).join('')}</div>${item.enchantment ? `<div class="enchantment-label">✦ ${esc(item.enchantment)} enchanted</div>` : ''}</div></div><p class="detail-description">${esc(def.text)}</p>${extraDetails}${upgrade ? `<div class="detail-note">Buying this upgrades your ${upgrade.tier} copy in ${upgrade.location} slot ${upgrade.position + 1}.${item.enchantment ? ` Its enchantment becomes ${esc(item.enchantment)}.` : ''} Drag onto that copy to purchase.</div>` : ''}${kind === 'owned' ? `<div class="detail-note">${item.location === 'stash' ? 'In your stash. Only explicitly stash-enabled abilities apply.' : 'On your active board.'} Sell value: ${sellPrice(content, run, item)} gold.</div>` : ''}<div class="detail-stats">${keys
      .map((key) => {
        const v = attribute(ctx, entity, key);
        return `<details><summary><span>${icon(statIcon[key] ?? 'star')} ${esc(key)}</span><b>${fmt(key, v.value)}</b></summary><div class="calculation">Base ${v.base}${v.steps.map((s) => `<p>${esc(s.layer)} · ${esc(s.source)}<br>${s.op} ${s.amount}: ${s.before} → ${s.after}</p>`).join('') || '<p>No additional modifiers.</p>'}</div></details>`;
      })
      .join(
        '',
      )}</div>${battle ? `<p class="runtime-note">Paused at ${(playTime / 1000).toFixed(2)}s · Ammo ${entity.ammo ?? 'unlimited'} · ${entity.destroyed ? 'Destroyed' : entity.flying ? 'Flying' : 'Active'}</p>` : ''}<details class="technical"><summary>Rules, targeting & counters</summary><p><b>Capabilities:</b> ${esc(tags.capabilities.join(', ')) || 'none'}<br><b>References:</b> ${esc(tags.references.join(', ')) || 'none'}<br><b>Protection:</b> ${esc(tags.protections.join(', ')) || 'none'}</p>${abilities(
      content,
      entity,
    )
      .map(
        (a) =>
          `<details><summary>${esc(a.id)} · ${esc(a.trigger.event)}</summary><p>Locations: ${a.locations.join(', ')} · Priority ${a.priority ?? 0} · ICD ${a.internalCooldown ?? 0}ms</p><pre>${esc(JSON.stringify(a, null, 2))}</pre><p>Counters: ${esc(JSON.stringify(entity.memory[a.id] ?? {}))}</p></details>`,
      )
      .join(
        '',
      )}${def.auras?.length ? `<details><summary>Auras</summary><pre>${esc(JSON.stringify(def.auras, null, 2))}</pre></details>` : ''}</details><div class="detail-footer">Detailed item view · <kbd>Esc</kbd> returns to the board</div>`;
  ($('item-dialog') as HTMLDialogElement).showModal();
}
function closeDetail() {
  ($('item-dialog') as HTMLDialogElement).close();
  inspected = undefined;
  if (resumeAfterInspect && battle) playing = true;
  resumeAfterInspect = false;
  updatePlayback();
}
function updatePlayback() {
  if (!battle) return;
  const end = cursor >= battle.replay.events.length - 1;
  const pause = app.querySelector<HTMLButtonElement>('[data-action="pause"]')!;
  pause.innerHTML = `${icon(playing ? 'pause' : 'play')} ${playing ? 'Pause' : end ? 'Replay' : 'Play'}`;
  pause.setAttribute('aria-label', playing ? 'Pause combat' : 'Play combat');
  $('combat-time').textContent = `${(playTime / 1000).toFixed(1)}s`;
  if (document.activeElement !== $('timeline')) ($('timeline') as HTMLInputElement).value = String(playTime);
  $('continue').hidden = !end;
  $('continue').textContent = practice ? 'Return to market →' : 'Continue journey →';
  app.querySelector<HTMLButtonElement>('[data-action="finish-playback"]')!.hidden = end;
  if ($('battle-result')) {
    $('battle-result').textContent = end
      ? battle.replay.final.outcome === 'p0'
        ? 'Victory at the crossing.'
        : battle.replay.final.outcome === 'draw'
          ? 'A shared finish.'
          : 'The crossing was lost.'
      : 'Let your curiosities do the talking.';
    if (end)
      $('battle-caption').textContent =
        run.hour === 2 && !practice
          ? battle.replay.final.outcome === 'p0'
            ? 'A few new finds await. Continue to collect your rewards.'
            : 'No Prestige lost. There is more market ahead.'
          : 'Continue to resolve this crossing.';
  }
}
function updateCombat() {
  if (!battle) return;
  const f = frame()!,
    state = context();
  if ($('opponent-vitals')) $('opponent-vitals').innerHTML = vitals(f.players[1]);
  $('player-vitals').innerHTML = vitals(f.players[0]);
  for (const e of f.entities) {
    const el = app.querySelector<HTMLElement>(`[data-entity="${CSS.escape(e.id)}"]`);
    if (!el) continue;
    if (el.dataset.def !== e.defId) {
      const node = document.createElement('div');
      node.innerHTML = itemCard(e, `combat:${e.id}`, { state, runtime: e });
      el.replaceWith(node.firstElementChild!);
      continue;
    }
    const v = values(e, state);
    el.classList.toggle('destroyed', e.destroyed);
    el.classList.toggle('flying', e.flying);
    el.classList.toggle('frozen', (e.statuses.freeze ?? 0) > f.time);
    for (const key of ['damage', 'shield', 'burn', 'poison', 'heal', 'regen']) {
      const label = el.querySelector(`[data-stat="${key}"] b`);
      if (label) label.textContent = String(v[key]);
    }
    el.dataset.cooldown = String(v.cooldown);
    el.querySelector('.runtime-badges')!.innerHTML =
      `${e.ammo !== null ? `<span class="ammo ${e.ammo === 0 ? 'empty' : ''}">${e.ammo === 0 ? 'EMPTY' : `${e.ammo} AMMO`}</span>` : ''}${Object.keys(
        e.statuses,
      )
        .filter((s) => e.statuses[s] > f.time)
        .map((s) => `<span class="status-${s}">${s}</span>`)
        .join('')}${e.destroyed ? '<span>DESTROYED</span>' : e.flying ? '<span>FLYING</span>' : ''}`;
  }
  updatePlayback();
  if (!$('inspector').hidden) renderEvents();
}
function updateCharge() {
  const f = frame();
  if (!f) return;
  for (const e of f.entities) {
    const el = app.querySelector<HTMLElement>(`[data-entity="${CSS.escape(e.id)}"]`),
      bar = el?.querySelector<HTMLElement>('.charge-track i');
    if (!el || !bar) continue;
    const cooldown = Number(el.dataset.cooldown),
      dt = Math.max(0, playTime - f.time);
    const rate =
      e.destroyed || (e.statuses.freeze ?? 0) > playTime
        ? 0
        : ((e.statuses.haste ?? 0) > playTime ? 4 : 2) / ((e.statuses.slow ?? 0) > playTime ? 2 : 1);
    bar.style.transform = `scaleX(${cooldown ? Math.min(1, (e.progress + dt * rate) / (cooldown * 2)) : 0})`;
    bar.classList.toggle('empty', e.ammo === 0);
  }
}
function animateEvents(events: SimEvent[]) {
  const relevant = events
    .filter((e) =>
      [
        'use.started',
        'damage.dealt',
        'shield.gained',
        'heal.received',
        'item.destroyed',
        'item.repaired',
      ].includes(e.kind),
    )
    .slice(-10);
  for (const event of relevant) {
    const source = app.querySelector<HTMLElement>(`[data-entity="${CSS.escape(event.sourceId)}"]`);
    if (event.kind === 'use.started') {
      source?.animate(
        [
          { filter: 'brightness(1)', transform: 'translateY(0)' },
          { filter: 'brightness(1.9)', transform: 'translateY(-7px)' },
          { filter: 'brightness(1)', transform: 'translateY(0)' },
        ],
        { duration: 280 },
      );
    } else {
      const target = app.querySelector<HTMLElement>(`[data-entity="${CSS.escape(event.targets[0] ?? '')}"]`);
      effects.burst(event, source?.getBoundingClientRect(), target?.getBoundingClientRect());
      if (event.kind === 'damage.dealt' && $('battle-caption')) {
        const entity = frame()?.entities.find((e) => e.id === event.sourceId);
        $('battle-caption').textContent =
          `${entity ? definition(content, entity.defId).name : (event.payload.kind ?? 'The storm')} · ${event.payload.attempted ?? event.payload.amount ?? ''} damage`;
      }
    }
  }
}
function jump(index: number) {
  if (!battle) return;
  cursor = Math.max(-1, Math.min(battle.replay.events.length - 1, index));
  playTime = battle.replay.events[cursor]?.time ?? 0;
  playing = false;
  effects.clear();
  updateCombat();
  updateCharge();
}
function seek(time: number) {
  if (!battle) return;
  let low = 0,
    high = battle.replay.events.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (battle.replay.events[mid].time <= time) low = mid + 1;
    else high = mid;
  }
  jump(low - 1);
  playTime = time;
  updateCharge();
  updatePlayback();
}
function renderEvents() {
  if (!battle) return;
  const event = battle.replay.events[cursor];
  $('event-detail').innerHTML = event
    ? `<div class="event-current"><span class="eyebrow">#${event.id} · ${event.time} ms · depth ${event.depth}</span><h3>${esc(event.kind)}</h3><p>Source: ${esc(event.sourceId)}<br>Owner: ${esc(event.ownerId)}<br>Targets: ${esc(event.targets.join(', ')) || 'none'}</p><p>Parent: ${event.parent ? `<button data-action="event-id" data-id="${event.parent}">#${event.parent}</button>` : 'root'} · Batch ${event.batch ?? 'none'}</p><p>Children: ${
        battle.replay.events
          .filter((e) => e.parent === event.id)
          .map((e) => `<button data-action="event-id" data-id="${e.id}">#${e.id}</button>`)
          .join(' ') || 'none'
      }</p><pre>${esc(JSON.stringify(event.payload, null, 2))}</pre><small>State hash ${event.hash}</small></div>`
    : '<p>Combat setup. Step an event to begin inspecting.</p>';
  const all = battle.replay.events
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => !filter || `${e.kind} ${e.sourceId}`.includes(filter));
  const nearest = all.findIndex(({ i }) => i >= cursor),
    start = Math.max(0, (nearest < 0 ? all.length : nearest) - 4);
  $('event-list').innerHTML =
    all
      .slice(start, start + 45)
      .map(
        ({ e, i }) =>
          `<button class="event-row ${i === cursor ? 'current' : ''}" data-action="event" data-id="${i}"><span>${(e.time / 1000).toFixed(2)}s · #${e.id}</span><b>${esc(e.kind)}</b><small>${esc(e.sourceId)}</small></button>`,
      )
      .join('') || '<p>No matching events.</p>';
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function closeMenu() {
  ($('menu-dialog') as HTMLDialogElement).close();
}
app.addEventListener('contextmenu', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-inspect]');
  if (target && !document.querySelector('dialog[open]')) {
    event.preventDefault();
    inspect(target.dataset.inspect!);
  }
});
app.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!button) return;
  const action = button.dataset.action,
    id = button.dataset.id ?? '';
  if (action === 'start') send({ type: 'start', choice: id });
  if (action === 'select') send({ type: 'select', id });
  if (action === 'choose') send({ type: 'choose', choice: id });
  if (action === 'challenge') {
    if (run.activeOpponent !== id && !send({ type: 'select', id })) return;
    send({ type: 'fight' });
  }
  if (action === 'reroll' || action === 'leave') send({ type: action });
  if (action === 'continue') {
    if (practice) {
      practice = false;
      battle = undefined;
      playing = false;
      $('inspector').hidden = true;
      effects.clear();
      render();
    } else send({ type: 'continue' });
  }
  if (action === 'undo') undoMove();
  if (action === 'menu') ($('menu-dialog') as HTMLDialogElement).showModal();
  if (action === 'close-menu') closeMenu();
  if (action === 'new') {
    closeMenu();
    ($('new-dialog') as HTMLDialogElement).showModal();
  }
  if (action === 'cancel-new') ($('new-dialog') as HTMLDialogElement).close();
  if (action === 'begin') {
    run = newRun(content, ($('seed') as HTMLInputElement).value || 'lantern-47');
    battle = undefined;
    playing = false;
    undo = [];
    effects.clear();
    $('inspector').hidden = true;
    ($('new-dialog') as HTMLDialogElement).close();
    autoSave();
    render();
  }
  if (action === 'close-detail') closeDetail();
  if (action === 'save') {
    if (autoSave()) notify('Evening saved.');
    closeMenu();
  }
  if (action === 'resume') {
    try {
      run = loadRun(content, localStorage.getItem(storageKey) ?? '');
      battle = undefined;
      playing = false;
      undo = [];
      effects.clear();
      $('inspector').hidden = true;
      closeMenu();
      render();
      notify('Saved evening resumed.');
    } catch (error) {
      notify((error as Error).message, true);
    }
  }
  if (action === 'export-save') download(`night-market-${run.seed}.json`, saveRun(content, run));
  if (action === 'export-snapshot')
    download(`build-${run.seed}.json`, JSON.stringify(runSnapshot(content, run), null, 2));
  if (action === 'import') ($('import-file') as HTMLInputElement).click();
  if (action === 'pause' && battle) {
    if (cursor >= battle.replay.events.length - 1) {
      cursor = -1;
      playTime = 0;
      updateCombat();
    }
    playing = !playing;
    updatePlayback();
  }
  if (action === 'step') jump(cursor + 1);
  if (action === 'next-use' && battle) {
    const next = battle.replay.events.findIndex((e, i) => i > cursor && e.kind === 'use.started');
    jump(next < 0 ? battle.replay.events.length - 1 : next);
  }
  if (action === 'finish-playback' && battle) jump(battle.replay.events.length - 1);
  if (action === 'restart-replay') jump(-1);
  if (action === 'inspector' && battle) {
    $('inspector').hidden = !$('inspector').hidden;
    if (!$('inspector').hidden) renderEvents();
  }
  if (action === 'event') jump(Number(id));
  if (action === 'event-id' && battle) jump(battle.replay.events.findIndex((e) => e.id === Number(id)));
  if (action === 'export-replay' && battle)
    download(`replay-${run.seed}.json`, JSON.stringify(battle.replay));
  if (action === 'verify' && battle) {
    const replay = simulate(content, battle.replay.initial, battle.replay.seed).replay;
    const ok = replay.finalHash === battle.replay.finalHash && replay.digest === battle.replay.digest;
    notify(
      ok
        ? `Replay verified · ${replay.events.length} identical events · ${replay.finalHash}`
        : 'Replay divergence',
      !ok,
    );
  }
  if (action === 'spar' && imported) {
    setupBattle(
      simulate(content, [runSnapshot(content, run), imported], `${run.seed}/practice`, { frames: true }),
      true,
    );
    render();
  }
});
app.addEventListener('keydown', (event) => {
  if (
    (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) &&
    (event.target as HTMLElement).closest('[data-inspect]')
  ) {
    event.preventDefault();
    inspect((event.target as HTMLElement).closest<HTMLElement>('[data-inspect]')!.dataset.inspect!);
  }
});
document.addEventListener('keydown', (event) => {
  if (
    (event.target as HTMLElement).matches('input,select,textarea') ||
    document.querySelector('dialog[open]')
  )
    return;
  if (event.code === 'Space' && battle) {
    event.preventDefault();
    app.querySelector<HTMLButtonElement>('[data-action="pause"]')!.click();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    undoMove();
  }
  if (event.key === 'Escape') $('inspector').hidden = true;
});
$('item-dialog').addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDetail();
});
$('item-dialog').addEventListener('click', (event) => {
  if (event.target === $('item-dialog')) {
    const r = $('item-dialog').getBoundingClientRect();
    const e = event as MouseEvent;
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDetail();
  }
});
$('speed').addEventListener('change', () => {
  speed = Number(($('speed') as HTMLSelectElement).value);
});
$('timeline').addEventListener('input', () => seek(Number(($('timeline') as HTMLInputElement).value)));
$('event-filter').addEventListener('input', () => {
  filter = ($('event-filter') as HTMLInputElement).value;
  renderEvents();
});
$('import-file').addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await file.text(),
      data = JSON.parse(text) as Record<string, unknown>;
    if (data.format === 'night-market-save') {
      run = loadRun(content, text);
      battle = undefined;
      playing = false;
      undo = [];
      autoSave();
    } else if (data.events) setupBattle(importReplay(content, text)!, true);
    else {
      imported = importSnapshot(content, text);
      notify(`Imported ${imported.name}. Practice is available at market choices.`);
    }
    closeMenu();
    render();
  } catch (error) {
    notify((error as Error).message, true);
  }
  (event.target as HTMLInputElement).value = '';
});
function tick(now: number) {
  const elapsed = Math.min(100, now - lastFrame);
  lastFrame = now;
  if (playing && battle && !inspected) {
    playTime += elapsed * speed;
    const previous = cursor;
    while (cursor + 1 < battle.replay.events.length && battle.replay.events[cursor + 1].time <= playTime)
      cursor++;
    if (cursor >= battle.replay.events.length - 1) {
      playing = false;
      playTime = battle.replay.final.time;
    }
    if (previous !== cursor) {
      updateCombat();
      animateEvents(battle.replay.events.slice(previous + 1, cursor + 1));
    }
    updatePlayback();
  }
  updateCharge();
  requestAnimationFrame(tick);
}
if (import.meta.env.DEV)
  Object.assign(window, {
    nightMarket: {
      state: () => clone(run),
      hash: () => hash(run),
      command: (command: InputCommand) => send(command),
      content,
    },
  });
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    run = loadRun(content, saved);
    $('save-status').textContent = '✓ Saved evening resumed';
  }
} catch {
  notify('Your saved run could not be read. Import a backup from the menu.', true);
}
render();
requestAnimationFrame(tick);
