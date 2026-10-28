import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { buildBackup } from '../domain/backup'
import type { Profile } from '../domain/types'
import { useStore } from '../state/store'
import { listEntries } from '../storage/db'
import { CheckIcon, ChevronRightIcon, DownloadIcon, PlusIcon, ShareIcon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { ImportFlow } from './ImportFlow'
import './ProfilesScreen.css'

const cars = (n: number) => `${n} car${n === 1 ? '' : 's'}`

async function exportProfile(profile: Profile) {
  const entries = await listEntries(profile.id)
  const json = JSON.stringify(buildBackup(profile, entries), null, 1)
  const name = `${profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'my'}-garage.json`
  const file = new File([json], name, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${profile.name}'s garage` })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toast(`Saved ${name}`)
}

export function ProfilesScreen() {
  const { profiles, activeId, entries, switchProfile, createProfile } = useStore()
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
      <EditProfileSheet profile={editing} count={editing ? counts[editing.id] ?? 0 : 0} onClose={() => setEditing(null)} />
      <ImportFlow text={importText} onClose={() => setImportText(null)} />
    </>
  )
}

function NewProfileSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => Promise<Profile> }) {
  const [name, setName] = useState('')
  const ok = name.trim().length > 0
  const close = () => {
    setName('')
    onClose()
  }
  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()} title="New Profile" left={<button className="text-button" onClick={close}>Cancel</button>}>
      <form
        className="import"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!ok) return
          await onCreate(name)
          close()
        }}
      >
        <label className="field">
          <span className="field__label">Profile name</span>
          <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </label>
        <p className="import__text">Starts with an empty garage on this phone.</p>
        <button className="button-primary" type="submit" disabled={!ok}>Create</button>
      </form>
    </Sheet>
  )
}

function EditProfileSheet({ profile, count, onClose }: { profile: Profile | null; count: number; onClose: () => void }) {
  const { renameProfile, deleteProfile } = useStore()
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setName(profile?.name ?? '')
    setConfirming(false)
  }, [profile])

  const ok = name.trim().length > 0

  return (
    <Sheet
      open={!!profile}
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
          <button className="button-secondary profile-export" onClick={() => void exportProfile(profile)}>
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
