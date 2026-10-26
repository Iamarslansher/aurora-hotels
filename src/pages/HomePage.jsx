import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedRooms } from '../components/home/FeaturedRooms';
import { HowItWorks } from '../components/home/HowItWorks';
import { AiPlannerTeaser } from '../components/home/AiPlannerTeaser';
import { AboutSection } from '../components/home/AboutSection';
import { GuestReviewsSection } from '../components/home/GuestReviewsSection';
import { ContactSection } from '../components/home/ContactSection';

export const HomePage = () => {
  return (
    <main className="min-h-screen">
      {/* 1. Hero with Video & Search Bar */}
      <HeroSection />

      {/* 2. Featured Rooms (Single, Couple, Friends) */}
      <FeaturedRooms />

      {/* 3. How It Works */}
      <HowItWorks />

      {/* 4. AI Budget Planner Teaser */}
      <AiPlannerTeaser />

      {/* 5. Dedicated About Section with Benefits */}
      <AboutSection />

      {/* 6. Real Verified Guest Reviews Section */}
      <GuestReviewsSection />

      {/* 7. Validated Contact Section */}
      <ContactSection />
    </main>
  );
};
