import { Component, type ReactNode } from 'react'

export function FatalScreen({ detail }: { detail?: string }) {
  return (
    <main className="welcome" role="alert">
      <h1 className="welcome__title">Couldn't open your garage</h1>
      <p className="welcome__lead">
        Something on this phone stopped the app from reading its saved data. Your garage is still stored here. Reload to try again.
        {detail ? ` (${detail})` : ''}
      </p>
      <button className="button-primary" onClick={() => location.reload()}>Reload</button>
    </main>
  )
}

// A render error in a Home Screen app has no browser reload button to escape it.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    return this.state.error ? <FatalScreen detail={this.state.error.message} /> : this.props.children
  }
}
