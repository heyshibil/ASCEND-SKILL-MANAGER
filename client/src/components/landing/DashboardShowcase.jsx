import { useEffect, useRef, useState } from 'react';

export default function DashboardShowcase() {
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
    <section className="dashboard-section" ref={sectionRef}>
      <div className={`dashboard-section__header ${reveal()}`}>
        <p className="dashboard-section__label">The Product</p>
        <h2 className="dashboard-section__title">
          Everything you need. Nothing you don't.
        </h2>
        <p className="dashboard-section__subtitle">
          Verify skills, track market shifts, and chart your growth all in one.
        </p>
      </div>

      <div className={`dashboard-section__mockup-wrapper ${reveal(1)}`}>
        <div className="dashboard-section__mockup">
          {/* Browser chrome */}
          <div className="dashboard-section__chrome">
            <div className="dashboard-section__chrome-dot" />
            <div className="dashboard-section__chrome-dot" />
            <div className="dashboard-section__chrome-dot" />
            <div className="dashboard-section__chrome-bar">
              <span className="dashboard-section__chrome-url">app.ascend.dev/dashboard</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="dashboard-section__content">
            {/* Sidebar */}
            <div className="dashboard-mock__sidebar">
              <div className="dashboard-mock__sidebar-group">
                <div className="dashboard-mock__sidebar-label">Main</div>
                <div className="dashboard-mock__sidebar-item active">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                  Overview
                </div>
                <div className="dashboard-mock__sidebar-item">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v14M1 8h14"/></svg>
                  Skill Control
                </div>
                <div className="dashboard-mock__sidebar-item">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14l4-4 3 3 5-7"/></svg>
                  Market Intel
                </div>
                <div className="dashboard-mock__sidebar-item">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12l5-5 3 3 6-6"/></svg>
                  Leaderboard
                </div>
                <div className="dashboard-mock__sidebar-item">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M6 8h4M8 6v4"/></svg>
                  Problems
                </div>
              </div>
              <div className="dashboard-mock__sidebar-group">
                <div className="dashboard-mock__sidebar-label">Account</div>
                <div className="dashboard-mock__sidebar-item">
                  <svg className="dashboard-mock__sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
                  Settings
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="dashboard-mock__main">
              <div className="dashboard-mock__header">
                <h3>Overview</h3>
                <div style={{
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderRadius: 'var(--landing-radius-full)',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 500,
                }}>
                  Generate Report
                </div>
              </div>

              {/* Metric cards */}
              <div className="dashboard-mock__metrics">
                <div className="dashboard-mock__metric-card">
                  <div className="dashboard-mock__metric-label">Career Liquidity</div>
                  <div className="dashboard-mock__metric-value">847</div>
                  <div className="dashboard-mock__metric-trend dashboard-mock__metric-trend--up">+12.3%</div>
                </div>
                <div className="dashboard-mock__metric-card">
                  <div className="dashboard-mock__metric-label">Verified Skills</div>
                  <div className="dashboard-mock__metric-value">9</div>
                  <div className="dashboard-mock__metric-trend dashboard-mock__metric-trend--up">+2 this month</div>
                </div>
                <div className="dashboard-mock__metric-card">
                  <div className="dashboard-mock__metric-label">Skill Debt</div>
                  <div className="dashboard-mock__metric-value">3</div>
                  <div className="dashboard-mock__metric-trend dashboard-mock__metric-trend--down">needs attention</div>
                </div>
                <div className="dashboard-mock__metric-card">
                  <div className="dashboard-mock__metric-label">Market Rank</div>
                  <div className="dashboard-mock__metric-value">Top 8%</div>
                  <div className="dashboard-mock__metric-trend dashboard-mock__metric-trend--up">↑ 3 positions</div>
                </div>
              </div>

              {/* Chart area */}
              <div className="dashboard-mock__chart">
                <div className="dashboard-mock__chart-title">Skill Growth Over Time</div>
                <div className="dashboard-mock__chart-graph">
                  {/* SVG chart illustration */}
                  <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="0" y1={i * 40} x2="600" y2={i * 40}
                        stroke="rgba(168,167,161,0.06)" strokeWidth="1" />
                    ))}

                    {/* Main trend line */}
                    <path
                      d="M0,120 C100,110 150,90 200,85 C250,80 300,60 350,55 C400,50 450,35 500,30 C550,25 600,20 600,15"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    {/* Main area fill */}
                    <path
                      d="M0,120 C100,110 150,90 200,85 C250,80 300,60 350,55 C400,50 450,35 500,30 C550,25 600,20 600,15 L600,160 L0,160 Z"
                      fill="url(#whiteGrad)"
                      opacity="0.15"
                    />

                    {/* TypeScript trend line */}
                    <path
                      d="M0,140 C100,135 150,120 200,100 C250,95 300,80 350,70 C400,65 450,55 500,45 C550,40 600,35 600,30"
                      fill="none"
                      stroke="#71717a"
                      strokeWidth="2"
                      opacity="0.8"
                    />

                    {/* Python trend line */}
                    <path
                      d="M0,100 C100,105 150,95 200,100 C250,98 300,95 350,92 C400,90 450,88 500,85 C550,82 600,80 600,78"
                      fill="none"
                      stroke="#3f3f46"
                      strokeWidth="2"
                      opacity="0.6"
                    />

                    <defs>
                      <linearGradient id="whiteGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Data point highlight */}
                    <circle cx="500" cy="30" r="4" fill="#ffffff" />
                    <circle cx="500" cy="30" r="8" fill="#ffffff" opacity="0.2" />

                    {/* Tooltip */}
                    <rect x="460" y="6" width="85" height="22" rx="4" fill="rgba(20,20,19,0.95)" stroke="rgba(168,167,161,0.1)" strokeWidth="1"/>
                    <text x="502" y="21" textAnchor="middle" fill="#F2F1EE" fontSize="10" fontFamily="JetBrains Mono, monospace">Score: 847</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature callouts */}
      <div className={`dashboard-section__features ${reveal(2)}`}>
        <div className="dashboard-feature">
          <div className="dashboard-feature__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 5L8 13L4 9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="dashboard-feature__title">Skill Verification</h3>
          <p className="dashboard-feature__description">
            AI-powered coding assessments that evaluate real competency, not just syntax recall.
          </p>
        </div>

        <div className="dashboard-feature">
          <div className="dashboard-feature__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 16L7 11L11 14L18 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="dashboard-feature__title">Growth Tracking</h3>
          <p className="dashboard-feature__description">
            See which skills are rising, which are fading, and where to invest your time next.
          </p>
        </div>

        <div className="dashboard-feature">
          <div className="dashboard-feature__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L18 2L18 7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 2L10 10" strokeLinecap="round"/>
              <path d="M8 4H4C3 4 2 5 2 6V16C2 17 3 18 4 18H14C15 18 16 17 16 16V12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="dashboard-feature__title">Instant Insights</h3>
          <p className="dashboard-feature__description">
            Connect GitHub or upload a resume to get your career intelligence in seconds.
          </p>
        </div>
      </div>
    </section>
  );
}
