import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import * as THREE from 'three'

type SceneVariant = 'lowerBody' | 'knee'
type RiskSide = 'left' | 'right'

export interface ClinicalSceneProps {
  variant: SceneVariant
  riskSide?: RiskSide
  live?: boolean
}

const COLORS = {
  navy: '#13253d',
  navyDeep: '#091525',
  navyLight: '#5f7f9f',
  ivory: '#f7ead2',
  ivoryLight: '#fff9ee',
  coral: '#f47f5b',
  coralLight: '#ffb194',
} as const

const ROTATION_STEP = Math.PI / 8

const figureStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 320,
  margin: 0,
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 24,
  background:
    'radial-gradient(circle at 50% 32%, #28435f 0%, #13253d 54%, #091525 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
}

const canvasStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  touchAction: 'none',
}

const controlsStyle: CSSProperties = {
  position: 'absolute',
  right: 16,
  bottom: 16,
  zIndex: 2,
  display: 'flex',
  gap: 8,
  padding: 6,
  border: '1px solid rgba(255, 255, 255, 0.16)',
  borderRadius: 999,
  background: 'rgba(9, 21, 37, 0.76)',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22)',
  backdropFilter: 'blur(12px)',
}

const controlButtonStyle: CSSProperties = {
  display: 'grid',
  width: 40,
  height: 40,
  placeItems: 'center',
  border: '1px solid rgba(247, 234, 210, 0.24)',
  borderRadius: '50%',
  color: COLORS.ivoryLight,
  background: 'rgba(19, 37, 61, 0.94)',
  font: 'inherit',
  fontSize: 18,
  lineHeight: 1,
  cursor: 'pointer',
}

const liveStyle: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  border: '1px solid rgba(255, 177, 148, 0.3)',
  borderRadius: 999,
  color: COLORS.ivoryLight,
  background: 'rgba(9, 21, 37, 0.76)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(12px)',
}

const visuallyHiddenStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', updatePreference)

    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}

interface RiskMarkerProps {
  position: [number, number, number]
  live: boolean
  reduceMotion: boolean
  size?: number
}

function RiskMarker({
  position,
  live,
  reduceMotion,
  size = 0.2,
}: RiskMarkerProps) {
  const pulseRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const pulse = pulseRef.current
    if (!pulse) return

    const scale = live && !reduceMotion
      ? 1 + (Math.sin(clock.elapsedTime * 2.2) + 1) * 0.035
      : 1

    pulse.scale.setScalar(scale)
  })

  return (
    <group ref={pulseRef} position={position}>
      <mesh>
        <sphereGeometry args={[size, 24, 16]} />
        <meshStandardMaterial
          color={COLORS.coral}
          emissive={COLORS.coral}
          emissiveIntensity={0.72}
          metalness={0.12}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <torusGeometry args={[size * 1.65, size * 0.09, 12, 48]} />
        <meshBasicMaterial
          color={COLORS.coralLight}
          transparent
          opacity={0.82}
        />
      </mesh>
    </group>
  )
}

interface LegProps {
  side: RiskSide
  riskSide: RiskSide
}

function Leg({ side, riskSide }: LegProps) {
  const direction = side === 'left' ? -1 : 1
  const x = direction * 0.43
  const isRiskSide = side === riskSide

  return (
    <group>
      <mesh position={[x, 0.58, 0]} rotation={[0, 0, direction * -0.045]}>
        <cylinderGeometry args={[0.23, 0.19, 1.22, 24]} />
        <meshStandardMaterial
          color={COLORS.ivory}
          emissive="#5a3a20"
          emissiveIntensity={0.05}
          metalness={0.08}
          roughness={0.34}
        />
      </mesh>

      <mesh position={[x, -0.08, 0.08]} scale={[1, 0.82, 0.92]}>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshStandardMaterial
          color={isRiskSide ? COLORS.coral : COLORS.ivoryLight}
          emissive={isRiskSide ? COLORS.coral : COLORS.navy}
          emissiveIntensity={isRiskSide ? 0.48 : 0.08}
          metalness={0.08}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[x, -0.84, 0]} rotation={[0, 0, direction * 0.035]}>
        <cylinderGeometry args={[0.18, 0.13, 1.32, 24]} />
        <meshStandardMaterial
          color={COLORS.ivory}
          emissive="#5a3a20"
          emissiveIntensity={0.05}
          metalness={0.08}
          roughness={0.36}
        />
      </mesh>

      <mesh position={[x, -1.54, 0.2]} scale={[0.21, 0.14, 0.5]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          metalness={0.08}
          roughness={0.38}
        />
      </mesh>

      <group position={[x + direction * 0.205, -0.72, 0.17]}>
        <mesh>
          <boxGeometry args={[0.13, 0.26, 0.09]} />
          <meshStandardMaterial
            color={COLORS.navyLight}
            metalness={0.52}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 0.07, 0.051]}>
          <sphereGeometry args={[0.025, 12, 8]} />
          <meshBasicMaterial color={COLORS.coralLight} />
        </mesh>
      </group>
    </group>
  )
}

