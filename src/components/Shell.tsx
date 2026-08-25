import {
  Activity,
  Bell,
  Bluetooth,
  CircleHelp,
  FileChartColumn,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  Stethoscope,
  UserRound,
  Wifi,
  X,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/assessment', label: 'Patient profile', icon: UserRound },
  { to: '/devices', label: 'Sensor kit', icon: Bluetooth },
  { to: '/movement', label: 'Movement test', icon: Activity },
  { to: '/report', label: 'Risk report', icon: FileChartColumn },
]

function Brand() {
  return (
    <NavLink to="/" className="brand" aria-label="OrthoSense AI home">
      <span className="brand-mark" aria-hidden="true">
        <span />
      </span>
      <span className="brand-copy">
        <strong>OrthoSense</strong>
        <small>NER risk intelligence</small>
      </span>
    </NavLink>
  )
}

export default function Shell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const section = navItems.find((item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )?.label

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-top">
          <Brand />
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={21} />
          </button>
        </div>

        <button className="button button--primary sidebar-cta" onClick={() => { setMobileOpen(false); navigate('/assessment') }}>
          <Plus size={18} aria-hidden="true" />
          New screening
        </button>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="field-mode-card">
          <div className="field-mode-card__top">
            <Wifi size={17} aria-hidden="true" />
            <span>Field mode</span>
          </div>
          <strong>Demo sync ready</strong>
          <small>Local-first concept</small>
        </div>
        <a className="nav-item nav-item--quiet" href="mailto:support@orthosense.demo">
          <CircleHelp size={19} aria-hidden="true" />
          Help & training
        </a>
        <div className="clinician-card">
          <span className="avatar">AS</span>
          <span>
            <strong>Dr. Anjali Sharma</strong>
            <small>Orthopaedic specialist</small>
          </span>
          <span className="online-dot" title="Online" />
        </div>
      </aside>

      {mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={22} />
            </button>
            <div className="mobile-brand"><Brand /></div>
            <span className="breadcrumb">Clinician workspace <b>/</b> {section}</span>
          </div>
          <div className="topbar-actions">
            <span className="network-status"><span /> Interactive prototype</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <button className="icon-button" aria-label="Settings"><Settings size={19} /></button>
          </div>
        </header>
        {children}
      </div>

      <nav className="bottom-nav" aria-label="Mobile primary navigation">
        {navItems.filter((item) => item.to !== '/assessment').map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => (isActive ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item')}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label.replace('Movement ', '')}</span>
          </NavLink>
        ))}
        <button className="bottom-nav__action" onClick={() => navigate('/assessment')} aria-label="Start new screening">
          <Stethoscope size={22} />
        </button>
      </nav>
    </div>
  )
}
