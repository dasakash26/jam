import { create } from 'zustand'
import { searchMusic } from '#/utils/api'
import type { Music } from '#/types'

interface MusicPlayer {
  query: string
  results: Music[]
  isLoading: boolean
  queue: Music[]
  history: Music[]
  error: string
  isError: boolean
  setQuery: (q: string) => void
  executeQuery: (q: string) => void
  pushToQueue: (m: Music) => void
  popFromQueue: () => void
  playPrevious: () => void
}

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined

export const useMusicPlayer = create<MusicPlayer>((set, get) => ({
  query: '',
  results: [] as Music[],
  isLoading: false,
  queue: [] as Music[],
  history: [] as Music[],
  error: '',
  isError: false,

  setQuery: (q: string) => {
    set({ query: q })
    get().executeQuery(q)
  },

  executeQuery: async (q: string) => {
    if (searchTimeoutId) clearTimeout(searchTimeoutId)

    if (!q.trim()) {
      set({ results: [], isLoading: false, isError: false })
      return
    }

    set({ isLoading: true })
    searchTimeoutId = setTimeout(async () => {
      try {
        const res = await searchMusic(q)
        console.log(res)
        set({ results: res, isLoading: false, isError: false })
      } catch (e) {
        set({ error: String(e), isLoading: false, isError: true })
      }
    }, 400)
  },

  pushToQueue: (m: Music) => {
    set((s) => ({ queue: [...s.queue, m] }))
  },

  popFromQueue: () => {
    const q = get().queue
    if (q.length === 0) return
    const current = q[0]
    set((s) => ({
      history: [...s.history, current],
      queue: s.queue.slice(1)
    }))
  },

  playPrevious: () => {
    const hist = get().history
    if (hist.length === 0) return
    const prev = hist[hist.length - 1]
    set((s) => ({
      history: s.history.slice(0, -1),
      queue: [prev, ...s.queue]
    }))
  }
}))
