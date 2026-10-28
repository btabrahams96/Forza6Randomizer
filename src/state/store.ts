import { create } from 'zustand'
import * as db from '../storage/db'
import type { BackupFile } from '../domain/backup'
import type { FilterState } from '../domain/filters'
import type { CustomCar, GarageEntry, Profile, RollSettings } from '../domain/types'

type State = {
  ready: boolean
  profiles: Profile[]
  activeId: string | null
  entries: GarageEntry[]
  settings: RollSettings | null
  /** Last rolled item key per profile; kept while the app is open so tab switches don't lose it. */
  lastRoll: Record<string, string>
}

type Actions = {
  init(): Promise<void>
  switchProfile(id: string): Promise<void>
  createProfile(name: string): Promise<Profile>
  renameProfile(id: string, name: string): Promise<void>
  deleteProfile(id: string): Promise<void>
  addCars(carIds: string[]): Promise<void>
  addCustom(custom: CustomCar, pi: number): Promise<void>
  updateEntry(id: string, patch: { pi?: number; nickname?: string | null }): Promise<void>
  duplicateEntry(id: string): Promise<void>
  deleteEntry(id: string): Promise<GarageEntry>
  restoreEntry(entry: GarageEntry): Promise<void>
  setPool(pool: RollSettings['pool']): Promise<void>
  setFilters(filters: FilterState): Promise<void>
  setLastRoll(key: string): void
  importBackup(file: BackupFile, target: { mode: 'new'; name: string } | { mode: 'replace'; profileId: string }): Promise<number>
}

export const useStore = create<State & Actions>((set, get) => {
  const reloadEntries = async () => {
    const id = get().activeId
    set({ entries: id ? await db.listEntries(id) : [] })
  }
  const saveSettings = async (patch: Partial<RollSettings>) => {
    const s = get().settings
    if (!s) return
    const next = { ...s, ...patch }
    set({ settings: next })
    await db.saveSettings(next)
  }

  return {
    ready: false,
    profiles: [],
    activeId: null,
    entries: [],
    settings: null,
    lastRoll: {},

    async init() {
      const profiles = await db.listProfiles()
      let activeId = await db.getActiveProfileId()
      if (!profiles.some((p) => p.id === activeId)) activeId = profiles[0]?.id ?? null
      set({ profiles, activeId })
      if (activeId) {
        set({ entries: await db.listEntries(activeId), settings: await db.getSettings(activeId) })
      }
      set({ ready: true })
    },

    async switchProfile(id) {
      await db.setActiveProfileId(id)
      set({ activeId: id, entries: await db.listEntries(id), settings: await db.getSettings(id) })
    },

    async createProfile(name) {
      const p = await db.createProfile(name)
      set({ profiles: await db.listProfiles() })
      await get().switchProfile(p.id)
      return p
    },

    async renameProfile(id, name) {
      await db.renameProfile(id, name)
      set({ profiles: await db.listProfiles() })
    },

    async deleteProfile(id) {
      await db.deleteProfile(id)
      const profiles = await db.listProfiles()
      set({ profiles })
      if (get().activeId === id) {
        if (profiles[0]) await get().switchProfile(profiles[0].id)
        else set({ activeId: null, entries: [], settings: null })
      }
    },

    async addCars(carIds) {
      const id = get().activeId
      if (!id) return
      await db.addEntries(id, carIds)
      await reloadEntries()
    },

    async addCustom(custom, pi) {
      const id = get().activeId
      if (!id) return
      await db.addCustomEntry(id, custom, pi)
      await reloadEntries()
    },

    async updateEntry(id, patch) {
      await db.updateEntry(id, patch)
      await reloadEntries()
    },

    async duplicateEntry(id) {
      await db.duplicateEntry(id)
      await reloadEntries()
    },

    async deleteEntry(id) {
      const removed = await db.deleteEntry(id)
      await reloadEntries()
      return removed
    },

    async restoreEntry(entry) {
      await db.restoreEntry(entry)
      await reloadEntries()
    },

    setPool: (pool) => saveSettings({ pool }),
    setFilters: (filters) => saveSettings({ filters }),
    setLastRoll(key) {
      const id = get().activeId
      if (id) set({ lastRoll: { ...get().lastRoll, [id]: key } })
    },

    async importBackup(file, target) {
      let profileId: string
      if (target.mode === 'new') {
        profileId = (await db.createProfile(target.name)).id
      } else {
        profileId = target.profileId
      }
      const entries = await db.replaceEntries(profileId, file.entries)
      set({ profiles: await db.listProfiles() })
      await get().switchProfile(profileId)
      return entries.length
    },
  }
})
