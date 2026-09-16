import Phaser from 'phaser';
import type { SimEvent } from '../packages/sim/src/model';

/** Presentation only. DOM hit regions own dragging; Phaser owns combat feedback. */
export class MarketEffects extends Phaser.Scene {
  private ready = false;
  constructor() {
    super('market-effects');
  }
  create(): void {
    this.ready = true;
  }
  clear(): void {
    if (this.ready) {
      this.tweens.killAll();
      this.children.removeAll(true);
    }
  }
  burst(event: SimEvent, source?: DOMRect, target?: DOMRect): void {
    if (
      !this.ready ||
      !target ||
      this.children.length > 130 ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const color = event.kind.includes('shield')
      ? 0x82c9ee
      : event.kind.includes('heal')
        ? 0x97d6ac
        : event.kind.includes('poison')
          ? 0xb5d577
          : event.kind.includes('burn')
            ? 0xffa35c
            : 0xffd68d;
    const x = target.x + target.width / 2,
      y = target.y + target.height / 2;
    const amount = Number(event.payload.healthDamage ?? event.payload.actual ?? event.payload.amount ?? 0);
    if (source && event.kind === 'damage.dealt') {
      const orb = this.add
        .circle(source.x + source.width / 2, source.y + source.height / 2, 5, color)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: orb,
        x,
        y,
        duration: 180,
        ease: 'Cubic.easeIn',
        onComplete: () => orb.destroy(),
      });
    }
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3,
        dot = this.add.circle(x, y, 2 + (i % 3), color);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 35,
        y: y + Math.sin(angle) * 28,
        alpha: 0,
        duration: 480,
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
    if (amount > 0) {
      const text = this.add
        .text(x, y - 15, `${event.kind === 'damage.dealt' ? '−' : '+'}${amount}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '27px',
          color: `#${color.toString(16)}`,
          stroke: '#17121c',
          strokeThickness: 4,
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: text,
        y: y - 72,
        alpha: 0,
        duration: 850,
        ease: 'Cubic.easeOut',
        onComplete: () => text.destroy(),
      });
    }
  }
}
export function mountEffects(): MarketEffects {
  const scene = new MarketEffects();
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'phaser-effects',
    transparent: true,
    width: innerWidth,
    height: innerHeight,
    scene: [scene],
    scale: { mode: Phaser.Scale.RESIZE },
    audio: { noAudio: true },
    banner: false,
    render: { antialias: true },
  });
  return scene;
}
