import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { searchMusic } from '#/utils/api'
import type { Music, QueueItem } from '#/types'
import { toast } from 'sonner'
import { safeUUID } from '#/utils/uuid'

interface MusicPlayer {
  query: string
  results: Music[]
  isLoading: boolean
  queue: QueueItem[]
  history: QueueItem[]
  error: string
  isError: boolean
  hasHydrated: boolean
  setHasHydrated: (h: boolean) => void
  setQuery: (q: string) => void
  executeQuery: () => void
  pushToQueue: (m: Music) => void
  playNextTrack: (m: Music) => void
  popFromQueue: () => void
  playPrevious: () => void
  clearQueue: () => void
  removeFromQueue: (queueItemId: string) => void
  clearHistory: () => void
}

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined

export const useMusicPlayer = create<MusicPlayer>()(
  persist(
    (set, get) => ({
      query: '',
      results: [] as Music[],
      isLoading: false,
      queue: [] as QueueItem[],
      history: [] as QueueItem[],
      error: '',
      isError: false,
      hasHydrated: false,

      setHasHydrated: (h: boolean) => set({ hasHydrated: h }),

      setQuery: (q: string) => {
        set({ query: q })
        get().executeQuery()
      },

      executeQuery: async () => {
        if (searchTimeoutId) clearTimeout(searchTimeoutId)
        const q = get().query

        if (!q) {
          set({ results: [], isLoading: false, isError: false, error: '' })
          return
        }

        set({ isLoading: true, isError: false, error: '' })
        searchTimeoutId = setTimeout(async () => {
          try {
            const res = await searchMusic(q)
            if (get().query !== q) return
            set({ results: res, isLoading: false, isError: false, error: '' })
            toast.success(`Results for "${q}"`, {
              description: `${res.length} ${res.length === 1 ? 'track' : 'tracks'} ready to play`,
            })
          } catch (e: unknown) {
            if (get().query !== q) return
            const errorMsg = e instanceof Error ? e.message : String(e)
            set({ error: errorMsg, isLoading: false, isError: true })
            toast.error('Search Failed', {
              description: errorMsg,
            })
          }
        }, 400)
      },

      pushToQueue: (m: Music) => {
        const item: QueueItem = { queueItemId: safeUUID(), track: m }
        set((s) => ({ queue: [...s.queue, item] }))
        toast('Added to Queue', {
          description: `${m.title} • ${m.uploader}`,
        })
      },

      playNextTrack: (m: Music) => {
        const item: QueueItem = { queueItemId: safeUUID(), track: m }
        set((s) => {
          if (s.queue.length === 0) return { queue: [item] }
          const newQ = [s.queue[0], item, ...s.queue.slice(1)]
          return { queue: newQ }
        })
        toast('Playing Next', {
          description: `${m.title} • ${m.uploader}`,
        })
      },

      popFromQueue: () => {
        set((s) => {
          if (s.queue.length === 0) return s
          const [cur, ...rem] = s.queue
          return { history: [cur, ...s.history], queue: rem }
        })
      },

      playPrevious: () => {
        set((s) => {
          if (s.history.length === 0) return s
          const [prev, ...remHistory] = s.history
          return {
            history: remHistory,
            queue: [prev, ...s.queue],
          }
        })
      },

      clearQueue: () => {
        set((s) => ({
          queue: s.queue.slice(0, 1),
        }))
        toast.info('Queue cleared')
      },

      removeFromQueue: (queueItemId: string) => {
        set((s) => ({
          queue: s.queue.filter((q) => q.queueItemId !== queueItemId),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
        toast.info('History cleared')
      },
    }),
    {
      name: 'localQ',
      partialize: (s) => ({
        queue: s.queue,
        history: s.history,
      }),
      onRehydrateStorage: () => (state) => {
        const ensureQueueItem = (item: any): QueueItem =>
          item?.track ? item : { queueItemId: safeUUID(), track: item }

        if (state?.queue) state.queue = state.queue.map(ensureQueueItem)
        if (state?.history) state.history = state.history.map(ensureQueueItem)
        state?.setHasHydrated(true)
      },
    },
  ),
)

