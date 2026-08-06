import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Stepper } from '@/components/Stepper'
import { Step1Personal } from '@/components/onboarding/Step1Personal'
import { Step2Profile } from '@/components/onboarding/Step2Profile'
import { Step3Platforms } from '@/components/onboarding/Step3Platforms'
import { Step4Categories } from '@/components/onboarding/Step4Categories'
import { Step5Availability } from '@/components/onboarding/Step5Availability'
import { Step6Review } from '@/components/onboarding/Step6Review'
import { createCreatorProfile } from '@/services/creator-profiles'
import type { CreatorProfileComplete } from '@/schemas/creator-onboarding'

const STEPS = [
  { id: 1, title: 'Infos personnelles', description: 'Nom et bio' },
  { id: 2, title: 'Profil', description: 'Photo et localisation' },
  { id: 3, title: 'Plateformes', description: 'Vos réseaux' },
  { id: 4, title: 'Catégories', description: 'Domaines' },
  { id: 5, title: 'Disponibilité', description: 'Quand vous êtes dispo' },
  { id: 6, title: 'Vérification', description: 'Confirmez' },
]

export function CreatorOnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [profileData, setProfileData] = useState<Partial<CreatorProfileComplete>>({
    platforms: [],
    categories: [],
  })

  if (!user) {
    navigate('/auth/signin')
    return null
  }

  const handleStep1 = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
    setCurrentStep(1)
    setError('')
  }

  const handleStep2 = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
    setError('')
  }

  const handleStep3 = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
    setCurrentStep(3)
    setError('')
  }

  const handleStep4 = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
    setCurrentStep(4)
    setError('')
  }

  const handleStep5 = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
    setCurrentStep(5)
    setError('')
  }

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      setError('')

      if (!profileData || typeof profileData !== 'object' || !('first_name' in profileData)) {
        throw new Error('Données incomplètes')
      }

      await createCreatorProfile(user.id, profileData as CreatorProfileComplete)
      navigate('/creator/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du profil')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Complétez votre profil</h1>
          <p className="mt-2 text-gray-600">Étape {currentStep + 1} de {STEPS.length}</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {currentStep === 0 && (
            <Step1Personal
              initialData={profileData}
              onNext={handleStep1}
              isLoading={isLoading}
            />
          )}

          {currentStep === 1 && (
            <Step2Profile
              initialData={profileData}
              onNext={handleStep2}
              onPrevious={() => setCurrentStep(0)}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <Step3Platforms
              initialData={profileData}
              onNext={handleStep3}
              onPrevious={() => setCurrentStep(1)}
              isLoading={isLoading}
            />
          )}

          {currentStep === 3 && (
            <Step4Categories
              initialData={profileData}
              onNext={handleStep4}
              onPrevious={() => setCurrentStep(2)}
              isLoading={isLoading}
            />
          )}

          {currentStep === 4 && (
            <Step5Availability
              initialData={profileData}
              onNext={handleStep5}
              onPrevious={() => setCurrentStep(3)}
              isLoading={isLoading}
            />
          )}

          {currentStep === 5 && (
            <Step6Review
              data={profileData as CreatorProfileComplete}
              onConfirm={handleConfirm}
              onPrevious={() => setCurrentStep(4)}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Progress Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Étape {currentStep + 1} de {STEPS.length} • {Math.round(((currentStep + 1) / STEPS.length) * 100)}% complet
        </div>
      </div>
    </div>
  )
}
