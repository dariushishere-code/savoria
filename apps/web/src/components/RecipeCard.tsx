import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Star } from 'lucide-react';
import type { RecipeListItem } from '../lib/api';
import { useScrollRevealCard } from './scroll-card-animations';

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  EXPERT: 'Expert',
};

function difficultyColor(difficulty: string) {
  if (difficulty === 'EASY') return 'is-safe';
  if (difficulty === 'HARD' || difficulty === 'EXPERT') return 'is-spicy';
  return 'is-medium';
}

export function RecipeCard({ recipe, index = 0 }: { recipe: RecipeListItem; index?: number }) {
  const cardRef = useScrollRevealCard();

  return (
    <Link
      ref={cardRef}
      to={`/recipes/${recipe.slug}`}
      className="recipe-card"
      style={{ transitionDelay: `${(index % 6) * 40}ms` }}
    >
      <div className="recipe-card-media">
        <div className="recipe-card-image">
          <img
            src={recipe.heroImageUrl ?? undefined}
            alt={recipe.title}
            loading="lazy"
            onError={(event) => {
              const img = event.currentTarget;
              img.style.opacity = '0';
            }}
          />
        </div>
        <div className="recipe-card-shade" aria-hidden="true" />
        <span className="recipe-card-difficulty">
          <span className={`difficulty-dot ${difficultyColor(recipe.difficulty)}`} />
          {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
        </span>
        <span className="recipe-card-arrow" aria-hidden="true">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="recipe-card-body">
        <div className="recipe-card-tags">
          {recipe.category && <span className="recipe-category">{recipe.category.name}</span>}
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag.id} className="recipe-tag">
              {tag.name}
            </span>
          ))}
        </div>
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-description">
          {recipe.description ?? 'A thoughtfully crafted Savoria recipe.'}
        </p>
        <div className="recipe-card-meta">
          {recipe.totalTimeMinutes && (
            <span className="recipe-meta-chip">
              <Clock className="h-3.5 w-3.5" />
              {recipe.totalTimeMinutes} min
            </span>
          )}
          <span className="recipe-meta-chip">
            <Star className="h-3.5 w-3.5" />
            {recipe.ratingAverage.toFixed(1)}
            <span className="recipe-meta-count">({recipe.ratingCount})</span>
          </span>
        </div>
      </div>
    </Link>
  );
}