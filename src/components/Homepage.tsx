"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, Search, AlertCircle, CheckCircle, Bell, Shield, LayoutDashboard } from "lucide-react";
import  DarkModeToggle  from "@/components/ui/DarkModeToggle";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, useAnimation } from "framer-motion";

interface UserData {
  name?: string;
  email: string;
  emailVerified: boolean;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number }[] = [];
    const particleCount = 50;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = 400; // Fixed height for hero section

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDarkMode = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(99, 102, 241, 0.3)";

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ height: "400px" }}
    />
  );
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const avatarControls = useAnimation();

  const justActivated = searchParams
    ? searchParams.get("justActivated") === "true"
    : false;

  const retryGetDoc = async (docRef: any, retries = 3, delay = 500) => {
    for (let i = 0; i < retries; i++) {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error("User data not found");
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    const fetchUserData = async () => {
      try {
        const userDoc = await retryGetDoc(doc(db, "users", user.uid));
        console.log("User data fetched successfully:", userDoc.data());
        const data = userDoc.data() as UserData;
        setUserName(data.name || user.displayName || "User");
        if (!data.emailVerified && !justActivated) {
          sessionStorage.setItem("activationEmail", data.email);
          toast({
            title: "Email Not Verified",
            description: "Please verify your email to access this page.",
            variant: "destructive",
          });
          router.push("/activate");
        } else {
          sessionStorage.removeItem("activationEmail");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        });
        router.push("/register");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchUserData();
  }, [user, authLoading, router, justActivated, toast]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    return names.length === 1
      ? names[0][0].toUpperCase()
      : `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  const features = [
    {
      title: "Report Lost Item",
      description: "Effortlessly report lost items with detailed information to aid in recovery.",
      icon: <AlertCircle className="h-8 w-8 text-amber-500 dark:text-amber-300" />,
      action: () => router.push("/lost-item-report"),
      buttonText: "Report Now",
    },
    {
      title: "Search and Match",
      description: "Quickly search and match lost items by name, ID, or location.",
      icon: <Search className="h-8 w-8 text-blue-500 dark:text-blue-300" />,
      action: () => router.push("/search-match"),
      buttonText: "Search Now",
    },
    {
      title: "Report Found Item",
      description: "Help reunite found items with their owners by reporting them here.",
      icon: <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-300" />,
      action: () => router.push("/found-item-report"),
      buttonText: "Report Found",
    },
    {
      title: "Verify Ownership",
      description: "Securely verify the authenticity of lost and found items.",
      icon: <Shield className="h-8 w-8 text-red-500 dark:text-red-300" />,
      action: () => router.push("/verify-items"),
      buttonText: "Verify Now",
    },
    {
      title: "Admin Dashboard",
      description: "Manage items, user roles, and reports with ease (admin only).",
      icon: <LayoutDashboard className="h-8 w-8 text-indigo-500 dark:text-indigo-300" />,
      action: () => router.push("/admin-dashboard"),
      buttonText: "Access Dashboard",
    },
  ];

  // Animation variants for cards
  const cardVariants = {
    initial: { opacity: 0, y: 30, rotate: -2 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    hover: {
      scale: 1.05,
      rotate: 1,
      boxShadow: "0 10px 20px rgba(79, 70, 229, 0.4)", // Stronger indigo shadow for both modes
      transition: { duration: 0.3 },
    },
  };

  // Animation variants for icons
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, y: -5, transition: { duration: 0.2 } },
  };

  // Animation variants for buttons
  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.02, 1], transition: { duration: 1.5, repeat: Infinity } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  // Animation variants for avatar
  const avatarVariants = {
    initial: { rotate: 0 },
    hover: { rotate: 360, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  if (authLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      
      <main className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Particle Background */}
        <ParticleBackground />
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center relative z-10"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                variants={avatarVariants}
                initial="initial"
                whileHover="hover"
              >
                <Avatar className="h-20 w-20 ring-4 ring-indigo-200 dark:ring-indigo-800">
                  <AvatarImage
                    src={user?.photoURL || "/images/Avatar.png"}
                    alt={userName || "User"}
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome Back, {userName}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Seamlessly manage your lost and found items with our intuitive platform. Report, search, verify, and stay updated—all in one place.
            </p>
          </motion.section>

          {/* Features Section */}
          <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              >
                <Card className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 p-6">
                    <motion.div
                      className="bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-indigo-800 dark:to-indigo-900 p-3 rounded-full"
                      variants={iconVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      {feature.icon}
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-6">
                    <motion.div
                      variants={buttonVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <Button
                        onClick={feature.action}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors rounded-lg py-2 text-sm font-medium"
                      >
                        {feature.buttonText}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}