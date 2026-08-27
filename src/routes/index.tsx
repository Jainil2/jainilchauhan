import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Experience } from "@/components/portfolio/Experience";
import { Projects } from "@/components/portfolio/Projects";
import { Education } from "@/components/portfolio/Education";
import { Writing } from "@/components/portfolio/Writing";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { SectionDivider } from "@/components/portfolio/SectionDivider";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { Now } from "@/components/portfolio/Now";
import { InfrastructureMap } from "@/components/portfolio/InfrastructureMap";
import { DeltaHome } from "@/components/delta/DeltaHome";
import { isPlatform } from "@/lib/site";

// `isPlatform` folds to a literal at build time (VITE_SITE is a define), so the
// unused branch is dead-code-eliminated: a portfolio build ships no DeltaHome,
// and a platform build ships none of the portfolio sections.
const platformHead = {
  meta: [
    { title: "Delta — learn AI systems from what you already know" },
    {
      name: "description",
      content:
        "An LLM KV-cache is an LRU cache. Continuous batching is a queue and a scheduler. Delta teaches AI systems as small deltas from the CS you already understand, with challenges you actually run.",
    },
  ],
};

export const Route = createFileRoute("/")({
  component: isPlatform ? DeltaHome : Index,
  head: () =>
    isPlatform
      ? platformHead
      : {
          meta: [
            { title: "Jainil Chauhan — Software Engineer · Distributed Systems & Backend" },
            {
              name: "description",
              content:
                "Portfolio of Jainil Chauhan — Software Engineer specialising in backend, distributed systems, OAuth/OIDC, AWS, and cloud cost optimization.",
            },
            {
              property: "og:title",
              content: "Jainil Chauhan — Software Engineer",
            },
            {
              property: "og:description",
              content:
                "Building low-latency, high-trust systems that scale quietly. Backend · auth · cloud.",
            },
            { property: "og:image", content: "/og-image.png" },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:url", content: "https://jainilchauhan.com/" },
            { name: "twitter:image", content: "/og-image.png" },
            { name: "twitter:title", content: "Jainil Chauhan — Software Engineer" },
            {
              name: "twitter:description",
              content:
                "Building low-latency, high-trust systems that scale quietly. Backend · auth · cloud.",
            },
          ],
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Jainil Chauhan",
                url: "https://jainilchauhan.com/",
                image: "https://jainilchauhan.com/og-image.png",
                jobTitle: "Software Engineer",
                description:
                  "Backend & distributed systems engineer building low-latency, high-trust systems.",
                worksFor: { "@type": "Organization", name: "Tech Holding" },
                alumniOf: {
                  "@type": "CollegeOrUniversity",
                  name: "Dharmsinh Desai University",
                },
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Nadiad",
                  addressCountry: "IN",
                },
                sameAs: [
                  "https://github.com/jainil-chauhan",
                  "https://www.linkedin.com/in/jainil-chauhan",
                ],
                knowsAbout: [
                  "Distributed Systems",
                  "Backend Engineering",
                  "OAuth 2.0",
                  "OIDC",
                  "AWS",
                  "Kubernetes",
                  "GraphQL",
                  "PostgreSQL",
                  "Redis",
                ],
              }),
            },
          ],
        },
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <CommandPalette />
      <main>
        <Hero />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-4">
          <InfrastructureMap />
        </div>
        <SectionDivider label="About" />
        <About />
        <SectionDivider label="Skills" />
        <Skills />
        <SectionDivider label="Experience" />
        <Experience />
        <SectionDivider label="Projects" />
        <Projects />
        <SectionDivider label="Now" />
        <Now />
        <SectionDivider label="Education" />
        <Education />
        <SectionDivider label="Writing" />
        <Writing />
        <SectionDivider label="Contact" />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
