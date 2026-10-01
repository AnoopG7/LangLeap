import {
  Bell,
  BookOpen,
  CheckSquare,
  FileEdit,
  Flame,
  LayoutDashboard,
  Languages,
  Mic,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui'
import { cn } from '@/lib'
import { useAuthStore } from '@/stores'
import type { LangLeapRole } from '@/lib'

type NavItem = {
  to: string
  label: string
  icon: typeof Sparkles
  end?: boolean
  roles?: LangLeapRole[]
  hidden?: boolean
}

type NavGroup = {
  group: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    group: 'Learn',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/lessons', label: 'Lessons', icon: BookOpen, roles: ['learner'] },
      { to: '/progress', label: 'Progress & Streak', icon: Flame, roles: ['learner'] },
      { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['learner'] },
    ],
  },
  {
    group: 'Studio',
    items: [
      {
        to: '/studio/content',
        label: 'Content Authoring',
        icon: FileEdit,
        roles: ['content_writer', 'admin', 'product_head'],
      },
      {
        to: '/studio/voice',
        label: 'Voice Recording',
        icon: Mic,
        roles: ['voice_artist', 'admin'],
      },
      {
        to: '/studio/review',
        label: 'Review & Publish',
        icon: CheckSquare,
        roles: ['reviewer', 'admin', 'product_head'],
      },
    ],
  },
]

function canSee(item: NavItem, role: LangLeapRole | undefined): boolean {
  if (item.hidden) return false
  if (!item.roles) return true
  if (!role) return false
  return item.roles.includes(role)
}

export function AppSidebar() {
  const user = useAuthStore((s) => s.user)

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((i) => canSee(i, user?.role)) }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Languages className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold">LangLeap</span>
            <span className="text-xs text-muted-foreground">English for Hindi &amp; Marathi</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(isActive && 'bg-accent text-accent-foreground')
                        }
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}