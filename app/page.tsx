import LandingPage from "@/components/ui/demo"
import { WorkSection, AboutSection, ContactSection, Footer } from "@/components/ui/sections"

export default function Home() {
  return (
    <main>
      <section id="hero">
        <LandingPage />
      </section>
      <WorkSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
