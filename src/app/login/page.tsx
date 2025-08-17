'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="METIST" className="h-8" />
          <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

