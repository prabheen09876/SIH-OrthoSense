import {
  Activity,
  ArrowUpRight,
  Check,
  Download,
  FileCheck2,
  Footprints,
  HeartPulse,
  MapPin,
  Share2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { FootPressureMap, RiskGauge } from '../components/DataVisuals'
import Workflow from '../components/Workflow'
import { useToast } from '../components/toast-context'
import { useScreening } from '../state/screening-context'

const ClinicalScene = lazy(() => import('../components/ClinicalScene'))

const findings = {
  loading: { label: 'Medial loading', value: '+34%', copy: 'Left medial compartment load is elevated during stance compared with the contralateral side.' },
  symmetry: { label: 'Gait symmetry', value: '82%', copy: 'Step timing is outside the expected bilateral range, with a repeatable left-side compensation pattern.' },
  pain: { label: 'Pain correlation', value: '6/10', copy: 'Reported pain aligns with the detected load pattern, increasing the priority for clinical follow-up.' },
}

type FindingKey = keyof typeof findings

export default function Report() {
  const { showToast } = useToast()
  const { profile } = useScreening()
  const [activeFinding, setActiveFinding] = useState<FindingKey>('loading')
  const [signed, setSigned] = useState(false)
  const riskSide = profile.joint.toLowerCase().startsWith('right') ? 'right' : 'left'
  const sideLabel = riskSide === 'left' ? 'Left' : 'Right'
  const finding = activeFinding === 'pain'
    ? { ...findings.pain, value: `${profile.pain}/10` }
    : activeFinding === 'loading'
      ? { ...findings.loading, copy: `${sideLabel} medial compartment load is elevated during stance compared with the contralateral side.` }
      : findings[activeFinding]

  function downloadReport() {
    const text = `ORTHOSENSE AI — DEMO OA RISK SCREENING\nPatient: ${profile.name} (PT-84729)\nScreening priority index: 78/100 · High\nCross-signal agreement: 91%\nPrimary marker: Elevated ${profile.joint.toLowerCase()} loading\n\nPrototype output only. This model is not clinically validated and this screening is not a diagnosis.`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'orthosense-PT-84729-report.txt'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Demo report downloaded')
  }

  async function shareReport() {
    const shareText = `OrthoSense AI demo screening PT-84729 (${profile.name}): clinician review requested.`
    try {
      await navigator.clipboard.writeText(shareText)
      showToast('Case summary copied to clipboard')
    } catch {
      showToast('Case is ready to share from this device')
    }
  }

  return (
    <div className="page-inner">
      <Workflow current={3} />
      <div className="report-header">
        <div>
          <div className="report-meta"><span>Demo case · PT-84729</span><span>25 Aug 2026 · 10:42</span><span className="risk-tag risk-tag--high">High priority</span></div>
          <h1>OA risk screening report</h1>
          <p>Multimodal evidence for {profile.name} · {profile.joint.toLowerCase()} assessment.</p>
        </div>
        <div className="report-actions">
          <button className="button button--secondary" onClick={shareReport}><Share2 size={17} /> Copy case summary</button>
          <button className="button button--primary" onClick={downloadReport}><Download size={17} /> Download report</button>
        </div>
      </div>

      <section className="report-summary-grid">
        <article className="panel risk-overview">
          <RiskGauge value={78} label="High priority" unit="/100" />
          <div className="risk-overview__copy">
            <span className="micro-label">Screening priority index</span>
            <h2>Early markers warrant clinical follow-up.</h2>
            <p>Repeated loading asymmetry, reduced range of motion, and pain alignment combine into a high-priority screening result.</p>
            <div className="confidence-row">
              <span><Sparkles size={16} /> Cross-signal agreement</span><strong>91%</strong>
              <i><b style={{ width: '91%' }} /></i>
            </div>
            <small className="prototype-note">Illustrative prototype metric—not clinically validated.</small>
          </div>
        </article>

        <article className="clinical-summary-card">
          <span className="micro-label">Clinical summary</span>
          <h2>What needs attention</h2>
          <div className="summary-observation"><ShieldAlert size={22} /><p><strong>Primary observation</strong>Elevated medial loading during {riskSide} stance, consistent across IMU and insole signals.</p></div>
          <ul className="check-list">
            <li><Check size={16} /> Schedule physical therapy assessment</li>
            <li><Check size={16} /> Review weight-bearing radiograph if indicated</li>
            <li><Check size={16} /> Repeat movement screen in 6 weeks</li>
          </ul>
        </article>
      </section>

      <section className="evidence-layout">
        <article className="panel evidence-scene">
          <div className="panel-heading">
            <div><span className="micro-label">Interactive evidence model</span><h2>Kinematic risk lens</h2></div>
            <span className="live-pill live-pill--muted"><span /> Review mode</span>
          </div>
          <div className="finding-tabs" role="tablist" aria-label="Risk markers">
            {(Object.keys(findings) as FindingKey[]).map((key) => <button key={key} role="tab" aria-selected={activeFinding === key} className={activeFinding === key ? 'finding-tab finding-tab--active' : 'finding-tab'} onClick={() => setActiveFinding(key)}>{findings[key].label}</button>)}
          </div>
          <div className="report-scene-wrap">
            <div className="scene-figure scene-figure--report">
              <Suspense fallback={<div className="scene-loading">Preparing clinical model…</div>}>
                <ClinicalScene variant="knee" riskSide={riskSide} />
              </Suspense>
            </div>
            <div className="active-finding-card">
              <span>{finding.label}</span><strong>{finding.value}</strong><p>{finding.copy}</p>
            </div>
            <div className="anatomy-label anatomy-label--upper">Femoral load axis <span /></div>
            <div className="anatomy-label anatomy-label--lower">Tibial plateau <span /></div>
          </div>
        </article>

        <aside className="evidence-sidebar">
          <article className="panel evidence-card">
            <div className="card-title-row"><div><Activity size={19} /><span><strong>Gait markers</strong><small>IMU synthesis</small></span></div></div>
            <dl className="evidence-list">
              <div><dt>Stance asymmetry</dt><dd><strong>+24%</strong><span className="risk-tag risk-tag--high">Elevated</span></dd></div>
              <div><dt>Knee ROM</dt><dd><strong>104°</strong><span className="risk-tag risk-tag--moderate">Reduced</span></dd></div>
              <div><dt>Cadence variability</dt><dd><strong>4.2%</strong><span className="risk-tag risk-tag--low">Normal</span></dd></div>
            </dl>
          </article>
          <article className="panel pressure-mini-card">
            <div className="card-title-row"><div><Footprints size={19} /><span><strong>Pressure profile</strong><small>Peak plantar load</small></span></div></div>
            <div className="pressure-mini"><FootPressureMap side="left" severity="elevated" /><FootPressureMap side="right" severity="normal" /></div>
            <div className="pressure-mini-values"><span>L · <b>482 kPa</b></span><span>R · <b>315 kPa</b></span></div>
          </article>
        </aside>
      </section>

      <section className="recommendations">
        <div className="recommendations-heading">
          <span className="section-icon"><Sparkles size={20} /></span>
          <div><span className="micro-label">AI-assisted care pathway</span><h2>Recommended next steps</h2><p>Generated from the captured markers. Final decisions remain with the clinician.</p></div>
        </div>
        <div className="recommendation-grid">
          <article><span>01</span><HeartPulse size={22} /><h3>Clinical review</h3><p>Evaluate the left medial compartment and confirm whether imaging is appropriate.</p><small>Priority · within 2 weeks</small></article>
          <article><span>02</span><Stethoscope size={22} /><h3>Mobility plan</h3><p>Begin low-impact strengthening focused on hip abductors and controlled knee loading.</p><small>Community physiotherapy</small></article>
          <article><span>03</span><MapPin size={22} /><h3>Connected follow-up</h3><p>Repeat the same sensor protocol locally and share the delta with the referral centre.</p><small>Review · 6 weeks</small></article>
        </div>
        <div className="report-footer">
          <p><ShieldAlert size={18} /><span><strong>Clinical safeguard</strong>This prototype is not clinically validated. Its AI-assisted screening output is not a definitive diagnosis.</span></p>
          <button className={`button ${signed ? 'button--signed' : 'button--primary'}`} onClick={() => { setSigned(true); showToast('Report acknowledged and signed') }} disabled={signed}>
            {signed ? <><FileCheck2 size={18} /> Reviewed in prototype</> : <>Mark reviewed (demo) <ArrowUpRight size={18} /></>}
          </button>
        </div>
      </section>
    </div>
  )
}
