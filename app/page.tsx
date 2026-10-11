import { Hero } from "@/components/sections/Hero";
import { SupportForm } from "@/components/sections/SupportForm";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { QuickAccess } from "@/components/sections/QuickAccess";
import { Trust } from "@/components/sections/Trust";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070f]">
      {/* Global background field */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_18%_8%,rgba(109,94,252,0.18),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_85%_22%,rgba(14,165,233,0.14),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_100%,rgba(139,92,246,0.12),transparent_70%)]" />
      </div>

      <Hero />
      <SupportForm />
      <WhyChooseUs />
      <QuickAccess />
      <Trust />
      <Footer />
    </main>
  );
}