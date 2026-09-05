import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PREFERS_REDUCED_MOTION } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

const CAN_USE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

/**
 * Per-card entrance + pointer-tilt hover. Each RecipeCard self-initializes,
 * so grids can be rendered with zero additional wiring. Use the cards'
 * parent as a `data-reveal-stagger` target instead if you want grouped stagger.
 */
export function useScrollRevealCard() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let ctx: gsap.Context | undefined;

    if (!PREFERS_REDUCED_MOTION) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          root,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: root, start: 'top 88%', once: true },
          },
        );
      });
    }

    if (!CAN_USE_POINTER || PREFERS_REDUCED_MOTION) {
      return () => ctx?.revert();
    }

    const image = root.querySelector('.recipe-card-media') as HTMLElement | null;
    const rotateX = gsap.quickTo(root, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotateY = gsap.quickTo(root, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const imgY = gsap.quickTo(image ?? root, 'yPercent', { duration: 0.9, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 9);
      rotateX(-py * 9);
      imgY(-py * 8);
      gsap.to(root, {
        boxShadow: `0 24px 60px -18px rgba(0,0,0,${0.28 + Math.abs(px) * 0.08})`,
        duration: 0.4,
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
      imgY(0);
      gsap.to(root, { boxShadow: '0 4px 18px rgba(0,0,0,0.14)', duration: 0.5, overwrite: 'auto' });
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      ctx?.revert();
    };
  }, []);

  return ref;
}