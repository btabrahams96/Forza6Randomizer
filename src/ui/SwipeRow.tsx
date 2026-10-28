import { useState, type ReactNode } from 'react'
import { motion, useAnimate } from 'motion/react'
import { CopyIcon, TrashIcon } from './icons'
import './SwipeRow.css'

const OPEN_X = -152

// A list row that swipes left to show Copy and Delete, like iOS Mail.
export function SwipeRow({
  children, onCopy, onDelete, label,
}: {
  children: ReactNode
  onCopy: () => void
  onDelete: () => void
  label: string
}) {
  const [scope, animate] = useAnimate()
  const [open, setOpen] = useState(false)

  const snap = (to: boolean) => {
    setOpen(to)
    void animate(scope.current, { x: to ? OPEN_X : 0 }, { type: 'spring', stiffness: 520, damping: 44 })
  }

  return (
    <div className="swipe">
      <div className="swipe__actions" aria-hidden={!open}>
        <button tabIndex={open ? 0 : -1} className="swipe__action swipe__action--copy" onClick={() => { snap(false); onCopy() }} aria-label={`Copy ${label}`}>
          <CopyIcon width={20} height={20} />
          Copy
        </button>
        <button tabIndex={open ? 0 : -1} className="swipe__action swipe__action--delete" onClick={() => { snap(false); onDelete() }} aria-label={`Delete ${label}`}>
          <TrashIcon width={20} height={20} />
          Delete
        </button>
      </div>
      <motion.div
        ref={scope}
        className="swipe__content"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: OPEN_X, right: 0 }}
        dragElastic={{ left: 0.15, right: 0.02 }}
        dragMomentum={false}
        onDragEnd={(_, info) => snap(info.offset.x + info.velocity.x * 0.2 < (open ? -40 : -60))}
        onClickCapture={(e) => {
          if (open) {
            e.stopPropagation()
            e.preventDefault()
            snap(false)
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
