import React, { useState } from 'react';
import { useAuth } from '@features/auth/api';
import { OnboardingStep } from './onboarding-step';
import type { StepContent } from './types';
import styles from './Onboarding.module.scss';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { completeOnboarding, isCompletingOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');

  const steps: StepContent[] = [
    {
      title: 'WELCOME TO THE\nFABRICBOT ECOSYSTEM',
      description: 'Your gateway to building\nand monetizing digital products\nwith advanced referral systems',
      image: 'lock'
    },
    {
      title: 'ALREADY\nAVAILABLE',
      description: [
        'Create personal product pages',
        'Launch a referral system in 60 seconds',
        'Share payouts with referrals and track statistics'
      ],
      image: 'lightning'
    },
    {
      title: 'COMING\nSOON',
      description: [
        'Connect your TG wallet and pay in TON',
        'Integrate the payment system with your services via API',
        'Enable your clients to pay through P2P'
      ],
      image: 'coin'
    },
    {
      title: 'TELL US ABOUT\nYOURSELF',
      description: 'Help your profile become more recognizable\nby sharing your full name with us',
      image: 'card',
      isForm: true
    }
  ];

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps;

  const handleNext = async () => {
    if (isLastStep) {
      await handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const onboardingData = isLastStep && fullName.trim() 
        ? { fullName: fullName.trim() } 
        : {};
      
      completeOnboarding(onboardingData);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const currentStepContent = steps[currentStep - 1];

  return (
    <div className={styles.onboarding}>
      <OnboardingStep
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        onClose={onComplete}
        stepContent={currentStepContent}
        isLastStep={isLastStep}
        isLoading={isCompletingOnboarding}
        fullName={fullName}
        onFullNameChange={setFullName}
      />
    </div>
  );
};

export default Onboarding;

