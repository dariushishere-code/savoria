import { useEffect, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PREFERS_REDUCED_MOTION } from './motion';

gsap.registerPlugin(ScrollTrigger);

const SCROLL_DISTANCE = 42;

type RevealKind = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

const REVEAL_FROM: Record<RevealKind, gsap.TweenVars> = {
  up: { y: SCROLL_DISTANCE, opacity: 0 },
  down: { y: -SCROLL_DISTANCE, opacity: 0 },
  left: { x: SCROLL_DISTANCE, opacity: 0 },
  right: { x: -SCROLL_DISTANCE, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.94, y: 18, opacity: 0 },
};

const REVEAL_TO: Record<RevealKind, gsap.TweenVars> = {
  up: { y: 0, opacity: 1 },
  down: { y: 0, opacity: 1 },
  left: { x: 0, opacity: 1 },
  right: { x: 0, opacity: 1 },
  fade: { opacity: 1 },
  scale: { scale: 1, y: 0, opacity: 1 },
};

function parseFloatAttr(element: HTMLElement, key: string): number | undefined {
  const raw = element.dataset[key];
  if (raw === undefined) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Scroll-triggered motion system. Everything inside the returned ref's
 * subtree is decorated with:
 *
 *   · [data-reveal="up|down|left|right|fade|scale"]       entrance (optionally
 *     delayed with data-reveal-delay="ms", or custom start via data-reveal-start)
 *   · [data-reveal-stagger]                               staggers its children
 *     (data-stagger-delay="ms", data-stagger-stagger="s")
 *   · [data-hero-animate]                                 play on load (hero intro)
 *   · [data-speed]                                        scrubbed parallax drift
 *   · [data-count]                                        animated number count-up
 *     (data-count-suffix, data-count-decimals)
 *
 * Pass `dep` to (re)initialize once async content is ready (e.g. data?.id).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  dep?: unknown,
): RefObject<T> {
  const ref = useRef<T>(null);
  const depKey = useMemo(() => `${dep ?? ''}`, [dep]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (PREFERS_REDUCED_MOTION) return;

    const ctx = gsap.context(() => {
      /* Hero entrance — plays once on load */
      gsap.utils.toArray<HTMLElement>('[data-hero-animate]', root).forEach((element) => {
        gsap.fromTo(
          element,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            delay: Number(element.dataset.heroDelay ?? 0),
            ease: 'power3.out',
          },
        );
      });

      /* Staggered batches — direct children of [data-reveal-stagger] */
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]', root).forEach((batch) => {
        const children = gsap.utils.toArray<HTMLElement>(batch.children);
        if (!children.length) return;
        gsap.fromTo(
          children,
          { y: SCROLL_DISTANCE * 0.62, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            delay: parseFloatAttr(batch, 'staggerDelay') ?? 0,
            stagger: parseFloatAttr(batch, 'staggerStagger') ?? 0.09,
            ease: 'power3.out',
            scrollTrigger: { trigger: batch, start: 'top 85%', once: true },
          },
        );
      });

      /* Single reveals */
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((element) => {
        const kind = (element.dataset.reveal as RevealKind) || 'up';
        const from = REVEAL_FROM[kind] ?? REVEAL_FROM.up;
        const to = REVEAL_TO[kind] ?? REVEAL_TO.up;
        gsap.fromTo(element, from, {
          ...to,
          duration: 1.05,
          delay: (parseFloatAttr(element, 'revealDelay') ?? 0) / 1000,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: element,
            start: element.dataset.revealStart ?? 'top 87%',
            once: true,
          },
        });
      });

      /* Scrub-produced parallax drift — data-speed="0.15" etc. */
      gsap.utils.toArray<HTMLElement>('[data-speed]', root).forEach((element) => {
        const amount = parseFloatAttr(element, 'speed') ?? 0;
        if (!amount) return;
        gsap.fromTo(
          element,
          { yPercent: -amount * 7 },
          {
            yPercent: amount * 7,
            ease: 'none',
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      /* Animated counters */
      gsap.utils.toArray<HTMLElement>('[data-count]', root).forEach((element) => {
        const target = Number(element.dataset.count);
        const decimals = parseFloatAttr(element, 'countDecimals') ?? 0;
        const suffix = element.dataset.countSuffix ?? '';
        if (!Number.isFinite(target)) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          onUpdate: () => {
            element.textContent = `${counter.value.toFixed(decimals)}${suffix}`;
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [depKey]);

  return ref;
}

/** Kill every active ScrollTrigger (used on route teardown). */
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/** Brief fade-in for content that mounts after data arrives. */
export function fadeInUp(element: HTMLElement, delay = 0) {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.7, delay, ease: 'power3.out' },
  );
}