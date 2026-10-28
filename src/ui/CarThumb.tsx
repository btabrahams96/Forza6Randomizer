import { carImage, PLACEHOLDER_IMAGE } from '../data/catalog'
import type { Car } from '../domain/types'

export function CarThumb({ car, size, className }: { car: Car | undefined; size: 'thumb' | 'hero'; className?: string }) {
  return (
    <img
      className={className}
      src={carImage(car, size)}
      alt=""
      loading={size === 'thumb' ? 'lazy' : 'eager'}
      decoding="async"
      width={1340}
      height={752}
      onError={(e) => {
        const img = e.currentTarget
        // Offline with no cached hero: fall back to the precached thumb, then the placeholder.
        if (size === 'hero' && car?.thumb && !img.src.endsWith(car.thumb)) img.src = car.thumb
        else if (!img.src.endsWith(PLACEHOLDER_IMAGE)) img.src = PLACEHOLDER_IMAGE
      }}
    />
  )
}
