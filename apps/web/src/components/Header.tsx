import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChefHat, Menu, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useMagnetic, useSmoothScroll } from '../lib/motion';

const NAV_LINKS = [
  { to: '/recipes', label: 'Recipes' },
  { to: '/ai', label: 'AI Chef' },
];

export function Header() {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();
  const { scrollTo } = useSmoothScroll();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 10);
      setIsHidden(y > 140 && y > lastY.current && !menuOpen);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const brandRef = useMagnetic<HTMLAnchorElement>(0.18);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.28);

  const goToSection = (hash: string) => {
    setMenuOpen(false);
    const target = document.querySelector(hash);
    if (target) {
      scrollTo(target as HTMLElement, { offset: -88 });
      return;
    }
    navigate(`/#${hash.slice(1)}`);
    window.setTimeout(() => {
      const afterNav = document.querySelector(hash);
      if (afterNav) scrollTo(afterNav as HTMLElement, { offset: -88 });
    }, 350);
  };

  return (
    <header className={`glassy-header is-${isScrolled ? 'scrolled' : 'top'} ${isHidden ? 'is-hidden' : ''}`}>
      <div className="container-app header-inner">
        <Link ref={brandRef} to="/" className="header-brand" aria-label="Savoria home">
          <ChefHat className="header-brand-mark" />
          <span>
            Savoria<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `header-link ${isActive ? 'is-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          <button type="button" className="header-link" onClick={() => goToSection('#explore')}>
            Explore
          </button>
          <button type="button" className="header-link" onClick={() => goToSection('#about')}>
            About
          </button>
        </nav>

        <div className="header-actions">
          {isLoading ? (
            <span className="header-skeleton" />
          ) : isAuthenticated && user ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className="header-link header-link-muted">
                  Admin
                </NavLink>
              )}
              <NavLink to="/profile" className="header-user" aria-label="Your profile">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
                <span>{user.name.split(' ')[0]}</span>
              </NavLink>
              <button type="button" className="header-link header-link-muted header-logout" onClick={() => logout()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link header-link-muted">
                Sign in
              </Link>
              <Link ref={ctaRef} to="/register" className="btn-primary header-cta">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="header-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={`mobile-menu glassy-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-inner">
          <Link to="/recipes" onClick={() => setMenuOpen(false)}>
            Recipes
          </Link>
          <Link to="/ai" onClick={() => setMenuOpen(false)}>
            <Sparkles className="h-4 w-4" /> AI Chef
          </Link>
          <button type="button" onClick={() => goToSection('#explore')}>
            Explore
          </button>
          <button type="button" onClick={() => goToSection('#about')}>
            About
          </button>
          <button type="button" onClick={() => goToSection('#contact')}>
            Contact
          </button>
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <UserRound className="h-4 w-4" /> Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button type="button" onClick={() => logout()}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-menu-cta">
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}