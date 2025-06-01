"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { UserCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCredentialsSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("Login successful - UID:", user.uid, "Email Verified:", user.emailVerified);

      // Refresh user data to ensure emailVerified is current
      await user.reload();
      const refreshedUser = auth.currentUser;
      console.log("After reload - UID:", refreshedUser?.uid, "Email Verified:", refreshedUser?.emailVerified);

      if (!refreshedUser?.emailVerified) {
        // Fallback to Firestore if Firebase Auth lags
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().emailVerified) {
          console.log("Firestore indicates email verified, proceeding to /home");
        } else {
          console.log("Email not verified, redirecting to /activate");
          sessionStorage.setItem("activationEmail", data.email);
          toast({
            title: "Email Not Verified",
            description: "Please verify your email to log in.",
            variant: "destructive",
          });
          router.push("/activate");
          return;
        }
      }

      toast({
        title: "Login Successful!",
        description: "Welcome back to Item Retriever.",
        className: "bg-positive text-primary-foreground",
      });
      router.push("/home?justActivated=true");
    } catch (error: any) {
      let description = "Invalid credentials or network error.";
      if (error instanceof Error && "code" in error) {
        const authError = error as AuthError;
        switch (authError.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            description = "Invalid email or password.";
            break;
          case "auth/too-many-requests":
            description = "Too many attempts. Try again later.";
            break;
          default:
            console.error("Login error:", authError.message);
            description = authError.message || description;
        }
      } else {
        console.error("Unexpected error:", error.message);
        description = error.message || description;
      }
      toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // JSX remains unchanged from the original
    <>
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">
        Welcome Back!
      </h1>
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(handleCredentialsSubmit)}
          className="space-y-6"
        >
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserCircle className="mr-2 h-4 w-4" />
            )}
            Login
          </Button>
        </form>
      </Form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Register here
        </Link>
      </p>
    </>
  );
}