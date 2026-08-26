import { useId } from 'react'

export interface RiskGaugeProps {
  value: number
  label: string
  unit?: string
}

export interface TelemetryChartProps {
  variant?: 'acceleration' | 'velocity'
}

export interface FootPressureMapProps {
  side: 'left' | 'right'
  severity?: 'normal' | 'elevated'
}

type TelemetryVariant = NonNullable<TelemetryChartProps['variant']>

const telemetryPlots = {
  acceleration: {
    title: 'Acceleration telemetry',
    unit: 'm/s²',
    description: 'Left and right tibial sensor acceleration over a four-second gait interval.',
    leftPath:
      'M24 128 C42 126 48 77 68 79 S93 152 112 143 S137 48 156 61 S178 178 198 155 S224 76 246 88 S273 151 292 132 S313 51 333 64 S354 174 374 151 S400 80 420 89 S445 139 462 123 S482 61 500 72',
    rightPath:
      'M24 139 C43 151 53 101 72 105 S94 172 114 159 S136 75 157 82 S181 146 199 137 S223 99 244 107 S271 174 291 158 S313 92 334 100 S356 148 376 140 S401 102 421 109 S445 164 464 151 S483 94 500 102',
  },
  velocity: {
    title: 'Angular velocity telemetry',
    unit: '°/s',
    description: 'Left and right tibial angular velocity over a four-second gait interval.',
    leftPath:
      'M24 127 C53 126 64 64 101 65 S146 178 184 175 S228 86 267 89 S310 164 346 160 S393 76 430 83 S470 145 500 125',
    rightPath:
      'M24 130 C53 151 73 98 105 101 S143 153 179 149 S223 75 261 78 S309 147 345 143 S391 96 428 99 S469 139 500 131',
  },
} as const satisfies Record<
  TelemetryVariant,
  {
    title: string
    unit: string
    description: string
    leftPath: string
    rightPath: string
  }
>

const horizontalGrid = [42, 78, 114, 150, 186] as const
const verticalGrid = [24, 92, 160, 228, 296, 364, 432, 500] as const

const footOutline =
  'M88 276 C65 279 49 266 45 242 C41 218 54 196 53 174 C52 151 35 126 34 100 C32 71 46 51 66 47 C87 42 102 57 105 80 C109 109 98 129 104 154 C110 180 129 201 128 227 C127 257 111 273 88 276 Z'

const toeShapes = [
  { cx: 73, cy: 29, rx: 13, ry: 16 },
  { cx: 49, cy: 30, rx: 10, ry: 13 },
  { cx: 31, cy: 39, rx: 8, ry: 11 },
  { cx: 19, cy: 52, rx: 6, ry: 9 },
  { cx: 13, cy: 67, rx: 5, ry: 7 },
] as const

interface CoverageNode {
  name: string
  x: number
  y: number
  status: 'active' | 'syncing'
}

const coverageNodes = [
  { name: 'Sikkim', x: 68, y: 116, status: 'active' },
  { name: 'Assam', x: 306, y: 151, status: 'active' },
  { name: 'Arunachal Pradesh', x: 393, y: 66, status: 'active' },
  { name: 'Meghalaya', x: 215, y: 207, status: 'active' },
  { name: 'Nagaland', x: 458, y: 151, status: 'active' },
  { name: 'Manipur', x: 462, y: 229, status: 'syncing' },
  { name: 'Mizoram', x: 382, y: 294, status: 'active' },
  { name: 'Tripura', x: 271, y: 276, status: 'syncing' },
] as const satisfies readonly CoverageNode[]

const coverageLinks = [
  [0, 3],
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
  [3, 7],
  [4, 5],
  [5, 6],
  [6, 7],
] as const

function normalizeId(id: string) {
  return id.replace(/:/g, '')
}

