import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE_OUT_EXPO: gsap.EaseFunction = (p: number) =>
  p === 1 ? 1 : 1 - Math.pow(2, -10 * p);

/* ────────────────────────────────────────────────────────────────
   Smooth scroll (Lenis) synced with GSAP ScrollTrigger.
   Falls back to native scrolling when reduced motion is preferred.
   ──────────────────────────────────────────────────────────────── */

type SmoothScrollValue = {
  lenis: Lenis | null;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
};

const SmoothScrollContext = createContext<SmoothScrollValue>({
  lenis: null,
  scrollTo: () => undefined,
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (PREFERS_REDUCED_MOTION) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: EASE_OUT_EXPO,
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.clearScrollMemory?.();
    };
  }, []);

  const scrollTo = useCallback<SmoothScrollValue['scrollTo']>(
    (target, options = {}) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, {
          offset: options.offset ?? 0,
          duration: options.immediate ? 0 : 1.2,
          easing: EASE_OUT_EXPO,
        });
        return;
      }
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: options.immediate ? 'auto' : 'smooth' });
      } else if (typeof target === 'string') {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        target?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [],
  );

  const value = useMemo(() => ({ lenis: lenisRef.current, scrollTo }), [scrollTo]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

/* ────────────────────────────────────────────────────────────────
   Entrance loader — a brief, branded veil that lifts on first paint.
   ──────────────────────────────────────────────────────────────── */

export function EntranceLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const characters = gsap.utils.toArray<HTMLElement>('.loader-character');
      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(root, { display: 'none' });
        },
      });
      timeline
        .fromTo(
          characters,
          { yPercent: 110, rotate: 4 },
          { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.045, ease: 'power3.out' },
        )
        .fromTo(
          '.loader-line',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: 'power3.inOut' },
          '-=0.35',
        )
        .to(
          root,
          { yPercent: -100, duration: 0.85, ease: 'power4.inOut' },
          '+=0.15',
        );
    }, root);

    return () => ctx.revert();
  }, []);

  if (PREFERS_REDUCED_MOTION) return null;

  const brand = 'Savoria';
  return (
    <div ref={rootRef} className="entrance-loader" aria-hidden="true">
      <div className="entrance-loader-inner">
        <span className="entrance-kicker">Discover · Cook · Savor</span>
        <span className="entrance-word" aria-label="Savoria">
          {Array.from(brand).map((letter, index) => (
            <span className="loader-character-wrap" key={`${letter}-${index}`}>
              <span className="loader-character">{letter}</span>
            </span>
          ))}
        </span>
        <span className="loader-line" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Magnetic hover — buttons/nav drift subtly toward the cursor.
   ──────────────────────────────────────────────────────────────── */

const CAN_USE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.32) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || PREFERS_REDUCED_MOTION || !CAN_USE_POINTER) return;

    const xTo = gsap.quickTo(element, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return ref;
}