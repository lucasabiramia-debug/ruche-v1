import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CreatorLayout } from '@/layouts/CreatorLayout'
import { CompanyLayout } from '@/layouts/CompanyLayout'

// Pages - Public
import { HomePage } from '@/pages/public/HomePage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { InvitationAcceptPage } from '@/pages/public/InvitationAcceptPage'

// Pages - Creator
import { CreatorDashboardPage } from '@/pages/creator/DashboardPage'
import { CreatorOnboardingPage } from '@/pages/creator/OnboardingPage'
import { CreatorMissionsPage } from '@/pages/creator/MissionsPage'
import { MissionDetailPage } from '@/pages/creator/MissionDetailPage'
import { CreatorAssignmentsPage } from '@/pages/creator/AssignmentsPage'
import { CreatorEarningsPage } from '@/pages/creator/EarningsPage'
import { BriefViewPage } from '@/pages/creator/BriefViewPage'
import { ProofSubmissionPage } from '@/pages/creator/ProofSubmissionPage'
import { AssignmentTrackingPage } from '@/pages/creator/AssignmentTrackingPage'

// Pages - Company
import { CompanyDashboardPage } from '@/pages/company/DashboardPage'
import { InvitationsPage } from '@/pages/company/InvitationsPage'
import { CompanyCampaignsPage } from '@/pages/company/CampaignsPage'
import { CampaignDetailPage } from '@/pages/company/CampaignDetailPage'
import { CampaignStudioPage } from '@/pages/company/CampaignStudioPage'
import { CompanyApplicationsPage } from '@/pages/company/ApplicationsPage'
import { CreatorProfilePage } from '@/pages/company/CreatorProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
              <Route path="/invitation/:token" element={<InvitationAcceptPage />} />
            </Route>

            {/* Creator routes */}
            <Route element={<CreatorLayout />}>
              <Route
                path="/creator/onboarding"
                element={
                  <ProtectedRoute>
                    <CreatorOnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/dashboard"
                element={
                  <ProtectedRoute>
                    <CreatorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/missions"
                element={
                  <ProtectedRoute>
                    <CreatorMissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/missions/:missionId"
                element={
                  <ProtectedRoute>
                    <MissionDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/assignments"
                element={
                  <ProtectedRoute>
                    <CreatorAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/assignments/:assignmentId"
                element={
                  <ProtectedRoute>
                    <AssignmentTrackingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/assignments/:assignmentId/brief"
                element={
                  <ProtectedRoute>
                    <BriefViewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/assignments/:assignmentId/proof"
                element={
                  <ProtectedRoute>
                    <ProofSubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/earnings"
                element={
                  <ProtectedRoute>
                    <CreatorEarningsPage />
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
              <Route
                path="/company/invitations"
                element={
                  <ProtectedRoute>
                    <InvitationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/campaigns"
                element={
                  <ProtectedRoute>
                    <CompanyCampaignsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/campaigns/new"
                element={
                  <ProtectedRoute>
                    <CampaignStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/campaigns/:campaignId"
                element={
                  <ProtectedRoute>
                    <CampaignDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applications"
                element={
                  <ProtectedRoute>
                    <CompanyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/creators/:creatorId"
                element={
                  <ProtectedRoute>
                    <CreatorProfilePage />
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