export function RiskGauge({ value, label, unit = '%' }: RiskGaugeProps) {
  const titleId = normalizeId(useId())
  const descriptionId = normalizeId(useId())
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  const roundedValue = Math.round(safeValue)
  const riskTier = safeValue >= 61 ? 'high' : safeValue >= 31 ? 'elevated' : 'low'

  return (
    <figure className={`data-visual risk-gauge risk-gauge--${riskTier}`}>
      <svg
        className="risk-gauge__svg"
        viewBox="0 0 240 240"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{label}</title>
        <desc id={descriptionId}>{`${roundedValue}${unit === '%' ? ' percent' : ` ${unit}`} screening score, classified as ${label}.`}</desc>
        <circle className="risk-gauge__halo" cx="120" cy="120" r="91" />
        <circle className="risk-gauge__track" cx="120" cy="120" r="78" pathLength="100" />
        <circle
          className="risk-gauge__value"
          cx="120"
          cy="120"
          r="78"
          pathLength="100"
          strokeDasharray={`${safeValue} ${100 - safeValue}`}
          transform="rotate(-90 120 120)"
        />
        <g className="risk-gauge__readout" aria-hidden="true">
          <text className="risk-gauge__number" x="116" y="119" textAnchor="middle">
            {roundedValue}
          </text>
          <text className="risk-gauge__percent" x="162" y="119" textAnchor="middle">
            {unit}
          </text>
          <text className="risk-gauge__label" x="120" y="150" textAnchor="middle">
            {label}
          </text>
        </g>
      </svg>
      <figcaption className="risk-gauge__scale">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </figcaption>
    </figure>
  )
}

export function TelemetryChart({ variant = 'acceleration' }: TelemetryChartProps) {
  const titleId = normalizeId(useId())
  const descriptionId = normalizeId(useId())
  const plot = telemetryPlots[variant]

  return (
    <figure className={`data-visual telemetry-chart telemetry-chart--${variant}`}>
      <div className="telemetry-chart__heading">
        <div>
          <span className="telemetry-chart__eyebrow">Live bilateral trace</span>
          <strong>{plot.title}</strong>
        </div>
        <span className="telemetry-chart__unit">{plot.unit}</span>
      </div>
      <svg
        className="telemetry-chart__plot"
        viewBox="0 0 524 220"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        preserveAspectRatio="none"
      >
        <title id={titleId}>{plot.title}</title>
        <desc id={descriptionId}>{plot.description}</desc>
        <g className="telemetry-chart__grid" aria-hidden="true">
          {horizontalGrid.map((y) => (
            <line key={`h-${y}`} x1="24" y1={y} x2="500" y2={y} />
          ))}
          {verticalGrid.map((x) => (
            <line key={`v-${x}`} x1={x} y1="24" x2={x} y2="190" />
          ))}
        </g>
        <line className="telemetry-chart__baseline" x1="24" y1="128" x2="500" y2="128" />
        <path className="telemetry-chart__trace telemetry-chart__trace--left" d={plot.leftPath} />
        <path className="telemetry-chart__trace telemetry-chart__trace--right" d={plot.rightPath} />
        <circle className="telemetry-chart__cursor" cx="500" cy="72" r="4" />
        <g className="telemetry-chart__axis" aria-hidden="true">
          <text x="24" y="210">0 s</text>
          <text x="262" y="210" textAnchor="middle">2 s</text>
          <text x="500" y="210" textAnchor="end">4 s</text>
        </g>
      </svg>
      <figcaption className="telemetry-chart__legend">
        <span><i className="telemetry-chart__swatch telemetry-chart__swatch--left" /> Left IMU</span>
        <span><i className="telemetry-chart__swatch telemetry-chart__swatch--right" /> Right IMU</span>
      </figcaption>
    </figure>
  )
}

