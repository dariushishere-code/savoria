import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipes, fetchRecipe, fetchCuisines, formatTime, type RecipeListItem, addComment, addFavorite, fetchComments, rateRecipe } from './lib/api';
import { useAuth } from './lib/auth';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChefHat, Clock3, Eye, EyeOff, Leaf, LockKeyhole, Mail, Menu, Search, ShieldCheck, Sparkles, Star, UserRound, Utensils, X } from 'lucide-react';
import { CookMode } from './components/CookMode';
import { ProfilePage } from './components/ProfilePage';
import { useScrollReveal } from './lib/scroll-animations';

const fallbackImages = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
];

function recipeImage(recipe: Pick<RecipeListItem, 'heroImageUrl' | 'title'>) {
  const hash = Array.from(recipe.title).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return recipe.heroImageUrl || fallbackImages[hash % fallbackImages.length];
}

function RecipeImage({ recipe, className = '' }: { recipe: Pick<RecipeListItem, 'heroImageUrl' | 'title'>; className?: string }) {
  const [src, setSrc] = useState(recipeImage(recipe));
  return (
    <img
      src={src}
      alt={recipe.title}
      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
      onError={() => setSrc(fallbackImages[0])}
    />
  );
}

function RecipeCard({ recipe, index = 0 }: { recipe: RecipeListItem; index?: number }) {
  return (
    <Link to={`/recipe/${recipe.slug}`} className="group card-hover motion-rise block" style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <RecipeImage recipe={recipe} />
        {recipe.cuisine && <span className="absolute left-3 top-3 badge bg-white/90 text-charcoal-700 backdrop-blur">{recipe.cuisine.name}</span>}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-charcoal-400">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" /> {recipe.ratingAverage.toFixed(1)}</span>
          {recipe.totalTimeMinutes && <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatTime(recipe.totalTimeMinutes)}</span>}
        </div>
        <h3 className="mt-2 font-display text-xl text-charcoal-900">{recipe.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-charcoal-500">{recipe.description || 'A thoughtful recipe to make and savor.'}</p>
      </div>
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const location = useLocation();
  const isRecipes = location.pathname.startsWith('/recipes');
  const isAI = location.pathname.startsWith('/ai');
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className={`glassy-header sticky top-0 z-20 border-b border-white/10${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container-app flex min-h-16 items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl tracking-tight text-white" onClick={closeMenu}>
            Savoria<span className="text-primary-300">.</span>
          </Link>
          <button type="button" className="btn-ghost md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} glassy-menu absolute left-0 right-0 top-full flex-col gap-1 p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <Link to="/recipes" className={`nav-link px-3 py-2 ${isRecipes ? 'nav-link-active' : ''}`} onClick={closeMenu}>
              Recipes
            </Link>
            <Link to="/ai" className={`nav-link px-3 py-2 ${isAI ? 'nav-link-active' : ''}`} onClick={closeMenu}>
              AI Chef
            </Link>
            <Link to="/#about" className="nav-link px-3 py-2" onClick={closeMenu}>About</Link>
            <Link to="/#contact" className="nav-link px-3 py-2" onClick={closeMenu}>Contact</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link px-3 py-2" onClick={closeMenu}>
                Admin
              </Link>
            )}
            <div className="my-2 h-px bg-white/10 md:hidden" />
            {isAuthenticated ? (
              <>
                <Link to="/profile" className={`nav-link flex items-center gap-2 px-3 py-2 ${location.pathname.startsWith('/profile') ? 'nav-link-active' : ''}`} onClick={closeMenu} title="Go to your profile">
                  <span className="nav-avatar"><UserRound className="h-3.5 w-3.5" /></span>
                  <span className="max-w-[10rem] truncate">{user?.name || 'My profile'}</span>
                </Link>
                <button type="button" className="btn-outline mx-2" onClick={() => { logout(); closeMenu(); }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link px-3 py-2" onClick={closeMenu}>Sign in</Link>
                <Link to="/register" className="btn-primary md:ml-2" onClick={closeMenu}>Create account</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="site-footer">
        <div className="container-app footer-grid"><div><Link to="/" className="footer-brand">Savoria<span>.</span></Link><p>Recipes with a sense of place.<br />Intelligence for your kitchen.</p></div><div className="footer-links"><div><strong>Explore</strong><Link to="/recipes">Recipes</Link><Link to="/ai">AI Chef</Link><Link to="/recipes">Meal planning</Link></div><div><strong>Company</strong><a href="/#about">About</a><a href="/#contact">Contact</a><a href="mailto:hello@savoria.app">Email us</a></div></div></div>
        <div className="container-app footer-bottom"><span>© {new Date().getFullYear()} Savoria</span><span>Made for curious cooks.</span>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipes', 'home'],
    queryFn: () => fetchRecipes({ sort: 'popular', pageSize: 8 }),
  });
  const cuisines = useQuery({ queryKey: ['cuisines'], queryFn: fetchCuisines });
  const [contactState, setContactState] = useState<'idle' | 'ready'>('idle');
  const scope = useScrollReveal<HTMLDivElement>(cuisines.data?.length ?? 0);
  return (
    <div ref={scope} className="landing-page">
      <section className="forest-hero">
        <div className="forest-hero-image" />
        <div className="forest-hero-mist" />
        <div className="forest-hero-content container-app">
          <p className="landing-kicker"><Leaf className="h-4 w-4" /> The quiet art of cooking</p>
          <h1>Cook something<br /><em>extraordinary.</em></h1>
          <p className="hero-copy">A world of recipes, a wiser way to cook, and a kitchen that always feels like home.</p>
          <div className="hero-actions"><Link to="/recipes" className="hero-button">Explore recipes <ArrowRight className="h-4 w-4" /></Link><Link to="/ai" className="hero-link"><Sparkles className="h-4 w-4" /> Ask Savoria AI</Link></div>
          <div className="hero-note"><span className="hero-note-line" /><span>Recipes rooted in place<br />and made for your table</span></div>
        </div>
        <div className="hero-scroll"><span>Scroll to explore</span><i /></div>
      </section>
      <section className="landing-section featured-section" data-reveal="fade">
        <div className="container-app">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">From the kitchen</p><h2 className="section-heading mt-2">Discover your next favorite dish.</h2></div>
          <Link to="/recipes" className="hidden items-center gap-1 text-sm font-semibold text-primary-700 sm:flex">View the collection <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {isLoading && <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="skeleton aspect-[4/5]" />)}</div>}
        {isError && <p className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">We could not load the collection right now. Please try again shortly.</p>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {!isLoading && data?.data?.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} />)}
        </div>
        </div>
      </section>
      <section id="explore" className="landing-section cuisine-section"><div className="container-app"><div className="section-intro" data-reveal="fade"><div><p className="eyebrow">A world on your plate</p><h2 className="section-heading mt-2">Travel by taste.</h2></div><p>From fragrant Thai kitchens to sunlit Mediterranean tables, follow your appetite.</p></div><div className="cuisine-strip" data-reveal-stagger>{cuisines.isLoading ? [1, 2, 3, 4].map((item) => <div key={item} className="cuisine-skeleton" />) : cuisines.data?.slice(0, 8).map((cuisine, index) => <Link key={cuisine.id} to={`/recipes?cuisine=${cuisine.slug}`} className={`cuisine-tile cuisine-tile-${index % 4}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{cuisine.name}</strong><small>{cuisine.region || 'Global kitchen'}</small></Link>)}</div></div></section>
      <section className="ai-feature-section"><div className="container-app ai-feature-inner"><div className="ai-feature-copy" data-reveal="left"><p className="landing-kicker dark"><Sparkles className="h-4 w-4" /> Your kitchen, understood</p><h2>Your AI chef,<br /><em>always in the kitchen.</em></h2><p>Ask what to make with what you have, find a smart substitute, or learn the story behind a dish. Savoria answers from the recipes in its collection.</p><Link to="/ai" className="hero-button dark-button">Meet your AI chef <ArrowRight className="h-4 w-4" /></Link></div><div className="ai-orbit" data-reveal="right"><div className="ai-orbit-ring ring-one" /><div className="ai-orbit-ring ring-two" /><div className="ai-orbit-core"><ChefHat className="h-10 w-10" /><span>Ask<br />anything</span></div><span className="ai-float float-one">What can I cook tonight?</span><span className="ai-float float-two">Replace eggs in baking</span></div></div></section>
      <section className="landing-section planner-section"><div className="container-app planner-grid"><div className="planner-image" data-reveal="left"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1100&q=85" alt="Colorful seasonal salad prepared in a home kitchen" loading="lazy" /></div><div className="planner-copy" data-reveal="right"><p className="eyebrow">Make space for good food</p><h2 className="section-heading mt-3">A week that<br /><em>tastes better.</em></h2><p>Turn inspiration into a rhythm. Gather breakfast, lunch, dinner, and the small snacks that make a week feel generous.</p><div className="meal-list"><span><b>01</b> Breakfast</span><span><b>02</b> Lunch</span><span><b>03</b> Dinner</span><span><b>04</b> Something sweet</span></div><Link to="/recipes" className="text-link">Start planning from recipes <ArrowRight className="h-4 w-4" /></Link></div></div></section>
      <section id="about" className="about-section"><div className="container-app about-grid" data-reveal-stagger><div><p className="eyebrow">About Savoria</p><h2>Cooking should feel inspiring,<br /><em>not complicated.</em></h2></div><div><p className="about-lead">Savoria brings global recipes, thoughtful guidance, and a little more confidence to the everyday kitchen.</p><p className="about-body">Discover dishes rooted in real places. Save the ones you love. Ask an AI chef when the pantry feels puzzling. Build a week around food that makes you want to sit down and stay awhile.</p><div className="about-stats"><span><b>07</b><small>world cuisines</small></span><span><b>∞</b><small>ways to make it yours</small></span></div></div></div></section>
      <section id="contact" className="contact-section"><div className="container-app contact-grid" data-reveal-stagger><div><p className="eyebrow">Say hello</p><h2 className="section-heading mt-3">Bring us<br /><em>to the table.</em></h2><p className="mt-5 max-w-sm text-white/60">Have a recipe story, a question, or an idea for the kitchen? We would love to hear from you.</p><p className="mt-8 text-sm text-white/80">hello@savoria.app</p></div><form className="contact-form" action="mailto:hello@savoria.app" method="post" encType="text/plain" onSubmit={() => setContactState('ready')}><div className="contact-fields"><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label></div><label>Subject<input name="subject" required placeholder="What is on your mind?" /></label><label>Message<textarea name="message" required rows={4} placeholder="Tell us a little more..." /></label><button type="submit" className="hero-button">Send message <ArrowRight className="h-4 w-4" /></button>{contactState === 'ready' && <p className="text-xs text-white/60">Your email client will open with the message ready to send.</p>}</form></div></section>
    </div>
  );
}

