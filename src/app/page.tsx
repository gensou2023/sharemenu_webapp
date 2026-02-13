import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CasesSection from "@/components/landing/CasesSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import PricingSection from "@/components/landing/PricingSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import FooterSection from "@/components/landing/FooterSection";
import AdPlaceholder from "@/components/AdPlaceholder";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MenuCraft AI",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  description:
    "AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。",
  url: "https://sharemenu-webapp.vercel.app",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    description: "Free プラン（無料）",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mt-[56px]">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-6">
          <AdPlaceholder variant="banner" />
        </div>
        <CasesSection />
        <UseCasesSection />
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-6">
          <AdPlaceholder variant="banner" />
        </div>
        <PricingSection />
        <CTABannerSection />
        <FooterSection />
      </main>
    </>
  );
}
