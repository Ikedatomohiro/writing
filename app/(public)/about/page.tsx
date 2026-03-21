import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `About - ${SITE_CONFIG.name}`,
  description:
    "Learn about the vision, mission, and team behind The Editorial.",
};

interface TeamMember {
  name: string;
  role: string;
  roleColor: string;
  bio: string;
  imagePlaceholder: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sarah Jenkins",
    role: "Editor-in-Chief",
    roleColor: "text-primary",
    bio: "With a background in molecular biology and investigative journalism, Sarah curates the 'Health' vertical with a focus on longevity and bio-optimization.",
    imagePlaceholder: "SJ",
  },
  {
    name: "Marcus Chen",
    role: "Principal Architect",
    roleColor: "text-secondary",
    bio: "A former systems engineer, Marcus deconstructs the world of 'Tech', exploring the societal implications of AI, blockchain, and quantum computing.",
    imagePlaceholder: "MC",
  },
  {
    name: "Elena Rodriguez",
    role: "Lead Analyst",
    roleColor: "text-tertiary",
    bio: "Elena brings 15 years of Wall Street experience to the 'Finance' desk, translating complex macro-trends into actionable insights for the modern investor.",
    imagePlaceholder: "ER",
  },
];

function HeroSection() {
  return (
    <section className="ml-[8%] mr-[12%] mb-24">
      <div className="max-w-4xl">
        <span className="font-label text-xs tracking-widest uppercase text-primary font-bold mb-4 block">
          Our Origin Story
        </span>
        <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface leading-[0.9] mb-8">
          The Vision Behind <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            The Editorial
          </span>
        </h1>
        <p className="font-body text-xl leading-relaxed text-on-surface-variant max-w-2xl">
          We believe information shouldn&apos;t just be consumed; it should be
          curated. In an age of noise, we provide the signal through a modern
          lens of intersectionality.
        </p>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="bg-surface-container-low py-24 mb-24">
      <div className="ml-[8%] mr-[12%] grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-highest flex items-center justify-center">
              <span className="text-on-surface-variant text-lg font-headline">
                Abstract Composition
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-container rounded-xl p-6 shadow-xl flex items-end">
            <p className="text-on-primary font-headline font-bold leading-tight">
              Convergence is our core philosophy.
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-headline text-4xl font-bold mb-8 tracking-tight">
            Our Mission
          </h2>
          <div className="space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
            <p>
              At the heart of{" "}
              <span className="font-bold text-on-surface">The Editorial</span>{" "}
              lies a simple truth: the most profound breakthroughs happen at the
              edges of disciplines.
            </p>
            <p>
              By converging{" "}
              <span className="text-primary font-bold">Health</span>,{" "}
              <span className="text-tertiary font-bold">Finance</span>, and{" "}
              <span className="text-secondary font-bold">Tech</span>, we
              explore how bio-hacking influences economic markets and how
              decentralized systems are reshaping personal wellness.
            </p>
            <p>
              We reject the &quot;boxed-in&quot; nature of traditional media.
              Our mission is to provide an adaptive intellectual ecosystem for
              the modern polymath.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col hover:translate-y-[-8px] transition-transform duration-300">
      <div className="w-full aspect-square rounded-lg overflow-hidden mb-6 bg-surface-container flex items-center justify-center">
        <span className="text-4xl font-headline font-bold text-on-surface-variant">
          {member.imagePlaceholder}
        </span>
      </div>
      <span
        className={`font-label text-[10px] tracking-[0.2em] uppercase ${member.roleColor} font-black mb-2`}
      >
        {member.role}
      </span>
      <h3 className="font-headline text-2xl font-bold mb-3">{member.name}</h3>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
        {member.bio}
      </p>
    </div>
  );
}

function EditorialBoardSection() {
  return (
    <section className="ml-[8%] mr-[12%] mb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
        <h2 className="font-headline text-5xl font-extrabold tracking-tighter">
          Meet the Editorial Board
        </h2>
        <p className="font-label text-sm tracking-widest uppercase text-outline">
          The Architects of Insight
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="ml-[8%] mr-[12%] text-center">
      <div className="bg-gradient-to-br from-primary to-primary-container p-16 rounded-xl text-on-primary shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-headline text-4xl font-bold mb-6">
            Ready to build the future of content?
          </h2>
          <p className="font-body text-lg mb-10 opacity-90 max-w-xl mx-auto">
            We are always looking for visionary partners and innovative
            contributors to join our growing ecosystem.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-surface-container-lowest text-primary font-headline font-extrabold px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 shadow-xl"
          >
            Contact for Collaborations
          </Link>
        </div>
        {/* Abstract background elements */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="pt-32 pb-20 bg-surface font-body text-on-surface">
      <HeroSection />
      <MissionSection />
      <EditorialBoardSection />
      <CtaSection />
    </main>
  );
}
