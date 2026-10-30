"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const artVideos = [
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f6573a0d-fab5-4352-8cd3-cbb57cb60cb9/generated_videos/close-up-cinematic-shot-of-skilled-india-5420c79a-20250820084136.mp4?",
    title: "Traditional Indian Craftsmanship"
  },
  {
    src: "https://videos.pexels.com/video-files/4683406/4683406-hd_720_1298_50fps.mp4",
    title: "Pottery Making"
  },
  {
    src: "https://videos.pexels.com/video-files/7205821/7205821-sd_960_540_24fps.mp4",
    title: "Textile Weaving"
  },
  {
    src: "https://videos.pexels.com/video-files/6720710/6720710-hd_1920_1080_25fps.mp4",
    title: "Woodcarving Artistry"
  }
];

const TwoColumnHeroWithImage = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % artVideos.length);
      setKey(prev => prev + 1); // Force video remount
    }, 8000); // Change video every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Video Background */}
      <video
        key={key}
        src={artVideos[currentVideoIndex].src}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 z-20" />

      <div className="container mx-auto relative z-30">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">

          <h1 className="text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl leading-tight font-display text-white">
            Where Every Craft Tells a Story and{" "}
            <span className="text-primary font-bold">
              Local Hands Meet Global Arts
            </span>
          </h1>

          <p className="text-white/90 max-w-xl lg:text-xl leading-relaxed">
            Discover authentic handcrafted products from local Indian artisans. Every purchase supports traditional craftsmanship and helps preserve cultural heritage.
          </p>

          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full px-8"
            >
              <Link href="/explore">
                Explore Marketplace
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto group bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <Link href="#artisans">
                Learn About Artisans
                <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Video Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {artVideos.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${currentVideoIndex === index
                    ? "w-8 bg-white/80"
                    : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  setKey(prev => prev + 1);
                }}
                aria-label={`Switch to ${artVideos[index].title} video`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { TwoColumnHeroWithImage };
