import { useEffect, useRef, useState } from 'react';

function useCountUp(end, duration = 2000, startTrigger = false) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!startTrigger) return;

    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, startTrigger]);

  return value;
}

export default function ScoreRevealSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const score = useCountUp(847, 2500, isVisible);
  const verificationLevel = useCountUp(94, 2000, isVisible);
  const marketAlignment = useCountUp(87, 2200, isVisible);
  const growthVelocity = useCountUp(12, 1800, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Marker position: 847/1000 = 84.7%
  const markerPos = isVisible ? 84.7 : 0;

  return (
    <section className="score-section" id="score" ref={sectionRef}>

      <p className={`section-label landing-reveal${isVisible ? ' is-visible' : ''}`}>
        Career Intelligence
      </p>

      <h2 className={`score-section__title landing-reveal landing-reveal--delay-1${isVisible ? ' is-visible' : ''}`}>
        Your Career Liquidity Score
      </h2>

      {/* The score — the 10% color moment */}
      <div className={`score-section__score-wrapper landing-reveal landing-reveal--delay-2${isVisible ? ' is-visible' : ''}`}>
        <div className="score-section__score">
          {score}
        </div>
        <div className="score-section__score-unit">/ 1000</div>
      </div>

      <p className={`score-section__score-label landing-reveal landing-reveal--delay-3${isVisible ? ' is-visible' : ''}`}>
        Career Liquidity Score
      </p>

      {/* Scale bar — gradient from dark to accent */}
      <div className={`score-section__scale landing-reveal landing-reveal--delay-3${isVisible ? ' is-visible' : ''}`}>
        <div className="score-scale__bar">
          <div
            className="score-scale__fill"
            style={{ width: isVisible ? `${markerPos}%` : '0%' }}
          />
          <div
            className="score-scale__marker"
            style={{ left: `${markerPos}%`, opacity: isVisible ? 1 : 0 }}
          />
        </div>
      </div>
      <div className={`score-scale__labels landing-reveal landing-reveal--delay-3${isVisible ? ' is-visible' : ''}`}>
        <span>0 — Critical</span>
        <span>500 — Average</span>
        <span>1000 — Exceptional</span>
      </div>

      {/* Sub-metrics — use color for the values (strategic color) */}
      <div className={`score-section__meta landing-reveal landing-reveal--delay-4${isVisible ? ' is-visible' : ''}`}>
        <div className="score-meta-item">
          <span className="score-meta-item__value score-meta-item__value--accent">{verificationLevel}%</span>
          <span className="score-meta-item__label">Verification Level</span>
        </div>
        <div className="score-meta-item">
          <span className="score-meta-item__value score-meta-item__value--accent">{marketAlignment}%</span>
          <span className="score-meta-item__label">Market Alignment</span>
        </div>
        <div className="score-meta-item">
          <span className="score-meta-item__value score-meta-item__value--positive">+{growthVelocity}%</span>
          <span className="score-meta-item__label">Growth Velocity</span>
        </div>
      </div>

      <p className={`score-section__description landing-reveal landing-reveal--delay-4${isVisible ? ' is-visible' : ''}`}>
        Measure your market value through verified coding assessments and real hiring demand.
      </p>
    </section>
  );
}
