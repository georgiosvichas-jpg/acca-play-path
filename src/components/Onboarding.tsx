import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Trophy, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroObjects from "@/assets/hero-objects.png";

const slides = [
  {
    title: "Plan smarter, not harder",
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/dashboard");
    }
  };

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
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 animate-bounce-soft">
            <Icon className="w-10 h-10 text-primary" />
          </div>

          {/* Image for first slide */}
          {slide.image && (
            <div className="mb-8 -mx-4">
              <img
                src={slide.image}
                alt="ACCA Study Objects"
                className="w-full max-w-md mx-auto animate-float"
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
            onClick={() => navigate("/dashboard")}
            className="mt-6 text-muted-foreground hover:text-foreground transition-colors text-sm mx-auto block"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
