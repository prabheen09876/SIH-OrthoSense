import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  MapPin,
  ScanLine,
  ScanSearch,
  ShieldCheck,
  Stethoscope,
  Wifi,
} from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegionalCoverage } from '../components/DataVisuals'

const ClinicalScene = lazy(() => import('../components/ClinicalScene'))

const recentCases = [
  { initials: 'LM', name: 'Lalrempuii Sailo', meta: 'Aizawl · 58 yrs', risk: 'High', score: 78, when: '8 min ago' },
  { initials: 'TB', name: 'Tashi Bhutia', meta: 'Gangtok · 51 yrs', risk: 'Moderate', score: 54, when: '34 min ago' },
  { initials: 'RD', name: 'Rina Das', meta: 'Jorhat · 46 yrs', risk: 'Low', score: 22, when: '1 hr ago' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="page-inner dashboard-page">
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> MDoNER joint health initiative</span>
          <h1 id="dashboard-title">See joint risk <em>sooner.</em></h1>
          <p className="hero-lede">
            One guided screening combines gait, pressure, pain and regional context—giving clinicians a clearer signal before osteoarthritis limits movement.
          </p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => navigate('/assessment')}>
              Start a screening <ArrowRight size={18} />
            </button>
            <button className="button button--secondary" onClick={() => navigate('/report')}>
              Open demo report
            </button>
            <button className="button button--ghost" onClick={() => navigate('/xray')}>
              <ScanSearch size={18} /> Analyze an X-ray
            </button>
          </div>
          <div className="trust-strip" aria-label="Platform capabilities">
            <span><ShieldCheck size={17} /> Consent-first</span>
            <span><Wifi size={17} /> Low-bandwidth sync</span>
            <span><Stethoscope size={17} /> Clinician reviewed</span>
          </div>
        </div>

        <div className="risk-lens-card">
          <div className="risk-lens-card__head">
            <div>
              <span className="micro-label">Interactive risk lens</span>
              <strong>Medial knee loading</strong>
            </div>
            <span className="live-pill"><span /> AI overlay</span>
          </div>
          <div className="scene-figure">
            <Suspense fallback={<div className="scene-loading">Preparing 3D joint…</div>}>
              <ClinicalScene variant="knee" riskSide="left" />
            </Suspense>
          </div>
          <div className="model-callout model-callout--top">
            <span>Risk marker</span><strong>Medial load</strong>
          </div>
          <div className="model-callout model-callout--bottom">
            <span>Confidence</span><strong>91%</strong>
          </div>
          <div className="scan-readout" aria-hidden="true"><ScanLine size={17} /> drag to inspect</div>
        </div>
      </section>

      <section className="metric-ribbon" aria-label="Today's screening summary">
        <article>
          <span className="metric-icon metric-icon--teal"><BrainCircuit size={19} /></span>
          <div><span>Screened today</span><strong>24</strong></div>
          <small>↑ 18% this week</small>
        </article>
        <article>
          <span className="metric-icon metric-icon--red"><CircleAlert size={19} /></span>
          <div><span>Priority reviews</span><strong>05</strong></div>
          <small>2 need referral</small>
        </article>
        <article>
          <span className="metric-icon metric-icon--gold"><MapPin size={19} /></span>
          <div><span>Connected sites</span><strong>08</strong></div>
          <small>Across all 8 states</small>
        </article>
        <article>
          <span className="metric-icon metric-icon--blue"><CalendarClock size={19} /></span>
          <div><span>Follow-ups due</span><strong>11</strong></div>
          <small>Next 7 days</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel regional-panel">
          <div className="panel-heading">
            <div>
              <span className="micro-label">NER screening network</span>
              <h2>Field coverage</h2>
            </div>
            <button className="text-button">View sites <ChevronRight size={16} /></button>
          </div>
          <RegionalCoverage />
          <div className="coverage-stats">
            <span><i className="legend-dot legend-dot--active" /> Online · 6</span>
            <span><i className="legend-dot legend-dot--sync" /> Syncing · 2</span>
            <span><i className="legend-dot" /> Offline cache enabled</span>
          </div>
        </article>

        <article className="panel cases-panel">
          <div className="panel-heading">
            <div>
              <span className="micro-label">Clinical queue</span>
              <h2>Recent screenings</h2>
            </div>
            <button className="text-button" onClick={() => navigate('/report')}>View all <ChevronRight size={16} /></button>
          </div>
          <div className="case-list">
            {recentCases.map((patient) => (
              <button className="case-row" key={patient.name} onClick={() => navigate('/report')}>
                <span className="case-avatar">{patient.initials}</span>
                <span className="case-person"><strong>{patient.name}</strong><small>{patient.meta}</small></span>
                <span className={`risk-tag risk-tag--${patient.risk.toLowerCase()}`}>{patient.risk}</span>
                <span className="case-score"><strong>{patient.score}</strong><small>/ 100</small></span>
                <span className="case-time">{patient.when}</span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
