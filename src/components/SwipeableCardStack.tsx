import { useState, useRef, useEffect } from "react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function SwipeableCardStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > 100) {
      handlePrev();
    } else if (dragOffset < -100) {
      handleNext();
    }

    setDragOffset(0);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, [isDragging, dragOffset]);

  const getCardStyle = (index: number) => {
    const position = index - activeIndex;
    const absPosition = Math.abs(position);
    
    if (absPosition > 2) return { display: "none" };

    const offset = dragOffset / 10;
    
    return {
      transform: `
        translateX(${position * 20 + offset}px)
        translateY(${absPosition * 20}px)
        translateZ(${-absPosition * 100}px)
        rotateY(${position * -5 + offset / 10}deg)
        scale(${1 - absPosition * 0.1})
      `,
      zIndex: features.length - absPosition,
      opacity: position === 0 ? 1 : 0.6 - absPosition * 0.2,
      pointerEvents: position === 0 ? "auto" : "none",
      transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    } as React.CSSProperties;
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative h-[600px] md:h-[700px] mx-auto max-w-5xl"
        style={{ perspective: "2000px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={getCardStyle(index)}
          >
            <div className="h-full w-full bg-white rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Image Section */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-contain p-8"
                    draggable={false}
                  />
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-4 bg-white">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-6 mt-12">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full w-12 h-12 bg-white shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Progress Indicators */}
        <div className="flex gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-border hover:bg-primary/50"
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full w-12 h-12 bg-white shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in">
        <p>Drag to explore features or use arrow buttons</p>
      </div>
    </div>
  );
}