function RecipesPage() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['recipes', q],
    queryFn: () => fetchRecipes({ q: q || undefined, pageSize: 12 }),
  });
  return (
    <div className="container-app py-10" data-reveal="fade">
      <p className="eyebrow">The Savoria collection</p>
      <h1 className="mt-2 font-display text-5xl">Find your next favorite.</h1>
      <form
        className="mt-8 flex max-w-2xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(input.trim());
        }}
      >
        <input
          className="input-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by dish, ingredient, or cuisine"
          aria-label="Search recipes"
        />
        <button type="submit" className="btn-primary shrink-0 px-4 sm:px-6">
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
        </button>
      </form>
      {q && <p className="mt-8 text-sm text-charcoal-500">Showing results for <span className="font-semibold text-charcoal-800">“{q}”</span>{isFetching && ' · Updating'}</p>}
      {isLoading && <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="skeleton aspect-[4/5]" />)}</div>}
      {isError && <p className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">Search is temporarily unavailable. Check the API connection and try again.</p>}
      {!isLoading && !isError && data?.data?.length === 0 && <div className="mt-10 rounded-2xl border border-dashed border-charcoal-200 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-charcoal-300" /><h2 className="mt-4 font-display text-2xl">Nothing matched that search</h2><p className="mt-2 text-sm text-charcoal-500">Try a broader dish, ingredient, or cuisine.</p></div>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!isLoading && !isError && data?.data?.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} />)}
      </div>
    </div>
  );
}

