import { CheckCircle2, X } from 'lucide-react'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timerRef = useRef<number | null>(null)

  const dismiss = useCallback(() => {
    setMessage('')
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  const showToast = useCallback((nextMessage: string) => {
    setMessage(nextMessage)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setMessage(''), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={19} aria-hidden="true" />
          <span>{message}</span>
          <button className="icon-button icon-button--small" onClick={dismiss} aria-label="Dismiss notification">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
