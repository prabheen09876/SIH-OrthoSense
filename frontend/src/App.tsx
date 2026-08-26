import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Shell from './components/Shell'
import { ToastProvider } from './components/Toast'
import Assessment from './pages/Assessment'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Movement from './pages/Movement'
import Report from './pages/Report'
import XrayAnalysis from './pages/XrayAnalysis'
import ScreeningProvider from './state/ScreeningProvider'

function AppRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [location.pathname, reduceMotion])

  return (
    <Shell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main-content"
          className="page"
          key={location.pathname}
          initial={{ opacity: 0, transform: reduceMotion ? 'none' : 'translateY(8px)' }}
          animate={{ opacity: 1, transform: 'translateY(0)' }}
          exit={{ opacity: 0, transform: reduceMotion ? 'none' : 'translateY(-4px)' }}
          transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.23, 1, 0.32, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/movement" element={<Movement />} />
            <Route path="/report" element={<Report />} />
            <Route path="/xray" element={<XrayAnalysis />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </Shell>
  )
}

export default function App() {
  return (
    <ScreeningProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ScreeningProvider>
  )
}
