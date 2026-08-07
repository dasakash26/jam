import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateUsername } from '#/utils/names'
import { generateId } from '#/utils/uuid'

interface UserState {
  userId: string
  userName: string
  setUserName: (name: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: generateId('user_'),
      userName: generateUsername(),

      setUserName: (name: string) => {
        const trimmed = name.trim()
        if (trimmed) set({ userName: trimmed })
      },
    }),
    {
      name: 'jam_user_store',
    },
  ),
)
