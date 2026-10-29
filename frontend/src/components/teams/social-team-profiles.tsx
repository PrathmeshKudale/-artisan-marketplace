"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Featured Indian artisans with their craft specialties and background images
const artisans = [
  {
    name: "Rajesh Kumar",
    role: "Master Potter from Rajasthan",
    backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    bio: "Rajesh carries forward 300 years of family tradition in blue pottery, creating stunning pieces using the ancient Persian technique brought to Jaipur centuries ago. His workshop in the heart of Jaipur has become a beacon for preserving this dying art form.",
    artwork: "Blue Pottery, Traditional Ceramics, Decorative Tiles",
    productLink: "#pottery-collection",
  },
  {
    name: "Meera Devi",
    role: "Textile Weaver from Gujarat", 
    backgroundImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    bio: "Meera specializes in traditional Patola silk weaving, a complex double ikat technique that takes months to complete a single saree with geometric patterns. Her family has been weaving these precious textiles for over 7 generations in Patan.",
    artwork: "Patola Silk Sarees, Ikat Textiles, Traditional Weaving",
    productLink: "#textile-collection",
  },
  {
    name: "Arjun Singh",
    role: "Wood Carver from Kashmir",
    backgroundImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    bio: "Arjun creates intricate walnut wood carvings using traditional Kashmiri techniques, specializing in floral motifs and geometric patterns passed down through generations. His work adorns homes and palaces across the region.",
    artwork: "Walnut Wood Carvings, Decorative Panels, Traditional Furniture",
    productLink: "#woodwork-collection",
  },
  {
    name: "Lakshmi Nair",
    role: "Metal Craft Artist from Kerala",
    backgroundImage: "https://images.unsplash.com/photo-1609205807107-7bb817e0b2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    bio: "Lakshmi masters the ancient art of bronze casting and bell metal work, creating traditional lamps, vessels, and decorative pieces using age-old Kerala techniques. Her workshop continues the legacy of Moradabad's metal craftsmanship.",
    artwork: "Bronze Sculptures, Bell Metal Vessels, Traditional Lamps",
    productLink: "#metalwork-collection",
  },
  {
    name: "Vikram Patel",
    role: "Block Print Artist from Rajasthan",
    backgroundImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    bio: "Vikram is a master of traditional block printing, hand-carving wooden blocks and creating vibrant textile designs that have adorned fabrics for centuries. His workshop in Sanganer preserves this ancient printing technique.",
    artwork: "Hand Block Printing, Textile Design, Wooden Blocks",
    productLink: "#blockprint-collection",
  },
];

const SocialTeamProfiles = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % artisans.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % artisans.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + artisans.length) % artisans.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentArtisan = artisans[currentSlide];

  return (
    <section className="py-16 mt-2 bg-background border-t border-amber-200/50">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 py-4 lg:py-8 text-center">
          <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-display">
            Masters of Traditional Crafts
          </h2>
          <p className="max-w-[600px] mx-auto tracking-[-0.32px] text-muted-foreground">
            Discover the talented artisans who preserve India's rich cultural heritage through their exceptional craftsmanship and time-honored techniques.
          </p>
        </div>

        {/* Slideshow Container */}
        <div className="mt-16 relative">
          <div className="relative h-[600px] lg:h-[700px] rounded-2xl overflow-hidden shadow-2xl">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
              style={{
                backgroundImage: `url(${currentArtisan.backgroundImage})`,
              }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 text-white">
              <div className="max-w-4xl">
                <h3 className="text-4xl lg:text-5xl font-bold font-display mb-2">
                  {currentArtisan.name}
                </h3>
                <p className="text-xl lg:text-2xl text-primary-foreground/90 mb-4">
                  {currentArtisan.role}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground">Artwork Specialization:</h4>
                  <p className="text-primary-foreground/80 text-lg">
                    {currentArtisan.artwork}
                  </p>
                </div>

                <p className="text-lg leading-relaxed text-primary-foreground/90 mb-8 max-w-3xl">
                  {currentArtisan.bio}
                </p>

                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View {currentArtisan.name}'s Products
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {artisans.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export { SocialTeamProfiles };
