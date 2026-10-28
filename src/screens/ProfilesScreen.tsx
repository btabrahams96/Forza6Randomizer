import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PLAYERS } from '../data/players'
import { buildBackup } from '../domain/backup'
import type { Profile } from '../domain/types'
import { useStore } from '../state/store'
import { listEntries } from '../storage/db'
import { CheckIcon, ChevronRightIcon, DownloadIcon, PlusIcon, ShareIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { useLastDefined } from '../ui/useLastDefined'
import { useBusy } from '../ui/useBusy'
import { ImportFlow } from './ImportFlow'
import './ProfilesScreen.css'

const cars = (n: number) => `${n} car${n === 1 ? '' : 's'}`

async function backupFile(profile: Profile): Promise<File> {
  const entries = await listEntries(profile.id)
  const json = JSON.stringify(buildBackup(profile, entries), null, 1)
  const name = `${profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'my'}-garage.json`
  return new File([json], name, { type: 'application/json' })
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Called straight from the tap with a file built in advance: iOS only opens the
// share sheet while the tap's user gesture is still fresh.
async function shareFile(file: File, profile: Profile) {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${profile.name}'s garage` })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      download(file)
      toast("Couldn't open the share sheet. Downloading the file instead; check your Files app.")
      return
    }
  }
  download(file)
  toast(`Downloading ${file.name}. Check your Files app.`)
}

export function ProfilesScreen() {
  const { profiles, activeId, entries, switchProfile, createProfile, importBackup } = useStore()
  const [adding, runAdd] = useBusy()
  const missing = PLAYERS.filter((pl) => !profiles.some((p) => p.name.trim().toLowerCase() === pl.name.toLowerCase()))
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<Profile | null>(null)
  const [creating, setCreating] = useState(false)
  const [importText, setImportText] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void Promise.all(profiles.map(async (p) => [p.id, (await listEntries(p.id)).length] as const)).then((pairs) => {
      if (live) setCounts(Object.fromEntries(pairs))
    })
    return () => {
      live = false
    }
  }, [profiles, entries])

  return (
    <>
      <header className="screen-head">
        <h1 className="screen-title">Profiles</h1>
      </header>

      <h2 className="section-label">On this phone</h2>
      <div className="group profiles" role="radiogroup" aria-label="Active profile">
        {profiles.map((p) => {
          const on = p.id === activeId
          const n = counts[p.id] ?? 0
          return (
            <div key={p.id} className="profile-row">
              <button
                className="profile-row__main"
                role="radio"
                aria-checked={on}
                aria-label={`${p.name}, ${cars(n)}`}
                onClick={() => void switchProfile(p.id)}
              >
                <span className="avatar" aria-hidden>{p.name.trim().charAt(0).toUpperCase()}</span>
                <span className="profile-row__text">
                  <span className="profile-row__name">{p.name}</span>
                  <span className="profile-row__sub">{cars(n)}</span>
                </span>
                <span className="profile-row__check">{on && <CheckIcon width={20} height={20} />}</span>
              </button>
              <button className="profile-row__edit" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                <ChevronRightIcon width={20} height={20} />
              </button>
            </div>
          )
        })}
        {missing.map((pl) => (
          <button
            key={pl.name}
            className="profile-add"
            disabled={adding}
            aria-label={`Add ${pl.name}'s garage, ${cars(pl.garage.entries.length)}`}
            onClick={() => void runAdd(() => importBackup(pl.garage, { mode: 'new', name: pl.name }))}
          >
            <PlusIcon width={20} height={20} />
            Add {pl.name}'s garage
          </button>
        ))}
        <button className="profile-add" onClick={() => setCreating(true)}>
          <PlusIcon width={20} height={20} />
          New profile
        </button>
      </div>

      <h2 className="section-label">Backup</h2>
      <div className="group">
        <label className="profile-action">
          <DownloadIcon width={20} height={20} />
          <span>Import backup</span>
          <input
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            aria-label="Import backup"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) setImportText(await f.text())
            }}
          />
        </label>
      </div>
      <p className="profiles-note">
        Garages live only on this phone. Export one from its profile to keep a copy or move it to another phone.
      </p>

      <h2 className="section-label">About</h2>
      <p className="profiles-note profiles-note--about">
        Car data and photos: Forza Wiki (forza.fandom.com). Forza Horizon 6 and its cars belong to Microsoft and Playground Games. This is a private fan app.
      </p>

      <NewProfileSheet open={creating} onClose={() => setCreating(false)} onCreate={createProfile} />
      <EditProfileSheet profile={editing} counts={counts} onClose={() => setEditing(null)} />
      <ImportFlow text={importText} onClose={() => setImportText(null)} />
    </>
  )
}

function NewProfileSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => Promise<Profile> }) {
  const [name, setName] = useState('')
  const [busy, runOnce] = useBusy()
  const ok = name.trim().length > 0
  const close = () => {
    setName('')
    onClose()
  }
  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()} title="New Profile" left={<button className="text-button" onClick={close}>Cancel</button>}>
      <form
        className="import"
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok) return
          void runOnce(async () => {
            await onCreate(name)
            close()
          })
        }}
      >
        <label className="field">
          <span className="field__label">Profile name</span>
          <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </label>
        <p className="import__text">Starts with an empty garage on this phone.</p>
        <button className="button-primary" type="submit" disabled={!ok || busy}>Create</button>
      </form>
    </Sheet>
  )
}

function EditProfileSheet({ profile: live, counts, onClose }: { profile: Profile | null; counts: Record<string, number>; onClose: () => void }) {
  const profile = useLastDefined(live)
  const count = profile ? counts[profile.id] ?? 0 : 0
  const { renameProfile, deleteProfile } = useStore()
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!live) return
    setFile(null)
    void backupFile(live).then(setFile)
    setName(live.name)
    setConfirming(false)
  }, [live])

  const ok = name.trim().length > 0

  return (
    <Sheet
      open={!!live}
      onOpenChange={(o) => !o && onClose()}
      title={profile?.name ?? ''}
      left={<button className="text-button" onClick={onClose}>Cancel</button>}
      right={
        <button
          className="text-button text-button--strong"
          disabled={!ok || confirming}
          onClick={async () => {
            if (profile && name.trim() !== profile.name) await renameProfile(profile.id, name)
            onClose()
          }}
        >
          Save
        </button>
      }
    >
      {profile && confirming && (
        <div className="import inline-confirm" role="alertdialog" aria-labelledby="delete-profile-title">
          <h3 id="delete-profile-title" className="inline-confirm__title">Delete {profile.name} and {cars(count)}?</h3>
          <p className="import__text">This removes the profile and its garage from this phone. Export it first if you want a copy. This can't be undone.</p>
          <button
            className="button-primary button-primary--danger"
            onClick={async () => {
              await deleteProfile(profile.id)
              onClose()
              toast(`Deleted ${profile.name}`)
            }}
          >
            Delete profile
          </button>
          <button className="button-secondary" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      )}
      {profile && !confirming && (
        <div className="import">
          <label className="field">
            <span className="field__label">Profile name</span>
            <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          </label>
          <button className="button-secondary profile-export" disabled={!file} onClick={() => file && void shareFile(file, profile)}>
            <ShareIcon width={20} height={20} />
            Export {cars(count)}
          </button>
          <button className="button-secondary button-secondary--danger" onClick={() => setConfirming(true)}>
            Delete profile
          </button>
        </div>
      )}
    </Sheet>
  )
}
