import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CARS } from '../data/catalog'
import { parseBackup, type ParseBackupResult } from '../domain/backup'
import type { Profile } from '../domain/types'
import { useStore } from '../state/store'
import { listEntries } from '../storage/db'
import { Sheet } from '../ui/Sheet'
import { useLastDefined } from '../ui/useLastDefined'
import { useBusy } from '../ui/useBusy'

const KNOWN = new Set(CARS.map((c) => c.id))
const cars = (n: number) => `${n} car${n === 1 ? '' : 's'}`

const ERRORS: Record<Extract<ParseBackupResult, { ok: false }>['error'], string> = {
  'not-json': "This file isn't a garage backup.",
  'wrong-app': "This file isn't a garage backup.",
  'unsupported-version': 'This backup comes from a newer version of the app. Update the app, then try again.',
  'no-entries': 'This backup has no cars this app can read.',
}

export function ImportFlow({ text, onClose }: { text: string | null; onClose: () => void }) {
  const profiles = useStore((s) => s.profiles)
  const importBackup = useStore((s) => s.importBackup)
  const [target, setTarget] = useState<'new' | string>('new')
  const [name, setName] = useState('')
  const [confirmReplace, setConfirmReplace] = useState<{ profile: Profile; count: number } | null>(null)
  const shownText = useLastDefined(text)
  const [busy, runOnce] = useBusy()
  const parsed = shownText === null ? null : parseBackup(shownText, KNOWN)

  useEffect(() => {
    if (text === null) return
    setTarget('new')
    setConfirmReplace(null)
    setName(parsed?.ok ? parsed.file.profileName : '')
    // Fresh state for each file picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const run = async () => {
    if (!parsed?.ok) return
    const n = await importBackup(
      parsed.file,
      target === 'new' ? { mode: 'new', name: name.trim() || parsed.file.profileName } : { mode: 'replace', profileId: target },
    )
    onClose()
    const notes = [
      parsed.skipped.length ? `skipped ${parsed.skipped.length} that didn't read right` : '',
      parsed.unrecognized ? `${cars(parsed.unrecognized)} not in the car list, kept as Unknown` : '',
    ].filter(Boolean)
    toast(`Imported ${cars(n)}${notes.length ? `; ${notes.join('; ')}` : ''}`)
  }

  const start = async () => {
    if (!parsed?.ok) return
    if (target === 'new') return run()
    const profile = profiles.find((p) => p.id === target)!
    setConfirmReplace({ profile, count: (await listEntries(profile.id)).length })
  }

  const count = parsed?.ok ? parsed.file.entries.length : 0

  return (
    <Sheet
      open={text !== null}
      onOpenChange={(o) => !o && onClose()}
      title="Import Garage"
      left={<button className="text-button" onClick={onClose}>Cancel</button>}
    >
      {parsed && !parsed.ok && (
        <div className="import">
          <p className="import__error">{ERRORS[parsed.error]}</p>
          <p className="import__text">Nothing was changed.</p>
          <button className="button-primary" onClick={onClose}>Close</button>
        </div>
      )}

      {parsed?.ok && confirmReplace && (
        <div className="import inline-confirm" role="alertdialog" aria-labelledby="replace-title">
          <h3 id="replace-title" className="inline-confirm__title">
            Replace {confirmReplace.profile.name}'s {cars(confirmReplace.count)}?
          </h3>
          <p className="import__text">
            Their garage becomes the {cars(count)} in this backup. Other profiles stay as they are. This can't be undone.
          </p>
          <button className="button-primary button-primary--danger" disabled={busy} onClick={() => runOnce(run)}>Replace garage</button>
          <button className="button-secondary" onClick={() => setConfirmReplace(null)}>Cancel</button>
        </div>
      )}

      {parsed?.ok && !confirmReplace && (
        <div className="import">
          <p className="import__text">
            {cars(count)} from “{parsed.file.profileName}”
            {parsed.skipped.length ? `. ${parsed.skipped.length} entries didn't read right and will be skipped.` : '.'}
          </p>
          <div className="options" role="radiogroup" aria-label="Import into">
            <div>
              <label className="options__row">
                <input type="radio" name="target" checked={target === 'new'} onChange={() => setTarget('new')} />
                <span className="options__label">New profile</span>
              </label>
            </div>
            {profiles.map((p) => (
              <div key={p.id}>
                <label className="options__row">
                  <input type="radio" name="target" checked={target === p.id} onChange={() => setTarget(p.id)} />
                  <span className="options__label">Replace {p.name}</span>
                </label>
              </div>
            ))}
          </div>
          {target === 'new' && (
            <label className="field import__name">
              <span className="field__label">Profile name</span>
              <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            </label>
          )}
          <button className="button-primary" disabled={busy} onClick={() => runOnce(start)}>Import {cars(count)}</button>
        </div>
      )}
    </Sheet>
  )
}
