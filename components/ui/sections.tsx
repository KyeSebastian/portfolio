"use client"

import { StackedCardsInteraction, type ProjectCardData } from "@/components/ui/stacked-cards-interaction"
import PhotoFlipGrid from "@/components/ui/photo-flip-grid"
import { TextScramble } from "@/components/ui/text-scramble"

// Work

const projects: ProjectCardData[] = [
  {
    title:       "Boom or Bust",
    category:    "Machine Learning",
    year:        "2025",
    description: "ML-powered fantasy football advisor. Four XGBoost models trained on 2021-2024 NFL data factor in Vegas lines, defensive matchups, snap counts, and red zone usage. Gives you a recommendation and explains it in plain English. QB accuracy: 83.4%.",
    image:       "/photos/boom-or-bust.png",
    githubUrl:   "https://github.com/KyeSebastian/boom-or-bust",
    liveUrl:     "/videos/boom-or-bust-demo.mp4",
  },
  {
    title:       "Cisco Security Auditor",
    category:    "Network Security",
    year:        "2026",
    description: "Automated CIS Benchmark compliance auditor for Cisco IOS environments. Connects to device fleets over SSH, retrieves running configurations, and evaluates security posture across 21 controls covering authentication hardening, encrypted management access, session controls, and logging. Produces a per-device compliance report with severity-graded findings and prioritized remediation steps. SSH · Cisco IOS · CIS Benchmark.",
    image:       "/photos/cisco-auditor.png",
    githubUrl:   "https://github.com/KyeSebastian/cisco-network-security-auditor",
  },
  {
    title:       "Home Lab",
    category:    "Network Security",
    year:        "2026",
    description: "Segmented network security lab on Proxmox: pfSense firewall and VLAN-isolated zones, a Windows Server 2022 Active Directory domain, and a Wazuh SIEM ingesting both firewall and host-level telemetry. Kerberoasted the domain via Impacket from Kali, then root-caused why the expected alert didn't fire. Six build logs, mistakes included.",
    image:       "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
    liveUrl:     "/blog",
    badgeLabel:  "Blog",
  },
]


