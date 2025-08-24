'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-16">
        <LoginForm />
      </div>
    </main>
  );
}

