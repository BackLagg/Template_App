import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { ErrorBoundary } from '@shared/ui';
import { getErrorType } from '@shared/lib';

import { ErrorScreen, Onboarding } from '@shared/ui';
import { MainLayout } from './layouts';
import { LoadingPage } from '@pages/loading';
import { EmptyPage } from '@pages/empty';

import '@shared/styles/index.scss';

const App: React.FC = () => {
  const { user, isLoading, error, isNewUser } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  if (error) {
    const errorType = !user ? 'noData' : getErrorType(error);
    return <ErrorScreen errorType={errorType} />;
  }

  if (isLoading || showLoading) {
    return (
      <LoadingPage
        onComplete={() => {
          setShowLoading(false);
        }}
      />
    );
  }

  if (isNewUser) {
    return (
      <Onboarding
        onComplete={() => {}}
      />
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<EmptyPage />} />
        </Routes>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default App;
