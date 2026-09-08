// The six case studies established for this site. Client marks are text
// wordmark badges for now (not real third-party logo artwork) — the brief
// was explicit that logos need permission before use; swap `initials` for
// a real `logo` image path per project once that's confirmed.
export const PROJECTS = [
  {
    slug: "visakhapatnam-steel-plant",
    client: "Visakhapatnam Steel Plant",
    initials: "VSP",
    title: "Reverse Engineering of Industrial Equipment",
    summary:
      "Converting undocumented industrial components into usable CAD data for maintenance and replacement.",
    industry: "Heavy Engineering",
    programme: "Plant Equipment Reverse Engineering",
    servicesShort: "Reverse Engineering · Measurement",
    tags: ["Heavy Engineering", "Reverse Engineering", "Measurement"],
    challenge:
      "Critical steel-plant machinery — originally supplied by international OEMs — had no usable drawings, making maintenance and replacement parts difficult to source.",
    approach:
      "We captured the physical equipment through on-site 3D scanning, reconstructed it into usable CAD, and verified every dimension against the original before handing over engineering-ready data.",
    steps: ["On-site 3D scanning", "Point-cloud capture", "CAD reconstruction", "Dimensional verification"],
    deliverables: [
      "As-built CAD models",
      "Dimensional inspection reports",
      "Replacement-part drawings",
      "Design verification documentation",
    ],
    outcome:
      "Produced usable engineering data for components that previously had none, supporting ongoing maintenance and replacement-part sourcing.",
    relatedService: { slug: "03", name: "Engineering Measurement & Reverse Engineering" },
  },
  {
    slug: "ashok-leyland-dost",
    client: "Ashok Leyland",
    initials: "AL",
    title: "Automotive Product Development Support",
    summary:
      "Engineering support across the development of a light commercial vehicle programme — from concept input through to production-ready design.",
    industry: "Automotive",
    programme: "Dost LCV Programme",
    servicesShort: "Design · CAE",
    tags: ["Automotive", "Concept & Product Design", "CAE Validation"],
    challenge:
      "The Dost programme needed engineering support that could move quickly from concept sketches to production-viable components, while staying within tight cost and weight targets for a new light commercial vehicle platform.",
    approach:
      "We worked alongside the in-house team on specific component packages — taking each from concept through CAD development, running CAE validation to catch structural or thermal issues early, and iterating designs before they reached tooling.",
    steps: ["Concept review", "CAD development", "CAE validation", "Design iteration"],
    deliverables: [
      "Component CAD models",
      "FEA structural reports",
      "Design change documentation",
      "Manufacturing-ready drawings",
    ],
    outcome:
      "Component designs were validated and released within the programme's timeline, with early CAE input reducing the number of late-stage design changes during tooling.",
    relatedService: { slug: "02", name: "CAE Product Validation" },
  },
  {
    slug: "daimler-india-benchmarking",
    client: "Daimler India",
    initials: "DA",
    title: "Truck Benchmarking & Engineering Measurement",
    summary: "Engineering measurement and benchmarking support during Daimler's entry into the Indian market.",
    industry: "Automotive",
    programme: "Truck Benchmarking",
    servicesShort: "Measurement · Reverse Engineering",
    tags: ["Automotive", "Measurement", "Benchmarking"],
    challenge:
      "Understanding competitor and reference truck platforms required precise dimensional data that wasn't available from drawings alone.",
    approach:
      "We identified the components in scope, captured them through 3D measurement, and built structured comparative benchmarking data the engineering team could act on directly.",
    steps: ["Component identification", "3D measurement capture", "Comparative analysis", "Benchmarking report"],
    deliverables: [
      "Dimensional measurement reports",
      "Comparative benchmarking data",
      "3D scan datasets",
      "Engineering summary documentation",
    ],
    outcome: "Supported benchmarking activities during Daimler's entry into India with accurate, structured engineering data.",
    relatedService: { slug: "03", name: "Engineering Measurement & Reverse Engineering" },
  },
  {
    slug: "cvrde-arjun-battle-tank",
    client: "CVRDE",
    initials: "CV",
    title: "Defence Engineering Design Support",
    summary: "Supported engineering design activities related to the Arjun Battle Tank programme.",
    industry: "Defence",
    programme: "Arjun Battle Tank",
    servicesShort: "Design Support · Validation",
    tags: ["Defence", "Design Support", "Validation"],
    challenge:
      "Defence-grade components demand rigorous engineering discipline and validated designs under demanding operating conditions.",
    approach:
      "We supported the engineering team through structured design reviews and validation-related analysis, working within the programme's technical requirements.",
    steps: ["Requirement review", "Design support", "Engineering validation", "Documentation"],
    deliverables: [
      "Engineering design support documentation",
      "Validation-related analysis",
      "Design review records",
      "Technical documentation",
    ],
    outcome: "Supported engineering design activities for a major national defence engineering programme.",
    relatedService: { slug: "02", name: "CAE Product Validation" },
  },
  {
    slug: "faro-metrology-applications",
    client: "FARO Business Technologies",
    initials: "FA",
    title: "Advanced Measurement & Metrology Applications",
    summary: "10 years deploying FARO 3D measurement technology across industrial customers.",
    industry: "Metrology",
    programme: "3D Measurement Deployment",
    servicesShort: "Measurement · Training",
    tags: ["Metrology", "Measurement", "Training"],
    challenge:
      "Industrial customers needed advanced 3D measurement technology and the expertise to apply it correctly across varied applications.",
    approach:
      "We assessed each application, deployed the right measurement equipment, and trained customer teams to run it confidently on their own.",
    steps: ["Application assessment", "Equipment deployment", "Customer training", "Ongoing support"],
    deliverables: [
      "Measurement system deployments",
      "Customer training programmes",
      "Application-specific workflows",
      "Technical support documentation",
    ],
    outcome: "Strengthened customers' in-house measurement and metrology capability across a decade of engagements.",
    relatedService: { slug: "03", name: "Engineering Measurement & Reverse Engineering" },
  },
  {
    slug: "infinite-solutions-spm",
    client: "Infinite Solutions",
    initials: "IS",
    title: "Special-Purpose Machine Development",
    summary: "Custom mechanical, electrical, electronics and PLC-based machine developed in-house.",
    industry: "Industrial Equipment",
    programme: "SPM Development",
    servicesShort: "Machine Design · Automation",
    tags: ["Industrial Equipment", "Machine Design", "Automation"],
    challenge: "A production and inspection requirement had no suitable off-the-shelf machine available.",
    approach:
      "We developed the machine end to end — mechanical and electrical design, automation architecture, PLC programming — through to commissioning.",
    steps: ["Concept development", "Mechanical & electrical design", "Automation & PLC integration", "Testing & commissioning"],
    deliverables: [
      "Machine design documentation",
      "Automation & control architecture",
      "PLC programming",
      "Commissioning records",
    ],
    outcome: "Delivered a working special-purpose machine tailored exactly to the production requirement.",
    relatedService: { slug: "06", name: "Special-Purpose Machine Design & Development" },
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
