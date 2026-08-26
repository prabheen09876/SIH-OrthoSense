import {
  ArrowRight,
  BatteryMedium,
  Bluetooth,
  Check,
  Footprints,
  Gauge,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Workflow from '../components/Workflow'
import { useToast } from '../components/toast-context'

type Device = {
  id: string
  name: string
  placement: string
  battery: number
  signal: string
  icon: typeof Smartphone
}

const deviceList: Device[] = [
  { id: 'left', name: 'Left IMU', placement: 'Upper tibia · L', battery: 85, signal: 'Strong', icon: Smartphone },
  { id: 'right', name: 'Right IMU', placement: 'Upper tibia · R', battery: 72, signal: 'Strong', icon: Smartphone },
  { id: 'insole', name: 'Pressure insoles', placement: 'Bilateral plantar matrix', battery: 98, signal: 'Good', icon: Footprints },
]

export default function Devices() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [syncing, setSyncing] = useState<string | null>(null)
  const [calibrated, setCalibrated] = useState(() => new Set(deviceList.map((device) => device.id)))

  function resync(id: string) {
    if (syncing) return
    setSyncing(id)
    setCalibrated((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    window.setTimeout(() => {
      setCalibrated((current) => new Set(current).add(id))
      setSyncing(null)
      showToast(`${deviceList.find((device) => device.id === id)?.name} calibrated`)
    }, 900)
  }

  const ready = calibrated.size === deviceList.length && !syncing

  return (
    <div className="page-inner">
      <Workflow current={1} />
      <div className="page-heading page-heading--compact">
        <div>
          <span className="eyebrow"><Bluetooth size={15} /> Simulated sensor kit · Step 2 of 4</span>
          <h1>Connect. Place. Calibrate.</h1>
          <p>Confirm each sensor is secure before beginning the guided movement sequence.</p>
        </div>
        <div className="kit-id"><span>Demo kit ID</span><strong>NER-AZL-024</strong></div>
      </div>

      <section className="device-grid" aria-label="Connected screening devices">
        {deviceList.map((device) => {
          const connected = calibrated.has(device.id)
          const Icon = device.icon
          return (
            <article className={`device-card ${connected ? 'device-card--ready' : 'device-card--syncing'}`} key={device.id}>
              <div className="device-card__top">
                <span className="device-icon"><Icon size={23} /></span>
                <span className={`status-pill ${connected ? 'status-pill--success' : 'status-pill--syncing'}`}>
                  <span /> {connected ? 'Connected' : 'Calibrating'}
                </span>
              </div>
              <div className="device-card__copy"><h2>{device.name}</h2><p>{device.placement}</p></div>
              <div className="device-orbit" aria-hidden="true">
                <span className="device-core">{connected ? <Check size={34} /> : <RefreshCw size={30} />}</span>
                <i /><i /><i />
              </div>
              <div className="device-meta">
                <span><BatteryMedium size={17} /> {device.battery}%</span>
                <span><Radio size={17} /> {device.signal}</span>
              </div>
              <button className="text-button" type="button" onClick={() => resync(device.id)} disabled={Boolean(syncing)}>
                <RefreshCw size={15} /> Recalibrate
              </button>
            </article>
          )
        })}
      </section>

      <section className="device-bottom-grid">
        <article className="panel placement-panel">
          <div className="panel-heading">
            <div><span className="micro-label">Placement check</span><h2>Three signals, one synchronized frame</h2></div>
          </div>
          <div className="sensor-flow" aria-label="Sensor data flow">
            <div><span><Smartphone size={21} /></span><strong>Left IMU</strong><small>100 Hz</small></div>
            <i className="flow-line"><b /></i>
            <div><span><Footprints size={21} /></span><strong>Insoles</strong><small>60 Hz</small></div>
            <i className="flow-line"><b /></i>
            <div><span><Gauge size={21} /></span><strong>Fusion</strong><small>Aligned</small></div>
          </div>
        </article>

        <article className="offline-card">
          <span className="offline-card__icon"><WifiOff size={22} /></span>
          <div><span className="micro-label">Field-ready concept</span><h2>Designed for offline capture.</h2><p>A production build would encrypt records locally and sync when the health grid reconnects.</p></div>
          <ShieldCheck size={20} className="offline-card__shield" />
        </article>
      </section>

      <section className={`ready-bar ${ready ? 'ready-bar--ready' : ''}`} aria-live="polite">
        <span className="ready-bar__icon">{ready ? <Check size={24} /> : <RefreshCw size={23} />}</span>
        <div><strong>{ready ? 'Demo kit ready for movement capture' : 'Calibrating sensor kit'}</strong><small>{ready ? 'All three simulated data streams are aligned.' : 'Keep the patient still for a moment.'}</small></div>
        <button className="button button--primary" disabled={!ready} onClick={() => navigate('/movement')}>Start movement test <ArrowRight size={18} /></button>
      </section>
    </div>
  )
}
