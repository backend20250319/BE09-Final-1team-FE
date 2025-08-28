'use client';

import { Suspense } from 'react';
import SignupForm from '../../auth/_components/SignupForm';
// Suspense를 사용하여 URL 파라미터를 안전하게 읽어옵니다.
const AdditionalInfoPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdditionalInfoContent />
    </Suspense>
  );
};

const AdditionalInfoContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm mode="social" />
      </div>
    </div>
  );
};

export default AdditionalInfoPage;