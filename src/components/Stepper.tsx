import React from 'react'

interface Step {
  id: number
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                  index < currentStep
                    ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                    : index === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </button>
              <p className="mt-2 text-xs font-medium text-gray-700">{step.title}</p>
              {step.description && <p className="mt-1 text-xs text-gray-500">{step.description}</p>}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 mx-2 h-1 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
