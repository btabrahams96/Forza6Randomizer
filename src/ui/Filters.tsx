import { useState } from 'react'
import { FILTER_LABELS, applyFilters, facetOptions, type FilterKey, type FilterState, type RollItem } from '../domain/filters'
import { CheckIcon, ChevronRightIcon } from './icons'
import { Sheet } from './Sheet'
import { useLastDefined } from './useLastDefined'
import './Filters.css'

function summary(key: FilterKey, values: string[]): string {
  if (values.length === 0) return 'Any'
  if (key === 'class' || values.length <= 2) return values.join(', ')
  return `${values[0]} +${values.length - 1}`
}

// One "Filters" row that opens a plain list of filters; each drills into its options.
export function Filters({
  items, filters, onChange, keys, nested = false,
}: {
  items: RollItem[]
  filters: FilterState
  onChange: (f: FilterState) => void
  keys: FilterKey[]
  nested?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [drill, setDrill] = useState<FilterKey | null>(null)
  const shownDrill = useLastDefined(drill)
  const selected = (k: FilterKey) => filters[k] ?? []
  const set = (k: FilterKey, values: string[]) => onChange({ ...filters, [k]: values })
  const active = keys.filter((k) => selected(k).length > 0)

  const toggle = (k: FilterKey, v: string) => {
    const cur = selected(k)
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  // Count each option against the other active filters, the way the game narrows choices.
  const optionsFor = (k: FilterKey) => {
    const opts = facetOptions(applyFilters(items, { ...filters, [k]: [] }), k)
    for (const v of selected(k)) if (!opts.some((o) => o.value === v)) opts.push({ value: v, count: 0 })
    return opts
  }

  const close = () => {
    setOpen(false)
    setDrill(null)
  }

  const clearAll = () => onChange(Object.fromEntries(keys.map((k) => [k, []])))

  return (
    <>
      <button className="filters-button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="filters-button__text">
          <span className="filters-button__label">Filters</span>
          <span className="filters-button__summary">
            {active.length === 0
              ? 'All cars'
              : active.map((k) => (k === 'class' ? `Class ${selected(k).join(', ')}` : summary(k, selected(k)))).join(' · ')}
          </span>
        </span>
        {active.length > 0 && <span className="filters-button__count" aria-label={`${active.length} active`}>{active.length}</span>}
        <ChevronRightIcon width={18} height={18} />
      </button>

      <Sheet
        nested={nested}
        open={open}
        onOpenChange={(o) => !o && close()}
        title={drill && shownDrill ? FILTER_LABELS[shownDrill] : 'Filters'}
        left={
          drill ? (
            <button className="text-button" onClick={() => setDrill(null)}>Back</button>
          ) : active.length > 0 ? (
            <button className="text-button" onClick={clearAll}>Clear All</button>
          ) : null
        }
        right={<button className="text-button text-button--strong" onClick={close}>Done</button>}
      >
        {drill ? (
          <>
            <ul className="options">
              {optionsFor(drill).map(({ value, count }) => {
                const on = selected(drill).includes(value)
                return (
                  <li key={value}>
                    <button className="options__row" role="menuitemcheckbox" aria-checked={on} onClick={() => toggle(drill, value)}>
                      {drill === 'class' ? (
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
            {selected(drill).length > 0 && (
              <button className="text-button filters-clear" onClick={() => set(drill, [])}>
                Clear {FILTER_LABELS[drill]}
              </button>
            )}
          </>
        ) : (
          <ul className="options">
            {keys.map((k) => (
              <li key={k}>
                <button className="options__row" onClick={() => setDrill(k)} aria-label={`${FILTER_LABELS[k]}, ${summary(k, selected(k))}`}>
                  <span className="options__label">{FILTER_LABELS[k]}</span>
                  <span className={`filters-value${selected(k).length ? ' filters-value--on' : ''}`}>{summary(k, selected(k))}</span>
                  <ChevronRightIcon width={18} height={18} className="filters-chevron" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
