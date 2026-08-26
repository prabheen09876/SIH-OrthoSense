import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const steps = [
  { label: 'Profile', path: '/assessment' },
  { label: 'Devices', path: '/devices' },
  { label: 'Movement', path: '/movement' },
  { label: 'Report', path: '/report' },
]

export default function Workflow({ current }: { current: number }) {
  const navigate = useNavigate()

  return (
    <ol className="workflow" aria-label="Screening progress">
      {steps.map((step, index) => {
        const status = index < current ? 'complete' : index === current ? 'current' : 'upcoming'
        return (
          <li key={step.path} className={`workflow-step workflow-step--${status}`}>
            <button
              type="button"
              onClick={() => index <= current && navigate(step.path)}
              disabled={index > current}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="workflow-index">{index < current ? <Check size={14} /> : index + 1}</span>
              <span>{step.label}</span>
            </button>
            {index < steps.length - 1 && <span className="workflow-line" />}
          </li>
        )
      })}
    </ol>
  )
}
