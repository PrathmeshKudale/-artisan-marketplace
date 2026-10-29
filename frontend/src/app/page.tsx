import { AnimatedIndicatorNavbar as Navbar } from "@/components/navbars/animated-indicator-navbar";
import { TwoColumnHeroWithImage } from "@/components/heros/two-column-hero-with-image";
import { TaglineSection } from "@/components/tagline/tagline-section";
import { VideoShowcase } from "@/components/video/video-showcase";
import { SocialTeamProfiles } from "@/components/teams/social-team-profiles";
import AiMarketplaceDashboard from "@/components/marketplace/ai-marketplace-dashboard";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";

export default function HomePage() {
  return (
    <>
    <Navbar />
      <TwoColumnHeroWithImage />
      <TaglineSection />
      <VideoShowcase />
      <SocialTeamProfiles />
      <AiMarketplaceDashboard />
      <NewsletterFooter />
    </>
  );
}
