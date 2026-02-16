import React, { useState, useEffect } from 'react';
import type { StepContent } from '../types';
import styles from './OnboardingStep.module.scss';

import lockImage from '@shared/assets/onboarding/lock.svg';
import coinImage from '@shared/assets/onboarding/coin.svg';
import lightningImage from '@shared/assets/onboarding/lightning.svg';
import cardImage from '@shared/assets/onboarding/card.svg';

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  stepContent: StepContent;
  isLastStep?: boolean;
  isLoading?: boolean;
  fullName?: string;
  onFullNameChange?: (name: string) => void;
}

const getImageSource = (imageName: string): string => {
  switch (imageName) {
    case 'lock':
      return lockImage;
    case 'coin':
      return coinImage;
    case 'lightning':
      return lightningImage;
    case 'card':
      return cardImage;
    default:
      return lockImage;
  }
};

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  currentStep,
  onNext,
  onBack,
  stepContent,
  isLastStep = false,
  isLoading = false,
  fullName = '',
  onFullNameChange
}) => {
  const isFirstStep = currentStep === 1;
  const [imageLoading, setImageLoading] = useState(true);
  const isFormStep = stepContent.isForm;

  const isFormValid = isFormStep ? fullName.trim().length >= 2 : true;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      onNext();
    }
  };

  useEffect(() => {
    const imageSource = getImageSource(stepContent.image);
    const img = new Image();
    img.onload = () => {
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageLoading(false);
    };
    img.src = imageSource;
  }, [currentStep, stepContent.image]);

  const renderImage = () => {
    const imageSource = getImageSource(stepContent.image);
    
    return (
      <div className={styles.imagePlaceholder}>
        {imageLoading ? (
          <div className={styles.skeleton}>
            <div className={styles.skeletonContent}></div>
          </div>
        ) : (
          <img
            src={imageSource}
            alt={`Image for step ${currentStep}`}
            className={styles.image}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.onboardingStep}>
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          {renderImage()}
        </div>

        <div className={styles.textContent}>
          <h2 className={styles.title}>
            {stepContent.title.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < stepContent.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>
          
          {Array.isArray(stepContent.description) ? (
            <ul className={styles.list}>
              {stepContent.description.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.description}>
              {(stepContent.description as string).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < (stepContent.description as string).split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
          
          {isFormStep && onFullNameChange && (
            <div className={styles.form}>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className={styles.navigation}>
          {isFirstStep ? (
            <button
              onClick={onNext}
              disabled={isLoading}
              className={styles.startButton}
            >
              {isLoading ? 'Starting...' : 'Get Started'}
              </button>
          ) : (
            <>
              <button
                onClick={onBack}
                disabled={isLoading}
                className={styles.backButton}
              >
                Back
              </button>
              <button
                onClick={onNext}
                disabled={isLoading || !isFormValid}
                className={styles.nextButton}
              >
                {isLastStep ? (isLoading ? 'Completing...' : 'Complete') : 'Next'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep;