function RecipeDetailPage() {
  const { slug } = useParams();
  const { accessToken, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cookOpen, setCookOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipe', slug],
    queryFn: () => fetchRecipe(slug!),
    enabled: !!slug,
  });
  const comments = useQuery({ queryKey: ['comments', data?.id], queryFn: () => fetchComments(data!.id), enabled: !!data?.id });
  const scope = useScrollReveal<HTMLElement>(data?.id);
  if (isLoading) return <div className="container-app py-16">Loading…</div>;
  if (isError || !data) return <div className="container-app py-16">Not found</div>;
  const r = data;
  return (
    <article ref={scope} className="container-app py-10">
      <Link to="/recipes" className="text-sm font-semibold text-primary-700">← Back to recipes</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div data-reveal="up"><p className="eyebrow">{r.cuisine?.name || 'Savoria kitchen'}</p><h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{r.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal-600">{r.description}</p></div>
        <div data-reveal="scale" className="aspect-[4/3] overflow-hidden rounded-2xl bg-cream-200"><RecipeImage recipe={r} /></div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-charcoal-600" data-reveal="fade"><span className="badge-outline">{r.difficulty}</span>{r.totalTimeMinutes && <span className="badge-outline flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatTime(r.totalTimeMinutes)}</span>}{r.servings && <span className="badge-outline">{r.servings} servings</span>}<button type="button" className="btn-primary" onClick={() => setCookOpen(true)}><ChefHat className="h-4 w-4" /> Start cooking</button><button type="button" className="btn-secondary btn-sm" disabled={!isAuthenticated} onClick={async () => { if (accessToken) { await addFavorite(r.id, accessToken); setFeedback('Saved to your favorites.'); } }}>{isAuthenticated ? '♡ Save recipe' : 'Sign in to save'}</button></div>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="rounded-2xl border border-charcoal-100 bg-white p-6" data-reveal="left">
          <h2 className="font-display text-xl">Ingredients</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {r.ingredients?.map((i: any) => (
              <li key={i.id}>
                <span className="font-medium">{i.amount} {i.unit}</span> {i.name || i.ingredient?.name}{i.note && <span className="text-charcoal-400">, {i.note}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2" data-reveal="right">
          <h2 className="font-display text-xl">Instructions</h2>
          <ol className="mt-4 space-y-4">
            {r.instructions?.map((s: any) => (
              <li key={s.id} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                  {s.stepNumber}
                </span>
                <p>{s.content}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <section className="mt-14 max-w-3xl border-t border-charcoal-100 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">From the table</p><h2 className="mt-2 font-display text-3xl">Ratings & notes</h2></div><div className="flex items-center gap-1" aria-label="Rate this recipe">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" className="p-1 text-primary-500 disabled:opacity-40" disabled={!isAuthenticated} aria-label={`Rate ${score} stars`} onClick={async () => { if (accessToken) { await rateRecipe(r.id, score, accessToken); setFeedback('Thanks for rating this recipe.'); } }}>★</button>)}</div></div>
        {feedback && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{feedback}</p>}
        {isAuthenticated ? <form className="mt-6 flex gap-2" onSubmit={async (event) => { event.preventDefault(); if (accessToken && comment.trim()) { await addComment(r.id, comment.trim(), accessToken); setComment(''); setFeedback('Your note was submitted for moderation.'); } }}><input className="input" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share a cooking note..." maxLength={2000} /><button type="submit" className="btn-primary shrink-0">Post</button></form> : <p className="mt-6 text-sm text-charcoal-500">Sign in to rate this recipe or share a cooking note.</p>}
        <div className="mt-8 space-y-4">{comments.data?.data?.map((item) => <div key={item.id} className="rounded-xl border border-charcoal-100 bg-white p-4"><p className="text-sm leading-6 text-charcoal-700">{item.content}</p><p className="mt-2 text-xs text-charcoal-400">{item.user.name}</p></div>)}</div>
      </section>
      {cookOpen && <CookMode recipe={r} onClose={() => setCookOpen(false)} />}
    </article>
  );
}

function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  if (!authLoading && isAuthenticated) return <Navigate to="/" replace />;
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1600&q=90" alt="Butter chicken in a copper bowl with naan and herbs" />
        <div className="auth-visual-shade" />
        <Link to="/" className="auth-brand">Savoria<span>.</span></Link>
        <div className="auth-story"><p className="auth-kicker">A table without borders</p><h1>Bring the world<br /><em>to your kitchen.</em></h1><p>Discover recipes with a sense of place, guided by an intelligence that understands how you cook.</p><div className="auth-story-mark"><span>01</span><i /><span>03</span></div></div>
        <p className="auth-caption">Butter chicken · Delhi, India</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <Link to="/" className="auth-mobile-brand">Savoria<span>.</span></Link>
          <div className="auth-heading"><p className="auth-kicker">Welcome back</p><h2>Continue your<br /><em>culinary journey.</em></h2><p>Sign in to keep your recipes, notes, and kitchen inspiration close.</p></div>
          <form className="auth-form" onSubmit={async (event) => { event.preventDefault(); setError(''); setIsSubmitting(true); try { await login(email, password); navigate('/'); } catch (err) { setError(err instanceof Error && err.message.includes('Invalid') ? 'The email or password is not quite right.' : 'We could not sign you in right now. Please try again.'); } finally { setIsSubmitting(false); } }}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <label className="auth-field"><span>Email address</span><div><Mail /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label>
            <label className="auth-field"><span>Password</span><div><LockKeyhole /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            <div className="auth-options"><label><input type="checkbox" /> <span>Remember me</span></label><Link to="/forgot-password">Forgot password?</Link></div>
            <button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? <><span className="auth-spinner" /> Signing you in...</> : <>Sign in <ArrowRight /></>}</button>
          </form>
          <div className="auth-trust"><ShieldCheck /><span>Your session is protected with secure, encrypted authentication.</span></div>
          <p className="auth-register">New to Savoria? <Link to="/register">Create your account <ArrowRight /></Link></p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <div className="auth-page auth-page-simple"><div className="auth-panel"><div className="auth-panel-inner"><Link to="/" className="auth-mobile-brand">Savoria<span>.</span></Link><div className="auth-heading"><p className="auth-kicker">Start tasting</p><h2>Make room for<br /><em>good things.</em></h2><p>Create an account to save recipes, rate dishes, and build your personal table.</p></div><form className="auth-form" onSubmit={async (event) => { event.preventDefault(); setError(''); setIsSubmitting(true); try { await register({ name, email, password }); navigate('/'); } catch (err) { setError(err instanceof Error ? err.message : 'We could not create your account.'); } finally { setIsSubmitting(false); } }}><p className="auth-error" role="alert" hidden={!error}>{error}</p><label className="auth-field"><span>Your name</span><div><UserRound /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required /></div></label><label className="auth-field"><span>Email address</span><div><Mail /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label><label className="auth-field"><span>Create a password</span><div><LockKeyhole /><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters, upper and lower case" required /></div></label><button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Creating your account...' : <>Create account <ArrowRight /></>}</button></form><p className="auth-register">Already have an account? <Link to="/login">Sign in <ArrowRight /></Link></p></div></div></div>;
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [error, setError] = useState('');
  return <div className="auth-page auth-page-simple"><div className="auth-panel"><div className="auth-panel-inner"><Link to="/" className="auth-mobile-brand">Savoria<span>.</span></Link>{sent ? <div className="auth-heading"><div className="auth-success-icon"><Check /></div><p className="auth-kicker">Check your inbox</p><h2>Path back<br /><em>to the table.</em></h2><p>If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.</p><Link to="/login" className="auth-submit auth-submit-link">Return to sign in <ArrowRight /></Link></div> : <><div className="auth-heading"><p className="auth-kicker">Password recovery</p><h2>Let&apos;s get you<br /><em>back in.</em></h2><p>Enter your email and we&apos;ll send a secure reset link.</p></div><form className="auth-form" onSubmit={async (event) => { event.preventDefault(); setError(''); try { const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); if (!response.ok) throw new Error('Request failed'); setSent(true); } catch { setError('We could not send that request. Please try again.'); } }}><p className="auth-error" role="alert" hidden={!error}>{error}</p><label className="auth-field"><span>Email address</span><div><Mail /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label><button type="submit" className="auth-submit">Send reset link <ArrowRight /></button></form><p className="auth-register"><Link to="/login">← Back to sign in</Link></p></>}</div></div></div>;
}

function AdminPage() {
  const { accessToken, isAdmin, isLoading } = useAuth();
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () =>
      fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      }).then((r) => r.json()),
    enabled: !!accessToken && isAdmin,
  });
  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <div className="p-8">Admin access required.</div>;
  const totals = data?.data?.totals;
  return (
    <div className="min-h-screen bg-charcoal-900 p-6 text-white">
      <h1 className="text-2xl font-semibold">Savoria Admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totals &&
          Object.entries(totals).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-charcoal-700 p-4">
              <p className="text-xs uppercase text-charcoal-400">{k}</p>
              <p className="text-2xl font-semibold">{String(v)}</p>
            </div>
          ))}
      </div>
      <Link to="/" className="mt-8 inline-block text-primary-500">
        ← Back to site
      </Link>
    </div>
  );
}

