# 🎨 KarigarSetu - AI Marketplace for Local Artisans

**Empowering artisans by connecting them directly to buyers worldwide through an intelligent AI-powered marketplace.**

![KarigarSetu Logo](https://artisan-marketplace-omega.vercel.app/) | Live Demo: [artisan-marketplace-omega.vercel.app](https://artisan-marketplace-omega.vercel.app/)  | Demo Video: https://youtu.be/XuDgCiityxk?si=zfrRCkFDdKLL6M2r

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Key Features in Detail](#key-features-in-detail)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 About

**KarigarSetu** (translating to "Artisan Bridge") is a platform designed to bridge the gap between local artisans and global buyers. Using AI-powered features, we help artisans showcase their products, reach a wider audience, and manage their business efficiently.

The platform leverages:
- **AI-driven recommendations** to help buyers discover relevant artisan products
- **Multi-language support** to make the platform accessible globally
- **Intelligent chatbot (Kalabandhu)** to provide personalized assistance
- **Secure payments** through Razorpay integration
- **Firebase-powered backend** for scalable infrastructure

---

## ✨ Features

### For Buyers
- 🔍 **Smart Search & Discovery**: Find artisan products based on interests
- 💬 **AI Assistant (Kalabandhu)**: Get personalized recommendations and answers about products
- 🌍 **Multi-language Support**: Browse in your preferred language (Google Translate integration)
- 📍 **Location-based Artisans**: Find artisans near you with Google Maps integration
- 🛒 **Seamless Shopping**: Browse, compare, and purchase artisan products
- 💳 **Multiple Payment Options**: Razorpay integration for card payments and Cash on Delivery
- 📦 **Order Tracking**: Track your orders with order confirmation emails
- ⭐ **Product Recommendations**: AI-powered suggestions for related artisan products

### For Artisans
- 🎨 **Artwork Upload**: Upload up to 6 images per product using Firebase Storage
- 🏪 **Shop Management**: Create and manage your artisan profile and shop
- 📊 **Analytics Dashboard**: Track sales, orders, and customer engagement
- 💰 **Payment Management**: Secure transactions through Razorpay
- 🌐 **Global Reach**: Display products to buyers worldwide

### Platform Features
- 🤖 **AI-Powered Recommendations**: Vertex AI-based content recommendations (with category-based fallback)
- 🔐 **Firebase Authentication**: Secure user registration and login
- 📧 **Email Notifications**: Order confirmations via Nodemailer
- 🗣️ **Intelligent Chatbot**: Kalabandhu AI assistant powered by Gemini API
- 🌐 **Multi-language Support**: Real-time translation using Google Cloud Translation API
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ♿ **Accessible UI**: Built with Radix UI and Headless UI components

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Radix UI, Headless UI, Tailwind CSS
- **Styling**: Tailwind CSS with custom animations
- **Components**: 
  - Form handling: React Hook Form with Zod validation
  - Charts: Recharts
  - Icons: Lucide React, React Icons, Tabler Icons
  - Animation: Framer Motion, Motion DOM
  - Carousel: Embla Carousel
  - 3D Visualizations: Three.js, React Three Fiber
- **State Management**: React Context, Firebase
- **Authentication**: Firebase Auth
- **Payment Gateway**: Razorpay

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (CommonJS)
- **Database**: Firebase Firestore
- **File Storage**: Firebase Storage
- **Authentication**: Firebase Admin SDK
- **Email Service**: Nodemailer
- **AI Services**:
  - Google Gemini API (Chat & Content Generation)
  - Google Cloud Translation API (Multi-language support)
  - Vertex AI (Content Recommendations)
  - Google Maps API (Location services)
- **Utilities**:
  - Multer: File upload handling
  - CORS: Cross-origin resource sharing
  - LRU Cache: Response caching
  - Axios: HTTP client

### Database
- **Firestore**: NoSQL document database for user data, orders, artworks, and transactions

### Deployment
- **Frontend**: Vercel
- **Backend**: Node.js server (Express)

### Language Composition
- **TypeScript**: 92.1%
- **JavaScript**: 7.2%
- **CSS**: 0.7%

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase project with credentials
- Google Cloud API keys (Gemini, Translation, Maps)
- Razorpay account

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/aadya284/artisan-marketplace.git
cd artisan-marketplace
