import { useEffect, useRef, useState } from 'react';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`landing-nav${scrolled ? ' scrolled' : ''}`}
      id="landing-nav"
    >
      <div className="landing-nav__inner">
        {/* Logo */}
        <a href="/" className="landing-nav__logo">Ascend</a>

        {/* Center nav links in pill */}
        <div className="landing-nav__links">
          <a href="#features" className="landing-nav__link">Features</a>
          <a href="#market" className="landing-nav__link">Market Intel</a>
          <a href="#ecosystem" className="landing-nav__link">Ecosystem</a>
        </div>

        {/* CTA */}
        <a href="/login" className="landing-nav__cta" id="nav-cta">
          Start Free
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </nav>
  );
}
