import LandingPage from "@/components/ui/demo"
import { WorkSection, AboutSection, ContactSection, Footer } from "@/components/ui/sections"
import MeshBackground from "@/components/ui/mesh-background"

export default function Home() {
  return (
    <>
      <MeshBackground />
      <main>
        <section id="hero">
          <LandingPage />
        </section>
        <AboutSection />
        <WorkSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
