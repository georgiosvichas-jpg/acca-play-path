import { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import featurePlanner from "@/assets/feature-planner.png";
import featureFlashcards from "@/assets/feature-flashcards.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureGamification from "@/assets/feature-gamification.png";
import featureSyllabus from "@/assets/feature-syllabus.png";
import featureResponsive from "@/assets/feature-responsive.png";

interface Feature {
  id: string;
  title: string;
  description: string;
  highlight: string;
  image: string;
}

const features: Feature[] = [
  {
    id: "planner",
    title: "Smart Planner",
    description: "Plan your studies intelligently with AI-assisted schedules that adapt to your available time and exam date. No spreadsheets — just automatic balance between topics, difficulty, and deadlines.",
    highlight: "Students who plan with Outcomeo complete 3× more study hours per week.",
    image: featurePlanner,
  },
  {
    id: "flashcards",
    title: "Interactive Flashcards",
    description: "Turn complex ACCA theory into quick 5-minute learning bursts. Reinforce memory with mini-problems and smart repetition that keeps you exam-ready anytime.",
    highlight: "Based on proven cognitive recall techniques.",
    image: featureFlashcards,
  },
  {
    id: "analytics",
    title: "Progress Analytics",
    description: "Visualize your preparation like never before. Track your readiness, XP, and streaks — and know exactly when you're exam-ready. No more guessing if you're prepared enough.",
    highlight: "Your personal data-driven progress coach.",
    image: featureAnalytics,
  },
  {
    id: "gamification",
    title: "Gamification Engine",
    description: "Earn XP, unlock badges, and climb leaderboards as you study. Stay consistent, motivated, and accountable — because progress feels better when it's visible.",
    highlight: "Turn discipline into a daily habit.",
    image: featureGamification,
  },
  {
    id: "syllabus",
    title: "Officially Aligned",
    description: "All Outcomeo content is structured directly from the public ACCA syllabus and learning outcomes — updated annually to reflect the latest standards. You focus on learning, we handle the updates.",
    highlight: "Trusted by ACCA candidates worldwide.",
    image: featureSyllabus,
  },
  {
    id: "responsive",
    title: "Learn Anywhere",
    description: "Seamlessly switch between desktop, tablet, and mobile. Outcomeo is fully responsive, cloud-synced, and built for the modern learner.",
    highlight: "Stay productive wherever you are.",
    image: featureResponsive,
  },
];

export default function StickyScrollFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = featureRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveFeature(index);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: "-20% 0px -20% 0px",
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Left Side - Sticky Image */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-70 transition-opacity duration-500" />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            <img
              src={features[activeFeature].image}
              alt={features[activeFeature].title}
              className="w-full h-auto transition-all duration-700 ease-out"
              key={activeFeature}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Scrolling Content */}
      <div className="space-y-32 py-8">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => (featureRefs.current[index] = el)}
            className="space-y-6 transition-opacity duration-500"
            style={{
              opacity: activeFeature === index ? 1 : 0.4,
            }}
          >
            <h3 className="text-3xl md:text-4xl font-display font-bold">
              {feature.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
            <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-primary/10 bg-blue-100 text-blue-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>"{feature.highlight}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
