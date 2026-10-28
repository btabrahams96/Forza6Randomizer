import { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { toast } from 'sonner'
import { classForPi, parsePi } from '../domain/classes'
import { applyFilters, type FilterState } from '../domain/filters'
import { useStore } from '../state/store'
import { allCarItems, matchesSearch } from '../state/items'
import { CarThumb } from '../ui/CarThumb'
import { FilterChips } from '../ui/FilterChips'
import { CheckIcon, ChevronRightIcon, SearchIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import './AddCarsSheet.css'

const plural = (n: number) => `${n} car${n === 1 ? '' : 's'}`

export function AddCarsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = useStore((s) => s.entries)
  const addCars = useStore((s) => s.addCars)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState(false)

  const owned = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) if (e.carId) m.set(e.carId, (m.get(e.carId) ?? 0) + 1)
    return m
  }, [entries])

  const all = allCarItems()
  const shown = useMemo(
    () => applyFilters(all, filters).filter((i) => matchesSearch(i, query)),
    [all, filters, query],
  )

  const close = () => {
    setQuery('')
    setFilters({})
    setPicked(new Set())
    setCustom(false)
    onClose()
  }

  const toggle = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const add = async () => {
    const n = picked.size
    await addCars([...picked])
    close()
    toast(`Added ${plural(n)} at stock PI`)
  }

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
          <FilterChips items={all} filters={filters} onChange={setFilters} keys={['class', 'carType', 'make', 'decade', 'rarity']} />

          <div className="add__list">
            {shown.length === 0 ? (
              <p className="add__empty">No FH6 cars match. Try fewer filters, or add it by hand below.</p>
            ) : (
              <Virtuoso
                className="add__virtuoso"
                data={shown}
                computeItemKey={(_, item) => item.key}
                itemContent={(_, item) => {
                  const car = item.car!
                  const on = picked.has(car.id)
                  const own = owned.get(car.id)
                  return (
                    <button
                      className="add__row"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`${car.name}, ${car.year}, stock ${classForPi(car.stockPi)} ${car.stockPi}${own ? `, you own ${own}` : ''}`}
                      onClick={() => toggle(car.id)}
                    >
                      <span className="add__thumb"><CarThumb car={car} size="thumb" /></span>
                      <span className="add__text">
                        <span className="add__name">{car.name}</span>
                        <span className="add__meta">
                          {car.year} · {car.carType ?? car.rarity} · {classForPi(car.stockPi)} {car.stockPi}
                        </span>
                      </span>
                      {own ? <span className="add__own">Own {own}</span> : null}
                      <span className={`add__check${on ? ' add__check--on' : ''}`} aria-hidden>
                        {on && <CheckIcon width={16} height={16} strokeWidth={3} />}
                      </span>
                    </button>
                  )
                }}
              />
            )}
          </div>

          <button className="add__unlisted" onClick={() => setCustom(true)}>
            Add a car that's not listed
            <ChevronRightIcon width={18} height={18} />
          </button>
          <button className="button-primary add__submit" disabled={picked.size === 0} onClick={add}>
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
