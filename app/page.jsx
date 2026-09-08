import Nav from "../components/Nav";
import Hero from "../components/Hero";
import WhatWeDo from "../components/WhatWeDo";
import Capabilities from "../components/Capabilities";
import Industries from "../components/Industries";
import ProjectBanner from "../components/ProjectBanner";

// Building this page part by part. Next up: WhyUs, CTA, Footer.
// Full project details (Client/Challenge/Approach/Outcome) live only on
// /projects/[slug] — the Home page shows a logo-only banner (ProjectBanner).
// The full-detail card grid (components/Projects.jsx) is kept unused, in
// case a future /projects hub page reuses it.
export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <WhatWeDo />
      <Capabilities />
      <Industries />
      <ProjectBanner />
    </>
  );
}
