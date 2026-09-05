import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlarmClock,
  ArrowLeft,
  ChefHat,
  Clock,
  Flame,
  Heart,
  Leaf,
  MessageCircle,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import {
  addComment,
  addFavorite,
  fetchComments,
  fetchRecipe,
  fetchRecipes,
  rateRecipe,
  removeFavorite,
  type RecipeDetail,
  type RecipeListItem,
} from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useScrollReveal } from '../lib/scroll-animations';
import { RecipeCard } from '../components/RecipeCard';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

function toHoursMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const RATING: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
    EXPERT: 'Expert',
  };
  return (
    <span className="detail-chip">
      <Flame className="h-4 w-4" />
      {RATING[difficulty] ?? difficulty}
    </span>
  );
}

function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange?: (score: number) => void;
  disabled?: boolean;
}) {
  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          className={`star-btn ${score <= Math.round(value) ? 'is-filled' : ''}`}
          onClick={() => onChange?.(score)}
          aria-label={`Rate ${score} out of 5`}
        >
          <Star className="h-4 w-4" />
        </button>
      ))}
    </span>
  );
}

export function RecipeDetailPage() {
  const { slug = '' } = useParams();
  const revealRef = useScrollReveal<HTMLDivElement>(slug);
  const { user, accessToken, isAuthenticated } = useAuth();
  const toastApi = useToast();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<RecipeListItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRecipe(null);
    setNotFound(false);
    setCommentText('');
    setChecked(new Set());

    fetchRecipe(slug)
      .then((result) => {
        if (cancelled) return;
        setRecipe(result);
        fetchRecipes({ cuisine: result.cuisine?.slug, page: 1, pageSize: 3 })
          .then((rel) => {
            if (!cancelled) setRelated(rel.data.filter((item) => item.id !== result.id).slice(0, 3));
          })
          .catch(() => undefined);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });

    fetchComments(slug)
      .then((result) => {
        if (!cancelled) setComments(result.data);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || !user || !recipe) return;
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await removeFavorite(recipe.id, accessToken ?? '');
        setIsFavorite(false);
        toastApi.push('success', { title: 'Removed from favorites' });
      } else {
        await addFavorite(recipe.id, accessToken ?? '');
        setIsFavorite(true);
        toastApi.push('success', {
          title: 'Saved to your favorites',
          message: 'Find it again on your profile.',
        });
      }
    } catch {
      toastApi.push('error', {
        title: 'Couldn‘t update favorites',
        message: 'Please try again in a moment.',
      });
    } finally {
      setFavoriteBusy(false);
    }
  }, [isAuthenticated, user, recipe, isFavorite, accessToken, toastApi]);

  const submitRating = useCallback(
    async (score: number) => {
      if (!recipe || !accessToken) return;
      try {
        await rateRecipe(recipe.id, score, accessToken);
        setMyRating(score);
        toastApi.push('success', { title: `Thanks — rated ${score}/5` });
      } catch {
        toastApi.push('error', { title: 'Couldn‘t submit your rating' });
      }
    },
    [recipe, accessToken, toastApi],
  );

  const submitComment = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!recipe || !accessToken || !commentText.trim()) return;
      setCommentBusy(true);
      try {
        const created = await addComment(recipe.id, commentText.trim(), accessToken);
        const comment: Comment = {
          id: created.id,
          content: commentText.trim(),
          createdAt: new Date().toISOString(),
          user: {
            id: user?.id ?? '',
            name: user?.name ?? 'You',
            avatarUrl: user?.avatarUrl ?? null,
          },
        };
        setComments((current) => [comment, ...current]);
        setCommentText('');
        toastApi.push('success', { title: 'Comment posted' });
      } catch {
        toastApi.push('error', { title: 'Couldn‘t post your comment' });
      } finally {
        setCommentBusy(false);
      }
    },
    [recipe, accessToken, commentText, user, toastApi],
  );

  if (notFound) {
    return (
      <div className="container-app empty-state page-state-pad">
        <span className="empty-emoji" aria-hidden="true">🍳</span>
        <h1>That recipe wandered off</h1>
        <p>We couldn‘t find a dish at this address — it may have moved to the archives.</p>
        <Link to="/recipes" className="btn-primary">
          <ArrowLeft className="h-4 w-4" /> Back to recipes
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="detail-skeleton">
        <div className="detail-skeleton-hero" />
        <div className="container-app">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-line" style={{ width: `${100 - i * 12}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const toggleIngredient = (id: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div ref={revealRef}>
      <section className="detail-hero">
        {recipe.heroImageUrl && <img src={recipe.heroImageUrl} alt="" data-speed="0.14" />}
        <div className="detail-hero-shade" aria-hidden="true" />
        <div className="container-app detail-hero-inner" data-hero-animate data-hero-delay="0.1">
          <Link to="/recipes" className="detail-back">
            <ArrowLeft className="h-4 w-4" /> All recipes
          </Link>
          <div className="detail-tags">
            {recipe.category && <span className="recipe-category">{recipe.category.name}</span>}
            {recipe.cuisine && <span className="recipe-tag">{recipe.cuisine.name}</span>}
            {recipe.diets.slice(0, 2).map((diet) => (
              <span key={diet.id} className="recipe-tag">{diet.name}</span>
            ))}
          </div>
          <h1 className="detail-title">{recipe.title}</h1>
          {recipe.description && <p className="detail-lead">{recipe.description}</p>}
          <div className="detail-meta">
            {recipe.totalTimeMinutes && (
              <span className="detail-chip">
                <Clock className="h-4 w-4" /> {toHoursMinutes(recipe.totalTimeMinutes)}
              </span>
            )}
            <span className="detail-chip">
              <UtensilsCrossed className="h-4 w-4" /> Serves {recipe.servings}
            </span>
            {recipe.calories && (
              <span className="detail-chip">
                <Flame className="h-4 w-4" /> {recipe.calories} kcal
              </span>
            )}
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.author && recipe.author.name && (
              <span className="detail-author">
                <ChefHat className="h-4 w-4" /> by {recipe.author.name}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="detail-actions" data-reveal="up">
        <button
          type="button"
          className={`btn-ghost fav-btn ${isFavorite ? 'is-favorited' : ''}`}
          onClick={toggleFavorite}
          disabled={favoriteBusy || !isAuthenticated}
        >
          <Heart className="h-4 w-4" />
          {isFavorite ? 'Saved' : 'Save recipe'}
        </button>
        <div className="detail-rating">
          <span className="detail-rating-score">{recipe.ratingAverage.toFixed(1)}</span>
          <RatingStars
            value={myRating || recipe.ratingAverage}
            onChange={isAuthenticated ? submitRating : undefined}
            disabled={!isAuthenticated}
          />
          <span className="detail-rating-count">{recipe.ratingCount} ratings</span>
        </div>
        {!isAuthenticated && (
          <Link to="/login" className="btn-link">
            Sign in to save & rate
          </Link>
        )}
      </div>
<div className="container-app detail-layout">
        <aside className="detail-sidebar" data-reveal="up">
          <div className="panel-card ingredients-panel">
            <h2 className="panel-title">Ingredients</h2>
            <ul className="ingredient-list">
              {recipe.ingredients.map((item) => {
                const label = [
                  item.amount != null ? item.amount : '',
                  item.unit ?? '',
                  item.name ?? item.ingredient?.name ?? '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={item.id}>
                    <label className={`ingredient-row ${checked.has(item.id) ? 'is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked.has(item.id)}
                        onChange={() => toggleIngredient(item.id)}
                      />
                      <span className="ingredient-check" aria-hidden="true" />
                      <span className="ingredient-label">
                        {label}
                        {item.note && <em> — {item.note}</em>}
                        {item.optional && <em className="ingredient-optional"> (optional)</em>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="ingredients-count">
              {checked.size} of {recipe.ingredients.length} gathered
            </div>
          </div>

          {recipe.nutrition && (
            <div className="panel-card nutrition-panel" data-reveal="up">
              <h2 className="panel-title">
                <Leaf className="h-4 w-4" /> Per serving
              </h2>
              <dl className="nutrition-grid">
                {[
                  ['Calories', recipe.nutrition.calories],
                  ['Protein', recipe.nutrition.protein],
                  ['Carbs', recipe.nutrition.carbs],
                  ['Fat', recipe.nutrition.fat],
                  ['Fiber', recipe.nutrition.fiber],
                ].map(([label, value]) => (
                  <div key={label} className="nutrition-item">
                    <dt>{label}</dt>
                    <dd>{value != null ? `${value}g` : '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>

        <div className="detail-main">
          <section className="panel-card" data-reveal="up">
            <h2 className="panel-title">Method</h2>
            <ol className="steps-list">
              {recipe.instructions.map((step) => (
                <li key={step.id} className="step">
                  <span className="step-number">{step.stepNumber}</span>
                  <div className="step-body">
                    {step.title && <h3>{step.title}</h3>}
                    <p>{step.content}</p>
                    {step.tip && <p className="step-tip">💡 {step.tip}</p>}
                    {step.timerSeconds ? (
                      <span className="step-timer">
                        <AlarmClock className="h-3.5 w-3.5" /> {Math.round(step.timerSeconds / 60)} min
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {(recipe.tips || recipe.chefNotes) && (
            <aside className="chef-note" data-reveal="up">
              <ChefHat className="chef-note-icon" />
              <div>
                <h3>From the chef</h3>
                {recipe.tips && <p>{recipe.tips}</p>}
                {recipe.chefNotes && <p>{recipe.chefNotes}</p>}
              </div>
            </aside>
          )}
<section className="comments-section" data-reveal="up">
            <h2 className="panel-title">
              <MessageCircle className="h-4 w-4" /> Comments
              <span className="comment-count">{comments.length}</span>
            </h2>

            {isAuthenticated ? (
              <form className="comment-form" onSubmit={submitComment}>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Made this? Share how it went…"
                  rows={3}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={commentBusy || !commentText.trim()}
                >
                  {commentBusy ? 'Posting…' : 'Post comment'}
                </button>
              </form>
            ) : (
              <p className="comment-login-prompt">
                <Link to="/login">Sign in</Link> to join the conversation.
              </p>
            )}

            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment">
                  <span className="comment-avatar" aria-hidden="true">
                    {comment.user.avatarUrl ? (
                      <img src={comment.user.avatarUrl} alt="" />
                    ) : (
                      comment.user.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="comment-body">
                    <strong>{comment.user.name}</strong>
                    <time dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <p>{comment.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-home related-section">
          <div className="container-app">
            <div className="section-head" data-reveal="up">
              <div>
                <span className="section-kicker">Keep exploring</span>
                <h2 className="section-title">More from the same kitchen</h2>
              </div>
            </div>
            <div className="card-grid" data-reveal-stagger>
              {related.map((recipeItem, i) => (
                <RecipeCard key={recipeItem.id} recipe={recipeItem} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}