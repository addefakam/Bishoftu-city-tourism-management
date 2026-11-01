import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { CityOverviewSection } from '@/components/city-overview'
import { WhyBishoftuSection } from '@/components/why-bishoftu'
import { FeaturedHotelsSection } from '@/components/featured-hotels'
import { VirtualBishoftuSection } from '@/components/virtual-bishoftu'
import { FeaturedAttractionsSection } from '@/components/featured-attractions'
import { ThingsToDoSection } from '@/components/things-to-do'
import { NewsSection } from '@/components/news-section'
import { AboutSection } from '@/components/about-section'
import { EmergencyServicesSection } from '@/components/emergency-services'
import { SiteFooter } from '@/components/site-footer'
import { AiChatWidget } from '@/components/ai-chat-widget'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CityOverviewSection />
        <WhyBishoftuSection />
        <FeaturedHotelsSection />
        <VirtualBishoftuSection />
        <FeaturedAttractionsSection />
        <ThingsToDoSection />
        <NewsSection />
        <AboutSection />
        <EmergencyServicesSection />
      </main>
      <SiteFooter />
      <AiChatWidget />
    </div>
  )
}
