import { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { toast } from 'sonner'
import { classForPi, parsePi } from '../domain/classes'
import { applyFilters, type FilterState } from '../domain/filters'
import { useStore } from '../state/store'
import { allCarItems, matchesSearch } from '../state/items'
import { titleWithoutYear } from '../state/names'
import { CarThumb } from '../ui/CarThumb'
import { Filters } from '../ui/Filters'
import { CheckIcon, ChevronRightIcon, SearchIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { useBusy } from '../ui/useBusy'
import './AddCarsSheet.css'

const plural = (n: number) => `${n} car${n === 1 ? '' : 's'}`

type Show = 'all' | 'owned' | 'new'
const SHOW: { id: Show; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'owned', label: 'Owned' },
  { id: 'new', label: 'Not owned' },
]

export function AddCarsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = useStore((s) => s.entries)
  const addCars = useStore((s) => s.addCars)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState(false)
  const [show, setShow] = useState<Show>('all')
  // A car already in the garage waiting on "Add another copy?" before it ticks.
  const [confirming, setConfirming] = useState<string | null>(null)
  const [busy, runOnce] = useBusy()

  const owned = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) if (e.carId) m.set(e.carId, (m.get(e.carId) ?? 0) + 1)
    return m
  }, [entries])

  const all = allCarItems()
  const shown = useMemo(
    () =>
      applyFilters(all, filters).filter((i) => {
        if (!matchesSearch(i, query)) return false
        const own = owned.has(i.key)
        return show === 'all' || (show === 'owned' ? own : !own)
      }),
    [all, filters, query, show, owned],
  )

  const close = () => {
    setQuery('')
    setFilters({})
    setPicked(new Set())
    setCustom(false)
    setShow('all')
    setConfirming(null)
    onClose()
  }

  const toggle = (id: string) => {
    // Ticking a car you already own asks first, so a second copy is never an accident.
    // Tapping the row again while asked just closes the question.
    if (!picked.has(id) && owned.has(id)) {
      setConfirming((cur) => (cur === id ? null : id))
      return
    }
    pick(id)
  }

  const pick = (id: string) => {
    setConfirming(null)
    setPicked((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const add = () => runOnce(async () => {
    const n = picked.size
    await addCars([...picked])
    close()
    toast(`Added ${plural(n)} at stock PI`)
  })

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && close()}
      title={custom ? 'Add Unlisted Car' : 'Add Cars'}
      tall
      left={
        custom ? (
          <button className="text-button" onClick={() => setCustom(false)}>Back</button>
        ) : (
          <button className="text-button" onClick={close}>Cancel</button>
        )
      }
    >
      {custom ? (
        <CustomCarForm onDone={close} />
      ) : (
        <div className="add">
          <label className="search">
            <SearchIcon width={18} height={18} />
            <input
              type="search"
              aria-label="Search all cars"
              placeholder={`Search ${all.length} FH6 cars`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
              autoCorrect="off"
            />
          </label>
          <Filters nested items={all} filters={filters} onChange={setFilters} keys={['class', 'carType', 'make', 'country', 'rarity', 'drivetrain', 'decade']} />
          <div className="segmented add__show" role="radiogroup" aria-label="Show">
            {SHOW.map((s) => (
              <button key={s.id} role="radio" aria-checked={show === s.id} className="segmented__option" onClick={() => setShow(s.id)}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="add__list">
            {shown.length === 0 ? (
              <p className="add__empty">
                {show === 'owned' && owned.size === 0
                  ? "You haven't added any cars yet."
                  : 'No FH6 cars match. Try fewer filters, or add it by hand below.'}
              </p>
            ) : (
              <Virtuoso
                className="add__virtuoso"
                data={shown}
                context={{ picked, confirming, owned }}
                computeItemKey={(_, item) => item.key}
                itemContent={(_, item, { picked, confirming, owned }) => {
                  const car = item.car!
                  const on = picked.has(car.id)
                  const own = owned.get(car.id)
                  const asking = confirming === car.id
                  return (
                    <div className={`add__item${own ? ' add__item--owned' : ''}`}>
                      <button
                        className="add__row"
                        role="checkbox"
                        aria-checked={on}
                        aria-label={`${car.name}, ${car.year}, stock ${classForPi(car.stockPi)} ${car.stockPi}${own ? `, in your garage${own > 1 ? ` (${own} copies)` : ''}` : ''}`}
                        onClick={() => toggle(car.id)}
                      >
                        <span className="add__thumb"><CarThumb car={car} size="thumb" /></span>
                        <span className="add__text">
                          <span className="add__name">{titleWithoutYear(item)}</span>
                          <span className="add__meta">
                            {car.year} · {car.carType ?? car.rarity} · {classForPi(car.stockPi)} {car.stockPi}
                          </span>
                          {own ? <span className="add__own">{own > 1 ? `In garage ×${own}` : 'In garage'}</span> : null}
                        </span>
                        <span className={`add__check${on ? ' add__check--on' : ''}`} aria-hidden>
                          {on && <CheckIcon width={16} height={16} strokeWidth={3} />}
                        </span>
                      </button>
                      {asking && (
                        <div className="add__confirm" role="group" aria-label={`${car.name} is already in your garage`}>
                          <p className="add__confirm-text">You already have this car. Add another copy?</p>
                          <div className="add__confirm-actions">
                            <button className="text-button" onClick={() => setConfirming(null)} aria-label="Cancel adding a copy">Cancel</button>
                            <button className="text-button text-button--strong" onClick={() => pick(car.id)}>Add another copy</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            )}
          </div>

          <button className="add__unlisted" onClick={() => setCustom(true)}>
            Add a car that's not listed
            <ChevronRightIcon width={18} height={18} />
          </button>
          <button className="button-primary add__submit" disabled={picked.size === 0 || busy} onClick={add}>
            {picked.size === 0 ? 'Select cars to add' : `Add ${plural(picked.size)}`}
          </button>
        </div>
      )}
    </Sheet>
  )
}

function CustomCarForm({ onDone }: { onDone: () => void }) {
  const addCustom = useStore((s) => s.addCustom)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [piText, setPiText] = useState('')
  const pi = parsePi(piText)
  const yearNum = /^\d{4}$/.test(year.trim()) ? Number(year) : null
  const ok = make.trim() && model.trim() && pi.ok && (year.trim() === '' || yearNum !== null)

  return (
    <form
      className="custom"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!ok || !pi.ok) return
        await addCustom({ make: make.trim(), model: model.trim(), year: yearNum }, pi.pi)
        toast(`Added ${make.trim()} ${model.trim()}`)
        onDone()
      }}
    >
      <p className="custom__lead">For a car the wiki doesn't list yet, like new DLC. It gets a plain placeholder photo.</p>
      <label className="field"><span className="field__label">Make</span>
        <input className="field__input" value={make} onChange={(e) => setMake(e.target.value)} maxLength={40} />
      </label>
      <label className="field"><span className="field__label">Model</span>
        <input className="field__input" value={model} onChange={(e) => setModel(e.target.value)} maxLength={60} />
      </label>
      <div className="custom__row">
        <label className="field"><span className="field__label">Year</span>
          <input className="field__input" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Optional" maxLength={4} />
        </label>
        <label className="field"><span className="field__label">PI</span>
          <input className="field__input" inputMode="numeric" value={piText} onChange={(e) => setPiText(e.target.value)} maxLength={3} />
        </label>
      </div>
      {piText && !pi.ok && <p className="field__hint field__hint--error">PI goes from 100 to 999.</p>}
      <button className="button-primary" type="submit" disabled={!ok}>Add car</button>
    </form>
  )
}
