import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchCategories, type Category } from '../lib/api';
import { useRecipes } from '../hooks/use-recipes';
import { useScrollReveal } from '../lib/scroll-animations';
import { RecipeCard } from '../components/RecipeCard';

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
  { value: 'EXPERT', label: 'Expert' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'top-rated', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'views', label: 'Most viewed' },
];

export function RecipesPage() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const { data, meta, loading, filters, setFilter, page, goToPage } = useRecipes();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([]);
      });
  }, []);

  const activeFilterCount = [filters.difficulty, filters.category].filter(Boolean).length;

  return (
    <div ref={revealRef} className="recipes-page">
      <section className="page-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container-app page-hero-inner">
          <span className="section-kicker" data-hero-animate>
            The library
          </span>
          <h1 className="page-title" data-hero-animate data-hero-delay="0.08">
            Recipes worth making
          </h1>
          <p className="page-sub" data-hero-animate data-hero-delay="0.16">
            Tested, tasted, and timed — search the collection and find tonight‘s dinner.
          </p>

          <div className="search-bar" data-hero-animate data-hero-delay="0.26">
            <Search className="search-bar-icon" />
            <input
              type="search"
              value={filters.q ?? ''}
              onChange={(event) => setFilter({ q: event.target.value })}
              placeholder="Try “cozy pasta” or “30-minute dinners”…"
              aria-label="Search recipes"
            />
            {filters.q && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setFilter({ q: '' })}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container-app recipes-content">
<div className="recipes-toolbar">
          <button
            type="button"
            className={`btn-ghost filter-toggle ${filtersOpen ? 'is-active' : ''}`}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>

          {categories.length > 0 && (
            <div className="chip-scroll" aria-label="Filter by category">
              <button
                type="button"
                className={`chip ${!filters.category ? 'is-active' : ''}`}
                onClick={() => setFilter({ category: '' })}
              >
                All
              </button>
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`chip ${filters.category === category.slug ? 'is-active' : ''}`}
                  onClick={() =>
                    setFilter({ category: filters.category === category.slug ? '' : category.slug })
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          <div className="sort-select-wrap">
            <select
              value={filters.sort ?? 'featured'}
              onChange={(event) => setFilter({ sort: event.target.value })}
              aria-label="Sort recipes"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`filter-panel ${filtersOpen ? 'is-open' : ''}`}>
          <span className="filter-label">Difficulty</span>
          <div className="chip-row">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`chip ${filters.difficulty === option.value ? 'is-active' : ''}`}
                onClick={() =>
                  setFilter({
                    difficulty: filters.difficulty === option.value ? '' : option.value,
                  })
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="recipe-card-skeleton" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state" data-reveal="up">
            <span className="empty-emoji" aria-hidden="true">🍽️</span>
            <h3>No recipes match yet</h3>
            <p>Try a different search term, or clear a filter or two.</p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setFilter({ q: '', difficulty: '', category: '' })}
            >
              Clear everything
            </button>
          </div>
        ) : (
          <>
            <div className="card-grid" data-reveal-stagger>
              {data.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={!meta.hasPrev}
                  onClick={() => goToPage(page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {meta.totalPages} · {meta.total} recipes
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={!meta.hasNext}
                  onClick={() => goToPage(page + 1)}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}