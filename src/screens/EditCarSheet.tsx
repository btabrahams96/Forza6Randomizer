import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getCar } from '../data/catalog'
import { CLASS_ORDER, PI_MAX, PI_MIN, classForPi, parsePi } from '../domain/classes'
import { COUNTRY_LABELS } from '../domain/labels'
import { useStore } from '../state/store'
import { itemTitle } from '../state/items'
import { CarThumb } from '../ui/CarThumb'
import { ClassBadge } from '../ui/ClassBadge'
import { Sheet } from '../ui/Sheet'
import { useLastDefined } from '../ui/useLastDefined'
import './EditCarSheet.css'

const PI_ERRORS = {
  empty: 'Enter the PI shown on the car in game.',
  'not-a-number': 'PI is a whole number, like 701.',
  'out-of-range': `PI goes from ${PI_MIN} to ${PI_MAX}.`,
}

export function EditCarSheet({
  entryId, onClose, onDelete,
}: {
  entryId: string | null
  onClose: () => void
  onDelete: (entryId: string) => void
}) {
  const liveEntry = useStore((s) => s.entries.find((e) => e.id === entryId))
  const entry = useLastDefined(liveEntry)
  const { updateEntry, duplicateEntry } = useStore()
  const [piText, setPiText] = useState('')
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (liveEntry) {
      setPiText(String(liveEntry.pi))
      setNickname(liveEntry.nickname ?? '')
    }
    // Reset only when a different car opens, not on every store refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId])

  const car = entry?.carId ? getCar(entry.carId) : undefined
  const title = entry ? itemTitle({ car, custom: entry.custom }) : ''
  const parsed = parsePi(piText)
  const cls = parsed.ok ? classForPi(parsed.pi) : null

  const step = (delta: number) => {
    const base = parsed.ok ? parsed.pi : entry?.pi ?? PI_MIN
    setPiText(String(Math.min(PI_MAX, Math.max(PI_MIN, base + delta))))
  }

  const save = async () => {
    if (!entry || !parsed.ok) return
    await updateEntry(entry.id, { pi: parsed.pi, nickname: nickname.trim() || null })
    onClose()
  }

  const duplicate = async () => {
    if (!entry) return
    await duplicateEntry(entry.id)
    onClose()
    toast(`Added another ${title}`)
  }

  return (
    <Sheet
        open={!!liveEntry}
        onOpenChange={(o) => !o && onClose()}
        title="Edit Car"
        left={<button className="text-button" onClick={onClose}>Cancel</button>}
        right={
          <button className="text-button text-button--strong" onClick={save} disabled={!parsed.ok}>Save</button>
        }
      >
        {entry && (
          <form
            className="edit"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <div className="edit__photo">
              <CarThumb car={car} size="hero" />
            </div>
            <h3 className="edit__name">{title}</h3>

            <label className="field" htmlFor="edit-pi">
              <span className="field__label">PI</span>
            </label>
            <div className="edit__pi">
              <input
                id="edit-pi"
                className="field__input edit__pi-input"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="done"
                value={piText}
                onChange={(e) => setPiText(e.target.value)}
                aria-invalid={!parsed.ok}
                aria-describedby="edit-pi-hint"
              />
              {parsed.ok && <ClassBadge pi={parsed.pi} size="lg" />}
              <div className="edit__stepper">
                <button type="button" onClick={() => step(-1)} aria-label="Lower PI by 1">−</button>
                <button type="button" onClick={() => step(1)} aria-label="Raise PI by 1">+</button>
              </div>
            </div>
            <p id="edit-pi-hint" className={`field__hint${parsed.ok ? '' : ' field__hint--error'}`}>
              {parsed.ok ? 'Type the PI from the game. The class follows it.' : PI_ERRORS[parsed.reason]}
            </p>

            <div className="edit__classes" aria-hidden>
              {CLASS_ORDER.map((c) => (
                <span
                  key={c}
                  className={`edit__class${c === cls ? ' edit__class--on' : ''}`}
                  style={{ ['--c' as string]: `var(--class-${c})` }}
                >
                  {c}
                </span>
              ))}
            </div>

            <label className="field edit__nickname">
              <span className="field__label">Nickname</span>
              <input
                className="field__input"
                value={nickname}
                placeholder="Optional, like Drag build"
                onChange={(e) => setNickname(e.target.value)}
                maxLength={40}
                enterKeyHint="done"
              />
            </label>

            <div className="edit__actions">
              <button type="button" className="button-secondary" onClick={duplicate}>Duplicate</button>
              <button type="button" className="button-secondary button-secondary--danger" onClick={() => { onClose(); onDelete(entry.id) }}>
                Delete
              </button>
            </div>

            {car && (
              <dl className="edit__stock">
                <div><dt>Car Type</dt><dd>{car.carType ?? 'Not listed'}</dd></div>
                <div><dt>Stock</dt><dd>{classForPi(car.stockPi)} {car.stockPi}</dd></div>
                <div><dt>Year</dt><dd>{car.year}</dd></div>
                <div><dt>Country</dt><dd>{COUNTRY_LABELS[car.country] ?? car.country}</dd></div>
                <div><dt>Drivetrain</dt><dd>{car.drivetrain ?? 'Not listed'}</dd></div>
                <div><dt>Rarity</dt><dd>{car.rarity}</dd></div>
              </dl>
            )}
            <button type="submit" hidden />
          </form>
        )}
    </Sheet>
  )
}