export function FootPressureMap({ side, severity = 'normal' }: FootPressureMapProps) {
  const id = normalizeId(useId())
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const clipId = `${id}-clip`
  const heatId = `${id}-heat`
  const sideLabel = side === 'left' ? 'Left' : 'Right'
  const severityLabel = severity === 'elevated' ? 'Elevated medial load' : 'Balanced load'
  const mirrorTransform = side === 'right' ? 'translate(180 0) scale(-1 1)' : undefined

  return (
    <figure
      className={`data-visual foot-pressure-map foot-pressure-map--${side} foot-pressure-map--${severity}`}
      data-side={side}
      data-severity={severity}
    >
      <svg
        className="foot-pressure-map__svg"
        viewBox="0 0 180 310"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{`${sideLabel} plantar pressure`}</title>
        <desc id={descriptionId}>{`${severityLabel} is shown across the ${side} foot.`}</desc>
        <defs>
          <clipPath id={clipId}>
            <g>
              <path d={footOutline} />
              {toeShapes.map((toe) => (
                <ellipse key={`${toe.cx}-${toe.cy}`} {...toe} />
              ))}
            </g>
          </clipPath>
          <radialGradient id={heatId}>
            <stop className="foot-pressure-map__heat-core" offset="0%" />
            <stop className="foot-pressure-map__heat-mid" offset="46%" />
            <stop className="foot-pressure-map__heat-edge" offset="100%" />
          </radialGradient>
        </defs>
        <g className="foot-pressure-map__foot" transform={mirrorTransform} aria-hidden="true">
          <path className="foot-pressure-map__sole" d={footOutline} />
          {toeShapes.map((toe) => (
            <ellipse className="foot-pressure-map__toe" key={`${toe.cx}-${toe.cy}`} {...toe} />
          ))}
        </g>
        <g className="foot-pressure-map__zones" clipPath={`url(#${clipId})`} transform={mirrorTransform} aria-hidden="true">
          <ellipse className="foot-pressure-map__zone foot-pressure-map__zone--forefoot" cx="78" cy="101" rx="60" ry="62" fill={`url(#${heatId})`} />
          <ellipse className="foot-pressure-map__zone foot-pressure-map__zone--midfoot" cx="92" cy="175" rx="42" ry="54" fill={`url(#${heatId})`} />
          <ellipse className="foot-pressure-map__zone foot-pressure-map__zone--heel" cx="84" cy="242" rx="49" ry="49" fill={`url(#${heatId})`} />
        </g>
        <path className="foot-pressure-map__centerline" d="M84 60 C97 120 74 181 86 261" transform={mirrorTransform} aria-hidden="true" />
      </svg>
      <figcaption className="foot-pressure-map__caption">
        <span>{sideLabel}</span>
        <strong>{severityLabel}</strong>
      </figcaption>
    </figure>
  )
}

export function RegionalCoverage() {
  const titleId = normalizeId(useId())
  const descriptionId = normalizeId(useId())

  return (
    <figure className="data-visual coverage-map">
      <svg
        className="coverage-map__svg"
        viewBox="0 0 540 350"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>North Eastern Region screening network</title>
        <desc id={descriptionId}>
          Eight connected field nodes across Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim and Tripura.
        </desc>
        <path
          className="coverage-map__terrain"
          d="M39 91 C91 45 165 81 207 118 C244 64 331 28 409 45 C466 58 501 100 489 160 C518 199 484 252 435 261 C409 327 333 328 286 296 C230 324 179 280 175 235 C104 226 63 183 84 143 C57 136 35 120 39 91 Z"
          aria-hidden="true"
        />
        <g className="coverage-map__links" aria-hidden="true">
          {coverageLinks.map(([from, to]) => {
            const source = coverageNodes[from]
            const target = coverageNodes[to]
            return (
              <line
                key={`${source.name}-${target.name}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
            )
          })}
        </g>
        <g className="coverage-map__nodes">
          {coverageNodes.map((node) => (
            <g
              className={`coverage-map__node coverage-map__node--${node.status}`}
              key={node.name}
              transform={`translate(${node.x} ${node.y})`}
            >
              <circle className="coverage-map__pulse" r="17" aria-hidden="true" />
              <circle className="coverage-map__marker" r="7" aria-hidden="true" />
              <text className="coverage-map__label" y="28" textAnchor="middle">
                {node.name}
              </text>
            </g>
          ))}
        </g>
        <g className="coverage-map__hub" transform="translate(306 151)" aria-hidden="true">
          <circle r="27" />
          <text y="4" textAnchor="middle">HQ</text>
        </g>
      </svg>
      <figcaption className="coverage-map__caption">
        <span><i className="coverage-map__status coverage-map__status--active" /> 6 online</span>
        <span><i className="coverage-map__status coverage-map__status--syncing" /> 2 syncing</span>
      </figcaption>
    </figure>
  )
}
