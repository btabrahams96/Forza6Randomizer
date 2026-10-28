import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import './Sheet.css'

export function Sheet({
  open, onOpenChange, title, children, left, right, tall = false, nested = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  left?: ReactNode
  right?: ReactNode
  tall?: boolean
  /** Opened from inside another sheet. */
  nested?: boolean
}) {
  const Root = nested ? Drawer.NestedRoot : Drawer.Root
  return (
    <Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />
        <Drawer.Content className={`sheet${tall ? ' sheet--tall' : ''}`} aria-describedby={undefined}>
          <div className="sheet__grabber" aria-hidden />
          <header className="sheet__head">
            <div className="sheet__side">{left}</div>
            <Drawer.Title className="sheet__title">{title}</Drawer.Title>
            <div className="sheet__side sheet__side--right">{right}</div>
          </header>
          <div className="sheet__body">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Root>
  )
}
