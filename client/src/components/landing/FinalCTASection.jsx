import { useEffect, useRef, useState } from 'react';

export default function FinalCTASection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const reveal = (delay = 0) =>
    `landing-reveal${delay ? ` landing-reveal--delay-${delay}` : ''}${isVisible ? ' is-visible' : ''}`;

  return (
    <section className="cta-section" id="cta" ref={sectionRef}>

      <h2 className={`cta-section__title ${reveal()}`}>
        start your ASCEND.
      </h2>

      <p className={`cta-section__subtitle ${reveal(1)}`}>
        Join developers who chose clarity over guesswork.
        Know your value. Track the market. Grow with purpose.
      </p>

      <div className={`cta-section__buttons ${reveal(2)}`}>
        <a href="/login" className="landing-btn landing-btn--primary" id="final-cta-primary">
          Start Free
          <span className="landing-btn__arrow">→</span>
        </a>
        <a href="#hero" className="landing-btn landing-btn--secondary" id="final-cta-secondary">
          Learn More
        </a>
      </div>

      <p className={`cta-section__fine-print ${reveal(3)}`}>
        No credit card required · Free forever for individual developers
      </p>
    </section>
  );
}
