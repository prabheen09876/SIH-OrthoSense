import {
  ArrowUpRight,
  FileWarning,
  ImageUp,
  Loader2,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { ApiError, predictXray, type XrayPrediction } from '../services/api'
import { useScreening } from '../state/screening-context'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

type Status = 'idle' | 'loading' | 'success' | 'error'

const severityTag: Record<string, string> = {
  'Low Risk': 'risk-tag--low',
  'Medium Risk': 'risk-tag--moderate',
  'High Risk': 'risk-tag--high',
}

export default function XrayAnalysis() {
  const { profile } = useScreening()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<XrayPrediction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Please choose a JPEG, PNG, or WEBP image.')
      setStatus('error')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError('Image is larger than the 10 MB limit.')
      setStatus('error')
      return
    }
    setFile(candidate)
    setPreview(URL.createObjectURL(candidate))
    setResult(null)
    setError(null)
    setStatus('idle')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    acceptFile(event.dataTransfer.files[0])
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setStatus('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function analyze() {
    if (!file) return
    setStatus('loading')
    setError(null)
    try {
      const prediction = await predictXray(file)
      setResult(prediction)
      setStatus('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong during analysis.')
      setStatus('error')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-heading page-heading--compact">
        <div>
          <span className="eyebrow"><ScanLine size={15} /> AI-assisted grading</span>
          <h1>Knee X-ray osteoarthritis analysis.</h1>
          <p>Upload a weight-bearing knee radiograph for {profile.name || 'the patient'}. The DenseNet-121 ordinal model grades joint space narrowing on a 0–2 scale.</p>
        </div>
      </div>

      <section className="xray-layout">
        <article className="panel xray-panel">
          <div className="panel-heading">
            <div><span className="micro-label">1. Image input</span><h2>Upload radiograph</h2></div>
            {file && <button className="text-button" onClick={reset}><X size={15} /> Clear</button>}
          </div>

          {!preview ? (
            <div
              className={`xray-dropzone ${dragActive ? 'xray-dropzone--active' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                hidden
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
              <span className="xray-dropzone__icon"><ImageUp size={30} /></span>
              <strong>Drag and drop, or click to browse</strong>
              <small>JPEG, PNG, or WEBP · up to 10 MB</small>
            </div>
          ) : (
            <div className="xray-preview">
              <img src={preview} alt="Uploaded knee radiograph preview" />
            </div>
          )}

          {status === 'error' && error && (
            <div className="xray-alert">
              <FileWarning size={17} /> <span>{error}</span>
            </div>
          )}

          <div className="xray-actions">
            <button
              className="button button--primary"
              disabled={!file || status === 'loading'}
              onClick={analyze}
            >
              {status === 'loading' ? <><Loader2 size={17} className="spin" /> Analyzing…</> : <><Sparkles size={17} /> Run analysis</>}
            </button>
            {status === 'error' && file && (
              <button className="button button--secondary" onClick={analyze}><RotateCcw size={16} /> Retry</button>
            )}
          </div>
        </article>

        <article className="panel xray-panel xray-result-panel">
          <div className="panel-heading">
            <div><span className="micro-label">2. Model output</span><h2>Grading result</h2></div>
            {result && <span className={`risk-tag ${severityTag[result.class_details.severity] ?? ''}`}>{result.class_details.severity}</span>}
          </div>

          {status !== 'success' || !result ? (
            <div className="xray-empty">
              <ScanLine size={26} />
              <p>{status === 'loading' ? 'Running inference on the uploaded image…' : 'Upload and analyze an image to see the model’s grading.'}</p>
            </div>
          ) : (
            <div className="xray-result">
              <div className="xray-result__headline">
                <span className="xray-grade-badge">{result.class_details.badge}</span>
                <div>
                  <span className="micro-label">Predicted grade</span>
                  <strong>{result.class_details.name}</strong>
                  <small>Confidence <b>{(result.confidence * 100).toFixed(1)}%</b> · {result.image_size}px processed</small>
                </div>
              </div>

              <p className="xray-result__description">{result.class_details.description}</p>

              <div className="xray-distribution">
                <span className="micro-label">Class probability</span>
                {['0', '1', '2'].map((grade) => (
                  <div className="xray-distribution__row" key={grade}>
                    <span>Grade {grade}</span>
                    <i><b style={{ width: `${Math.round((result.class_distribution[grade] ?? 0) * 100)}%` }} /></i>
                    <strong>{Math.round((result.class_distribution[grade] ?? 0) * 100)}%</strong>
                  </div>
                ))}
              </div>

              <div className="xray-recommendation">
                <ArrowUpRight size={18} />
                <span><strong>Suggested next step</strong>{result.class_details.recommendation}</span>
              </div>

              <div className="xray-safeguard">
                <ShieldAlert size={16} />
                <span>{result.disclaimer}</span>
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
