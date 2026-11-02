'use client';

import { useEffect, useRef } from 'react';

const GAP = 22; // dot grid step, px
// Kept subtle on purpose (user feedback): a hint of depth, never a distraction.
const REACH = 110; // how far around the pointer the dots lift, px
const PUSH = 5; // how far the nearest dots move aside, px
const DOT = 1.2; // dot radius at rest, px

type Rgb = [number, number, number];

/** `#rrggbb` → [r, g, b] (theme tokens are plain hex). */
function rgb(hex: string): Rgb {
  const v = hex.trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) || 0) as Rgb;
}

/** The theme's ink and accent, read from the tokens (re-read when the theme class changes). */
function readColors(): { dot: Rgb; hot: Rgb; dark: boolean } {
  const css = getComputedStyle(document.documentElement);
  return {
    dot: rgb(css.getPropertyValue('--foreground')),
    hot: rgb(css.getPropertyValue('--primary')),
    dark: document.documentElement.classList.contains('dark'),
  };
}

/**
 * The app's backdrop (design «C+», https://claude.ai/artifact/8VLRMZc8t3Vuk2zRyaNx2X): a faint dot
 * grid that breathes, lifts and warms around the cursor or finger, two soft lights drifting behind
 * it, and both moving slower than the page as it scrolls (parallax). One fixed canvas drawn on
 * animation frames — no React renders. Paused while the tab is hidden; with reduced motion it is a
 * still grid.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let colors = readColors();
    const themeWatch = new MutationObserver(() => (colors = readColors()));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let width = 0;
    let height = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();

    // Where the pointer is, where the effect has eased to, and how strong it is (fades in and out).
    const target = { x: width / 2, y: height / 3, on: false };
    const eased = { x: target.x, y: target.y, power: 0 };
    const point = (x: number, y: number) => Object.assign(target, { x, y, on: true });
    const onPointer = (e: PointerEvent) => point(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) point(t.clientX, t.clientY);
    };
    const away = () => (target.on = false);

    const draw = (seconds: number) => {
      eased.x += (target.x - eased.x) * 0.12;
      eased.y += (target.y - eased.y) * 0.12;
      eased.power += ((target.on ? 1 : 0) - eased.power) * 0.06;
      const { dot, hot, dark } = colors;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, width, height);

      // The light under the cursor/finger.
      if (eased.power > 0.01) {
        const glow = ctx.createRadialGradient(eased.x, eased.y, 0, eased.x, eased.y, 160);
        glow.addColorStop(0, `rgba(${hot.join(',')},${(dark ? 0.07 : 0.05) * eased.power})`);
        glow.addColorStop(1, `rgba(${hot.join(',')},0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // The grid: parallax with the scroll, a slow breath, lifted around the pointer.
      const shift = -((scroll * 0.35) % GAP);
      for (let gy = shift - GAP; gy < height + GAP; gy += GAP) {
        for (let gx = GAP / 2; gx < width; gx += GAP) {
          const breath = reduced ? 0 : Math.sin(seconds * 0.8 + gx * 0.04 + gy * 0.03) * 0.6;
          let x = gx;
          let y = gy + breath;
          const dx = x - eased.x;
          const dy = y - eased.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const near = Math.max(0, 1 - d / REACH);
          const lift = near * near * eased.power;
          x += (dx / d) * PUSH * lift;
          y += (dy / d) * PUSH * lift;
          ctx.beginPath();
          ctx.arc(x, y, DOT + lift * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${(lift > 0.02 ? hot : dot).join(',')},${0.1 + lift * 0.15})`;
          ctx.fill();
        }
      }

      // The drifting lights scroll slower still.
      if (lightsRef.current)
        lightsRef.current.style.transform = `translate3d(0, ${-scroll * 0.1}px, 0)`;
    };

    let frame = 0;
    let odd = false;
    const loop = (time: number) => {
      // At rest (no pointer) half the frame rate is plenty for a breath; full speed while it reacts.
      odd = !odd;
      if (target.on || eased.power > 0.01 || odd) draw(time / 1000);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (reduced) draw(0);
      else frame = requestAnimationFrame(loop);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start());
    // Reduced motion: a still grid, redrawn only when the page scrolls or resizes.
    const redraw = () => reduced && draw(0);

    window.addEventListener('resize', resize);
    window.addEventListener('resize', redraw);
    window.addEventListener('scroll', redraw, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduced) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('touchend', away);
      document.documentElement.addEventListener('pointerleave', away);
      window.addEventListener('blur', away);
    }
    start();

    return () => {
      cancelAnimationFrame(frame);
      themeWatch.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', redraw);
      window.removeEventListener('scroll', redraw);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', away);
      document.documentElement.removeEventListener('pointerleave', away);
      window.removeEventListener('blur', away);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div ref={lightsRef} className="absolute -inset-24">
        <div className="absolute top-10 left-[15%] size-105 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_70%)] motion-safe:animate-glow-drift" />
        <div className="absolute top-[70%] left-[45%] size-95 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--palette-amber)_8%,transparent)_0%,transparent_70%)] motion-safe:animate-glow-drift-alt" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
