"use client"; // Make this a client component to use hooks

import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react"; // Import hooks

export default function AppLayout({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-background">
        &copy; {currentYear || new Date().getFullYear()} Item Retriever. Secure
        your world. {/* Display year, fallback if not yet set */}
      </footer>
    </div>
  );
}
