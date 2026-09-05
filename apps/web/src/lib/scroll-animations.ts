import { useEffect, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SCROLL_DISTANCE = 38;

type RevealKind = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

const REVEAL_FROM: Record<RevealKind, gsap.TweenVars> = {
  up: { y: SCROLL_DISTANCE, opacity: 0 },
  down: { y: -SCROLL_DISTANCE, opacity: 0 },
  left: { x: SCROLL_DISTANCE, opacity: 0 },
  right: { x: -SCROLL_DISTANCE, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.92, opacity: 0 },
};

const REVEAL_TO: Record<RevealKind, gsap.TweenVars> = {
  up: { y: 0, opacity: 1 },
  down: { y: 0, opacity: 1 },
  left: { x: 0, opacity: 1 },
  right: { x: 0, opacity: 1 },
  fade: { opacity: 1 },
  scale: { scale: 1, opacity: 1 },
};

/**
 * Sets up GSAP ScrollTrigger reveal + parallax animations for everything
 * inside the returned ref's subtree. Pass `dep` to (re)initialize once
 * async content is ready (e.g. `data?.id`).
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLDivElement>(recipe?.id);
 *   <div ref={ref}> ... sections marked with data-reveal / data-reveal-stagger ...
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  dep?: unknown,
): RefObject<T> {
  const ref = useRef<T>(null);
  const depKey = useMemo(() => `${dep ?? ''}`, [dep]);

  useEffect(() => {
    const root = ref.current;
    if (!root || REDUCED_MOTION) return;

    const ctx = gsap.context(() => {
      /* Staggered batches — direct children of [data-reveal-stagger] */
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]', root).forEach((batch) => {
        const children = gsap.utils.toArray<HTMLElement>(batch.children);
        if (!children.length) return;
        gsap.fromTo(
          children,
          { y: SCROLL_DISTANCE * 0.7, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: batch, start: 'top 84%', once: true },
          },
        );
      });

      /* Single elements marked with data-reveal */
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((el) => {
        const kind = (el.dataset.reveal as RevealKind) || 'up';
        const from = REVEAL_FROM[kind] ?? REVEAL_FROM.up;
        const to = REVEAL_TO[kind] ?? REVEAL_TO.up;
        gsap.fromTo(el, from, {
          ...to,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });

      /* Hero parallax (scrubbed on scroll) */
      const hero = root.querySelector<HTMLElement>('.forest-hero');
      const heroImage = root.querySelector<HTMLElement>('.forest-hero-image');
      const heroContent = root.querySelector<HTMLElement>('.forest-hero-content');
      if (hero) {
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
        if (heroImage) {
          gsap.fromTo(heroImage, { yPercent: -6 }, { yPercent: 7, ease: 'none', scrollTrigger: scrub });
        }
        if (heroContent) {
          gsap.to(heroContent, {
            yPercent: 14,
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: scrub,
          });
        }
      }

      /* Feature grid cards — soft rise on entry (pairs with .motion-rise fallback) */
      gsap.utils.toArray<HTMLElement>('.featured-grid > a, .recipe-grid > a', root).forEach((card) => {
        gsap.fromTo(
          card,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: card.parentElement, start: 'top 82%', once: true },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [depKey]);

  return ref;
}

/** Kills all active ScrollTrigger instances (useful before route teardown if ever needed). */
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}