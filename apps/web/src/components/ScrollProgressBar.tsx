import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** A slim, springy progress bar pinned to the top of the viewport. */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const scrolled =
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      gsap.to(bar, { scaleX: scrolled, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}