import { Link } from 'react-router-dom';
import { ArrowUp, ChefHat, Instagram, Twitter, Youtube } from 'lucide-react';
import { useSmoothScroll } from '../lib/motion';
import { useMagnetic } from '../lib/motion';

export function Footer() {
  const { scrollTo } = useSmoothScroll();
  const backTopRef = useMagnetic<HTMLButtonElement>(0.3);

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-accent" aria-hidden="true" />
      <div className="container-app footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand">
            <ChefHat className="h-5 w-5" />
            <span>
              Savoria<span className="brand-dot">.</span>
            </span>
          </Link>
          <p>
            Thoughtful recipes, friendly AI guidance, and a community that cares about the food
            on your table. Cook with confidence.
          </p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X / Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/recipes">All recipes</Link>
          <Link to="/ai">AI Chef</Link>
          <Link to="/register">Join Savoria</Link>
          <Link to="/login">Sign in</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>

        <div className="footer-back-top">
          <button
            ref={backTopRef}
            type="button"
            className="back-top-btn"
            onClick={() => scrollTo(0)}
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
            <span>Back to top</span>
          </button>
        </div>
      </div>

      <div className="container-app footer-bottom">
        <span>© {new Date().getFullYear()} Savoria. Crafted with care.</span>
        <span className="footer-made-line">Made for people who love to cook</span>
      </div>
    </footer>
  );
}