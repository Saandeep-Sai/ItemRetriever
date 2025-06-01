"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { sendOtpAction } from "@/app/actions/authActions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, UserPlus, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Zod schema for form validation
const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"]).default("other"),
    address: z.string().min(1, "Address is required"),
    role: z.enum(["user", "admin"]).default("user"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      dob: "",
      gender: "other",
      address: "",
      role: "user",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      console.log("Starting registration for:", data.email);
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("User created with UID:", user.uid);

      await setDoc(doc(db, "users", user.uid), {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        role: data.role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });
      console.log("User data stored in Firestore for UID:", user.uid);

      const otpResponse = await sendOtpAction(data.email);
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }
      console.log("OTP sent:", otpResponse.message);

      sessionStorage.setItem("activationEmail", data.email);
      toast({
        title: "Registration Successful",
        description: "Check your email for the OTP to activate your account.",
      });
      router.push("/activate");
    } catch (error: any) {
      let description = "Registration failed.";
      if (error.message?.includes("Failed to send email")) {
        description =
          "Failed to send OTP email. Please verify your email address.";
      } else if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            description =
              "Email already registered. Please log in or reset your password.";
            break;
          case "auth/invalid-email":
            description = "Invalid email address.";
            break;
          case "auth/weak-password":
            description = "Password too weak. Use a stronger password.";
            break;
          default:
            console.error("Auth error:", error.code, error.message);
            description = error.message || description;
        }
      } else {
        console.error("Unexpected error:", error.message);
        description = error.message || description;
      }
      toast({
        title: "Registration Failed",
        description,
        variant: "destructive",
      });
      sessionStorage.removeItem("activationEmail");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fieldVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.01, transition: { duration: 0.2 } },
  };

  return (
    <>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Register
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Create an account to manage lost and found items securely.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="e.g., John Doe"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
              
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@gmail.com"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        For login and notifications.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="e.g., 1234567890"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        For SMS notifications.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
              
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Date of Birth
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white dark:bg-gray-800"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="bg-white dark:bg-gray-800 dark:text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        For identity verification.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Optional, for profiling.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="address"
                          placeholder="e.g., 123 Main St, Anytown"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        For item verification and contact.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-white">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Admin roles require approval.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Minimum 8 characters.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Must match password.
                      </FormDescription>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
              
            </div>
            
              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 rounded-lg py-2.5 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Register
              </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>
    </>
  );
}
