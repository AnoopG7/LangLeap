import { create } from 'zustand'
import type { SignInInput, SignUpInput } from '@/lib/schemas'
import type { LangLeapRole, User } from '@/lib/types'
import { DEMO_USERS, type DemoUser } from '@/data/users'
import { ensureLearnerData } from '@/data/bootstrap'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (input: SignInInput) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  fetchMe: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const TOKEN_KEY = 'langleap_token'
const USER_KEY = 'langleap_user'
const EXTRA_USERS_KEY = 'langleap_users_extra'

function toUser(d: DemoUser): User {
  return {
    id: d.id,
    email: d.email,
    fullName: d.fullName,
    role: d.role,
    firstLanguage: d.firstLanguage,
    level: d.level,
  }
}

function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function allUsers(): DemoUser[] {
  const extra = JSON.parse(localStorage.getItem(EXTRA_USERS_KEY) ?? '[]') as DemoUser[]
  return [...DEMO_USERS, ...extra]
}

function persistExtra(users: DemoUser[]) {
  localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify(users))
}

/**
 * Frontend-only authentication. There is no backend: sign-in validates against
 * the hardcoded demo accounts (+ any locally created accounts), the session is
 * kept in localStorage, and fetchMe simply re-hydrates the stored profile.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: readStoredToken(),
  isAuthenticated: Boolean(readStoredToken()),
  isLoading: false,
  error: null,

  signIn: async (input) => {
    set({ isLoading: true, error: null })
    await new Promise((r) => setTimeout(r, 350))
    const match = allUsers().find(
      (u) => u.email.toLowerCase() === input.email.trim().toLowerCase()
    )
    if (!match || match.password !== input.password) {
      set({ isLoading: false, error: 'Invalid email or password' })
      throw new Error('Invalid email or password')
    }
    const user = toUser(match)
    localStorage.setItem(TOKEN_KEY, `langleap-demo-${user.id}`)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    // Seed a learner's first-run history (progress/streak/notifications) so
    // the demo opens alive instead of an empty ledger.
    if (user.role === 'learner') ensureLearnerData(user.id)
    set({ user, token: localStorage.getItem(TOKEN_KEY), isAuthenticated: true, isLoading: false, error: null })
  },

  signUp: async (input) => {
    set({ isLoading: true, error: null })
    await new Promise((r) => setTimeout(r, 350))
    const users = allUsers()
    if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
      set({ isLoading: false, error: 'An account with this email already exists' })
      throw new Error('Account exists')
    }
    const created: DemoUser = {
      id: `u-signup-${Date.now()}`,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      fullName: input.fullName.trim(),
      role: 'learner' as LangLeapRole,
      firstLanguage: input.firstLanguage,
      level: 'A1',
    }
    persistExtra([...users, created])
    set({ isLoading: false, error: null })
  },

  fetchMe: async () => {
    const user = readStoredUser()
    if (!user) return
    set({ user, isAuthenticated: true })
  },

  signOut: async () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null })
  },

  clearError: () => set({ error: null }),
}))