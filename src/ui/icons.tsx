import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
})

export const DiceIcon = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" /><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" /><circle cx="12" cy="12" r="1.1" fill="currentColor" /></svg>
)
export const GarageIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 4l9 6.5V20H3z" /><path d="M7 20v-6h10v6M7 17h10" /></svg>
)
export const PersonIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.8-6 8-6s6.5 2 8 6" /></svg>
)
export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
)
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>
)
export const PlusIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
export const CheckIcon = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}><path d="m7 10 5 5 5-5" /></svg>
)
export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)}><path d="m10 7 5 5-5 5" /></svg>
)
export const CopyIcon = (p: P) => (
  <svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
)
export const TrashIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /></svg>
)
export const ShareIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" /><path d="M5 12v7.5h14V12" /></svg>
)
export const DownloadIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></svg>
)
