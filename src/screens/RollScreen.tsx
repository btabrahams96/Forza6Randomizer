import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { COUNTRY_LABELS } from '../domain/labels'
import { FILTER_KEYS, applyFilters, type RollItem } from '../domain/filters'
import { roll } from '../domain/roll'
import { useStore } from '../state/store'
import { allCarItems, entryItems, itemTitle } from '../state/items'
import { CarThumb } from '../ui/CarThumb'
import { ClassBadge } from '../ui/ClassBadge'
import { FilterChips } from '../ui/FilterChips'
import { DiceIcon } from '../ui/icons'
import './RollScreen.css'

const plural = (n: number) => `${n} matching car${n === 1 ? '' : 's'}`

export function RollScreen({ onOpenProfiles, rng = Math.random }: { onOpenProfiles?: () => void; rng?: () => number }) {
  const { entries, settings, setPool, setFilters } = useStore()
  const profile = useStore((s) => s.profiles.find((p) => p.id === s.activeId))
  const [rolled, setRolled] = useState<{ item: RollItem; n: number } | null>(null)
  const reduce = useReducedMotion()

  const pool = settings?.pool ?? 'garage'
  const filters = settings?.filters ?? {}
  const items = useMemo(() => (pool === 'garage' ? entryItems(entries) : allCarItems()), [pool, entries])
  const matching = useMemo(() => applyFilters(items, filters), [items, filters])
  const hasFilters = Object.values(filters).some((v) => v?.length)
  const garageEmpty = pool === 'garage' && entries.length === 0

  // A rolled car that no longer fits the pool or filters is stale; drop it.
  const shown = rolled && matching.some((i) => i.key === rolled.item.key) ? rolled : null

  const doRoll = () => {
    const item = roll(matching, rng)
    if (!item) return
    setRolled((cur) => ({ item, n: (cur?.n ?? 0) + 1 }))
    navigator.vibrate?.(10)
  }

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.94, y: 18, filter: 'blur(10px)' },
        animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.97, y: -10, filter: 'blur(6px)' },
      }

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
          <button
            key={p}
            role="radio"
            aria-checked={pool === p}
            className="segmented__option"
            onClick={() => void setPool(p)}
          >
            {p === 'garage' ? 'My Garage' : 'All Cars'}
          </button>
        ))}
      </div>

      <FilterChips items={items} filters={filters} onChange={(f) => void setFilters(f)} keys={FILTER_KEYS} />

      <div className="roll__stage">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown ? (
            <motion.section
              key={shown.n}
              className="roll-card"
              aria-label="Rolled car"
              aria-live="polite"
              {...enter}
              transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }}
            >
              <div className="roll-card__photo">
                <CarThumb car={shown.item.car} size="hero" />
              </div>
              <div className="roll-card__body">
                <p className="roll-card__make">
                  {[shown.item.car?.make ?? shown.item.custom?.make, shown.item.car?.year ?? shown.item.custom?.year]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <h2 className="roll-card__model">
                  {shown.item.car?.model || shown.item.custom?.model || itemTitle(shown.item)}
                </h2>
                <div className="roll-card__meta">
                  <motion.span
                    initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={reduce ? undefined : { type: 'spring', stiffness: 500, damping: 22, delay: 0.14 }}
                  >
                    <ClassBadge pi={shown.item.pi} size="lg" />
                  </motion.span>
                  {shown.item.nickname && <span className="roll-card__nick">{shown.item.nickname}</span>}
                </div>
                {shown.item.car && (
                  <p className="roll-card__facts">
                    {[shown.item.car.drivetrain, shown.item.car.rarity, shown.item.car.carType, COUNTRY_LABELS[shown.item.car.country]]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.div key="empty" className="roll-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DiceIcon width={44} height={44} />
              {garageEmpty ? (
                <>
                  <p className="roll-empty__title">Your garage is empty.</p>
                  <p className="roll-empty__text">Add your cars in the Garage tab, or roll from All Cars.</p>
                </>
              ) : matching.length === 0 ? (
                <>
                  <p className="roll-empty__title">No cars match these filters.</p>
                  {hasFilters && (
                    <button className="text-button" onClick={() => void setFilters({})}>Clear filters</button>
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
