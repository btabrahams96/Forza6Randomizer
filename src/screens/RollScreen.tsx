import { useMemo, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { COUNTRY_LABELS } from '../domain/labels'
import { FILTER_KEYS, applyFilters } from '../domain/filters'
import { roll } from '../domain/roll'
import { useStore } from '../state/store'
import { allCarItems, entryItems } from '../state/items'
import { titleWithoutYear } from '../state/names'
import { CarThumb } from '../ui/CarThumb'
import { ClassBadge } from '../ui/ClassBadge'
import { Filters } from '../ui/Filters'
import { DiceIcon } from '../ui/icons'
import './RollScreen.css'

const plural = (n: number) => `${n} matching car${n === 1 ? '' : 's'}`

export function RollScreen({
  onOpenProfiles, onOpenGarage, rng = Math.random,
}: {
  onOpenProfiles?: () => void
  onOpenGarage?: () => void
  rng?: () => number
}) {
  const { entries, settings, setPool, setFilters, setLastRoll } = useStore()
  const profile = useStore((s) => s.profiles.find((p) => p.id === s.activeId))
  const lastKey = useStore((s) => (s.activeId ? s.lastRoll[s.activeId] : undefined))
  const reduce = useReducedMotion()
  // Counts rolls made while this screen is mounted; 0 means the card came back from a tab switch.
  const rolls = useRef(0)

  const pool = settings?.pool ?? 'garage'
  const filters = settings?.filters ?? {}
  const items = useMemo(() => (pool === 'garage' ? entryItems(entries) : allCarItems()), [pool, entries])
  const matching = useMemo(() => applyFilters(items, filters), [items, filters])
  const hasFilters = Object.values(filters).some((v) => v?.length)
  const garageEmpty = pool === 'garage' && entries.length === 0

  // A rolled car that no longer fits the pool or filters is stale; drop it.
  const shown = lastKey ? matching.find((i) => i.key === lastKey) ?? null : null

  const doRoll = () => {
    const item = roll(matching, rng)
    if (!item) return
    rolls.current += 1
    setLastRoll(item.key)
    navigator.vibrate?.(10)
  }

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.94, y: 18, filter: 'blur(10px)' },
        animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.97, y: -10, filter: 'blur(6px)' },
      }

  const car = shown?.car
  const facts = shown
    ? [car?.year ?? shown.custom?.year, car?.drivetrain, car?.rarity, car?.carType, car && COUNTRY_LABELS[car.country]].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="roll">
      <header className="screen-head">
        <h1 className="screen-title">Roll</h1>
        {profile && (
          <button className="avatar" onClick={onOpenProfiles} aria-label={`Profile: ${profile.name}`}>
            {profile.name.trim().charAt(0).toUpperCase()}
          </button>
        )}
      </header>

      <div className="segmented" role="radiogroup" aria-label="Roll from">
        {(['garage', 'all'] as const).map((p) => (
          <button key={p} role="radio" aria-checked={pool === p} className="segmented__option" onClick={() => void setPool(p)}>
            {p === 'garage' ? 'My Garage' : 'All Cars'}
          </button>
        ))}
      </div>

      <Filters items={items} filters={filters} onChange={(f) => void setFilters(f)} keys={FILTER_KEYS} />

      <div className="roll__stage">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown ? (
            <motion.section
              key={`${shown.key}-${rolls.current}`}
              className="roll-card"
              aria-label="Rolled car"
              aria-live="polite"
              {...enter}
              initial={rolls.current === 0 ? false : enter.initial}
              transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }}
            >
              <div className="roll-card__photo">
                <CarThumb car={car} size="hero" />
              </div>
              <div className="roll-card__body">
                <h2 className="roll-card__model">{titleWithoutYear(shown)}</h2>
                <div className="roll-card__meta">
                  <motion.span
                    initial={reduce || rolls.current === 0 ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={reduce ? undefined : { type: 'spring', stiffness: 500, damping: 22, delay: 0.14 }}
                  >
                    <ClassBadge pi={shown.pi} size="lg" />
                  </motion.span>
                  {shown.nickname && <span className="roll-card__nick">{shown.nickname}</span>}
                </div>
                {facts && <p className="roll-card__facts">{facts}</p>}
              </div>
            </motion.section>
          ) : (
            <motion.div key="empty" className="roll-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DiceIcon width={40} height={40} />
              {garageEmpty ? (
                <>
                  <p className="roll-empty__title">Your garage is empty.</p>
                  <p className="roll-empty__text">Add the cars you own, or roll from every FH6 car.</p>
                  <div className="roll-empty__actions">
                    {onOpenGarage && <button className="button-secondary" onClick={onOpenGarage}>Add Cars</button>}
                    <button className="button-secondary" onClick={() => void setPool('all')}>Roll from All Cars</button>
                  </div>
                </>
              ) : matching.length === 0 ? (
                <>
                  <p className="roll-empty__title">No cars match these filters.</p>
                  {hasFilters && (
                    <div className="roll-empty__actions">
                      <button className="button-secondary" onClick={() => void setFilters({})}>Clear filters</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="roll-empty__title">Set the event's filters, then roll.</p>
                  <p className="roll-empty__text">Every matching car has the same chance.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="roll__dock">
        <p className="roll__count">{plural(matching.length)}</p>
        <button className="button-primary roll__button" onClick={doRoll} disabled={matching.length === 0}>
          {shown ? 'Roll again' : 'Roll'}
        </button>
      </div>
    </div>
  )
}
