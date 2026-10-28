import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

// iOS-style action alert: a short question, a destructive action and Cancel.
export function ConfirmDialog({
  open, title, message, confirmLabel, onConfirm, onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  return createPortal(
    <div className="confirm-scrim" onClick={onCancel}>
      <div
        className="confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-message' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm__text">
          <h2 id="confirm-title" className="confirm__title">{title}</h2>
          {message && <p id="confirm-message" className="confirm__message">{message}</p>}
        </div>
        <button className="confirm__action confirm__action--danger" onClick={onConfirm}>{confirmLabel}</button>
        <button ref={cancelRef} className="confirm__action" onClick={onCancel}>Cancel</button>
      </div>
    </div>,
    document.body,
  )
}
