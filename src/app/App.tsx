import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AuthProvider } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CreatorLayout } from '@/layouts/CreatorLayout'
import { CompanyLayout } from '@/layouts/CompanyLayout'

// Pages
import { HomePage } from '@/pages/public/HomePage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { CreatorDashboardPage } from '@/pages/creator/DashboardPage'
import { CompanyDashboardPage } from '@/pages/company/DashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
            </Route>

            {/* Creator routes */}
            <Route element={<CreatorLayout />}>
              <Route
                path="/creator/dashboard"
                element={
                  <ProtectedRoute>
                    <CreatorDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Company routes */}
            <Route element={<CompanyLayout />}>
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute>
                    <CompanyDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