interface ModelProps {
  rotation: number
  riskSide: RiskSide
  live: boolean
  reduceMotion: boolean
}

function LowerBodyModel({
  rotation,
  riskSide,
  live,
  reduceMotion,
}: ModelProps) {
  const riskX = riskSide === 'left' ? -0.43 : 0.43

  return (
    <group position={[0, 0.1, 0]} rotation={[0, rotation, 0]} scale={0.84}>
      <mesh position={[0, 1.29, 0]} scale={[1.08, 0.56, 0.7]}>
        <sphereGeometry args={[0.52, 28, 18]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          emissive="#5a3a20"
          emissiveIntensity={0.04}
          metalness={0.1}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, 1.27, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 10, 48]} />
        <meshBasicMaterial color={COLORS.navyLight} />
      </mesh>

      <Leg side="left" riskSide={riskSide} />
      <Leg side="right" riskSide={riskSide} />

      <RiskMarker
        position={[riskX, -0.08, 0.3]}
        live={live}
        reduceMotion={reduceMotion}
        size={0.13}
      />
    </group>
  )
}

function KneeModel({
  rotation,
  riskSide,
  live,
  reduceMotion,
}: ModelProps) {
  const riskX = riskSide === 'left' ? -0.3 : 0.3

  return (
    <group position={[0, 0.08, 0]} rotation={[0, rotation, 0]} scale={0.8}>
      {[-0.62, -0.13, 0.38].map((height, index) => (
        <mesh key={height} position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68 + index * 0.05, 0.7 + index * 0.05, 56]} />
          <meshBasicMaterial color={COLORS.coralLight} transparent opacity={0.2 - index * 0.035} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.25, 0.34, 1.58, 28]} />
        <meshStandardMaterial
          color={COLORS.ivory}
          emissive="#5a3a20"
          emissiveIntensity={0.05}
          metalness={0.09}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[-0.22, -0.01, 0.02]} scale={[0.38, 0.3, 0.34]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          metalness={0.08}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.22, -0.01, 0.02]} scale={[0.38, 0.3, 0.34]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          metalness={0.08}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.48, 0.36, 0.2, 28]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          metalness={0.08}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.35, 0.23, 1.42, 28]} />
        <meshStandardMaterial
          color={COLORS.ivory}
          emissive="#5a3a20"
          emissiveIntensity={0.05}
          metalness={0.08}
          roughness={0.36}
        />
      </mesh>

      <mesh position={[0, -0.14, 0.18]}>
        <torusGeometry args={[0.48, 0.055, 14, 56]} />
        <meshStandardMaterial
          color={COLORS.coral}
          emissive={COLORS.coral}
          emissiveIntensity={0.58}
          metalness={0.18}
          roughness={0.26}
        />
      </mesh>

      <mesh position={[0, -0.1, 0.41]} scale={[0.34, 0.44, 0.17]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial
          color={COLORS.ivoryLight}
          emissive={COLORS.coral}
          emissiveIntensity={0.1}
          metalness={0.08}
          roughness={0.3}
        />
      </mesh>

      <RiskMarker
        position={[riskX, -0.13, 0.39]}
        live={live}
        reduceMotion={reduceMotion}
        size={0.12}
      />
    </group>
  )
}

function DiagnosticBackdrop({ variant }: { variant: SceneVariant }) {
  const radius = variant === 'knee' ? 1.55 : 1.9

  return (
    <group position={[0, 0, -1.15]}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 8, 96]} />
        <meshBasicMaterial
          color={COLORS.navyLight}
          transparent
          opacity={0.48}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[radius * 0.73, 0.009, 8, 96]} />
        <meshBasicMaterial
          color={COLORS.coralLight}
          transparent
          opacity={0.24}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[radius * 0.06, 24]} />
        <meshBasicMaterial color={COLORS.coral} transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

function SceneFallback({ variant }: { variant: SceneVariant }) {
  const subject = variant === 'knee' ? 'knee joint' : 'lower body'

  return (
    <div
      className="clinical-scene__fallback"
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        minHeight: 320,
        placeItems: 'center',
        padding: 24,
        color: COLORS.ivoryLight,
        textAlign: 'center',
        background: COLORS.navy,
      }}
    >
      <p style={{ maxWidth: 280, margin: 0 }}>
        The interactive {subject} view is unavailable. Clinical measurements
        remain available in the surrounding report.
      </p>
    </div>
  )
}

