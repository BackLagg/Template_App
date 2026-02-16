export type OnboardingStep = 'step1' | 'step2' | 'step3' | 'step4' | 'final';

export interface StepContent {
  title: string;
  description: string | string[];
  image: string;
  isForm?: boolean;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  userName?: string;
  fullName?: string;
}

export interface OnboardingContextType {
  state: OnboardingState;
  setCurrentStep: (step: OnboardingStep) => void;
  setUserName: (name: string) => void;
  setFullName: (name: string) => void;
  nextStep: () => void;
  skipToFinal: () => void;
  completeOnboarding: () => void;
}

