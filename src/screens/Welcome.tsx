import { useState } from 'react'
import { PLAYERS } from '../data/players'
import { useStore } from '../state/store'
import { ChevronRightIcon } from '../ui/icons'
import { InstallHint } from '../ui/InstallHint'
import { useBusy } from '../ui/useBusy'

const cars = (n: number) => `${n} car${n === 1 ? '' : 's'}`

export function Welcome() {
  const { createProfile, importBackup } = useStore()
  const [other, setOther] = useState(false)
  const [name, setName] = useState('')
  const [busy, run] = useBusy()
  const ok = name.trim().length > 0

  return (
    <main className="welcome">
      <InstallHint />
      <h1 className="welcome__title">Who's playing?</h1>
      <p className="welcome__lead">Pick your name. Your garage loads on this phone and stays here.</p>

      <div className="group welcome__players">
        {PLAYERS.map((p) => (
          <button
            key={p.name}
            className="welcome__player"
            disabled={busy}
            aria-label={`${p.name}, ${cars(p.garage.entries.length)}`}
            onClick={() => void run(() => importBackup(p.garage, { mode: 'new', name: p.name }))}
          >
            <span className="avatar welcome__avatar" aria-hidden>{p.name.charAt(0)}</span>
            <span className="welcome__player-text">
              <span className="welcome__player-name">{p.name}</span>
              <span className="welcome__player-sub">{cars(p.garage.entries.length)}</span>
            </span>
            <ChevronRightIcon width={20} height={20} />
          </button>
        ))}
      </div>

      {other ? (
        <form
          className="welcome__form"
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) void run(() => createProfile(name))
          }}
        >
          <label className="field">
            <span className="field__label">Your name</span>
            <input
              className="field__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
              enterKeyHint="go"
              maxLength={40}
              autoFocus
            />
          </label>
          <button className="button-primary" type="submit" disabled={!ok || busy}>Start</button>
        </form>
      ) : (
        <button className="text-button welcome__other" onClick={() => setOther(true)}>Someone else</button>
      )}
    </main>
  )
}
