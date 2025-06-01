"use client";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LoaderCircle } from "lucide-react";
import DarkModeToggle from "./ui/DarkModeToggle";

export function PublicHeader() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        className: "bg-green-500 text-white dark:bg-green-600 dark:text-white",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
      console.error("Sign out error:", error.message);
    }
  };

  if (loading) {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ItemRetriever
          </div>
          <div className="flex items-center gap-4">
            <LoaderCircle className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200"
          aria-label="ItemRetriever Home"
        >
          ItemRetriever
        </Link>
        <div className="flex items-center gap-6">
          <DarkModeToggle />
          <nav className="flex items-center gap-3">
            {user ? (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                aria-label="Sign out"
              >
                <LogOut className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-300" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                    aria-label="Login"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="default"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400 transition-all duration-200"
                    aria-label="Register"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}