export default function ClinicalScene({
  variant,
  riskSide = 'right',
  live = false,
}: ClinicalSceneProps) {
  const captionId = useId()
  const reduceMotion = usePrefersReducedMotion()
  const controlsRef = useRef<{ reset: () => void } | null>(null)
  const [modelRotation, setModelRotation] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  const subject = variant === 'knee' ? 'knee joint' : 'lower-body alignment'
  const description = `Interactive 3D ${subject} visualization with the ${riskSide} side highlighted as the current risk area${live ? ' during a live scan' : ''}.`

  const rotateModel = (direction: -1 | 1) => {
    setHasInteracted(true)
    setModelRotation((currentRotation) =>
      THREE.MathUtils.euclideanModulo(
        currentRotation + direction * ROTATION_STEP,
        Math.PI * 2,
      ),
    )
  }

  const resetView = () => {
    setHasInteracted(true)
    setModelRotation(0)
    controlsRef.current?.reset()
  }

  return (
    <figure
      className={`clinical-scene clinical-scene--${variant}`}
      style={figureStyle}
      aria-describedby={captionId}
    >
      <figcaption
        id={captionId}
        className="clinical-scene__caption"
        style={visuallyHiddenStyle}
      >
        {description} Use the controls following the visualization to rotate or
        reset the view.
      </figcaption>

      {live && (
        <div className="clinical-scene__live-indicator" style={liveStyle}>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: COLORS.coral,
              boxShadow: `0 0 14px ${COLORS.coral}`,
            }}
          />
          Live analysis
        </div>
      )}

      <div
        className="clinical-scene__canvas"
        style={canvasStyle}
        aria-hidden="true"
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{
            position: [0, 0.05, variant === 'knee' ? 5.1 : 5.7],
            fov: variant === 'knee' ? 38 : 42,
            near: 0.1,
            far: 50,
          }}
          frameloop={live && !reduceMotion ? 'always' : 'demand'}
          fallback={<SceneFallback variant={variant} />}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={1.15} />
          <hemisphereLight
            args={[COLORS.ivoryLight, COLORS.navyDeep, 1.45]}
          />
          <directionalLight
            color={COLORS.ivoryLight}
            intensity={2.25}
            position={[4, 5, 5]}
          />
          <pointLight
            color={COLORS.coral}
            intensity={15}
            distance={9}
            position={[-3, 0.5, 3]}
          />
          <pointLight
            color="#87a9c7"
            intensity={10}
            distance={8}
            position={[3, -1, 2]}
          />

          <DiagnosticBackdrop variant={variant} />
          {variant === 'lowerBody' ? (
            <LowerBodyModel
              rotation={modelRotation}
              riskSide={riskSide}
              live={live}
              reduceMotion={reduceMotion}
            />
          ) : (
            <KneeModel
              rotation={modelRotation}
              riskSide={riskSide}
              live={live}
              reduceMotion={reduceMotion}
            />
          )}

          <gridHelper
            args={[7, 14, '#45627f', '#223a53']}
            position={[0, -1.7, 0]}
          />
          <OrbitControls
            ref={(controls) => {
              controlsRef.current = controls
            }}
            makeDefault
            target={[0, 0, 0]}
            enablePan={false}
            enableZoom
            enableRotate
            enableDamping={!reduceMotion}
            dampingFactor={0.08}
            rotateSpeed={0.55}
            zoomSpeed={0.65}
            minDistance={4.15}
            maxDistance={7.25}
            minPolarAngle={Math.PI * 0.31}
            maxPolarAngle={Math.PI * 0.69}
            minAzimuthAngle={-Math.PI * 0.62}
            maxAzimuthAngle={Math.PI * 0.62}
            autoRotate={live && !reduceMotion && !hasInteracted}
            autoRotateSpeed={0.45}
            onStart={() => setHasInteracted(true)}
          />
        </Canvas>
      </div>

      <div
        className="clinical-scene__controls"
        style={controlsStyle}
        role="group"
        aria-label="3D model controls"
      >
        <button
          className="clinical-scene__control clinical-scene__control--left"
          style={controlButtonStyle}
          type="button"
          aria-label="Rotate model left"
          title="Rotate left"
          onClick={() => rotateModel(-1)}
        >
          <span aria-hidden="true">↶</span>
        </button>
        <button
          className="clinical-scene__control clinical-scene__control--reset"
          style={controlButtonStyle}
          type="button"
          aria-label="Reset 3D view"
          title="Reset view"
          onClick={resetView}
        >
          <span aria-hidden="true">⌂</span>
        </button>
        <button
          className="clinical-scene__control clinical-scene__control--right"
          style={controlButtonStyle}
          type="button"
          aria-label="Rotate model right"
          title="Rotate right"
          onClick={() => rotateModel(1)}
        >
          <span aria-hidden="true">↷</span>
        </button>
      </div>
    </figure>
  )
}
