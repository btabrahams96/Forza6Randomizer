import { useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { toast } from 'sonner'
import { CLASS_ORDER, classForPi, type ClassId } from '../domain/classes'
import { applyFilters, type FilterState, type RollItem } from '../domain/filters'
import { useStore } from '../state/store'
import { entryItems, itemTitle, matchesSearch } from '../state/items'
import { CarThumb } from '../ui/CarThumb'
import { ClassBadge } from '../ui/ClassBadge'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { FilterChips } from '../ui/FilterChips'
import { CheckIcon, ChevronDownIcon, PlusIcon, SearchIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { SwipeRow } from '../ui/SwipeRow'
import { AddCarsSheet } from './AddCarsSheet'
import { EditCarSheet } from './EditCarSheet'
import './GarageScreen.css'

type Sort = 'pi' | 'make' | 'year' | 'updated'
const SORTS: { id: Sort; label: string }[] = [
  { id: 'pi', label: 'PI' },
  { id: 'make', label: 'Manufacturer' },
  { id: 'year', label: 'Year' },
  { id: 'updated', label: 'Recently updated' },
]

const plural = (n: number) => `${n} car${n === 1 ? '' : 's'}`

export function GarageScreen() {
  const entries = useStore((s) => s.entries)
  const { duplicateEntry, deleteEntry, restoreEntry } = useStore()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState<Sort>('pi')
  const [sortOpen, setSortOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<RollItem | null>(null)

  const items = useMemo(() => entryItems(entries), [entries])
  const updatedAt = useMemo(() => new Map(entries.map((e) => [e.id, e.updatedAt])), [entries])

  const { groups, counts, flat } = useMemo(() => {
    const shown = applyFilters(items, filters).filter((i) => matchesSearch(i, query))
    const cmp: Record<Sort, (a: RollItem, b: RollItem) => number> = {
      pi: (a, b) => b.pi - a.pi,
      make: (a, b) => itemTitle(a).localeCompare(itemTitle(b)),
      year: (a, b) => (b.car?.year ?? b.custom?.year ?? 0) - (a.car?.year ?? a.custom?.year ?? 0),
      updated: (a, b) => (updatedAt.get(b.key) ?? 0) - (updatedAt.get(a.key) ?? 0),
    }
    const byClass = new Map<ClassId, RollItem[]>()
    for (const item of shown) {
      const c = classForPi(item.pi)
      byClass.set(c, [...(byClass.get(c) ?? []), item])
    }
    const groups = CLASS_ORDER.filter((c) => byClass.has(c))
    const lists = groups.map((c) => byClass.get(c)!.sort(cmp[sort]))
    return { groups, counts: lists.map((l) => l.length), flat: lists.flat() }
  }, [items, filters, query, sort, updatedAt])

  const confirmDelete = async () => {
    if (!deleting?.entryId) return
    const title = itemTitle(deleting)
    const removed = await deleteEntry(deleting.entryId)
    setDeleting(null)
    toast(`Deleted ${title}`, { action: { label: 'Undo', onClick: () => void restoreEntry(removed) } })
  }

  const hasFilters = query.trim() !== '' || Object.values(filters).some((v) => v?.length)

  return (
    <>
      <header className="screen-head">
        <h1 className="screen-title">Garage</h1>
        <button className="icon-button" onClick={() => setAdding(true)} aria-label="Add cars">
          <PlusIcon width={26} height={26} />
        </button>
      </header>

      {entries.length === 0 ? (
        <div className="garage-empty">
          <h2 className="garage-empty__title">Your garage is empty</h2>
          <p className="garage-empty__text">Tick the cars you own from all 665 FH6 cars. Each goes in at its stock PI, and you can update it after you upgrade.</p>
          <button className="button-primary" onClick={() => setAdding(true)}>Add your cars</button>
        </div>
      ) : (
        <>
          <label className="search">
            <SearchIcon width={18} height={18} />
            <input
              type="search"
              aria-label="Search garage"
              placeholder={`Search ${plural(entries.length)}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
              autoCorrect="off"
            />
          </label>
          <div className="garage-tools">
            <FilterChips items={items} filters={filters} onChange={setFilters} keys={['class', 'carType', 'make', 'drivetrain']} />
            <button className="chip garage-sort" onClick={() => setSortOpen(true)} aria-haspopup="dialog">
              <span className="chip__main">
                Sort: {SORTS.find((s) => s.id === sort)!.label}
                <ChevronDownIcon width={16} height={16} />
              </span>
            </button>
          </div>

          {flat.length === 0 ? (
            <div className="garage-empty garage-empty--inline">
              <p className="garage-empty__text">No cars in your garage match.</p>
              {hasFilters && (
                <button className="text-button" onClick={() => { setQuery(''); setFilters({}) }}>Clear search and filters</button>
              )}
            </div>
          ) : (
            <GroupedVirtuoso
              useWindowScroll
              groupCounts={counts}
              groupContent={(i) => (
                <h2 className="garage-section" aria-label={`Class ${groups[i]}, ${plural(counts[i])}`}>
                  <span>Class {groups[i]}</span>
                  <span className="garage-section__count">{plural(counts[i])}</span>
                </h2>
              )}
              itemContent={(index) => {
                const item = flat[index]
                const title = itemTitle(item)
                const sub = item.nickname ?? item.car?.carType ?? item.car?.rarity ?? (item.custom ? 'Added by hand' : 'No longer in the car list')
                return (
                  <SwipeRow
                    label={title}
                    onCopy={async () => {
                      await duplicateEntry(item.entryId!)
                      toast(`Added another ${title}`)
                    }}
                    onDelete={() => setDeleting(item)}
                  >
                    <button
                      className="garage-row"
                      onClick={() => setEditing(item.entryId)}
                      aria-label={`Edit ${title}, ${sub}, class ${classForPi(item.pi)} ${item.pi}`}
                    >
                      <span className="garage-row__thumb"><CarThumb car={item.car} size="thumb" /></span>
                      <span className="garage-row__text">
                        <span className="garage-row__name">{title}</span>
                        <span className="garage-row__sub">{sub}</span>
                      </span>
                      <ClassBadge pi={item.pi} />
                    </button>
                  </SwipeRow>
                )
              }}
            />
          )}
        </>
      )}

      <Sheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        title="Sort Within Class"
        right={<button className="text-button text-button--strong" onClick={() => setSortOpen(false)}>Done</button>}
      >
        <ul className="options">
          {SORTS.map((s) => (
            <li key={s.id}>
              <button className="options__row" role="menuitemradio" aria-checked={sort === s.id} onClick={() => { setSort(s.id); setSortOpen(false) }}>
                <span className="options__label">{s.label}</span>
                <span className="options__check">{sort === s.id && <CheckIcon width={20} height={20} />}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <AddCarsSheet open={adding} onClose={() => setAdding(false)} />
      <EditCarSheet
        entryId={editing}
        onClose={() => setEditing(null)}
        onDelete={(id) => setDeleting(items.find((i) => i.entryId === id) ?? null)}
      />
      <ConfirmDialog
        open={!!deleting}
        title={deleting ? `Delete ${itemTitle(deleting)}?` : ''}
        message="It comes off this garage. You can undo right after."
        confirmLabel="Delete car"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
