import { chromium, type Locator } from 'playwright';
import { createServer } from 'vite';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { content, instance } from '../packages/content';
import { clone, hash } from '../packages/sim/src/determinism';
import { commandOptions, dispatch, newRun, rewardTargets, saveRun } from '../packages/sim/src/run';
import type { Run } from '../packages/sim/src/model';

let executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
if (!executablePath && !existsSync(chromium.executablePath())) {
  const cache = resolve(homedir(), '.cache/ms-playwright');
  if (existsSync(cache))
    for (const dir of (await readdir(cache))
      .filter((d) => d.startsWith('chromium-'))
      .sort()
      .reverse()) {
      for (const file of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const candidate = resolve(cache, dir, file);
        if (existsSync(candidate)) {
          executablePath = candidate;
          break;
        }
      }
      if (executablePath) break;
    }
}
const server = await createServer({
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
  logLevel: 'error',
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors: string[] = [];
page.on('pageerror', (error) => errors.push(error.message));
const state = () => page.evaluate('window.nightMarket.state()') as Promise<Run>;
const click = (action: string, id?: string) =>
  page
    .locator(`[data-action="${action}"]${id ? `[data-id="${id}"]` : ''}:visible`)
    .first()
    .click();
const owned = (id: string) => page.locator(`[data-owned-id="${id}"]`);
const offer = (id: string) => page.locator(`[data-drag-kind="offer"][data-drag-id="${id}"]`);
async function point(location: 'board' | 'stash', slot: number) {
  const box = (await page.locator(`[data-drop-location="${location}"]`).boundingBox())!;
  return { x: box.x + (box.width / 10) * (slot + 0.5), y: box.y + box.height / 2 };
}
async function drag(source: Locator, target: { x: number; y: number }, cancel = false) {
  const box = await source.boundingBox();
  assert.ok(box, 'Drag source visible');
  await page.mouse.move(box.x + Math.min(20, box.width / 3), box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  if (cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
}
async function importRun(run: Run) {
  await click('menu');
  await page
    .locator('#import-file')
    .setInputFiles({
      name: 'fixture.json',
      mimeType: 'application/json',
      buffer: Buffer.from(saveRun(content, run)),
    });
  await page.waitForFunction(() => !document.querySelector('#menu-dialog[open]'));
}
async function fitsViewport() {
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
    'No page scrolling at this desktop size',
  );
  for (const id of ['player-board', 'stash', 'sell-zone']) {
    const box = await page.locator(`#${id}`).boundingBox();
    assert.ok(
      box &&
        box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= page.viewportSize()!.width + 1 &&
        box.y + box.height <= page.viewportSize()!.height + 1,
      `${id} remains on screen`,
    );
  }
}
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:4173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'artifacts/redesign-start.png' });
  await click('start', 'economy');
  const first = (await state()).items[0].id;
  const untouched = hash(await state());
  await owned(first).click();
  assert.equal(hash(await state()), untouched, 'Left-click does not select or mutate an item');
  assert.equal(await page.locator('#item-dialog[open]').count(), 0);
  await owned(first).click({ button: 'right' });
  assert.match(await page.locator('#detail-name').innerText(), /Rivet Lance/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#item-dialog[open]').count(), 0);
  await drag(owned(first), await point('stash', 3));
  assert.equal((await state()).items[0].location, 'stash');
  assert.equal((await state()).items[0].position, 3);
  await click('undo');
  assert.equal((await state()).items[0].location, 'board');
  const beforeCancel = hash(await state());
  await drag(owned(first), await point('stash', 4), true);
  assert.equal(hash(await state()), beforeCancel, 'Escape cancels without a command');
  await drag(owned(first), await point('board', 9));
  assert.equal(hash(await state()), beforeCancel, 'Invalid drop is harmless');
  assert.equal(await page.locator('.drag-ghost').count(), 0);
  const normal = await state();

  // An imported deterministic test save exercises crowded and upgrade cases; the full journey below restores the ordinary run.
  const fixture = dispatch(content, newRun(content, 'pointer-fixture'), {
    version: 1,
    revision: 0,
    type: 'start',
    choice: 'economy',
  }).state;
  fixture.phase = 'shop';
  fixture.selected = 'open-stalls';
  fixture.gold = 50;
  fixture.items.push(instance('tea-tray', 'test-tea', 2), instance('folding-buckler', 'test-shield', 4));
  fixture.offers = [
    { id: 'vial', defId: 'bitter-vial', tier: 'bronze', enchantment: null, price: 3, sold: false },
    { id: 'duplicate', defId: 'rivet-lance', tier: 'bronze', enchantment: 'cinder', price: 5, sold: false },
    { id: 'anvil', defId: 'echo-anvil', tier: 'silver', enchantment: null, price: 9, sold: false },
    { id: 'courier', defId: 'paced-courier', tier: 'bronze', enchantment: null, price: 6, sold: false },
  ];
  await importRun(fixture);
  await fitsViewport();
  await page.screenshot({ path: 'artifacts/redesign-shop.png' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await fitsViewport();
  await page.screenshot({ path: 'artifacts/redesign-shop-1280.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await offer('anvil').click({ button: 'right' });
  assert.match(await page.locator('#detail-name').innerText(), /Echo Anvil/);
  await page.screenshot({ path: 'artifacts/redesign-details.png' });
  await click('close-detail');
  await drag(offer('vial'), await point('stash', 8));
  let current = await state();
  const vial = current.items.find((i) => i.defId === 'bitter-vial')!;
  assert.ok(vial);
  assert.equal(vial.position, 8);
  assert.equal(vial.location, 'stash');
  assert.equal(current.gold, 47);
  const beforeBadUpgrade = hash(current);
  await drag(offer('duplicate'), await point('stash', 1));
  assert.equal(hash(await state()), beforeBadUpgrade);
  await drag(offer('duplicate'), await point('board', 0));
  current = await state();
  assert.equal(current.items[0].tier, 'silver');
  assert.equal(current.items[0].enchantment, 'cinder');
  assert.equal(current.gold, 42);
  await drag(owned(current.items[0].id), await point('board', 2));
  assert.equal((await state()).items[0].position, 2);
  assert.equal((await state()).items.find((i) => i.id === 'test-tea')!.position, 0);
  await page.keyboard.press('Control+z');
  assert.equal((await state()).items[0].position, 0);
  const sell = (await page.locator('#sell-zone').boundingBox())!;
  await drag(owned(vial.id), { x: sell.x + sell.width / 2, y: sell.y + sell.height / 2 });
  assert.ok(!(await state()).items.some((i) => i.id === vial.id));
  assert.ok((await state()).gold > 42);
  const rewardFixture = clone(fixture);
  rewardFixture.phase = 'choice';
  rewardFixture.afterChoices = 'shop';
  rewardFixture.pending = [
    {
      reason: 'Choose an enchantment',
      rewards: [
        {
          id: 'brisk',
          label: 'A quicker rhythm',
          text: 'Grant a Brisk enchantment.',
          target: 'enchant',
          enchantment: 'brisk',
        },
      ],
    },
  ];
  await importRun(rewardFixture);
  await drag(page.locator('[data-drag-kind="reward"]'), await point('board', 0));
  assert.equal((await state()).items[0].enchantment, 'brisk');
  await importRun(normal);
  await page.reload();
  await page.waitForLoadState('networkidle');
  assert.equal(hash(await state()), hash(normal), 'Reload resumes exact decision boundary');
  await click('menu');
  await click('save');
  await click('menu');
  await click('resume');
  let testedShop = false,
    testedCombat = false,
    testedReward = false;
  for (let step = 0; step < 220; step++) {
    const run = await state();
    if (run.phase === 'defeat' || run.phase === 'victory') break;
    if (run.phase === 'choice') {
      const rewards = commandOptions(content, run);
      const choice = rewards.find((r) => !r.target && !r.item) ?? rewards[0];
      if (!choice.target && !choice.item) await click('choose', choice.id);
      else if (choice.target) {
        const target = rewardTargets(content, run, choice)[0];
        await drag(
          page.locator(`[data-drag-kind="reward"][data-drag-id="${choice.id}"]`),
          await point(target.location as 'board' | 'stash', target.position),
        );
      } else throw new Error('Journey needs a non-item reward or target fixture');
      testedReward = true;
    } else if (run.phase === 'shop') {
      if (!testedShop && run.gold >= 2) await click('reroll');
      testedShop = true;
      await click('leave');
    } else if (run.phase === 'result') {
      if (await page.locator('#playback:visible').count()) {
        if (!testedCombat) {
          await click('pause');
          await click('step');
          await click('next-use');
          await page.screenshot({ path: 'artifacts/redesign-combat.png' });
          await click('inspector');
          await click('pause');
          await page.locator('#event-filter').focus();
          await page.keyboard.type('damage', { delay: 80 });
          assert.equal(await page.locator('#event-filter').inputValue(), 'damage');
          assert.ok(
            await page.locator('#event-filter').evaluate((el) => el === document.activeElement),
            'Inspector filter focus survives playback updates',
          );
          await page.locator('#speed').selectOption('2');
          assert.equal(await page.locator('#speed').inputValue(), '2');
          await click('pause');
          await page.screenshot({ path: 'artifacts/redesign-inspector.png' });
          await click('verify');
          assert.match(await page.locator('#notice').innerText(), /Replay verified/);
          await page.getByRole('button', { name: 'Close battle inspector' }).click();
          testedCombat = true;
        }
        await click('finish-playback');
      }
      await click('continue');
    } else if (run.hour === 2 || run.hour === 5) await click('challenge', run.candidates[0]);
    else {
      const shop = run.candidates.find((id) => ['open-stalls', 'tool-cart', 'glass-stall'].includes(id));
      const free = run.candidates.find((id) => ['found-purse', 'gift-crate'].includes(id));
      await click('select', !testedShop && shop ? shop : (free ?? run.candidates.at(-1)));
    }
    if (step % 30 === 0)
      console.log(`Browser journey ${step}: day ${(await state()).day}, ${(await state()).phase}`);
  }
  const final = await state();
  assert.ok(['defeat', 'victory'].includes(final.phase));
  assert.ok(testedShop && testedCombat && testedReward);
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.screenshot({ path: 'artifacts/redesign-complete.png' });
  console.log(
    JSON.stringify({
      browser: 'Chromium',
      viewport: '1440x900 and 1280x800',
      dragMove: true,
      cancel: true,
      invalidDrop: true,
      rightClick: true,
      purchase: true,
      duplicateUpgrade: true,
      swapUndo: true,
      sell: true,
      rewardDrop: true,
      filterFocus: true,
      resume: true,
      outcome: final.phase,
      lastChance: final.lastChanceUsed,
      pageErrors: errors.length,
    }),
  );
} catch (error) {
  await page.screenshot({ path: 'artifacts/redesign-failure.png' });
  console.error('Page errors:', errors);
  throw error;
} finally {
  await browser.close();
  await server.close();
}
