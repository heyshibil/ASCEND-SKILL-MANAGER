import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Staggered entrance animation
    const children = el.querySelectorAll('.hero-animate');
    children.forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
      child.style.filter = 'blur(4px)';
      child.style.transition = `opacity 1s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.15}s, transform 1s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.15}s, filter 1s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.15}s`;

      // Trigger after a tick
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
          child.style.filter = 'blur(0px)';
        });
      });
    });
  }, []);

  return (
    <section className="hero-section" id="hero" ref={sectionRef}>
      {/* Status badge */}
      <div className="hero-section__badge hero-animate">
        <span className="hero-section__badge-dot" />
        Now in Public Beta
      </div>

      {/* Headline */}
      <h1 className="hero-section__headline hero-animate">
        Know Where You Stand
        {/* <br />
        Know Where to Go Next */}
      </h1>

      {/* Subtext */}
      <p className="hero-section__subtext hero-animate">
        Skill insights powered by real market demand.
      </p>

      {/* CTAs */}
      <div className="hero-section__ctas hero-animate">
        <a href="/login" className="landing-btn landing-btn--primary" id="hero-cta-primary">
          Start For Free
          {/* <span className="landing-btn__arrow">→</span> */}
        </a>
        <a href="#features" className="landing-btn landing-btn--secondary" id="hero-cta-secondary">
          See How It Works
        </a>
      </div>

    </section>
  );
}
