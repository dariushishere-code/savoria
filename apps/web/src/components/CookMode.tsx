import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type { RecipeDetail } from '../lib/api';

type CookModeProps = {
  recipe: RecipeDetail;
  onClose: () => void;
};

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function CookMode({ recipe, onClose }: CookModeProps) {
  const steps = useMemo(
    () => [...recipe.instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [recipe.instructions],
  );
  const ingredients = useMemo(() => {
    const sorted = [...recipe.ingredients].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted;
  }, [recipe.ingredients]);

  const [stepIndex, setStepIndex] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'cooking' | 'done'>('cooking');
  const [timer, setTimer] = useState<{ total: number; remaining: number; running: boolean } | null>(null);
  const [timerDone, setTimerDone] = useState(false);

  const stepRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[stepIndex];

  /* Step transition animation */
  useEffect(() => {
    if (!stepRef.current) return;
    gsap.fromTo(
      stepRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    );
  }, [stepIndex]);

  /* Initialize / reset timer when the step changes */
  useEffect(() => {
    const seconds = currentStep?.timerSeconds;
    if (seconds && seconds > 0) {
      setTimer({ total: seconds, remaining: seconds, running: false });
      setTimerDone(false);
    } else {
      setTimer(null);
      setTimerDone(false);
    }
  }, [stepIndex, currentStep?.timerSeconds]);

  /* Countdown */
  useEffect(() => {
    if (!timer || !timer.running || timer.remaining <= 0) return;
    const id = window.setInterval(() => {
      setTimer((current) => {
        if (!current) return current;
        const next = current.remaining - 1;
        if (next <= 0) {
          window.clearInterval(id);
          setTimerDone(true);
          return { ...current, remaining: 0, running: false };
        }
        return { ...current, remaining: next };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer?.running, timer?.remaining]);

  const goToPrevious = useCallback(() => {
    if (phase !== 'cooking') return;
    setStepIndex((index) => Math.max(0, index - 1));
  }, [phase]);

  const goToNext = useCallback(() => {
    if (phase !== 'cooking') return;
    if (stepIndex >= steps.length - 1) {
      setPhase('done');
      return;
    }
    setStepIndex((index) => index + 1);
  }, [phase, stepIndex, steps.length]);

  /* Lock body scroll + keyboard shortcuts */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'ArrowLeft') goToPrevious();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, goToNext, goToPrevious]);

  const toggleIngredient = (id: string) => {
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTimer = () => {
    if (!timer) return;
    setTimer((current) => {
      if (!current) return current;
      if (current.remaining <= 0) {
        setTimerDone(false);
        return { ...current, remaining: current.total, running: true };
      }
      return { ...current, running: !current.running };
    });
  };

  const resetTimer = () => {
    if (!timer) return;
    setTimer({ ...timer, remaining: timer.total, running: false });
    setTimerDone(false);
  };

  const jumpToStep = (index: number) => {
    setStepIndex(index);
  };

  const cookAgain = () => {
    setStepIndex(0);
    setChecked(new Set());
    setPhase('cooking');
    setTimer(null);
    setTimerDone(false);
  };

  const ingredientProgress = checked.size;
  const ingredientTotal = ingredients.length;
  const stepProgress = ((stepIndex + 1) / Math.max(steps.length, 1)) * 100;

  return createPortal(
    <div className="cook-mode" role="dialog" aria-modal="true" aria-label={`Cook ${recipe.title}`}>
      <div className="cook-mode-header">
        <div className="cook-mode-brand">
          <span className="cook-mode-mark"><ChefHat className="h-5 w-5" /></span>
          <div>
            <strong>Cook mode</strong>
            <span>{recipe.title}</span>
          </div>
        </div>
        <div className="cook-mode-actions">
          <span className="cook-mode-keystrokes"><kbd>Esc</kbd> to close</span>
          <button type="button" className="cook-mode-close" onClick={onClose} aria-label="Exit cook mode">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="cook-mode-body">
        <aside className="cook-side">
          <div className="cook-side-card">
            <p className="cook-eyebrow">Ingredients</p>
            <p className="cook-check-count">{ingredientProgress}/{ingredientTotal} gathered</p>
            <div className="cook-check-track" role="progressbar" aria-valuenow={ingredientProgress} aria-valuemin={0} aria-valuemax={ingredientTotal}>
              <span style={{ width: `${ingredientTotal ? (ingredientProgress / ingredientTotal) * 100 : 0}%` }} />
            </div>
            <ul className="cook-ingredients">
              {ingredients.map((item) => {
                const name = item.name || item.ingredient?.name || '';
                const isChecked = checked.has(item.id);
                return (
                  <li key={item.id}>
                    <button type="button" className={`cook-ingredient ${isChecked ? 'is-checked' : ''}`} onClick={() => toggleIngredient(item.id)}>
                      <span className="cook-check">{isChecked && <Check className="h-3.5 w-3.5" />}</span>
                      <span className="cook-ingredient-text">
                        <strong>{name}</strong>
                        <em>{[item.amount, item.unit].filter(Boolean).join(' ')}{item.note ? ` — ${item.note}` : ''}</em>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="cook-side-card cook-progress-card">
            <p className="cook-eyebrow">Steps</p>
            <div className="cook-step-track" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={0} aria-valuemax={steps.length}>
              <span style={{ width: `${stepProgress}%` }} />
            </div>
            <ol className="cook-step-dots">
              {steps.map((step, index) => (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`cook-step-dot ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex || phase === 'done' ? 'is-done' : ''}`}
                    onClick={() => jumpToStep(index)}
                    aria-label={`Jump to step ${step.stepNumber}`}
                    aria-current={index === stepIndex ? 'step' : undefined}
                  >
                    {index < stepIndex || phase === 'done' ? <Check className="h-3 w-3" /> : index + 1}
                  </button>
                </li>
              ))}
            </ol>
            <p className="cook-step-label">Step {currentStep?.stepNumber ?? steps.length} of {steps.length}</p>
          </div>

          <div className="cook-side-card cook-servings-card">
            <Clock3 className="h-4 w-4" />
            <span>{recipe.totalTimeMinutes ? `${Math.round(recipe.totalTimeMinutes)} min total` : 'Time to gather'} · {recipe.servings ?? 4} servings</span>
          </div>
        </aside>

        <main className="cook-main">
          {phase === 'done' ? (
            <div className="cook-done">
              <div className="cook-done-burst"><span /><span /><span /><span /><span /><span /></div>
              <div className="cook-done-mark"><Check className="h-10 w-10" /><Flame className="h-5 w-5 cook-flame" /></div>
              <p className="cook-eyebrow">Plated &amp; ready</p>
              <h2>{recipe.title} is<br /><em>done.</em></h2>
              <p className="cook-done-note">Beautiful work — this dish is ready for the table. Take a photo before it disappears.</p>
              <div className="cook-done-actions">
                <button type="button" className="cook-btn-primary" onClick={cookAgain}>
                  <RotateCcw className="h-4 w-4" /> Cook again
                </button>
                <button type="button" className="cook-btn-ghost" onClick={onClose}>
                  Exit cook mode
                </button>
              </div>
            </div>
          ) : (
            currentStep && (
              <div className="cook-step" ref={stepRef}>
                <div className="cook-step-meta">
                  <p className="cook-eyebrow">Step {currentStep.stepNumber} of {steps.length}</p>
                  {recipe.cuisine?.name && <span className="cook-cuisine">{recipe.cuisine.name}</span>}
                </div>
                <h2 className="cook-step-title">{currentStep.title || `Step ${currentStep.stepNumber}`}</h2>
                <p className="cook-step-content">{currentStep.content}</p>

                {currentStep.tip && (
                  <div className="cook-tip">
                    <span><Sparkles className="h-4 w-4" /></span>
                    <p><strong>Chef&apos;s tip</strong> — {currentStep.tip}</p>
                  </div>
                )}

                {timer && (
                  <div className={`cook-timer ${timerDone ? 'is-done' : ''}`}>
                    <div
                      className="cook-timer-ring"
                      style={{ '--timer-progress': `${timer.total ? ((timer.total - timer.remaining) / timer.total) * 100 : 0}%` } as React.CSSProperties}
                    >
                      <div className="cook-timer-core">
                        <span>{timerDone ? 'Done!' : formatTime(timer.remaining)}</span>
                        <small>{timerDone ? 'Time is up' : timer.running ? 'Cooking...' : 'Ready when you are'}</small>
                      </div>
                    </div>
                    <div className="cook-timer-actions">
                      <button type="button" className={`cook-btn-timer ${timer.running ? 'is-running' : ''}`} onClick={toggleTimer} aria-label={timer.running ? 'Pause timer' : timerDone ? 'Repeat timer' : 'Start timer'}>
                        {timerDone || timer.remaining <= 0 ? <RotateCcw className="h-4 w-4" /> : timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button type="button" className="cook-btn-timer" onClick={resetTimer} aria-label="Reset timer">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <span className="cook-timer-hint">The recipe suggests {Math.round((timer.total || 0) / 60)} min</span>
                    </div>
                  </div>
                )}

                <div className="cook-step-nav">
                  <button type="button" className="cook-btn-ghost" onClick={goToPrevious} disabled={stepIndex === 0}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </button>
                  <button type="button" className="cook-btn-primary" onClick={goToNext}>
                    {stepIndex >= steps.length - 1 ? <>Finish <Check className="h-4 w-4" /></> : <>Next step <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>,
    document.body,
  );
}