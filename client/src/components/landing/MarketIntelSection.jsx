import { useEffect, useRef, useState } from 'react';

const TRENDS = [
  { name: 'React',      fill: 92, change: '+34%', direction: 'up',     color: '#61DAFB' },
  { name: 'TypeScript', fill: 94, change: '+28%', direction: 'up',     color: '#3178C6' },
  { name: 'Rust',       fill: 45, change: '+180%',direction: 'up',     color: '#CE412B' },
  { name: 'Python',     fill: 88, change: 'Stable',direction: 'stable',color: '#3776AB' },
  { name: 'jQuery',     fill: 12, change: '-67%', direction: 'down',   color: '#ef4444' },
  { name: 'Go',         fill: 65, change: '+52%', direction: 'up',     color: '#00ADD8' },
];

export default function MarketIntelSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const reveal = (delay = 0) =>
    `landing-reveal${delay ? ` landing-reveal--delay-${delay}` : ''}${isVisible ? ' is-visible' : ''}`;

  return (
    <section className="market-section" id="market" ref={sectionRef}>

      <div className="market-section__inner">
        {/* Left: Copy + trend bars */}
        <div>
          <p className={`market-section__label ${reveal()}`}>Market Intelligence</p>
          <h2 className={`market-section__title ${reveal(1)}`}>
            The market moves.<br />You move first.
          </h2>
          <p className={`market-section__description ${reveal(2)}`}>
            Ascend monitors real hiring data, job market trends, and technology adoption
            to tell you exactly which skills to invest in and which to let go.
          </p>

          <div className={`market-trends ${reveal(3)}`}>
            {TRENDS.map((trend) => (
              <div className="market-trend" key={trend.name}>
                <span className="market-trend__name">{trend.name}</span>
                <div className="market-trend__bar">
                  <div
                    className="market-trend__bar-fill"
                    style={{
                      width: isVisible ? `${trend.fill}%` : '0%',
                      background: trend.color,
                      transition: `width 1.5s cubic-bezier(0.16,1,0.3,1) ${Math.random() * 0.3}s`,
                    }}
                  />
                </div>
                <span className={`market-trend__change market-trend__change--${trend.direction}`}>
                  {trend.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chart visualization */}
        <div className={`market-section__chart ${reveal(2)}`}>
          <div className="market-chart__header">
            <span className="market-chart__title">Skill Demand — Last 12 Months</span>
            <div className="market-chart__legend">
              <div className="market-chart__legend-item">
                <div className="market-chart__legend-dot" style={{ background: '#61DAFB' }} />
                React
              </div>
              <div className="market-chart__legend-item">
                <div className="market-chart__legend-dot" style={{ background: '#3776AB' }} />
                Python
              </div>
              <div className="market-chart__legend-item">
                <div className="market-chart__legend-dot" style={{ background: '#CE412B' }} />
                Rust
              </div>
            </div>
          </div>

          <svg className="market-chart__svg" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Subtle grid */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 50} x2="500" y2={i * 50}
                stroke="rgba(168,167,161,0.05)" strokeWidth="1" />
            ))}

            {/* React line */}
            <path
              d="M0,140 C40,130 80,110 120,100 C160,90 200,80 240,70 C280,60 320,50 360,42 C400,35 440,30 500,20"
              fill="none" stroke="#61DAFB" strokeWidth="2.5" strokeLinecap="round"
              style={{
                strokeDasharray: 800,
                strokeDashoffset: isVisible ? 0 : 800,
                transition: 'stroke-dashoffset 2.5s cubic-bezier(0.16,1,0.3,1) 0.3s',
              }}
            />
            <path
              d="M0,140 C40,130 80,110 120,100 C160,90 200,80 240,70 C280,60 320,50 360,42 C400,35 440,30 500,20 L500,200 L0,200 Z"
              fill="url(#mktReact)" opacity="0.15"
            />

            {/* Python line */}
            <path
              d="M0,100 C40,95 80,90 120,92 C160,88 200,85 240,82 C280,80 320,78 360,75 C400,72 440,68 500,65"
              fill="none" stroke="#3776AB" strokeWidth="2" strokeLinecap="round"
              style={{
                strokeDasharray: 800,
                strokeDashoffset: isVisible ? 0 : 800,
                transition: 'stroke-dashoffset 2.5s cubic-bezier(0.16,1,0.3,1) 0.5s',
              }}
            />

            {/* Rust line — dramatic rise */}
            <path
              d="M0,180 C40,178 80,175 120,170 C160,165 200,155 240,140 C280,120 320,95 360,70 C400,50 440,35 500,25"
              fill="none" stroke="#CE412B" strokeWidth="2" strokeLinecap="round"
              style={{
                strokeDasharray: 800,
                strokeDashoffset: isVisible ? 0 : 800,
                transition: 'stroke-dashoffset 2.5s cubic-bezier(0.16,1,0.3,1) 0.7s',
              }}
            />

            <defs>
              <linearGradient id="mktReact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#61DAFB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#61DAFB" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points */}
            {isVisible && (
              <>
                <circle cx="500" cy="20" r="4" fill="#61DAFB" opacity={isVisible ? 1 : 0} style={{ transition: 'opacity 0.5s 2.5s' }} />
                <circle cx="500" cy="65" r="4" fill="#3776AB" opacity={isVisible ? 1 : 0} style={{ transition: 'opacity 0.5s 2.7s' }} />
                <circle cx="500" cy="25" r="4" fill="#CE412B" opacity={isVisible ? 1 : 0} style={{ transition: 'opacity 0.5s 2.9s' }} />
              </>
            )}
          </svg>
        </div>
      </div>
    </section>
  );
}
