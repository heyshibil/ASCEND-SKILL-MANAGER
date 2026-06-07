import { useEffect, useRef } from 'react';

const DECAY_DATA = [
  { name: 'React', current: 92, status: 'healthy', label: 'Strong demand' },
  { name: 'Node.js', current: 78, status: 'healthy', label: 'Stable' },
  { name: 'jQuery', current: 23, status: 'danger', label: '-67% in 24 months' },
  { name: 'Angular.js', current: 15, status: 'danger', label: 'Rapid decline' },
  { name: 'Docker', current: 85, status: 'healthy', label: 'Growing demand' },
  { name: 'REST APIs', current: 56, status: 'warning', label: 'Shifting to GraphQL' },
];

const STATEMENTS = [
  {
    number: '01',
    text: 'Skills you learned 2 years ago may already be declining in market value.',
  },
  {
    number: '02',
    text: 'The frameworks hiring managers want today aren\'t what they wanted 12 months ago.',
  },
  {
    number: '03',
    text: 'Without data, your next career move is a guess.',
  },
];

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            // Animate decay bars when visible
            const bars = entry.target.querySelectorAll('.decay-bar__fill');
            bars.forEach((bar) => {
              const width = bar.dataset.width;
              if (width) {
                setTimeout(() => { bar.style.width = width + '%'; }, 200);
              }
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.problem-statement, .problem-section__header');
    elements?.forEach((el) => {
      el.classList.add('landing-reveal');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="problem-section" id="features" ref={sectionRef}>

      <div className="problem-section__header landing-reveal">
        <p className="section-label">The Problem</p>
        <h2 className="problem-section__title">
          Skills decay. Markets shift. Careers stall.
        </h2>
        <p className="problem-section__subtitle">
          The tech landscape changes faster than any developer can track alone.
        </p>
      </div>

      <div className="problem-section__statements">
        {STATEMENTS.map((stmt, idx) => (
          <div className="problem-statement" key={idx}>
            <div>
              <div className="problem-statement__number">{stmt.number}</div>
              <p className="problem-statement__text">{stmt.text}</p>
            </div>

            {/* Decay bars for the first statement */}
            {idx === 0 && (
              <div className="decay-bars">
                {DECAY_DATA.slice(0, 3).map((skill) => (
                  <div className="decay-bar" key={skill.name}>
                    <div className="decay-bar__label">
                      <span className="decay-bar__name">{skill.name}</span>
                      <span
                        className="decay-bar__value"
                        style={{
                          color: skill.status === 'healthy' ? 'var(--landing-success)' :
                                 skill.status === 'warning' ? 'var(--landing-warning)' :
                                 'var(--landing-danger)'
                        }}
                      >
                        {skill.label}
                      </span>
                    </div>
                    <div className="decay-bar__track">
                      <div
                        className={`decay-bar__fill decay-bar__fill--${skill.status}`}
                        data-width={skill.current}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Decay bars for the second statement */}
            {idx === 1 && (
              <div className="decay-bars">
                {DECAY_DATA.slice(3, 6).map((skill) => (
                  <div className="decay-bar" key={skill.name}>
                    <div className="decay-bar__label">
                      <span className="decay-bar__name">{skill.name}</span>
                      <span
                        className="decay-bar__value"
                        style={{
                          color: skill.status === 'healthy' ? 'var(--landing-success)' :
                                 skill.status === 'warning' ? 'var(--landing-warning)' :
                                 'var(--landing-danger)'
                        }}
                      >
                        {skill.label}
                      </span>
                    </div>
                    <div className="decay-bar__track">
                      <div
                        className={`decay-bar__fill decay-bar__fill--${skill.status}`}
                        data-width={skill.current}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Data-driven insight for third */}
            {idx === 2 && (
              <div className="decay-bars" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--landing-border)',
                  borderRadius: 'var(--landing-radius-md)',
                  fontFamily: 'var(--landing-font-mono)',
                  fontSize: '13px',
                  color: 'var(--landing-text-tertiary)',
                  lineHeight: 1.8,
                }}>
                  <span style={{ color: 'var(--landing-text-secondary)' }}>$</span> ascend analyze --career
                  <br />
                  <span style={{ color: 'var(--landing-danger)' }}>⚠ 3 skills below market threshold</span>
                  <br />
                  <span style={{ color: 'var(--landing-warning)' }}>△ 2 skills trending downward</span>
                  <br />
                  <span style={{ color: 'var(--landing-success)' }}>✓ 4 skills in high demand</span>
                  <br />
                  <br />
                  <span style={{ color: 'var(--landing-text-secondary)' }}>Career Liquidity Score: </span>
                  <span style={{ color: 'var(--landing-text-primary)' }}>calculating...</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
