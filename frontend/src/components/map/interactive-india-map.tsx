"use client";

import { useState } from "react";
import { Palette, ChevronLeft, ChevronRight, MapPin, Star, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Comprehensive Indian states and their traditional arts data
const stateCrafts = {
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    arts: ["Kalamkari Painting", "Kondapalli Toys", "Leather Puppetry"],
    primaryCraft: "Kalamkari Painting",
    icon: "🖌️",
    description: "Hand-painted textiles with natural dyes and mythological themes",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Andhra_Pradesh_map.png",
    artImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#FF9933",
    artisan: "Master Venkataswamy",
    artisanStory: "A master Kalamkari artist from Srikalahasti, creating epic tales from Hindu mythology on fabric.",
    price: "₹3,000 - ₹20,000",
    rating: 4.9
  },
  "bihar": {
    name: "Bihar",
    arts: ["Madhubani Painting", "Sikki Grass Work", "Manjusha Art"],
    primaryCraft: "Madhubani Painting",
    icon: "🎨",
    description: "Traditional folk paintings with vibrant colors and intricate patterns",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bihar_map.png",
    artImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#4B0082",
    artisan: "Sita Devi",
    artisanStory: "A renowned Madhubani artist from Mithila, painting stories of Hindu mythology with natural pigments.",
    price: "₹2,000 - ₹25,000",
    rating: 4.8
  },
  "rajasthan": {
    name: "Rajasthan",
    arts: ["Blue Pottery", "Miniature Painting", "Block Printing", "Kathputli Puppetry"],
    primaryCraft: "Blue Pottery",
    icon: "🏺",
    description: "Traditional ceramic art with distinctive blue and white patterns",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Rajasthan_map.png",
    artImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#CD853F",
    artisan: "Kripal Singh",
    artisanStory: "From the Pink City of Jaipur, continuing the 300-year-old tradition of blue pottery with Persian techniques.",
    price: "₹500 - ₹8,000",
    rating: 4.7
  },
  "uttar-pradesh": {
    name: "Uttar Pradesh",
    arts: ["Banarasi Silk", "Chikankari Embroidery", "Brassware of Moradabad"],
    primaryCraft: "Banarasi Silk",
    icon: "🕌",
    description: "Luxurious silk weaving and delicate embroidery",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/13/Uttar_Pradesh_map.png",
    artImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#FF9933",
    artisan: "Masterji Ravi Shankar",
    artisanStory: "A third-generation weaver from Varanasi, preserving the ancient art of Banarasi silk weaving.",
    price: "₹15,000 - ₹50,000",
    rating: 4.9
  },
  "west-bengal": {
    name: "West Bengal",
    arts: ["Kantha Embroidery", "Dokra Metal", "Terracotta of Bishnupur"],
    primaryCraft: "Kantha Embroidery",
    icon: "🧵",
    description: "Running stitch embroidery and metal work",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/West_Bengal_map.png",
    artImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#CD853F",
    artisan: "Manju Das",
    artisanStory: "A skilled artisan from rural Bengal, transforming old sarees into beautiful Kantha quilts and scarves.",
    price: "₹800 - ₹5,000",
    rating: 4.6
  },
  "odisha": {
    name: "Odisha",
    arts: ["Pattachitra Painting", "Applique of Pipili", "Stone Carving"],
    primaryCraft: "Pattachitra Painting",
    icon: "🖼️",
    description: "Traditional scroll paintings and applique work",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Odisha_map.png",
    artImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#4B0082",
    artisan: "Jagannath Mohapatra",
    artisanStory: "From the temple town of Puri, creating intricate Pattachitra paintings on palm leaves and cloth.",
    price: "₹1,500 - ₹12,000",
    rating: 4.8
  },
  "kerala": {
    name: "Kerala",
    arts: ["Kathakali Masks", "Mural Painting", "Coir & Coconut Craft"],
    primaryCraft: "Kathakali Masks",
    icon: "🎭",
    description: "Traditional dance masks and coconut fiber crafts",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Kerala_map.png",
    artImage: "https://images.unsplash.com/photo-1609205807107-7bb817e0b2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#4B0082",
    artisan: "Raman Nair",
    artisanStory: "From the backwaters of Kerala, creating traditional Kathakali masks and coir products.",
    price: "₹200 - ₹3,000",
    rating: 4.5
  },
  "gujarat": {
    name: "Gujarat",
    arts: ["Bandhani Tie-Dye", "Patola Silk", "Rogan Art", "Terracotta Work"],
    primaryCraft: "Bandhani Tie-Dye",
    icon: "🎭",
    description: "Vibrant tie-dye textiles and intricate mirror work",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/02/Gujarat_map.png",
    artImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#CD853F",
    artisan: "Meera Ben",
    artisanStory: "Master craftswoman from Kutch, preserving the ancient art of Bandhani tie-dye techniques.",
    price: "₹1,000 - ₹15,000",
    rating: 4.7
  },
  "maharashtra": {
    name: "Maharashtra",
    arts: ["Warli Painting", "Paithani Sarees", "Kolhapuri Chappals"],
    primaryCraft: "Warli Painting",
    icon: "🎨",
    description: "Tribal geometric art and silk weaving",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Maharashtra_map.png",
    artImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#FF9933",
    artisan: "Jivya Soma Mashe",
    artisanStory: "Renowned Warli artist bringing tribal art to contemporary canvas while preserving traditions.",
    price: "₹2,000 - ₹18,000",
    rating: 4.8
  },
  "tamil-nadu": {
    name: "Tamil Nadu",
    arts: ["Tanjore Painting", "Bronze Sculptures", "Kanchipuram Silk Sarees"],
    primaryCraft: "Tanjore Painting",
    icon: "🖼️",
    description: "Classical paintings and bronze work",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Tamil_Nadu_map.png",
    artImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "#FF9933",
    artisan: "Radhika Srinivasan",
    artisanStory: "Master artist from Thanjavur, creating traditional paintings with gold foil and precious stones.",
    price: "₹5,000 - ₹30,000",
    rating: 4.9
  }
};

