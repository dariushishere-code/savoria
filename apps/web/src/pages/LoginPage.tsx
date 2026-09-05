import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { friendlyAuthError } from '../lib/auth-messages';

export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (!authLoading && isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1600&q=90"
          alt="Butter chicken in a copper bowl with naan and herbs"
        />
        <div className="auth-visual-shade" />
        <Link to="/" className="auth-brand">
          Savoria<span>.</span>
        </Link>
        <div className="auth-story">
          <p className="auth-kicker">A table without borders</p>
          <h1>
            Bring the world
            <br />
            <em>to your kitchen.</em>
          </h1>
          <p>
            Discover recipes with a sense of place, guided by an intelligence that understands how
            you cook.
          </p>
          <div className="auth-story-mark">
            <span>01</span>
            <i />
            <span>03</span>
          </div>
        </div>
        <p className="auth-caption">Butter chicken · Delhi, India</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link to="/" className="auth-mobile-brand">
            Savoria<span>.</span>
          </Link>
          <div className="auth-heading">
            <p className="auth-kicker">Welcome back</p>
            <h2>
              Continue your
              <br />
              <em>culinary journey.</em>
            </h2>
            <p>Sign in to keep your recipes, notes, and kitchen inspiration close.</p>
          </div>
          <form
            className="auth-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setError('');
              setIsSubmitting(true);
              try {
                await login(email, password);
                navigate(from);
              } catch (err) {
                setError(friendlyAuthError(err, 'We could not sign you in right now. Please try again.'));
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <div>
                <Mail />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div>
                <LockKeyhole />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            <div className="auth-options">
              <label>
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="auth-spinner" /> Signing you in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight />
                </>
              )}
            </button>
          </form>
          <div className="auth-trust">
            <ShieldCheck />
            <span>Your session is protected with secure, encrypted authentication.</span>
          </div>
          <p className="auth-register">
            New to Savoria? <Link to="/register">Create your account <ArrowRight /></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
