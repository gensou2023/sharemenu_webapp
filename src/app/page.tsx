import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CasesSection from "@/components/landing/CasesSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mt-[52px]">
        <HeroSection />
        <HowItWorksSection />
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-4">
          <AdPlaceholder variant="banner" />
        </div>
        <CasesSection />
        <UseCasesSection />
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-4">
          <AdPlaceholder variant="banner" />
        </div>
        <PricingSection />
        <FooterSection />
      </main>
    </>
  );
}
