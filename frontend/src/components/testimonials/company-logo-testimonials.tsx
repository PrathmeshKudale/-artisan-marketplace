import { Handshake } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    image: {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      alt: "Customer Rajesh Kumar",
      width: 80,
      height: 80,
    },
    quote:
      "The craftsmanship is exceptional. Each piece tells a story and the quality is unmatched. I've found authentic handmade treasures that I couldn't find anywhere else.",
    author: {
      name: "Rajesh Kumar",
      role: "Customer, Mumbai",
      type: "customer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop",
      alt: "Pottery workshop of Meera Devi",
      width: 80,
      height: 80,
    },
    quote:
      "This platform helped me reach customers across India. My pottery business has grown beyond my village, and I can now support my entire family through my craft.",
    author: {
      name: "Meera Devi",
      role: "Potter, Rajasthan",
      type: "artisan",
      image: "https://images.unsplash.com/photo-1494790108755-2616c056ca85?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      alt: "Customer Priya Sharma",
      width: 80,
      height: 80,
    },
    quote:
      "Every product I've purchased has exceeded my expectations. The attention to detail and authentic traditional techniques make each piece truly special.",
    author: {
      name: "Priya Sharma",
      role: "Customer, Delhi",
      type: "customer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      alt: "Textile weaving workspace of Arjun Singh",
      width: 80,
      height: 80,
    },
    quote:
      "From selling in local markets to reaching customers nationwide, this platform transformed my weaving business. I can now preserve our traditional art while earning a sustainable living.",
    author: {
      name: "Arjun Singh",
      role: "Textile Weaver, Gujarat",
      type: "artisan",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      alt: "Customer Anita Patel",
      width: 80,
      height: 80,
    },
    quote:
      "I love supporting local artisans and this platform makes it so easy to find authentic handcrafted items. The quality and uniqueness of each piece is remarkable.",
    author: {
      name: "Anita Patel",
      role: "Customer, Bangalore",
      type: "customer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      alt: "Jewelry making workspace of Lakshmi Nair",
      width: 80,
      height: 80,
    },
    quote:
      "My jewelry designs now reach customers I never imagined possible. The platform has given me the tools to showcase my traditional craft to a modern audience.",
    author: {
      name: "Lakshmi Nair",
      role: "Jewelry Artisan, Kerala",
      type: "artisan",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    },
  },
];

const CompanyLogoTestimonials = () => {
  return (
    <section className="pt-16 pb-32 bg-background">
      <div className="border-y border-border">
        <div className="container mx-auto flex flex-col gap-6 border-x border-border py-4 max-lg:border-x lg:py-8">
          <h2 className="font-display text-3xl leading-tight tracking-tight text-marketplace-text-primary md:text-4xl lg:text-6xl">
            Stories from our community
          </h2>
          <p className="max-w-[600px] tracking-[-0.32px] text-marketplace-text-secondary">
            Hear from artisans and customers who are part of our thriving marketplace celebrating traditional Indian crafts
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-10 grid gap-8 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="flex flex-col gap-6 rounded-md bg-card p-6 shadow-sm border-border"
          >
            <div className="flex items-center gap-3">
              <img
                src={testimonial.image.src}
                alt={testimonial.image.alt}
                width={testimonial.image.width}
                height={testimonial.image.height}
                className="rounded-full object-cover"
              />
              <Badge variant={testimonial.author.type === 'artisan' ? 'default' : 'secondary'} className="text-xs">
                {testimonial.author.type === 'artisan' ? 'Artisan' : 'Customer'}
              </Badge>
            </div>

            <blockquote className="text-muted-foreground text-lg font-normal italic">{`"${testimonial.quote}"`}</blockquote>

            <div className="mt-auto flex items-center gap-4">
              <img
                src={testimonial.author.image}
                alt={`${testimonial.author.name}'s profile picture`}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-lg tracking-[-0.36px] text-marketplace-text-primary font-display">
                  {testimonial.author.name}
                </p>
                <p className="text-marketplace-text-secondary">
                  {testimonial.author.role}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 h-8 w-full border-y border-border md:h-12 lg:h-[112px]">
        <div className="container mx-auto h-full w-full border-x border-border"></div>
      </div>
    </section>
  );
};

export { CompanyLogoTestimonials };
