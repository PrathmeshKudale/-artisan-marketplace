"use client";

import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export interface FeaturedProduct {
  id: string;
  name: string;
  artisan: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
}

export interface HorizontalCarouselGalleryProps {
  title?: string;
  description?: string;
  products?: FeaturedProduct[];
}

const defaultProducts = [
  {
    id: "handwoven-silk-scarf",
    name: "Handwoven Silk Scarf",
    artisan: "Meera Devi",
    price: 2499,
    originalPrice: 3200,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
    category: "Textiles",
    description: "Exquisite handwoven silk scarf with traditional Banarasi patterns, crafted by master weaver Meera Devi."
  },
  {
    id: "ceramic-dinner-set",
    name: "Blue Pottery Dinner Set",
    artisan: "Rajesh Kumar",
    price: 4599,
    originalPrice: 5500,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop",
    category: "Pottery",
    description: "Hand-painted blue pottery dinner set featuring traditional Jaipur designs, perfect for special occasions."
  },
  {
    id: "silver-jhumka-earrings",
    name: "Silver Jhumka Earrings",
    artisan: "Priya Sharma",
    price: 1899,
    originalPrice: 2400,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
    category: "Jewelry",
    description: "Intricately crafted silver jhumka earrings with oxidized finish and traditional temple motifs."
  },
  {
    id: "wooden-jewelry-box",
    name: "Carved Wooden Jewelry Box",
    artisan: "Gopal Singh",
    price: 3299,
    originalPrice: 4100,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop",
    category: "Woodcraft",
    description: "Beautifully carved wooden jewelry box with intricate floral patterns and multiple compartments."
  },
  {
    id: "embroidered-cushion-covers",
    name: "Embroidered Cushion Covers",
    artisan: "Sunita Bai",
    price: 1599,
    originalPrice: 2000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor",
    description: "Set of 4 hand-embroidered cushion covers featuring vibrant mirror work and traditional motifs."
  },
];

const HorizontalCarouselGallery = ({
  title = "Featured Products",
  description = "Discover exquisite handcrafted products from talented artisans across India, each piece telling a unique story of tradition and skill.",
  products = defaultProducts,
}: HorizontalCarouselGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className="py-32 bg-background">
      <div className="container">
        <div className="mb-8 flex items-end justify-between md:mb-14 lg:mb-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-medium font-display md:text-4xl lg:text-5xl text-marketplace-text-primary">
              {title}
            </h2>
            <p className="max-w-lg text-marketplace-text-secondary">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto hover:bg-marketplace-surface border border-border"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto hover:bg-marketplace-surface border border-border"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:mr-[max(0rem,calc(50vw-700px))] 2xl:ml-[max(8rem,calc(50vw-700px))]">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[360px]"
              >
                <div className="group rounded-xl cursor-pointer bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 bg-marketplace-success text-white px-2 py-1 rounded-md text-sm font-medium">
                        Save ₹{product.originalPrice - product.price}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-marketplace-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-marketplace-text-secondary">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg text-marketplace-text-primary mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-marketplace-text-secondary mb-3">
                      by <span className="font-medium text-marketplace-primary">{product.artisan}</span>
                    </p>
                    
                    <p className="text-sm text-marketplace-text-secondary mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl text-marketplace-text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-marketplace-text-secondary line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-marketplace-primary hover:bg-marketplace-secondary text-white font-medium transition-colors duration-200"
                    >
                      <Eye className="size-4 mr-2" />
                      Quick View
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-8 flex justify-center gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? "w-8 bg-marketplace-primary" 
                  : "w-4 bg-marketplace-primary/30 hover:bg-marketplace-primary/50"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { HorizontalCarouselGallery };