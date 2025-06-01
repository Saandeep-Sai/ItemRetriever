import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <main className="rounded-lg border bg-card p-6 shadow-lg sm:p-8">
          {children}
        </main>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Item Retriever. All rights reserved.
        </p>
      </div>
    </div>
  );
}
