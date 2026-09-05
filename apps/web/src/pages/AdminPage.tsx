import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChefHat, Users, UtensilsCrossed, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

type AdminTotals = {
  recipes?: number;
  users?: number;
  comments?: number;
  [key: string]: number | undefined;
};

export function AdminPage() {
  const { accessToken, isAdmin, isLoading } = useAuth();

  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () =>
      fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      }).then((r) => r.json() as Promise<{ data?: { totals?: AdminTotals } }>),
    enabled: !!accessToken && isAdmin,
  });

  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <div className="p-8">Admin access required.</div>;

  const totals = data?.data?.totals;

  const STAT_CARDS: { key: keyof AdminTotals; label: string; icon: typeof Users }[] = [
    { key: 'recipes', label: 'Recipes', icon: UtensilsCrossed },
    { key: 'users', label: 'Members', icon: Users },
    { key: 'comments', label: 'Comments', icon: MessageCircle },
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container-app admin-hero-inner" data-hero-animate>
          <Link to="/" className="admin-back">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <span className="section-kicker">
            <ChefHat className="h-3.5 w-3.5" /> &nbsp;Command center
          </span>
          <h1 className="page-title">Savoria Admin</h1>
          <p className="page-sub">A quick look at what‘s happening across the kitchen.</p>
        </div>
      </div>

      <div className="container-app admin-content">
        <div className="stat-grid">
          {STAT_CARDS.map(({ key, label, icon: Icon }) => {
            const value = totals?.[key];
            return (
              <div key={key} className="stat-card" data-reveal="up">
                <span className="stat-card-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="stat-card-label">{label}</p>
                <strong className="stat-card-value">
                  {typeof value === 'number' ? value.toLocaleString() : '—'}
                </strong>
              </div>
            );
          })}
          {totals &&
            Object.entries(totals)
              .filter(([key]) => !STAT_CARDS.some((card) => card.key === key))
              .map(([key, value]) => (
                <div key={key} className="stat-card" data-reveal="up">
                  <p className="stat-card-label">{key}</p>
                  <strong className="stat-card-value">
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </strong>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
