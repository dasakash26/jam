import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { fetchPlaylist, searchMusic } from '#/utils/api'
import type { Music, QueueItem } from '#/types'
import { toast } from 'sonner'
import { generateId } from '#/utils/uuid'
import {
  LOCAL_QUEUE_STORAGE_KEY,
  PLAYLIST_REGEX,
  QUEUE_ITEM_ID_PREFIX,
  SEARCH_DEBOUNCE_MS,
} from '#/config'

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
  pushToQueue: (items: Music | Music[]) => void
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

      setHasHydrated: (h) => set({ hasHydrated: h }),

      setQuery: (q) => {
        set({ query: q })
        get().executeQuery()
      },

      executeQuery: async () => {
        if (searchTimeoutId) clearTimeout(searchTimeoutId)
        const q = get().query.trim()
        if (!q) {
          set({ results: [], isLoading: false, isError: false, error: '' })
          return
        }
        set({ isLoading: true, isError: false, error: '' })
        searchTimeoutId = setTimeout(async () => {
          try {
            const isPlaylist = PLAYLIST_REGEX.test(q)
            const res = isPlaylist ? await fetchPlaylist(q) : await searchMusic(q)
            if (get().query.trim() !== q) return
            set({ results: res, isLoading: false, isError: false, error: '' })
            toast.success(isPlaylist ? 'Playlist Loaded' : `Results for "${q}"`, {
              description: `${res.length} ${res.length === 1 ? 'track' : 'tracks'} loaded`,
            })
          } catch (e: unknown) {
            if (get().query.trim() !== q) return
            const errorMsg = e instanceof Error ? e.message : String(e)
            set({ error: errorMsg, isLoading: false, isError: true })
            toast.error('Search / Import Failed', { description: errorMsg })
          }
        }, SEARCH_DEBOUNCE_MS)
      },

      pushToQueue: (items) => {
        const tracks = Array.isArray(items) ? items : [items]
        if (tracks.length === 0) return
        const newItems: QueueItem[] = tracks.map((m) => ({
          queueItemId: generateId(QUEUE_ITEM_ID_PREFIX),
          track: m,
        }))
        set((s) => ({ queue: [...s.queue, ...newItems] }))

        if (tracks.length === 1 && tracks[0]) {
          const m = tracks[0]
          toast('Added to Queue', { description: `${m.title} • ${m.uploader}` })
        } else {
          toast.success('Playlist Added to Queue', {
            description: `Added ${tracks.length} tracks to queue`,
          })
        }
      },

      playNextTrack: (m) => {
        const item: QueueItem = {
          queueItemId: generateId(QUEUE_ITEM_ID_PREFIX),
          track: m,
        }
        set((s) => {
          if (s.queue.length === 0) return { queue: [item] }
          const rest = s.queue.slice(1).filter((q) => q.track.id !== m.id)
          return { queue: [s.queue[0], item, ...rest] }
        })
        toast('Playing Next', { description: `${m.title} • ${m.uploader}` })
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
          return { history: remHistory, queue: [prev, ...s.queue] }
        })
      },

      clearQueue: () => {
        set((s) => ({ queue: s.queue.slice(0, 1) }))
        toast.info('Queue cleared')
      },

      removeFromQueue: (queueItemId) => {
        set((s) => ({ queue: s.queue.filter((q) => q.queueItemId !== queueItemId) }))
      },

      clearHistory: () => {
        set({ history: [] })
        toast.info('History cleared')
      },
    }),
    {
      name: LOCAL_QUEUE_STORAGE_KEY,
      partialize: (s) => ({ queue: s.queue, history: s.history }),
      onRehydrateStorage: () => (state) => {
        const ensureQueueItem = (item: any): QueueItem =>
          item?.track
            ? item
            : { queueItemId: generateId(QUEUE_ITEM_ID_PREFIX), track: item }

        if (state?.queue) state.queue = state.queue.map(ensureQueueItem)
        if (state?.history) state.history = state.history.map(ensureQueueItem)
        state?.setHasHydrated(true)
      },
    },
  ),
)

export const useSearchSlice = () =>
  useMusicPlayer(
    useShallow((s) => ({
      query: s.query,
      results: s.results,
      isLoading: s.isLoading,
      isError: s.isError,
      error: s.error,
      setQuery: s.setQuery,
      executeQuery: s.executeQuery,
      pushToQueue: s.pushToQueue,
    })),
  )

export const useHomePlayerSlice = () =>
  useMusicPlayer(
    useShallow((s) => ({
      queue: s.queue,
      history: s.history,
      hasHydrated: s.hasHydrated,
      isLoading: s.isLoading,
      isError: s.isError,
      error: s.error,
      executeQuery: s.executeQuery,
      clearQueue: s.clearQueue,
      clearHistory: s.clearHistory,
      removeFromQueue: s.removeFromQueue,
      pushToQueue: s.pushToQueue,
      playNextTrack: s.playNextTrack,
      popFromQueue: s.popFromQueue,
      playPrevious: s.playPrevious,
    })),
  )
