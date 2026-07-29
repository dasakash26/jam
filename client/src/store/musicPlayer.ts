import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { searchMusic } from '#/utils/api'
import type { Music } from '#/types'
import { toast } from 'sonner'

interface MusicPlayer {
  query: string
  results: Music[]
  isLoading: boolean
  queue: Music[]
  history: Music[]
  error: string
  isError: boolean
  hasHydrated: boolean
  setHasHydrated: (h: boolean) => void
  setQuery: (q: string) => void
  executeQuery: () => void
  pushToQueue: (m: Music) => void
  popFromQueue: () => void
  playPrevious: () => void
  clearQueue: () => void
  removeFromQueue: (index: number) => void
  clearHistory: () => void
}

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined

export const useMusicPlayer = create<MusicPlayer>()(
  persist(
    (set, get) => ({
      query: '',
      results: [] as Music[],
      isLoading: false,
      queue: [] as Music[],
      history: [] as Music[],
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
          set({ results: [], isLoading: false, isError: false })
          return
        }

        set({ isLoading: true })
        searchTimeoutId = setTimeout(async () => {
          try {
            const res = await searchMusic(q)
            if (get().query != q) return
            set({ results: res, isLoading: false, isError: false })
            toast.success(`Results for "${q}"`, {
              description: `${res.length} ${res.length === 1 ? 'track' : 'tracks'} ready to play`,
            })
          } catch (e) {
            set({ error: String(e), isLoading: false, isError: true })
          }
        }, 400)
      },

      pushToQueue: (m: Music) => {
        set((s) => ({ queue: [...s.queue, m] }))
        toast('Added to Queue', {
          icon: '🎵',
          description: `${m.title} • ${m.uploader}`,
        })
      },

      popFromQueue: () => {
        set((s) => {
          if (s.queue.length === 0) return s
          const [cur, ...rem] = s.queue
          return { history: [...s.history, cur], queue: rem }
        })
      },

      playPrevious: () => {
        set((s) => {
          if (s.history.length === 0) return s
          const prev = s.history[s.history.length - 1]
          return {
            history: s.history.slice(0, -1),
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

      removeFromQueue: (index: number) => {
        set((s) => {
          const newQ = [...s.queue]
          newQ.splice(index, 1)
          return { queue: newQ }
        })
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
        state?.setHasHydrated(true)
      },
    },
  ),
)
