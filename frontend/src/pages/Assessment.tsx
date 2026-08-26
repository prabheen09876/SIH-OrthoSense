import { ArrowRight, Check, ClipboardPlus, MapPinned, Save, ShieldCheck, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Workflow from '../components/Workflow'
import { useToast } from '../components/toast-context'
import { useScreening, type ScreeningProfile } from '../state/screening-context'

const exposureOptions = ['Hill terrain', 'Farm work', 'Prolonged standing', 'Prior knee injury']

export default function Assessment() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, setProfile } = useScreening()
  const [exposures, setExposures] = useState<string[]>(['Hill terrain', 'Farm work'])
  const [consent, setConsent] = useState(false)

  function updateField<Key extends keyof ScreeningProfile>(key: Key, value: ScreeningProfile[Key]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function toggleExposure(value: string) {
    setExposures((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    showToast('Patient profile saved securely')
    navigate('/devices')
  }

  return (
    <div className="page-inner">
      <Workflow current={0} />
      <div className="page-heading">
        <div>
          <span className="eyebrow"><ClipboardPlus size={15} /> New screening · Step 1 of 4</span>
          <h1>Build the patient context.</h1>
          <p>Demographic, pain, and terrain exposure data help the model interpret movement markers responsibly.</p>
        </div>
        <span className="draft-badge"><span /> Prototype data</span>
      </div>

      <form className="assessment-layout" onSubmit={handleSubmit}>
        <div className="form-stack">
          <section className="panel form-panel">
            <div className="section-title">
              <span className="section-icon"><UserRound size={19} /></span>
              <div><h2>Patient details</h2><p>Core details used to normalize gait and load.</p></div>
            </div>
            <div className="field-grid">
              <label className="field field--wide">
                <span>Full name</span>
                <input name="name" value={profile.name} onChange={(event) => updateField('name', event.target.value)} required />
              </label>
              <label className="field">
                <span>Age</span>
                <input name="age" type="number" min="18" max="100" value={profile.age} onChange={(event) => updateField('age', Number(event.target.value))} required />
              </label>
              <label className="field">
                <span>Sex</span>
                <select name="sex" value={profile.sex} onChange={(event) => updateField('sex', event.target.value)}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select>
              </label>
              <label className="field">
                <span>Height <small>cm</small></span>
                <input name="height" type="number" value={profile.height} onChange={(event) => updateField('height', Number(event.target.value))} required />
              </label>
              <label className="field">
                <span>Weight <small>kg</small></span>
                <input name="weight" type="number" value={profile.weight} onChange={(event) => updateField('weight', Number(event.target.value))} required />
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="section-title">
              <span className="section-icon"><MapPinned size={19} /></span>
              <div><h2>Regional context</h2><p>Local conditions can shape access, activity, and follow-up.</p></div>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>State</span>
                <select name="state" value={profile.state} onChange={(event) => updateField('state', event.target.value)}>
                  <option>Assam</option><option>Arunachal Pradesh</option><option>Manipur</option>
                  <option>Meghalaya</option><option>Mizoram</option><option>Nagaland</option><option>Sikkim</option><option>Tripura</option>
                </select>
              </label>
              <label className="field">
                <span>District / field site</span>
                <input name="district" value={profile.site} onChange={(event) => updateField('site', event.target.value)} />
              </label>
              <label className="field">
                <span>Preferred language</span>
                <select name="language" value={profile.language} onChange={(event) => updateField('language', event.target.value)}><option>Mizo</option><option>English</option><option>Hindi</option><option>Assamese</option></select>
              </label>
              <label className="field">
                <span>Referral centre</span>
                <select name="referral" value={profile.referral} onChange={(event) => updateField('referral', event.target.value)}><option>Zoram Medical College</option><option>District Civil Hospital</option></select>
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="section-title">
              <span className="section-icon"><ClipboardPlus size={19} /></span>
              <div><h2>Joint health history</h2><p>Patient-reported signals stay visible alongside AI findings.</p></div>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Primary complaint</span>
                <select name="joint" value={profile.joint} onChange={(event) => updateField('joint', event.target.value)}><option>Left knee</option><option>Right knee</option><option>Both knees</option><option>Hip</option><option>Ankle</option></select>
              </label>
              <label className="field">
                <span>Symptom duration</span>
                <select name="duration" value={profile.duration} onChange={(event) => updateField('duration', event.target.value)}><option>Under 3 months</option><option>3–6 months</option><option>6–12 months</option><option>Over 1 year</option></select>
              </label>
              <div className="field field--wide range-field">
                <span>Pain today <strong>{profile.pain}/10</strong></span>
                <input aria-label="Pain score" type="range" min="0" max="10" value={profile.pain} onChange={(event) => updateField('pain', Number(event.target.value))} />
                <div><small>No pain</small><small>Severe pain</small></div>
              </div>
              <div className="field field--wide">
                <span>Activity & terrain exposure</span>
                <div className="choice-row">
                  {exposureOptions.map((option) => {
                    const active = exposures.includes(option)
                    return <button key={option} className={`choice-chip ${active ? 'choice-chip--active' : ''}`} type="button" aria-pressed={active} onClick={() => toggleExposure(option)}>{active && <Check size={14} />} {option}</button>
                  })}
                </div>
              </div>
              <label className="field field--wide">
                <span>Clinical notes <small>optional</small></span>
                <textarea name="notes" rows={3} value={profile.notes} onChange={(event) => updateField('notes', event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        <aside className="assessment-summary">
          <section className="panel summary-card">
            <span className="micro-label">Screening preview</span>
            <h2>Ready for baseline capture</h2>
            <dl className="summary-list">
              <div><dt>Patient</dt><dd>{profile.name || 'Not entered'}</dd></div>
              <div><dt>Primary joint</dt><dd>{profile.joint}</dd></div>
              <div><dt>Pain score</dt><dd>{profile.pain} / 10</dd></div>
              <div><dt>Site</dt><dd>{profile.site || 'Not entered'}</dd></div>
            </dl>
            <div className="context-note"><MapPinned size={17} /><span>Terrain exposure will be included as context, not treated as a diagnosis.</span></div>
          </section>
          <label className="consent-card">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span className="consent-check"><Check size={14} /></span>
            <span><strong>Patient consent recorded</strong><small>Consent covers sensor capture and secure clinical review.</small></span>
            <ShieldCheck size={20} />
          </label>
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={() => showToast('Demo draft saved for this session')}><Save size={17} /> Save draft</button>
            <button type="submit" className="button button--primary" disabled={!consent}>Continue to devices <ArrowRight size={17} /></button>
          </div>
        </aside>
      </form>
    </div>
  )
}
