import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Trophy, Rocket, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroObjects from "@/assets/hero-objects.png";

const slides = [
  {
    title: "Study smarter, not harder",
    description: "Create your perfect study schedule and track your progress with ease.",
    icon: Sparkles,
    image: heroObjects,
  },
  {
    title: "Earn XP while mastering ACCA",
    description: "Turn your study sessions into achievements. Every concept learned brings you closer.",
    icon: Trophy,
  },
  {
    title: "Ready to level up?",
    description: "Your journey to ACCA success starts here. Let's make studying fun!",
    icon: Rocket,
  },
];

export default function Onboarding() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8FBFA] to-[#EAF8F4]">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl p-10 shadow-elegant text-center">
            {/* Top Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow">
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
              Welcome to Study Buddy
            </h1>

            {/* Subtext */}
            <p className="text-base text-[#475569] mb-8 leading-relaxed">
              Let's personalize your ACCA study experience — it takes less than a minute to set up.
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleGetStarted}
              className="w-full sm:w-[220px] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            >
              Get Started
            </Button>

            {/* Secondary Text */}
            <p className="mt-6 text-sm text-[#94A3B8]">
              Your study plan will be ready instantly after setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Carousel Slides
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-secondary/20 animate-float" />
      <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-primary/10 animate-bounce-soft" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-1/3 right-10 w-12 h-12 rounded-full bg-accent/20 animate-float" style={{ animationDelay: "1s" }} />

      <div className="max-w-2xl w-full animate-fade-in">
        {/* Progress indicators */}
        <div className="flex gap-2 justify-center mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-12 bg-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card card-float text-center">
          {/* Image for first slide */}
          {slide.image && (
            <div className="mb-6 -mx-8 md:-mx-12">
              <img
                src={slide.image}
                alt="ACCA Study Objects"
                className="w-full animate-float"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 text-balance">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-lg mx-auto">
            {slide.description}
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl shadow-float transition-all duration-300 hover:scale-105 hover:shadow-float"
            onClick={handleNext}
          >
            {currentSlide === slides.length - 1 ? "Start Planning" : "Next"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Skip button */}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={() => navigate("/auth")}
            className="mt-6 text-muted-foreground hover:text-foreground transition-colors text-sm mx-auto block"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
