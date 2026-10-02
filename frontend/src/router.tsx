import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { RequireRoles } from '@/components/auth'
import DashboardPage from '@/pages/dashboard'
import LessonsPage from '@/pages/lessons'
import LessonStudyPage from '@/pages/lesson-study'
import ProgressPage from '@/pages/progress'
import NotificationsPage from '@/pages/notifications'
import StudioContentPage from '@/pages/studio/content'
import StudioVoicePage from '@/pages/studio/voice'
import StudioReviewPage from '@/pages/studio/review'
import NotFoundPage from '@/pages/not-found'
import AccessDeniedPage from '@/pages/access-denied'
import LoginPage from '@/pages/login'
import ForgotPasswordPage from '@/pages/forgot-password'
import ResetPasswordPage from '@/pages/reset-password'

import LandingPage from '@/pages/landing'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/landing',
    element: <Navigate to="/" replace />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      {
        path: '/lessons',
        element: (
          <RequireRoles roles={['learner']}>
            <LessonsPage />
          </RequireRoles>
        ),
      },
      {
        path: '/lesson/:id',
        element: (
          <RequireRoles roles={['learner']}>
            <LessonStudyPage />
          </RequireRoles>
        ),
      },
      {
        path: '/progress',
        element: (
          <RequireRoles roles={['learner']}>
            <ProgressPage />
          </RequireRoles>
        ),
      },
      {
        path: '/notifications',
        element: (
          <RequireRoles roles={['learner']}>
            <NotificationsPage />
          </RequireRoles>
        ),
      },
      {
        path: '/studio/content',
        element: (
          <RequireRoles roles={['content_writer', 'admin', 'product_head']}>
            <StudioContentPage />
          </RequireRoles>
        ),
      },
      {
        path: '/studio/voice',
        element: (
          <RequireRoles roles={['voice_artist', 'reviewer', 'admin', 'product_head']}>
            <StudioVoicePage />
          </RequireRoles>
        ),
      },
      {
        path: '/studio/review',
        element: (
          <RequireRoles roles={['reviewer', 'admin', 'product_head']}>
            <StudioReviewPage />
          </RequireRoles>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/403',
    element: <AccessDeniedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router