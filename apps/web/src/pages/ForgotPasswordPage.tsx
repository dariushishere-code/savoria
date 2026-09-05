import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { friendlyAuthError } from '../lib/auth-messages';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="auth-page auth-page-simple">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link to="/" className="auth-mobile-brand">
            Savoria<span>.</span>
          </Link>
          {sent ? (
            <div className="auth-heading">
              <div className="auth-success-icon">
                <Check />
              </div>
              <p className="auth-kicker">Check your inbox</p>
              <h2>
                Path back
                <br />
                <em>to the table.</em>
              </h2>
              <p>
                If an account exists for <strong>{email}</strong>, we have sent instructions to
                reset your password.
              </p>
              <Link to="/login" className="auth-submit auth-submit-link">
                Return to sign in <ArrowRight />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <p className="auth-kicker">Password recovery</p>
                <h2>
                  Let&apos;s get you
                  <br />
                  <em>back in.</em>
                </h2>
                <p>Enter your email and we&apos;ll send a secure reset link.</p>
              </div>
              <form
                className="auth-form"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError('');
                  setIsSubmitting(true);
                  try {
                    const response = await fetch('/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    if (!response.ok) {
                      const payload = (await response.json().catch(() => ({}))) as {
                        message?: string;
                      };
                      throw new Error(payload.message ?? 'Request failed');
                    }
                    setSent(true);
                  } catch (err) {
                    setError(friendlyAuthError(err, 'We could not send that request. Please try again.'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <p className="auth-error" role="alert" hidden={!error}>
                  {error}
                </p>
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
                <button type="submit" className="auth-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="auth-spinner" /> Sending...
                    </>
                  ) : (
                    <>
                      Send reset link <ArrowRight />
                    </>
                  )}
                </button>
              </form>
              <p className="auth-register">
                <Link to="/login">← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
