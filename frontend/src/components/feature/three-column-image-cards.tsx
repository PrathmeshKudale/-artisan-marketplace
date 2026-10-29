"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const categories = [
  {
    title: "Textiles & Fabrics",
    description:
      "Discover exquisite handwoven sarees, block-printed fabrics, and traditional Indian textiles crafted by skilled artisans using time-honored techniques.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Pottery & Ceramics",
    description:
      "Explore beautiful clay pottery, terracotta items, and ceramic art pieces handcrafted by master potters using traditional Indian techniques.",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Jewelry & Accessories",
    description:
      "Browse stunning traditional Indian jewelry including kundan, meenakari, and silver ornaments crafted by expert jewelers and artisans.",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const ThreeColumnImageCards = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto">
        <div className="m-auto mb-24 max-w-xl text-center">
          <h2 className="mb-6 text-3xl font-semibold lg:text-5xl text-marketplace-text-primary font-display">
            Craft Categories
          </h2>
          <p className="m-auto max-w-3xl text-lg lg:text-xl text-marketplace-text-secondary">
            Discover authentic Indian crafts across our curated categories, each showcasing the finest work of traditional artisans and craftspeople.
          </p>
        </div>
        <div className="mt-11 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Card key={index} className="border-0 pt-0 bg-card overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img
                src={category.image}
                alt={category.title}
                className="aspect-video w-full object-cover"
              />
              <div className="p-6">
                <h3 className="mb-3 text-xl font-semibold text-marketplace-text-primary font-display">{category.title}</h3>
                <p className="text-marketplace-text-secondary mb-6 leading-relaxed">{category.description}</p>
                <Button
                  className="w-full bg-marketplace-primary hover:bg-marketplace-secondary text-primary-foreground font-medium rounded-lg"
                  size="default"
                >
                  Explore Category
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ThreeColumnImageCards };
