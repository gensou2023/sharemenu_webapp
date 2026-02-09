import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CasesSection from "@/components/landing/CasesSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mt-[52px]">
        <HeroSection />
        <CasesSection />
        <PricingSection />
        <FooterSection />
      </main>
    </>
  );
}
