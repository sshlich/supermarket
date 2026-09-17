import type { Content, Run } from '../packages/sim/src/model';
import { definition } from '../packages/sim/src/geometry';
import {
  dragItem,
  dropRecipients,
  previewDrop,
  sellPrice,
  type Destination,
  type DragSource,
} from './interactions';

interface Hooks {
  content: Content;
  run: () => Run;
  locked: () => boolean;
  commit: (source: DragSource, destination: Destination) => void;
  notify: (text: string, error?: boolean) => void;
}
/** A pointer gesture, not an item selection. Nothing mutates until a validated release. */
export function installDragging(
  root: HTMLElement,
  hooks: Hooks,
): { cancel: () => void; active: () => boolean } {
  let gesture:
    | {
        source: DragSource;
        element: HTMLElement;
        pointer: number;
        startX: number;
        startY: number;
        grabX: number;
        grabY: number;
        offset: number;
        revision: number;
        dragging: boolean;
        ghost?: HTMLElement;
        destination?: Destination;
      }
    | undefined;
  const hint = document.getElementById('drag-hint')!;
  const clearPreview = () => {
    root
      .querySelectorAll('.drop-valid,.drop-invalid,.drop-upgrade')
      .forEach((el) => el.classList.remove('drop-valid', 'drop-invalid', 'drop-upgrade'));
    document.getElementById('drop-footprint')?.remove();
  };
  function cancel() {
    const previous = gesture;
    gesture = undefined;
    if (previous?.element.hasPointerCapture(previous.pointer))
      previous.element.releasePointerCapture(previous.pointer);
    previous?.element.classList.remove('being-dragged');
    previous?.ghost?.remove();
    clearPreview();
    root.classList.remove('dragging');
    root.querySelectorAll('.drop-eligible').forEach((el) => el.classList.remove('drop-eligible'));
    document.querySelector('#sell-zone strong')!.textContent = 'Sell an item';
    hint.hidden = true;
  }
  function destinationAt(x: number, y: number): Destination | undefined {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (el?.closest('#sell-zone')) return { location: 'sell' };
    const tray = el?.closest<HTMLElement>('[data-drop-location]');
    if (!tray || !gesture) return;
    const location = tray.dataset.dropLocation as 'board' | 'stash',
      rect = tray.getBoundingClientRect();
    const hit = el?.closest<HTMLElement>('[data-owned-id]');
    const cell = rect.width / 10;
    const position = Math.floor((x - rect.x) / cell) - gesture.offset;
    const item = hit && hooks.run().items.find((i) => i.id === hit.dataset.ownedId);
    const dragged = dragItem(hooks.content, hooks.run(), gesture.source);
    const swap =
      gesture.source.kind === 'owned' &&
      dragged &&
      item &&
      item.id !== dragged.id &&
      definition(hooks.content, item.defId).size === definition(hooks.content, dragged.defId).size;
    return { location, position: swap ? item.position : position, ...(item ? { itemId: item.id } : {}) };
  }
  root.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || gesture || hooks.locked() || document.querySelector('dialog[open]')) return;
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-drag-kind]');
    if (!element || element.dataset.unavailable === 'true') return;
    const source = { kind: element.dataset.dragKind, id: element.dataset.dragId } as DragSource;
    const item = dragItem(hooks.content, hooks.run(), source),
      rect = element.getBoundingClientRect();
    const size = item ? definition(hooks.content, item.defId).size : 1;
    gesture = {
      source,
      element,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - rect.x,
      grabY: event.clientY - rect.y,
      offset: Math.min(size - 1, Math.floor((event.clientX - rect.x) / (rect.width / size))),
      revision: hooks.run().revision,
      dragging: false,
    };
    element.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  document.addEventListener('pointermove', (event) => {
    if (!gesture || event.pointerId !== gesture.pointer) return;
    if (!gesture.dragging && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 5)
      return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      const notice = document.getElementById('notice');
      if (notice) notice.hidden = true;
      const rect = gesture.element.getBoundingClientRect();
      gesture.ghost = gesture.element.cloneNode(true) as HTMLElement;
      gesture.ghost.removeAttribute('id');
      gesture.ghost.removeAttribute('data-drag-kind');
      gesture.ghost.removeAttribute('data-owned-id');
      gesture.ghost.removeAttribute('data-inspect');
      gesture.ghost.setAttribute('aria-hidden', 'true');
      gesture.ghost.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      gesture.ghost.classList.add('drag-ghost');
      Object.assign(gesture.ghost.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: '0px',
        top: '0px',
        gridColumn: 'auto',
      });
      document.body.append(gesture.ghost);
      if (gesture.source.kind === 'reward') {
        const art = gesture.ghost.querySelector('.choice-art')?.cloneNode(true);
        const label = document.createElement('strong');
        label.textContent = gesture.element.querySelector('h3')?.textContent ?? 'Reward';
        gesture.ghost.replaceChildren(...(art ? [art] : []), label);
        gesture.ghost.className = 'drag-ghost reward-token';
        Object.assign(gesture.ghost.style, { width: '160px', height: '100px' });
        gesture.grabX = 80;
        gesture.grabY = 50;
      }
      gesture.element.classList.add('being-dragged');
      root.classList.add('dragging');
      for (const item of dropRecipients(hooks.content, hooks.run(), gesture.source))
        root.querySelector(`[data-owned-id="${CSS.escape(item.id)}"]`)?.classList.add('drop-eligible');
      const item = dragItem(hooks.content, hooks.run(), gesture.source);
      if (gesture.source.kind === 'owned' && item)
        document.querySelector('#sell-zone strong')!.textContent =
          `Sell for ${sellPrice(hooks.content, hooks.run(), item)} gold`;
    }
    gesture.ghost!.style.transform = `translate(${event.clientX - gesture.grabX}px, ${event.clientY - gesture.grabY}px) rotate(-3deg)`;
    gesture.destination = destinationAt(event.clientX, event.clientY);
    clearPreview();
    const preview = gesture.destination
      ? previewDrop(hooks.content, hooks.run(), gesture.source, gesture.destination, hooks.locked())
      : { ok: false, message: 'Drop on your board or stash · Esc to cancel' };
    hint.textContent = preview.message;
    hint.className = preview.ok ? 'drag-hint valid' : 'drag-hint';
    hint.hidden = false;
    if (gesture.destination?.location === 'sell')
      document.getElementById('sell-zone')!.classList.add(preview.ok ? 'drop-valid' : 'drop-invalid');
    else if (gesture.destination) {
      const tray = root.querySelector<HTMLElement>(`[data-drop-location="${gesture.destination.location}"]`)!;
      const item = dragItem(hooks.content, hooks.run(), gesture.source);
      if (preview.upgradeId)
        root
          .querySelector(`[data-owned-id="${CSS.escape(preview.upgradeId)}"]`)
          ?.classList.add('drop-upgrade');
      else {
        const marker = document.createElement('div');
        marker.id = 'drop-footprint';
        marker.className = preview.ok ? 'drop-valid' : 'drop-invalid';
        const start = gesture.destination.position,
          width = item ? definition(hooks.content, item.defId).size : 1;
        marker.style.left = `${Math.max(0, start) * 10}%`;
        marker.style.width = `${Math.max(0, Math.min(10, start + width) - Math.max(0, start)) * 10}%`;
        tray.append(marker);
      }
    }
  });
  document.addEventListener('pointerup', (event) => {
    if (!gesture || event.pointerId !== gesture.pointer) return;
    const current = gesture;
    const destination = destinationAt(event.clientX, event.clientY);
    cancel();
    if (!current.dragging || !destination) return;
    if (current.revision !== hooks.run().revision || hooks.locked()) {
      hooks.notify('The scene changed. Please try that drag again.', true);
      return;
    }
    const preview = previewDrop(hooks.content, hooks.run(), current.source, destination);
    if (!preview.ok) {
      hooks.notify(preview.message, true);
      return;
    }
    hooks.commit(current.source, destination);
  });
  document.addEventListener('pointercancel', cancel);
  root.addEventListener('lostpointercapture', (event) => {
    if (gesture?.pointer === event.pointerId) cancel();
  });
  window.addEventListener('blur', cancel);
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && gesture) {
        event.preventDefault();
        event.stopImmediatePropagation();
        cancel();
      }
    },
    true,
  );
  document.addEventListener(
    'contextmenu',
    (event) => {
      if (gesture?.dragging) {
        event.preventDefault();
        event.stopImmediatePropagation();
        cancel();
      }
    },
    true,
  );
  root.addEventListener('dragstart', (event) => event.preventDefault());
  return { cancel, active: () => !!gesture?.dragging };
}
