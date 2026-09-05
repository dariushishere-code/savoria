import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollProgressBar } from './ScrollProgressBar';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

export function Shell() {
  return (
    <>
      <ScrollToTop />
      <ScrollProgressBar />
      <Header />
      <main id="main" className="main-app">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}