export function WorkSection() {
  return (
    <section
      id="work"
      className="relative px-10 sm:px-20 pt-20 pb-20 sm:pb-40 border-t border-cream/5"
    >
      <div className="flex flex-col lg:flex-row gap-20 lg:gap-0">

        {/* Left: project cards */}
        <div className="flex-1 flex flex-col">
          <p className="font-mono text-xs tracking-widest text-cream/60 uppercase mb-3">
            Projects
          </p>
          <p className="text-2xl font-light text-cream/85 mb-8">
            <span className="hidden lg:inline">Hover to explore</span>
            <span className="lg:hidden">Swipe to explore</span>
          </p>
          <StackedCardsInteraction cards={projects} />
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-cream/5 mx-16 self-stretch" />

        {/* Right: credentials & stack */}
        <div className="flex-1 flex flex-col">
          <p className="font-mono text-xs tracking-widest text-cream/60 uppercase mb-3">
            Tech Stack
          </p>
          <div className="flex flex-col mt-4">
            {[
              { label: "Certifications", value: "CompTIA Security+ · CCNA (in progress)" },
              { label: "Networking",     value: "TCP/IP · VLANs · OSPF · BGP · IPsec · SSH" },
              { label: "Security",       value: "Firewalls · IDS/IPS · Wireshark · Wazuh · CIS Benchmarks" },
              { label: "Automation",     value: "Python · Nornir · Netmiko · Bash" },
              { label: "Dev",            value: "Git · Linux · SQL · XGBoost · FastAPI" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-5">
                  <span className="font-mono text-xs tracking-widest text-cream/60 uppercase w-36 shrink-0">{label}</span>
                  <span className="text-sm text-cream/85 font-light">{value}</span>
                </div>
                <div className="w-full h-px bg-cream/5" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

// About

export function AboutSection() {
  return (
    <section
      id="about"
      className="pt-16 pb-20 sm:pb-40 border-t border-cream/5"
    >
      <p className="font-mono text-xs tracking-widest text-cream/60 uppercase mb-20 px-10 sm:px-20">
        About
      </p>

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Text: left half */}
        <div className="flex-1 px-10 sm:px-20 lg:pr-16 flex flex-col justify-center gap-6">
          <p className="text-base sm:text-xl lg:text-2xl font-light text-cream/85 leading-relaxed">
            In 2025 I received my degree in computer science and am actively looking for my first industry opportunity. Since graduating, I entered fatherhood, soaking in every one of my son&apos;s firsts. Before that, the only kids I&apos;d looked after were at an educational learning center where I helped teach coding, so imagine finding out you&apos;re expecting a baby the day after your last university exam!
          </p>
          <p className="text-base sm:text-xl lg:text-2xl font-light text-cream/85 leading-relaxed">
            My foundation was built with Java, learning data structures, algorithms, and programming fundamentals. Python is my craft, from scripts and data pipelines to machine learning.
          </p>
          <p className="text-base sm:text-xl lg:text-2xl font-light text-cream/85 leading-relaxed">
            I&apos;m CompTIA Security+ certified with the CCNA next on the list. I&apos;m ready to be in a real environment, solving real problems, and earning my place on the team. My contact is at the bottom of the page, feel free to reach out.
          </p>
        </div>

        {/* Photo grid: right half */}
        <div className="w-full lg:w-[40%] px-10 sm:px-20 lg:px-0 lg:pr-10 mt-16 lg:mt-0">
          <PhotoFlipGrid />
        </div>
      </div>
    </section>
  )
}

// Contact

export function ContactSection() {
  return (
    <section
      id="contact"
      className="px-10 sm:px-20 pt-8 sm:pt-16 pb-20 sm:pb-40 border-t border-cream/5"
    >
      <p className="font-mono text-xs tracking-widest text-cream/60 uppercase mb-8 sm:mb-20">
        Contact
      </p>

      <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-0">

        {/* Left: email + links */}
        <div className="flex-1 flex flex-col gap-12">
          <a
            href="mailto:kyemora01@outlook.com"
            className="text-xl sm:text-3xl lg:text-5xl font-light [font-variant-numeric:lining-nums] text-cream/85 hover:text-cream/100 transition-colors duration-500 w-fit break-all"
          >
            kyemora01@outlook.com
          </a>

          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <a
              href="https://github.com/KyeSebastian"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 border border-cream/15 hover:border-cream/35 hover:bg-cream/5 px-5 py-2.5 transition-all duration-300 w-fit hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
            >
              <span className="font-mono text-xs tracking-widest text-cream/85 group-hover:text-cream/100 uppercase transition-colors duration-300">
                GitHub
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/kye-mora/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 border border-cream/15 hover:border-cream/35 hover:bg-cream/5 px-5 py-2.5 transition-all duration-300 w-fit hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
            >
              <span className="font-mono text-xs tracking-widest text-cream/85 group-hover:text-cream/100 uppercase transition-colors duration-300">
                LinkedIn
              </span>
            </a>

            {/* CV Download */}
            <a
              href="/cv.pdf"
              download
              className="group flex items-center gap-3 border border-cream/15 hover:border-cream/35 hover:bg-cream/5 px-5 py-2.5 transition-all duration-300 w-fit hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
            >
              <span className="font-mono text-xs tracking-widest text-cream/85 group-hover:text-cream/100 uppercase transition-colors duration-300">
                Download CV
              </span>
              <svg
                width="10" height="12" viewBox="0 0 10 12" fill="none"
                className="text-cream/85 group-hover:text-cream/100 transition-colors duration-300"
              >
                <path d="M5 0v8M1 5l4 4 4-4M0 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-cream/5 mx-16 self-stretch" />

        {/* Right: recruiter snapshot */}
        <div className="flex-1 flex flex-col gap-4 justify-center">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs tracking-widest text-cream/45 uppercase w-28">Location</span>
            <TextScramble text="Torrance, CA" autoStart autoStartDelay={600} loop loopDelay={3000} resolvedClassName="text-cream/85" className="text-xs" />
          </div>
          <div className="w-full h-px bg-cream/5" />
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs tracking-widest text-cream/45 uppercase w-28">Seeking</span>
            <TextScramble text="Network Engineering/ IT" autoStart autoStartDelay={600} loop loopDelay={3000} resolvedClassName="text-cream/85" className="text-xs" />
          </div>
          <div className="w-full h-px bg-cream/5" />
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs tracking-widest text-cream/45 uppercase w-28">Studying</span>
            <TextScramble text="CCNA" autoStart autoStartDelay={600} loop loopDelay={3000} resolvedClassName="text-cream/85" className="text-xs" />
          </div>
          <div className="w-full h-px bg-cream/5" />
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs tracking-widest text-cream/45 uppercase w-28">Building</span>
            <TextScramble text="Home Lab" autoStart autoStartDelay={600} loop loopDelay={3000} resolvedClassName="text-cream/85" className="text-xs" />
          </div>
        </div>

      </div>
    </section>
  )
}

// Footer

export function Footer() {
  return (
    <footer
      className="px-10 sm:px-20 py-12 border-t border-cream/5 flex flex-col items-center justify-center gap-2"
    >
      <span className="font-mono text-xs text-cream/40 tracking-widest uppercase">
        Kye Mora
      </span>
      <span className="font-mono text-xs text-cream/20 tracking-widest">
        © {new Date().getFullYear()} All rights reserved
      </span>
    </footer>
  )
}
