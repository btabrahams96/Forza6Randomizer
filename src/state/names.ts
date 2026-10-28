import type { RollItem } from '../domain/filters'
import { itemTitle } from './items'

// "Mazda MX-5 Miata (1994)" next to a visible 1994 reads twice; drop the repeat.
export function titleWithoutYear(item: Pick<RollItem, 'car' | 'custom'>): string {
  const title = itemTitle(item)
  const year = item.car?.year ?? item.custom?.year
  return year ? title.replace(new RegExp(`\\s*\\(${year}\\)$`), '') : title
}
