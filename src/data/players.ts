import type { BackupFile } from '../domain/backup'
import bryton from '../../seed/bryton-garage.json'
import kyle from '../../seed/kyle-garage.json'

// The two players' garages, transcribed from their in-game screenshots, ship
// with the app so picking a name on first launch loads the right cars.
export const PLAYERS: { name: string; garage: BackupFile }[] = [
  { name: 'Bryton', garage: bryton as BackupFile },
  { name: 'Kyle', garage: kyle as BackupFile },
]
