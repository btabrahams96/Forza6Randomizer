import { classForPi } from '../domain/classes'
import './ClassBadge.css'

export function ClassBadge({ pi, size = 'md' }: { pi: number; size?: 'md' | 'lg' }) {
  const cls = classForPi(pi)
  return (
    <span
      className={`class-badge class-badge--${size}`}
      style={{ ['--c' as string]: `var(--class-${cls})` }}
      role="img"
      aria-label={`Class ${cls}, PI ${pi}`}
    >
      <span className="class-badge__class" aria-hidden>{cls}</span>
      <span className="class-badge__pi" aria-hidden>{pi}</span>
    </span>
  )
}
