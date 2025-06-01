
"use client";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import DarkModeToggle from "./ui/DarkModeToggle";

export function Header() {
  const { user, role, signOut, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
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

  if (loading) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/home" className="text-2xl font-bold text-primary">
          ItemRetriever
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/lost-item-report">
                <Button variant="ghost">Report Lost</Button>
              </Link>
              <Link href="/found-item-report">
                <Button variant="ghost">Report Found</Button>
              </Link>
              <Link href="/search-match">
                <Button variant="ghost">Search</Button>
              </Link>
              <Link href="/chats">
                <Button variant="ghost">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chats
                </Button>
              </Link>
              <Link href="/reviews/view">
                <Button variant="ghost">Reviews</Button>
              </Link>
              {role === "admin" && (
                <>
                  <Link href="/verify-items">
                    <Button variant="ghost">Verify Items</Button>
                  </Link>
                  <Link href="/admin/admin-dashboard">
                    <Button variant="ghost">Admin Dashboard</Button>
                  </Link>
                </>
              )}
              <DarkModeToggle />
              <Avatar>
                <AvatarImage src="/images/avatar.png" alt="User" />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="default">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}