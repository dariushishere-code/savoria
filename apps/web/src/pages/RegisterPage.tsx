import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { fieldErrors, friendlyAuthError } from '../lib/auth-messages';
import { useToast } from '../lib/toast';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=90"
          alt="A rustic spread of freshly prepared dishes"
        />
        <div className="auth-visual-shade" />
        <Link to="/" className="auth-brand">
          Savoria<span>.</span>
        </Link>
        <div className="auth-story">
          <p className="auth-kicker">Join the table</p>
          <h1>
            Your kitchen,
            <br />
            <em>made smarter.</em>
          </h1>
          <p>
            Save the recipes you love, get AI guidance that remembers your taste, and cook with a
            little more confidence every day.
          </p>
          <div className="auth-story-mark">
            <span>01</span>
            <i />
            <span>03</span>
          </div>
        </div>
        <p className="auth-caption">Garden feast · Provence, France</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link to="/" className="auth-mobile-brand">
            Savoria<span>.</span>
          </Link>
          <div className="auth-heading">
            <p className="auth-kicker">Create your account</p>
            <h2>
              Start a <em>tastier</em> chapter.
            </h2>
            <p>Free to join — set up takes less than a minute.</p>
          </div>
          <form
            className="auth-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setError('');
              setFieldErrs({});

              if (!PASSWORD_RULE.test(password)) {
                setError(
                  'Your password needs to be at least 8 characters with upper and lower case letters and a number.',
                );
                return;
              }

              setIsSubmitting(true);
              try {
                await register({ name: name.trim(), email, password });
                toast.push('success', {
                  title: 'Welcome to Savoria!',
                  message: 'Your account is ready — let‘s find something delicious.',
                });
                navigate('/');
              } catch (err) {
                setError(friendlyAuthError(err, 'We could not create your account right now.'));
                setFieldErrs(fieldErrors(err));
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
              <span>Your name</span>
              <div>
                <UserRound />
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  required
                />
              </div>
              {fieldErrs.name && <em className="auth-field-error">{fieldErrs.name}</em>}
            </label>
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
              {fieldErrs.email && <em className="auth-field-error">{fieldErrs.email}</em>}
            </label>
            <label className="auth-field">
              <span>Create a password</span>
              <div>
                <LockKeyhole />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8+ characters, upper and lower case, a number"
                  required
                />
              </div>
              {fieldErrs.password && <em className="auth-field-error">{fieldErrs.password}</em>}
            </label>
            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="auth-spinner" /> Creating your account...
                </>
              ) : (
                <>
                  Create account <ArrowRight />
                </>
              )}
            </button>
          </form>
          <div className="auth-trust">
            <ShieldCheck />
            <span>Your details are encrypted and never shared.</span>
          </div>
          <p className="auth-register">
            Already have an account? <Link to="/login">Sign in <ArrowRight /></Link>
          </p>
        </div>
      </div>
    </div>
  );
}

