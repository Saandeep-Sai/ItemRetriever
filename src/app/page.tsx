"use client";

import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Search, Bell, Shield, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Search className="h-12 w-12 text-teal-500 mb-4" />,
    title: "Search & Match",
    description: "Easily find lost or found items by name, ID, or location with our smart matching system.",
  },
  {
    icon: <Bell className="h-12 w-12 text-teal-500 mb-4" />,
    title: "Instant Alerts",
    description: "Stay updated with real-time email and SMS notifications for item updates.",
  },
  {
    icon: <Shield className="h-12 w-12 text-teal-500 mb-4" />,
    title: "Secure Verification",
    description: "Verify item ownership with our robust proof-of-ownership process.",
  },
  {
    icon: <LayoutDashboard className="h-12 w-12 text-teal-500 mb-4" />,
    title: "Admin Tools",
    description: "Manage items, users, and reports with a powerful admin dashboard.",
  },
];

const projectFeatures = [
  { title: "Report Lost Items", description: "Quickly report lost items with detailed information." },
  { title: "Smart Matching", description: "Automatically match lost items with found ones." },
  { title: "Report Found Items", description: "Help return items by reporting found objects." },
  { title: "Real-Time Updates", description: "Get instant notifications on item status." },
  { title: "Secure Recovery", description: "Ensure safe item recovery with verification." },
  { title: "Admin Management", description: "Oversee all activities with admin tools." },
];

function FeatureSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: { perView: 1, spacing: 24 },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 24 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 24 },
      },
    },
    created() {
      setLoaded(true);
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    drag: true, // Enable touch/swipe
  });

  useEffect(() => {
    if (!instanceRef.current) return;
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <section className="py-16 bg-gradient-to-b from-teal-500/10 to-cyan-600/10">
      <div className="container px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
          Explore ItemRetriever
        </h2>
        <div className="relative">
          <div
            ref={sliderRef}
            className="keen-slider w-screen left-1/2 transform -translate-x-1/2"
          >
            {projectFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="keen-slider__slide bg-secondary/95 rounded-3xl p-10 md:p-12 flex flex-col justify-center items-center text-center transform transition-transform duration-500 hover:scale-105 min-h-[600px]"
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          {loaded && instanceRef.current ? (
            <div className="flex justify-center mt-8 gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-teal-500/20 hover:bg-teal-500/40 dark:bg-teal-500/30 dark:hover:bg-teal-500/50 text-gray-900 dark:text-white"
                onClick={() => instanceRef.current?.prev()}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-teal-500/20 hover:bg-teal-500/40 dark:bg-teal-500/30 dark:hover:bg-teal-500/50 text-gray-900 dark:text-white"
                onClick={() => instanceRef.current?.next()}
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">Loading slider...</div>
          )}
          <div className="flex justify-center mt-4 gap-2">
            {projectFeatures.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${currentSlide === idx ? 'bg-teal-500 scale-125' : 'bg-gray-400'}`}
                onClick={() => instanceRef.current?.moveToIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <PublicHeader />
      <main className="flex-1">
        <section className="py-20 text-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              ItemRetriever: Seamless Item Management
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Track, match, and recover lost and found items with ease for colleges, offices, and more.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Link href="/register">
                <Button className="bg-white text-teal-500 hover:bg-gray-100 text-lg px-8 py-6 animate-pulse-glow">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="text-white border-white hover:bg-teal-500/20 text-lg px-8 py-6">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Why ItemRetriever?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <Card
                  key={feature.title}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="text-center">
                    {feature.icon}
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <FeatureSlider />

        <section className="py-16 text-center bg-teal-500/10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white animate-fade-in">
              Start Managing Items Today
            </h2>
            <p className="text-lg max-w-xl mx-auto mb-8 text-gray-600 dark:text-gray-300 animate-fade-in">
              Join thousands using ItemRetriever to streamline lost and found processes.
            </p>
            <Link href="/register">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white text-lg px-10 py-6 animate-pulse-glow">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}