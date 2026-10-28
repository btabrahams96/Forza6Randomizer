import { ShareIcon } from './icons'
import './InstallHint.css'

// On iOS, a Home Screen app keeps its own storage, separate from Safari's, and
// Safari can clear site data it hasn't seen in a week. Steer people to install first.
function isIosBrowserTab(): boolean {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches
  return ios && !standalone
}

export function InstallHint() {
  if (!isIosBrowserTab()) return null
  return (
    <p className="install-hint" role="note">
      <ShareIcon width={18} height={18} />
      <span>
        <strong>Add to Home Screen first.</strong> Tap Share, then Add to Home Screen, and open it from there. A garage saved in a Safari tab stays in Safari and can be cleared.
      </span>
    </p>
  )
}