const InteractiveIndiaMap = () => {
  const [selectedState, setSelectedState] = useState<string | null>("rajasthan");
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const selectedCraft = selectedState ? stateCrafts[selectedState as keyof typeof stateCrafts] : null;

  return (
    <section className="py-32 bg-gradient-to-br from-orange-50 via-blue-50 to-amber-50 relative overflow-hidden">
      {/* Subtle Indian motifs background */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paisley' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M30,15 Q20,5 10,15 Q15,25 30,15 Z' fill='%23FF9933' fill-opacity='0.08'/%3E%3Cpath d='M50,35 Q40,25 30,35 Q35,45 50,35 Z' fill='%234B0082' fill-opacity='0.06'/%3E%3Ccircle cx='45' cy='10' r='3' fill='%23CD853F' fill-opacity='0.05'/%3E%3Ccircle cx='15' cy='50' r='2' fill='%23FF9933' fill-opacity='0.07'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23paisley)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Additional decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 opacity-10">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-600 blur-xl"></div>
      </div>
      <div className="absolute bottom-20 right-20 w-32 h-32 opacity-8">
        <div className="w-full h-full rounded-full bg-gradient-to-tl from-indigo-500 to-purple-600 blur-2xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-white/80 backdrop-blur-sm">
            <MapPin className="w-4 h-4 mr-2" />
            Explore Indian Crafts
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Discover India's Rich
            <span className="block text-orange-600">Cultural Heritage</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Click on any state to explore traditional crafts, meet local artisans, and support cultural preservation
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-orange-100">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Interactive Map of India
              </h3>
              
              {/* Physical India Map with Clickable Overlays */}
              <div className="relative">
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff1ce823622ae4b55a2cc7cc1ca8532c5%2F53cc67aca27645c2a236e9cbd125da04?format=webp&width=800"
                  alt="Physical Map of India"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                
                {/* Major States Clickable Overlays */}
                {/* Rajasthan */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-amber-400/20 rounded-lg"
                  style={{ 
                    top: '32%', 
                    left: '18%', 
                    width: '20%', 
                    height: '18%',
                    backgroundColor: selectedState === "rajasthan" ? 'rgba(205, 133, 63, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("rajasthan")}
                  onMouseEnter={() => setHoveredState("rajasthan")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Rajasthan - Blue Pottery"
                />

                {/* Uttar Pradesh */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-orange-400/20 rounded-lg"
                  style={{ 
                    top: '26%', 
                    left: '42%', 
                    width: '18%', 
                    height: '12%',
                    backgroundColor: selectedState === "uttar-pradesh" ? 'rgba(255, 153, 51, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("uttar-pradesh")}
                  onMouseEnter={() => setHoveredState("uttar-pradesh")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Uttar Pradesh - Banarasi Silk"
                />

                {/* Bihar */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-indigo-400/20 rounded-lg"
                  style={{ 
                    top: '38%', 
                    left: '60%', 
                    width: '12%', 
                    height: '8%',
                    backgroundColor: selectedState === "bihar" ? 'rgba(75, 0, 130, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("bihar")}
                  onMouseEnter={() => setHoveredState("bihar")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Bihar - Madhubani Paintings"
                />

                {/* West Bengal */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-amber-400/20 rounded-lg"
                  style={{ 
                    top: '44%', 
                    left: '72%', 
                    width: '10%', 
                    height: '12%',
                    backgroundColor: selectedState === "west-bengal" ? 'rgba(205, 133, 63, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("west-bengal")}
                  onMouseEnter={() => setHoveredState("west-bengal")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="West Bengal - Kantha Embroidery"
                />

                {/* Andhra Pradesh */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-orange-400/20 rounded-lg"
                  style={{ 
                    top: '65%', 
                    left: '48%', 
                    width: '14%', 
                    height: '12%',
                    backgroundColor: selectedState === "andhra-pradesh" ? 'rgba(255, 153, 51, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("andhra-pradesh")}
                  onMouseEnter={() => setHoveredState("andhra-pradesh")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Andhra Pradesh - Kalamkari Art"
                />

                {/* Odisha */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-indigo-400/20 rounded-lg"
                  style={{ 
                    top: '58%', 
                    left: '62%', 
                    width: '10%', 
                    height: '10%',
                    backgroundColor: selectedState === "odisha" ? 'rgba(75, 0, 130, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("odisha")}
                  onMouseEnter={() => setHoveredState("odisha")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Odisha - Pattachitra Paintings"
                />

                {/* Kerala */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-indigo-400/20 rounded-lg"
                  style={{ 
                    top: '82%', 
                    left: '38%', 
                    width: '8%', 
                    height: '12%',
                    backgroundColor: selectedState === "kerala" ? 'rgba(75, 0, 130, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("kerala")}
                  onMouseEnter={() => setHoveredState("kerala")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Kerala - Kathakali Masks"
                />

                {/* Gujarat */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-amber-400/20 rounded-lg"
                  style={{ 
                    top: '40%', 
                    left: '8%', 
                    width: '15%', 
                    height: '16%',
                    backgroundColor: selectedState === "gujarat" ? 'rgba(205, 133, 63, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("gujarat")}
                  onMouseEnter={() => setHoveredState("gujarat")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Gujarat - Bandhani Tie-Dye"
                />

                {/* Maharashtra */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-orange-400/20 rounded-lg"
                  style={{ 
                    top: '55%', 
                    left: '25%', 
                    width: '18%', 
                    height: '14%',
                    backgroundColor: selectedState === "maharashtra" ? 'rgba(255, 153, 51, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("maharashtra")}
                  onMouseEnter={() => setHoveredState("maharashtra")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Maharashtra - Warli Painting"
                />

                {/* Tamil Nadu */}
                <div 
                  className="absolute cursor-pointer transition-all duration-300 hover:bg-orange-400/20 rounded-lg"
                  style={{ 
                    top: '75%', 
                    left: '48%', 
                    width: '12%', 
                    height: '15%',
                    backgroundColor: selectedState === "tamil-nadu" ? 'rgba(255, 153, 51, 0.3)' : 'transparent'
                  }}
                  onClick={() => setSelectedState("tamil-nadu")}
                  onMouseEnter={() => setHoveredState("tamil-nadu")}
                  onMouseLeave={() => setHoveredState(null)}
                  title="Tamil Nadu - Tanjore Painting"
                />

                {/* Enhanced Hover Tooltip with Image */}
                {hoveredState && stateCrafts[hoveredState as keyof typeof stateCrafts] && (
                  <div 
                    className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl border border-orange-200 max-w-sm backdrop-blur-sm z-20 transform transition-all duration-300 scale-105 overflow-hidden"
                    style={{ 
                      borderLeft: `4px solid ${stateCrafts[hoveredState as keyof typeof stateCrafts].color}`,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {/* State Image */}
                    <div className="relative h-24 overflow-hidden">
                      <img 
                        src={stateCrafts[hoveredState as keyof typeof stateCrafts].image}
                        alt={stateCrafts[hoveredState as keyof typeof stateCrafts].name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-2 left-3">
                        <h5 className="text-white font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {stateCrafts[hoveredState as keyof typeof stateCrafts].name}
                        </h5>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md"
                          style={{ backgroundColor: `${stateCrafts[hoveredState as keyof typeof stateCrafts].color}20` }}
                        >
                          <span>{stateCrafts[hoveredState as keyof typeof stateCrafts].icon}</span>
                        </div>
                        <div className="flex-1">
                          <h4 
                            className="font-bold text-gray-800 text-base leading-tight mb-1" 
                            style={{ 
                              fontFamily: 'Rajdhani, sans-serif',
                              color: stateCrafts[hoveredState as keyof typeof stateCrafts].color
                            }}
                          >
                            {stateCrafts[hoveredState as keyof typeof stateCrafts].primaryCraft}
                          </h4>
                          <div className="text-xs text-gray-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stateCrafts[hoveredState as keyof typeof stateCrafts].arts.join(" • ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Click to explore crafts
                        </p>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <div className="w-1 h-1 rounded-full bg-orange-300"></div>
                          <div className="w-1 h-1 rounded-full bg-orange-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Craft Details Panel */}
          {selectedCraft && (
            <div className="lg:col-span-1">
              <div 
                className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-2xl overflow-hidden border border-orange-200 sticky top-8 transform transition-all duration-500 hover:shadow-3xl"
                style={{ 
                  borderTop: `4px solid ${selectedCraft.color}`,
                  animation: 'fadeInUp 0.6s ease-out'
                }}
              >
                <div className="relative h-64 overflow-hidden group">
                  <img
                    src={selectedCraft.artImage}
                    alt={selectedCraft.primaryCraft}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
                  
                  <div className="absolute top-4 left-4">
                    <Badge 
                      className="text-white border-white/30 shadow-lg backdrop-blur-sm font-semibold"
                      style={{ 
                        backgroundColor: `${selectedCraft.color}E6`,
                        fontFamily: 'Rajdhani, sans-serif'
                      }}
                    >
                      <span className="text-lg mr-2">{selectedCraft.icon}</span>
                      {selectedCraft.primaryCraft}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-white/50">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {selectedCraft.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, transparent 50%, ${selectedCraft.color} 50%)`,
                    }}
                  ></div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Title Section */}
                  <div className="border-b border-gray-100 pb-4">
                    <h3 
                      className="text-3xl font-bold mb-3 leading-tight" 
                      style={{ 
                        fontFamily: 'Rajdhani, sans-serif',
                        color: selectedCraft.color
                      }}
                    >
                      {selectedCraft.primaryCraft}
                    </h3>
                    <p 
                      className="text-gray-700 text-base leading-relaxed mb-3" 
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {selectedCraft.description}
                    </p>
                    
                    {/* All Arts List */}
                    <div className="flex flex-wrap gap-2">
                      {selectedCraft.arts.map((art, index) => (
                        <span 
                          key={index}
                          className="text-xs px-3 py-1 rounded-full border"
                          style={{ 
                            backgroundColor: `${selectedCraft.color}10`,
                            borderColor: `${selectedCraft.color}30`,
                            color: selectedCraft.color,
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {art}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Artisan Section */}
                  <div>
                    <h4 
                      className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2" 
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      <span className="text-2xl">👨‍🎨</span>
                      Meet the Artisan
                    </h4>
                    <div 
                      className="rounded-xl p-5 border-l-4 shadow-sm"
                      style={{ 
                        backgroundColor: `${selectedCraft.color}10`,
                        borderLeftColor: selectedCraft.color,
                        borderStyle: 'solid'
                      }}
                    >
                      <h5 
                        className="font-bold text-gray-800 mb-2 text-lg" 
                        style={{ 
                          fontFamily: 'Rajdhani, sans-serif',
                          color: selectedCraft.color
                        }}
                      >
                        {selectedCraft.artisan}
                      </h5>
                      <p 
                        className="text-sm text-gray-700 leading-relaxed" 
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {selectedCraft.artisanStory}
                      </p>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 
                      className="font-bold mb-2 text-gray-800 text-lg flex items-center gap-2" 
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      <span className="text-xl">💰</span>
                      Price Range
                    </h4>
                    <p 
                      className="text-3xl font-bold mb-1" 
                      style={{ 
                        color: selectedCraft.color,
                        fontFamily: 'Rajdhani, sans-serif'
                      }}
                    >
                      {selectedCraft.price}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Handcrafted with traditional techniques
                    </p>
                  </div>

                  {/* Enhanced Buy Now Button */}
                  <Button 
                    className="w-full text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-white/20"
                    style={{ 
                      backgroundColor: selectedCraft.color,
                      fontFamily: 'Rajdhani, sans-serif',
                      boxShadow: `0 4px 15px ${selectedCraft.color}40`
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Buy Authentic {selectedCraft.primaryCraft}
                    <span className="ml-2 text-xl">→</span>
                  </Button>
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
                      Authentic Craft
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-blue-500">🛡️</span>
                      Secure Payment
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-orange-500">📦</span>
                      Fast Shipping
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { InteractiveIndiaMap };
