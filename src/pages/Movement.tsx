import {
  Activity,
  ArrowRight,
  CircleStop,
  Footprints,
  Gauge,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FootPressureMap, TelemetryChart } from '../components/DataVisuals'
import Workflow from '../components/Workflow'
import { useScreening } from '../state/screening-context'

const ClinicalScene = lazy(() => import('../components/ClinicalScene'))

const phases = ['Baseline', 'Walk', 'Sit–stand']

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

export default function Movement() {
  const navigate = useNavigate()
  const { profile, setProfile } = useScreening()
  const [running, setRunning] = useState(true)
  const [seconds, setSeconds] = useState(84)
  const [phase, setPhase] = useState(1)
  const [location, setLocation] = useState(profile.joint)
  const steps = useMemo(() => 14 + Math.floor(Math.max(0, seconds - 84) / 3), [seconds])
  const riskSide = profile.joint.toLowerCase().startsWith('right') ? 'right' : 'left'

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  return (
    <div className="page-inner page-inner--wide">
      <Workflow current={2} />
      <div className="capture-header">
        <div>
          <span className="eyebrow"><span className={`record-dot ${running ? 'record-dot--active' : ''}`} /> Simulated multimodal capture</span>
          <h1>Movement test</h1>
        </div>
        <div className="capture-patient"><span>PT-84729</span><strong>{profile.name}</strong><small>{profile.joint} · pain {profile.pain}/10</small></div>
        <button className="button button--secondary" onClick={() => { setSeconds(0); setPhase(0) }}><RotateCcw size={17} /> Restart</button>
      </div>

      <section className="capture-layout">
        <div className="capture-main">
          <article className="capture-viewport">
            <div className="viewport-toolbar">
              <span className="live-pill"><span /> {running ? 'Simulating' : 'Paused'}</span>
              <span><Radio size={16} /> 3 streams synchronized</span>
            </div>
            <div className="scene-figure scene-figure--capture">
              <Suspense fallback={<div className="scene-loading">Loading movement model…</div>}>
                <ClinicalScene variant="lowerBody" riskSide={riskSide} live={running} />
              </Suspense>
            </div>
            <div className="joint-label joint-label--knee"><span /> Knee angle <strong>14.2°</strong></div>
            <div className="joint-label joint-label--stride"><ScanLine size={15} /> Stride <strong>1.20 m</strong></div>
            <div className="capture-grid-floor" aria-hidden="true" />
          </article>

          <div className="telemetry-grid">
            <article className="panel telemetry-card">
              <div className="card-title-row"><div><Activity size={19} /><span><strong>Acceleration</strong><small>Bilateral tibial IMU · m/s²</small></span></div><span className="status-pill status-pill--success"><span /> Live</span></div>
              <TelemetryChart variant="acceleration" />
            </article>
            <article className="panel telemetry-card">
              <div className="card-title-row"><div><Gauge size={19} /><span><strong>Angular velocity</strong><small>Flexion cycle · °/s</small></span></div><span className="mono-value">+42.6</span></div>
              <TelemetryChart variant="velocity" />
            </article>
          </div>

          <article className="panel pressure-panel">
            <div className="panel-heading">
              <div><span className="micro-label">Pressure insoles · live</span><h2>Plantar load distribution</h2></div>
              <div className="heat-legend"><span>Low</span><i /><span>High</span></div>
            </div>
            <div className="pressure-content">
              <div className="pressure-feet"><FootPressureMap side="left" severity="elevated" /><FootPressureMap side="right" severity="normal" /></div>
              <div className="pressure-stats">
                <div><span>Left peak</span><strong>482 <small>kPa</small></strong></div>
                <div><span>Right peak</span><strong>315 <small>kPa</small></strong></div>
                <div className="insight-alert"><Footprints size={19} /><span><strong>34% left bias</strong><small>during stance phase</small></span></div>
              </div>
            </div>
          </article>
        </div>

        <aside className="capture-rail">
          <section className="panel phase-card">
            <span className="micro-label">Diagnostic sequence</span>
            <div className="phase-list">
              {phases.map((item, index) => (
                <button key={item} className={index === phase ? 'phase phase--active' : index < phase ? 'phase phase--done' : 'phase'} onClick={() => setPhase(index)}>
                  <span>{index < phase ? '✓' : index + 1}</span><strong>{item}</strong><small>{index === 0 ? '30 sec' : index === 1 ? '2 min' : '5 reps'}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="panel live-metrics">
            <div><span>Gait symmetry</span><strong>82<small>%</small></strong><i><b style={{ width: '82%' }} /></i></div>
            <div><span>Knee ROM</span><strong>104<small>°</small></strong></div>
            <div><span>Steps</span><strong>{steps}</strong></div>
          </section>

          <section className="panel pain-card">
            <div className="card-title-row"><div><span><strong>Patient-reported pain</strong><small>Capture during movement</small></span></div><span className="pain-value">{profile.pain}</span></div>
            <input aria-label="Current pain score" type="range" min="0" max="10" value={profile.pain} onChange={(event) => setProfile((current) => ({ ...current, pain: Number(event.target.value) }))} />
            <div className="choice-row choice-row--compact">
              {['Left knee', 'Right knee', 'Hip', 'Ankle'].map((item) => <button key={item} aria-pressed={location === item} className={`choice-chip ${location === item ? 'choice-chip--active' : ''}`} onClick={() => { setLocation(item); setProfile((current) => ({ ...current, joint: item })) }}>{item}</button>)}
            </div>
          </section>

          <section className="ai-signal-card">
            <span><ScanLine size={18} /> Early signal</span>
            <strong>Medial load pattern detected</strong>
            <p>Prototype signal agreement is building. Final interpretation belongs to the clinician.</p>
          </section>
        </aside>
      </section>

      <div className="recording-dock" aria-label="Recording controls">
        <button className={`record-button ${running ? 'record-button--active' : ''}`} onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause recording' : 'Resume recording'}>
          {running ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}
        </button>
        <div><strong>{running ? 'Recording' : 'Paused'}</strong><span>{formatTime(seconds)}</span></div>
        <div className={`waveform ${running ? 'waveform--active' : ''}`} aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <i key={index} style={{ '--bar': `${12 + ((index * 11) % 24)}px` } as React.CSSProperties} />)}</div>
        <button className="button button--primary" onClick={() => navigate('/report')}><CircleStop size={17} /> Complete assessment <ArrowRight size={17} /></button>
      </div>
    </div>
  )
}
