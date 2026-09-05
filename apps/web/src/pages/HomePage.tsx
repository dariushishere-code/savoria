import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChefHat, Sparkles } from 'lucide-react';
import { fetchRecipes, type RecipeListItem } from '../lib/api';
import { useScrollReveal } from '../lib/scroll-animations';
import { useMagnetic } from '../lib/motion';
import { RecipeCard } from '../components/RecipeCard';

const MARQUEE_WORDS = ['Braise', 'Sear', 'Roast', 'Whip', 'Fold', 'Simmer', 'Grill', 'Taste'];

function Hero() {
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.24);

  return (
    <section className="home-hero" id="top">
      <div className="hero-aura hero-aura-a" aria-hidden="true" />
      <div className="hero-aura hero-aura-b" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-float hero-float-1" data-speed="0.2" aria-hidden="true">🍋</div>
      <div className="hero-float hero-float-2" data-speed="-0.26" aria-hidden="true">🫒</div>
      <div className="hero-float hero-float-3" data-speed="0.12" aria-hidden="true">🌿</div>

      <div className="container-app hero-content">
        <span className="hero-eyebrow" data-hero-animate>
          <Sparkles className="h-3.5 w-3.5" />
          &nbsp;Good food, thoughtfully made
        </span>
        <h1 className="hero-title" data-hero-animate data-hero-delay="0.1">
          Cook with <span className="hero-accent">confidence</span>, eat with
          joy<span className="brand-dot">.</span>
        </h1>
        <p className="hero-sub" data-hero-animate data-hero-delay="0.22">
          Savoria pairs meticulously tested recipes with a friendly AI chef that adapts to
          your pantry, your time, and your taste — so every meal feels like the best version of itself.
        </p>
        <div className="hero-actions" data-hero-animate data-hero-delay="0.34">
          <Link ref={ctaRef} to="/recipes" className="btn-primary btn-lg">
            Explore recipes <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/ai" className="btn-ghost btn-lg">
            Meet the AI Chef
          </Link>
        </div>
        <div className="hero-proof" data-hero-animate data-hero-delay="0.46">
          <div className="proof-avatars" aria-hidden="true">
            {['SA', 'MK', 'JL'].map((initials) => (
              <span key={initials}>{initials}</span>
            ))}
          </div>
          <p>
            Loved by <strong>12,000+</strong> home cooks around the world
          </p>
        </div>
      </div>

      <div className="hero-scroll-cue" data-hero-animate data-hero-delay="0.8" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <div key={half} className="marquee-group">
            {MARQUEE_WORDS.map((word) => (
              <span key={`${half}-${word}`} className="marquee-word">
                {word} <em>·</em>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const [featured, setFeatured] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRecipes({ sort: 'top-rated', page: 1, pageSize: 3 })
      .then((result) => {
        if (!cancelled) {
          setFeatured(result.data.slice(0, 3));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={revealRef}>
      <Hero />
      <Marquee />

      <section className="section-home" id="explore">
        <div className="container-app">
          <div className="section-head" data-reveal="up">
            <div>
              <span className="section-kicker">Picked for you</span>
              <h2 className="section-title">Trending on the table</h2>
            </div>
            <Link to="/recipes" className="btn-ghost section-link">
              View all recipes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="card-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="recipe-card-skeleton" />
              ))}
            </div>
          ) : (
            <div className="card-grid featured-grid" data-reveal-stagger>
              {featured.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
<section className="section-home section-alt" id="about">
        <div className="container-app about-grid">
          <div className="about-visual" data-reveal="left">
            <div className="about-visual-frame">
              <div className="about-visual-grid" aria-hidden="true" />
              <span className="about-badge">Est. with love</span>
            </div>
          </div>

          <div className="about-copy">
            <span className="section-kicker" data-reveal="up">
              Our story
            </span>
            <h2 className="section-title" data-reveal="up">
              Recipes you can trust, guidance you‘ll love
            </h2>
            <p className="about-lead" data-reveal="up">
              Every dish at Savoria is cooked, edited, and tested before it reaches you. We obsess
              over the details — temperatures, textures, timings — so your kitchen time becomes
              calm, creative, and deliciously predictable.
            </p>
            <div className="stats-row" data-reveal="up">
              <div className="stat">
                <strong>
                  <span data-count="250" data-count-suffix="+">0</span>
                </strong>
                <span className="stat-label">Crafted recipes</span>
              </div>
              <div className="stat">
                <strong>
                  <span data-count="12" data-count-decimals="1" data-count-suffix="k+">0</span>
                </strong>
                <span className="stat-label">Happy cooks</span>
              </div>
              <div className="stat">
                <strong>
                  <span data-count="4.8" data-count-decimals="1">0</span>
                </strong>
                <span className="stat-label">Average rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-home">
        <div className="container-app">
          <div className="ai-banner" data-reveal="scale">
            <div className="ai-banner-glow" aria-hidden="true" />
            <div className="ai-banner-copy">
              <span className="section-kicker">The AI Chef</span>
              <h2 className="section-title">Stuck on “what‘s for dinner?”</h2>
              <p>
                Tell the AI Chef what you have on hand and how much time you have. It will turn it
                into a plate you‘re proud of — with substitutions and step-by-step guidance.
              </p>
              <Link to="/ai" className="btn-primary">
                <ChefHat className="h-4 w-4" /> Ask the AI Chef
              </Link>
            </div>
            <div className="ai-banner-art" aria-hidden="true">
              <span className="ai-bubble">“Looks like you have cherry tomatoes…”</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}