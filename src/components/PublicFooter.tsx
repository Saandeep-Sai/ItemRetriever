"use client";

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PublicFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="flex flex-col items-start">
            <Link href="/" className="mb-4">
              <Logo />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Reunite with your belongings using ItemRetriever, the ultimate solution for lost and found management.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">Product</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-primary">How it Works</Link></li>
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary">Sign Up</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">Community</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li><Link href="/reviews/view" className="text-sm text-muted-foreground hover:text-primary">User Reviews</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Support Forum (Soon)</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">Legal</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy (Soon)</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service (Soon)</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear || new Date().getFullYear()} ItemRetriever. All rights reserved.
          </p>
          <div className="flex space-x-5">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}