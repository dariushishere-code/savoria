import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bookmark, Clock3, LogOut, Mail, Sparkles, Star, UserRound } from 'lucide-react';
import { fetchFavorites, type RecipeListItem } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useScrollReveal } from '../lib/scroll-animations';

function ProfileRecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const image = recipe.heroImageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';
  return (
    <Link to={`/recipe/${recipe.slug}`} className="group card-hover overflow-hidden rounded-2xl border border-charcoal-100 bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={image}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85';
          }}
        />
        {recipe.cuisine && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-charcoal-700 backdrop-blur">
            {recipe.cuisine.name}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-charcoal-400">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" /> {recipe.ratingAverage.toFixed(1)}
          </span>
          {recipe.totalTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> {recipe.totalTimeMinutes}m
            </span>
          )}
        </div>
        <h3 className="mt-2 font-display text-xl text-charcoal-900">{recipe.title}</h3>
      </div>
    </Link>
  );
}

export function ProfilePage() {
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const scope = useScrollReveal<HTMLDivElement>(user?.id);

  const favorites = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => fetchFavorites(accessToken!),
    enabled: !!accessToken,
  });

  if (isLoading) return <div className="container-app py-16">Loading…</div>;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: '/profile' }} />;
  }

  return (
    <div ref={scope} className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-image" />
        <div className="profile-hero-shade" />
        <div className="container-app profile-hero-inner">
          <div className="profile-card" data-reveal="up">
            <div className="profile-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <UserRound className="h-9 w-9" />
              )}
            </div>
            <div className="profile-meta">
              <p className="profile-kicker"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
              <h1>{user.name || 'Home cook'}</h1>
              <p className="profile-sub">
                {user.emailVerified ? 'Verified cook' : 'Email not verified'} ·{' '}
                {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'Savoria team' : 'Savoria member'}
              </p>
            </div>
            <div className="profile-actions">
              <Link to="/ai" className="profile-btn profile-btn-primary">
                <Sparkles className="h-4 w-4" /> Ask the AI chef
              </Link>
              <button
                type="button"
                className="profile-btn profile-btn-ghost"
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app profile-content">
        <div className="profile-section-head" data-reveal="fade">
          <div>
            <p className="eyebrow">Your table</p>
            <h2 className="section-heading mt-2">Saved recipes.</h2>
          </div>
          <Link to="/recipes" className="text-link">
            Browse more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {favorites.isLoading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        )}

        {favorites.isError && (
          <p className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            We could not load your saved recipes right now.
          </p>
        )}

        {!favorites.isLoading && !favorites.isError && (favorites.data?.data?.length ?? 0) === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-charcoal-200 bg-white p-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-charcoal-300" />
            <h3 className="mt-4 font-display text-2xl">Nothing saved yet</h3>
            <p className="mt-2 text-sm text-charcoal-500">
              Save recipes as you browse — they will show up here for quick access.
            </p>
            <Link to="/recipes" className="btn-primary mt-6">
              Explore recipes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {favorites.data?.data?.map((recipe) => (
            <ProfileRecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
}