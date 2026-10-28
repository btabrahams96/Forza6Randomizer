import { useState } from 'react'
import { useStore } from '../state/store'
import { InstallHint } from '../ui/InstallHint'

export function Welcome() {
  const createProfile = useStore((s) => s.createProfile)
  const [name, setName] = useState('')
  const ok = name.trim().length > 0

  return (
    <main className="welcome">
      <InstallHint />
      <h1 className="welcome__title">Forza 6 Randomizer</h1>
      <p className="welcome__lead">Your garage, one tap from a random car. Start with your name. Your garage stays on this phone.</p>
      <form
        className="welcome__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void createProfile(name)
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
          />
        </label>
        <button className="button-primary" type="submit" disabled={!ok}>Start</button>
      </form>
    </main>
  )
}
