"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const slides = [
  {
    image: "/images/slide1.jpg",
    title: "Find Your Lost Items",
    description: "Report and search for lost items with ease.",
    cta: "Get Started",
    action: "/search-match",
  },
  {
    image: "/images/slide2.jpg",
    title: "Reunite Found Items",
    description: "Help others by reporting found items.",
    cta: "Report Now",
    action: "/found-item-report",
  },
  {
    image: "/images/slide3.jpg",
    title: "Secure Verification",
    description: "Verify ownership safely and securely.",
    cta: "Verify Now",
    action: "/verify-items",
  },
];

export default function Slider() {
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: {
          perView: 1,
          spacing: 20,
        },
      },
    },
    created(slider) {
      setInterval(() => {
        slider.next();
      }, 5000); // Auto-slide every 5 seconds
    },
  });

  return (
    <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
      {slides.map((slide, index) => (
        <div key={index} className="keen-slider__slide relative">
          <div className="relative h-64 sm:h-80 w-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 text-white max-w-md">
            <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
            <p className="text-lg mb-4">{slide.description}</p>
            <Button
              onClick={() => window.location.href = slide.action}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {slide.cta}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}