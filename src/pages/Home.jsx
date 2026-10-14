import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { StorytellingSection } from '@/components/home/StorytellingSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BeforeAfterSlider } from '@/components/home/BeforeAfterSlider';
import { CommunitySection } from '@/components/home/CommunitySection';
import { CtaSection } from '@/components/home/CtaSection';
import './Home.css';

export default function Home() {
  return (
    <main data-testid="page-home" className="home-page">
      <HeroSection />
      <BrandsSection />
      <StorytellingSection />
      <CategoriesSection />
      <FeaturedProducts />
      <BeforeAfterSlider />
      <CommunitySection />
      <CtaSection />
    </main>
  );
}
