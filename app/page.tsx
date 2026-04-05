import LandingPage from "@/components/ui/demo"
import { WorkSection, AboutSection, ContactSection, Footer } from "@/components/ui/sections"
import { AuroraBackground } from "@/components/ui/aurora-background"

export default function Home() {
  return (
    <>
      <AuroraBackground />
      <main>
        <section id="hero">
          <LandingPage />
        </section>
        <WorkSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
