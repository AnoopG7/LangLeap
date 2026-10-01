import type { FirstLanguage, LangLeapRole } from '@/lib'

export interface DemoUser {
  id: string
  email: string
  password: string
  fullName: string
  role: LangLeapRole
  firstLanguage: FirstLanguage
  level: 'A1' | 'A2'
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u-learner-01',
    email: 'learner@langleap.app',
    password: 'Learner@123',
    fullName: 'Priya Sharma',
    role: 'learner',
    firstLanguage: 'hindi',
    level: 'A1',
  },
  {
    id: 'u-writer-01',
    email: 'writer@langleap.app',
    password: 'Writer@123',
    fullName: 'Rahul Verma',
    role: 'content_writer',
    firstLanguage: 'hindi',
    level: 'A1',
  },
  {
    id: 'u-artist-01',
    email: 'artist@langleap.app',
    password: 'Artist@123',
    fullName: 'Meera Nair',
    role: 'voice_artist',
    firstLanguage: 'marathi',
    level: 'A1',
  },
  {
    id: 'u-reviewer-01',
    email: 'reviewer@langleap.app',
    password: 'Reviewer@123',
    fullName: 'Anita Desai',
    role: 'reviewer',
    firstLanguage: 'hindi',
    level: 'A1',
  },
  {
    id: 'u-admin-01',
    email: 'admin@langleap.app',
    password: 'Admin@123',
    fullName: 'Arjun Malhotra',
    role: 'admin',
    firstLanguage: 'hindi',
    level: 'A1',
  },
  {
    id: 'u-head-01',
    email: 'producthead@langleap.app',
    password: 'ProductHead@123',
    fullName: 'Kavita Iyer',
    role: 'product_head',
    firstLanguage: 'marathi',
    level: 'A2',
  },
]

export const QUICK_FILL = DEMO_USERS.map((u) => ({
  label: `${u.fullName} — ${u.role.replace('_', ' ')}`,
  email: u.email,
  password: u.password,
}))

// ── Role → route access (mirrors RequireRoles in src/router.tsx) ───────────

export const ROUTE_ROLES: Record<string, LangLeapRole[]> = {
  '/lessons': ['learner'],
  '/lesson': ['learner'],
  '/progress': ['learner'],
  '/notifications': ['learner'],
  '/studio/content': ['content_writer', 'admin', 'product_head'],
  '/studio/voice': ['voice_artist', 'admin'],
  '/studio/review': ['reviewer', 'admin', 'product_head'],
}

/** Whether `role` may open `pathname` (unlisted paths are open to all roles). */
export function canAccessPath(role: LangLeapRole, pathname: string): boolean {
  const exact = ROUTE_ROLES[pathname]
  if (exact) return exact.includes(role)
  if (pathname.startsWith('/lesson/')) return ROUTE_ROLES['/lesson'].includes(role)
  return true
}

/** Role labels used across the UI, kept in sync with LangLeapRole. */
export const ROLE_LABELS: Record<LangLeapRole, string> = {
  learner: 'Learner',
  content_writer: 'Content writer',
  voice_artist: 'Voice artist',
  reviewer: 'Reviewer',
  admin: 'Admin',
  product_head: 'Product head',
}