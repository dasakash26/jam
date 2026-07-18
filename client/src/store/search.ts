import { create } from 'zustand'
import { searchSongs } from '#/utils/api'
import type { Song } from '#/types'

interface Search {
  query: string
  results: Song[] 
  isLoading: boolean
  error: string
  isError: boolean
  setQuery: (newQuery: string) => void
  executeQuery: (query: string) => void
}

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined

export const useSearch = create<Search>((set, get) => ({
  query: '',
  results: [] as Song[],
  isLoading: false,
  error: '',
  isError: false,

  setQuery: (newQuery: string) => {
    set({ query: newQuery })
    get().executeQuery(newQuery)
  },

  executeQuery: async (query: string) => {
    if (searchTimeoutId) clearTimeout(searchTimeoutId)

    if (!query.trim()) {
      set({ results: [], isLoading: false, isError: false })
      return
    }

    set({ isLoading: true })
    searchTimeoutId = setTimeout(async () => {
      try {
        const res = await searchSongs(query)
        console.log(res)
        set({ results: res, isLoading: false, isError: false })
      } catch (e) {
        set({ error: String(e), isLoading: false, isError: true })
      }
    }, 400)
  },
}))
