import { useState } from 'react'
import { FILTER_LABELS, applyFilters, facetOptions, type FilterKey, type FilterState, type RollItem } from '../domain/filters'
import { CheckIcon, ChevronDownIcon, CloseIcon } from './icons'
import { Sheet } from './Sheet'
import './FilterChips.css'

function chipText(key: FilterKey, values: string[]) {
  if (values.length === 0) return FILTER_LABELS[key]
  if (key === 'class') return `Class ${values.join(', ')}`
  return values.length === 1 ? values[0] : `${values[0]} +${values.length - 1}`
}

export function FilterChips({
  items, filters, onChange, keys,
}: {
  items: RollItem[]
  filters: FilterState
  onChange: (f: FilterState) => void
  keys: FilterKey[]
}) {
  const [openKey, setOpenKey] = useState<FilterKey | null>(null)
  const selected = (k: FilterKey) => filters[k] ?? []
  const set = (k: FilterKey, values: string[]) => onChange({ ...filters, [k]: values })

  const toggle = (k: FilterKey, v: string) => {
    const cur = selected(k)
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  // Count options against every other active filter, the way the game narrows choices.
  const optionsFor = (k: FilterKey) => {
    const others = { ...filters, [k]: [] }
    const pool = applyFilters(items, others)
    const opts = facetOptions(pool, k)
    for (const v of selected(k)) if (!opts.some((o) => o.value === v)) opts.push({ value: v, count: 0 })
    return opts
  }

  return (
    <div className="chips" role="group" aria-label="Filters">
      {keys.map((k) => {
        const vals = selected(k)
        const on = vals.length > 0
        return (
          <span key={k} className={`chip${on ? ' chip--on' : ''}`}>
            <button className="chip__main" onClick={() => setOpenKey(k)} aria-haspopup="dialog">
              {chipText(k, vals)}
              {!on && <ChevronDownIcon width={16} height={16} />}
            </button>
            {on && (
              <button className="chip__clear" onClick={() => set(k, [])} aria-label={`Clear ${FILTER_LABELS[k]}`}>
                <CloseIcon width={15} height={15} />
              </button>
            )}
          </span>
        )
      })}

      <Sheet
        open={openKey !== null}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={openKey ? FILTER_LABELS[openKey] : ''}
        left={
          openKey && selected(openKey).length > 0 ? (
            <button className="text-button" onClick={() => set(openKey, [])}>Clear</button>
          ) : null
        }
        right={<button className="text-button text-button--strong" onClick={() => setOpenKey(null)}>Done</button>}
      >
        {openKey && (
          <ul className="options">
            {optionsFor(openKey).map(({ value, count }) => {
              const on = selected(openKey).includes(value)
              return (
                <li key={value}>
                  <button
                    className="options__row"
                    role="menuitemcheckbox"
                    aria-checked={on}
                    onClick={() => toggle(openKey, value)}
                  >
                    {openKey === 'class' ? (
                      <span className="options__class" style={{ ['--c' as string]: `var(--class-${value})` }}>{value}</span>
                    ) : (
                      <span className="options__label">{value}</span>
                    )}
                    <span className="options__count">{count}</span>
                    <span className="options__check">{on && <CheckIcon width={20} height={20} />}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Sheet>
    </div>
  )
}
