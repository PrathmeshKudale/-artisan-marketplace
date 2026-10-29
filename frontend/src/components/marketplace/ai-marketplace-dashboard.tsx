"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { IndianRupee, Sparkles, TrendingUp, Users } from "lucide-react";

const trendingProducts = [
  {
    id: 1,
    name: "Handloom Kanchipuram Saree",
    artisan: "Sita Devi — Kanchipuram",
    price: 7499,
    description: "Pure silk weave with zari border in traditional motifs.",
    image:
      "https://images.pexels.com/photos/5770714/pexels-photo-5770714.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tag: "Bestseller",
    category: "Textiles",
  },
  {
    id: 2,
    name: "Jaipur Blue Pottery Vase",
    artisan: "Mohammad Iqbal — Jaipur",
    price: 1899,
    description: "Hand-painted floral patterns in signature blue glaze.",
    image:
      "https://images.pexels.com/photos/1170683/pexels-photo-1170683.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tag: "Discount",
    category: "Pottery",
  },
  {
    id: 3,
    name: "Dhokra Brass Necklace",
    artisan: "Gauri Kumari — Bastar",
    price: 2599,
    description: "Lost-wax handcrafted tribal necklace with antique finish.",
    image:
      "https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tag: "Bestseller",
    category: "Jewelry",
  },
  {
    id: 4,
    name: "Madhubani Folk Painting",
    artisan: "Anita Kumari — Mithila",
    price: 3999,
    description: "Nature-inspired canvas in natural pigments.",
    image:
      "https://images.pexels.com/photos/267527/pexels-photo-267527.jpeg?auto=compress&cs=tinysrgb&w=1200",
    category: "Paintings",
  },
  {
    id: 5,
    name: "Kolhapuri Leather Chappals",
    artisan: "Shivaji Patil — Kolhapur",
    price: 1399,
    description: "Hand-stitched traditional footwear with cushioned sole.",
    image:
      "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
    tag: "Discount",
    category: "Footwear",
  },
  {
    id: 6,
    name: "Banarasi Brocade Fabric",
    artisan: "Rahim Ansari — Varanasi",
    price: 2299,
    description: "Rich brocade yardage with gold-toned zari work.",
    image:
      "https://images.pexels.com/photos/259756/pexels-photo-259756.jpeg?auto=compress&cs=tinysrgb&w=1200",
    category: "Textiles",
  },
];

const growthData = [
  { month: "May", sales: 120, orders: 80 },
  { month: "Jun", sales: 160, orders: 100 },
  { month: "Jul", sales: 180, orders: 120 },
  { month: "Aug", sales: 220, orders: 140 },
  { month: "Sep", sales: 260, orders: 170 },
  { month: "Oct", sales: 310, orders: 200 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function AiMarketplaceDashboard() {
  const totalNewArtisans = 48;
  const growthPercent = 25;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-marketplace-text-primary">
            Discover Crafts • Track Growth • Shop Smart
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-marketplace-text-secondary">
            A modern marketplace that blends tradition with intelligence — view trending items, meet new creators, and see real-time growth insights at a glance.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Trending items (2 cols) */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="font-display text-xl md:text-2xl text-marketplace-text-primary">
                  Trending Selling Items
                </CardTitle>
                <CardDescription>Most loved by our community this week</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {trendingProducts.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {item.tag && (
                            <span className="rounded-md bg-marketplace-primary text-primary-foreground px-2 py-1 text-xs font-medium shadow-sm">
                              {item.tag}
                            </span>
                          )}
                          <span className="rounded-md bg-marketplace-surface/90 backdrop-blur px-2 py-1 text-xs font-medium text-marketplace-text-secondary">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg text-marketplace-text-primary line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-marketplace-text-secondary mb-2 line-clamp-1">
                          by <span className="text-marketplace-primary font-medium">{item.artisan}</span>
                        </p>
                        <p className="text-sm text-marketplace-text-secondary line-clamp-2 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-marketplace-text-primary" />
                            <span className="text-xl font-semibold text-marketplace-text-primary">
                              {item.price.toLocaleString()}
                            </span>
                          </div>
                          <Button className="bg-marketplace-primary hover:bg-marketplace-secondary text-primary-foreground rounded-lg">
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Stats + Insights */}
          <div className="flex flex-col gap-6">
            {/* New Artisan Joiners */}
            <Card className="border border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="font-display text-lg text-marketplace-text-primary flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> New Artisan Joiners (This Month)
                </CardTitle>
                <CardDescription>Welcome to our creative family</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl md:text-5xl font-bold text-marketplace-text-primary">{totalNewArtisans}</p>
                    <p className="text-sm text-marketplace-text-secondary">fresh creators joined</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-indigo-600 text-white">+{growthPercent}%</Badge>
                    <Button variant="outline" className="rounded-lg">
                      Meet our new creators
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Insights */}
            <Card className="border border-border bg-card">
              <CardHeader className="border-b">
                <CardTitle className="font-display text-lg text-marketplace-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-marketplace-primary" /> Artisan Growth Insights
                </CardTitle>
                <CardDescription>Month-over-month performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="h-56 w-full">
                  <LineChart data={growthData} margin={{ left: 32, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--color-chart-3)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>

                <div className="mt-4 rounded-lg bg-marketplace-surface p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-marketplace-primary mt-0.5" />
                    <p className="text-sm text-marketplace-text-secondary">
                      <span className="font-semibold text-marketplace-text-primary">AI Insight:</span> Top 10 artisans grew by {growthPercent}% this month due to festive season sales. Consider spotlighting textiles and jewelry in homepage promos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AiMarketplaceDashboard;