function AIPage() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { accessToken } = useAuth();
  const promptChips = ['What can I make with chicken?', 'Help me replace eggs', 'A quick dinner for two'];
  return (
    <div className="ai-page">
      <div className="ai-shell">
        <header className="ai-header"><div className="ai-title-mark"><Sparkles className="h-5 w-5" /><span>AI Chef</span></div><span className="ai-status"><i /> Grounded in Savoria recipes</span></header>
        <div className="ai-intro"><p className="eyebrow">Your kitchen, understood</p><h1>What are we<br /><em>cooking today?</em></h1><p>Ask anything about the recipes in your collection. I&apos;ll help you find a dish, adjust it, or make sense of what&apos;s in your pantry.</p></div>
        <div className="ai-chat">
          {!submittedMessage && !reply && !isLoading && <div className="ai-empty"><div className="ai-empty-orbit"><span><ChefHat className="h-7 w-7" /></span><i /><i /></div><p>Start with a question</p><div className="ai-chips">{promptChips.map((chip) => <button key={chip} type="button" onClick={() => setMessage(chip)}>{chip} <ArrowRight className="h-3.5 w-3.5" /></button>)}</div></div>}
          {submittedMessage && <div className="ai-message ai-message-user"><div className="ai-avatar user-avatar">You</div><p>{submittedMessage}</p></div>}
          {(isLoading || reply) && <div className="ai-message ai-message-assistant"><div className="ai-avatar"><Sparkles className="h-4 w-4" /></div><div className="ai-response"><span className="ai-response-label">Savoria AI</span>{isLoading && !reply && <span className="ai-thinking"><i /><i /><i /></span>}<p>{reply}{isLoading && reply && <span className="ai-caret" />}</p></div></div>}
          {error && <div className="ai-error"><span>{error}</span><button type="button" onClick={() => setError('')}>Dismiss</button></div>}
        </div>
        <form className="ai-composer" onSubmit={async (event) => {
          event.preventDefault();
          if (!message.trim() || isLoading) return;
          const currentMessage = message.trim(); setSubmittedMessage(currentMessage); setMessage(''); setReply(''); setError(''); setIsLoading(true);
          const controller = new AbortController(); setAbortController(controller);
          try {
            const res = await fetch('/api/ai/chat/stream', { method: 'POST', credentials: 'include', signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify({ message: currentMessage }) });
            if (!res.ok || !res.body) throw new Error('The AI chef is unavailable right now.');
            const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
            while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const events = buffer.split('\n\n'); buffer = events.pop() ?? ''; for (const streamEvent of events) { const line = streamEvent.replace(/^data:\s*/, ''); if (!line) continue; const payload = JSON.parse(line) as { chunk?: string }; if (payload.chunk) setReply((current) => current + payload.chunk); } }
          } catch (err) { if (!(err instanceof DOMException && err.name === 'AbortError')) setError(err instanceof Error ? err.message : 'The AI chef is unavailable right now.'); } finally { setIsLoading(false); setAbortController(null); }
        }}>
          <textarea className="ai-input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Savoria anything..." aria-label="Ask Savoria anything" rows={1} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
          <div className="ai-composer-footer"><span>Shift + Enter for a new line</span>{isLoading ? <button type="button" className="ai-stop" onClick={() => abortController?.abort()}>Stop</button> : <button type="submit" className="ai-send" disabled={!message.trim()} aria-label="Send message"><ArrowRight className="h-5 w-5" /></button>}</div>
        </form>
      </div>
      <aside className="ai-aside"><div className="ai-aside-art"><div className="ai-plate"><div><Utensils className="h-8 w-8" /><span>Cook<br />curiously</span></div></div></div><p className="eyebrow">A little guidance</p><h2>Good food starts<br /><em>with a good question.</em></h2><p>Every answer begins with what&apos;s already in your kitchen.</p><Link to="/recipes" className="text-link">Browse the collection <ArrowRight className="h-4 w-4" /></Link></aside>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Shell>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="recipe/:slug" element={<RecipeDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="ai" element={<AIPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}
