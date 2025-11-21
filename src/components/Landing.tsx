import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Check, Star, Mail, Linkedin, Instagram, MessageCircle, ArrowRight, Lock, HelpCircle } from "lucide-react";
import heroObjects from "@/assets/hero-objects.png";
import logo from "@/assets/logo-new.png";
import SwipeableCardStack from "@/components/SwipeableCardStack";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { STRIPE_PRICES } from "@/lib/stripe-config";

export default function Landing() {
  const navigate = useNavigate();
  const [navBg, setNavBg] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: "pro" | "elite") => {
    setLoading(tier);
    try {
      const priceId = isAnnual 
        ? (tier === "pro" ? STRIPE_PRICES.PRO_ANNUAL : STRIPE_PRICES.ELITE_ANNUAL)
        : (tier === "pro" ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.ELITE_MONTHLY);

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId, mode: "subscription" },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      setNavBg(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white ${navBg ? "shadow-sm" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="Outcomeo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-xl">Outcomeo</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {["features", "pricing", "faq", "contact", "resources"].map(item => <button key={item} onClick={() => scrollToSection(item)} className="text-sm font-medium hover:text-primary transition-colors capitalize">
                  {item === "faq" ? "FAQ" : item}
                </button>)}
              <Button onClick={() => navigate("/auth")} size="sm" className="rounded-xl">
                Start for free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-secondary/20 animate-float" />
        <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-primary/10 animate-bounce-soft" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="mb-4 rounded-full bg-amber-200 text-card-foreground">Trusted by over 10,000 professionals worldwide</Badge>
              <h1 className="text-5xl font-display font-extrabold mb-6 leading-tight md:text-5xl">
                Pass your ACCA exams faster - with smart, personalised practice that actually sticks
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Daily micro-practice, adaptive difficulty, real-exam style questions and personalised AI coaching that shows you exactly what to s          
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl shadow-lg">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("features")} className="rounded-xl text-card-foreground bg-amber-100">
                  See how it works
                </Button>
              </div>
            </div>
            <div className="animate-slide-up">
              <img src={heroObjects} alt="ACCA Study Tools" className="w-full animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-[#F8FBFA] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
              Study better with tools designed for real ACCA success
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to plan, learn, and track your journey — built by ACCA graduates for ACCA students.
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-8 rounded-full" />
          </div>

          {/* 3D Swipeable Card Stack */}
          <SwipeableCardStack />

          {/* Section Footer CTA */}
          <div className="text-center pt-16 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold">
                Join thousands of ACCA students studying smarter with Outcomeo
              </h3>
              <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Trusted by ACCA students around the world
            </h2>
            <Badge variant="secondary" className="rounded-full bg-accent text-card-foreground">
              92% of users say they study more consistently
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[{
            name: "Aisha K.",
            location: "Lagos",
            paper: "Paper PM",
            text: "Outcomeo completely changed how I prepare for my exams. The flashcards and progress tracker kept me consistent — and I passed PM on my first try!"
          }, {
            name: "George L.",
            location: "London",
            paper: "Paper FR",
            text: "It makes studying actually fun. The gamified planner keeps me accountable — I finally enjoy revision."
          }, {
            name: "Maria P.",
            location: "Athens",
            paper: "Paper MA",
            text: "The readiness score helped me know exactly when I was ready to book my next paper."
          }].map((testimonial, i) => <Card key={i} className="p-6 animate-slide-up hover:shadow-lg transition-all flex flex-col" style={{
            animationDelay: `${i * 0.2}s`
          }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground mb-4 flex-1">{testimonial.text}</p>
                <div className="mt-auto">
                  <p className="font-semibold pb-px">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location} • {testimonial.paper}</p>
                </div>
              </Card>)}
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl">
              Join them — start your free plan today
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 md:px-8 bg-gradient-to-b from-[#F9FAFB] to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Choose Your Path to <span className="text-primary">ACCA Success</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free, upgrade anytime. Unlock powerful AI-driven features to ace your exams.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in">
            <span className={`text-sm font-medium transition-colors duration-200 ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-primary" />
            <span className={`text-sm font-medium transition-colors duration-200 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              Save up to 37%
            </Badge>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
            {/* Card 1 - Free */}
            <Card className="relative bg-card border-2 border-border rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="gap-2 mb-2 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-foreground">FREE</h3>
                  </div>
                  
                  <div className="gap-2 pt-2 flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">€0</span>
                    <span className="text-sm text-muted-foreground">— Forever Free</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center pt-4 leading-relaxed">
                    Discover how Outcomeo works — with just enough access to explore the tool, but not enough to prepare for a real exam.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-4 text-foreground">What's Included</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.1s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">10% of each question bank</span>
                        <p className="text-muted-foreground mt-0.5">Try real ACCA-style questions across all papers. Good for testing — not enough for exam readiness.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.15s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">10 daily flashcards</span>
                        <p className="text-muted-foreground mt-0.5">Maintain a small practice habit and preview the micro-learning format.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.2s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">1 weekly timed mock</span>
                        <p className="text-muted-foreground mt-0.5">One simulation per week to get a feel for exam timing.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.25s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Basic analytics</span>
                        <p className="text-muted-foreground mt-0.5">View accuracy and time spent — limited insights.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.3s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">1-week study plan preview</span>
                        <p className="text-muted-foreground mt-0.5">See how the structured plan works, but cannot build a full journey.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Who this is for</p>
                  <p className="text-sm text-muted-foreground">New users exploring the platform before committing.</p>
                </div>

                <Button variant="outline" className="w-full h-12 rounded-xl border-2" onClick={() => navigate("/auth")}>
                  Start Free
                </Button>
              </div>
            </Card>

            {/* Card 2 - Pro (Most Popular) */}
            <Card className="relative border-2 border-primary rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-slide-up" style={{
            animationDelay: "0.1s"
          }}>
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-none px-4 py-1.5 font-semibold">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
              
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="gap-2 mb-2 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-foreground">PRO</h3>
                  </div>
                  
                  <div className="gap-2 pt-2 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">€{isAnnual ? "99" : "12.99"}</span>
                    <span className="text-sm text-muted-foreground">/ {isAnnual ? "year" : "month"}</span>
                  </div>
                  <p className="text-center text-sm font-medium text-primary">
                    {isAnnual ? "Everything you need to pass" : "Everything you need to pass"}
                  </p>
                  
                  <p className="text-sm text-muted-foreground text-center pt-4 leading-relaxed">
                    The complete ACCA practice toolkit. Designed for candidates who want full coverage, structured guidance, and a proven exam study system.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-4 text-foreground">What You Unlock</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.1s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">100% of all question banks</span>
                        <p className="text-muted-foreground mt-0.5">Full access to every ACCA-style micro-problem and mini-case.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.15s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Unlimited flashcards</span>
                        <p className="text-muted-foreground mt-0.5">Unlimited daily practice to build retention and exam confidence.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.2s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">4 weekly timed mocks</span>
                        <p className="text-muted-foreground mt-0.5">Enough simulations to track progress and improve exam discipline.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.25s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">AI explanations (limited)</span>
                        <p className="text-muted-foreground mt-0.5">Get instant insights after every question — understand the logic behind right/wrong answers.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.3s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Full analytics + heatmaps</span>
                        <p className="text-muted-foreground mt-0.5">Identify your weakest units in seconds and focus where it matters.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.35s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Unlimited study planner</span>
                        <p className="text-muted-foreground mt-0.5">Build a personalized plan for any exam date.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.4s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Core spaced repetition engine</span>
                        <p className="text-muted-foreground mt-0.5">Automatically reviews topics you forget — boosts long-term retention.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.45s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">AI study path generator</span>
                        <p className="text-muted-foreground mt-0.5">Recommends the right order to study based on performance.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Who this is for</p>
                  <p className="text-sm text-muted-foreground mb-4">Candidates who want a structured, complete, exam-ready workflow.</p>
                  
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <p className="text-xs italic text-muted-foreground">"Pro helped me raise my accuracy from 54% to 81% in 9 days."</p>
                    <p className="text-xs font-medium text-foreground mt-1">— Sofia, FR</p>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                  onClick={() => handleCheckout("pro")}
                  disabled={loading === "pro"}
                >
                  {loading === "pro" ? "Loading..." : "Unlock Full ACCA Access"}
                </Button>
              </div>
            </Card>

            {/* Card 3 - Elite */}
            <Card className="relative border-2 border-accent rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up" style={{
            animationDelay: "0.2s"
          }}>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="gap-2 mb-2 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-foreground">ELITE</h3>
                  </div>
                  
                  <div className="gap-2 pt-2 flex items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">€{isAnnual ? "159" : "19.99"}</span>
                    <span className="text-sm text-muted-foreground">/ {isAnnual ? "year" : "month"}</span>
                  </div>
                  <p className="text-center text-sm font-medium text-accent">
                    {isAnnual ? "AI-powered performance coaching" : "AI-powered performance coaching"}
                  </p>
                  
                  <p className="text-sm text-muted-foreground text-center pt-4 leading-relaxed">
                    Designed for serious candidates who want maximum clarity, personalized guidance, and zero guesswork. This is the closest you can get to having a personal ACCA tutor.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-4 text-foreground">Everything in Pro, plus:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.1s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Unlimited timed mocks</span>
                        <p className="text-muted-foreground mt-0.5">Run simulations daily if needed — the fastest way to build exam stamina.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.15s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Unlimited AI Tutor Chat</span>
                        <p className="text-muted-foreground mt-0.5">Full conversational access. Ask any question. Get any explanation. Anytime.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.2s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Advanced spaced repetition</span>
                        <p className="text-muted-foreground mt-0.5">Concept-level memory tracking, adaptive scheduling, retention predictions.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.25s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Predictive analytics</span>
                        <p className="text-muted-foreground mt-0.5">Forecast your expected score based on your real performance patterns.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.3s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Pass probability tracker</span>
                        <p className="text-muted-foreground mt-0.5">Know your likelihood of passing each week — adjust early.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.35s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Performance benchmarking</span>
                        <p className="text-muted-foreground mt-0.5">Compare yourself with top performers.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.4s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Exam-week mode</span>
                        <p className="text-muted-foreground mt-0.5">A 7-day high-intensity preparation program designed to maximize peak performance.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.45s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Multi-paper dashboard</span>
                        <p className="text-muted-foreground mt-0.5">Track progress across multiple papers in one unified view.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.5s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">AI Copilot (dynamic study plans)</span>
                        <p className="text-muted-foreground mt-0.5">Your study plan updates daily based on what you actually did.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 animate-fade-in" style={{
                    animationDelay: "0.55s"
                  }}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Early access to new features</span>
                        <p className="text-muted-foreground mt-0.5">Elite users get priority.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Who this is for</p>
                  <p className="text-sm text-muted-foreground mb-4">Candidates who want predictive clarity, coaching-level support, and the highest chance of passing.</p>
                  
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <p className="text-xs italic text-muted-foreground">"Elite was like having my own tutor. I knew exactly when I was exam-ready."</p>
                    <p className="text-xs font-medium text-foreground mt-1">— Daniel, SBR</p>
                  </div>
                </div>

                <Button 
                  onClick={() => handleCheckout("elite")} 
                  className="w-full h-12 rounded-xl font-semibold bg-amber-200 hover:bg-amber-100 text-card-foreground"
                  disabled={loading === "elite"}
                >
                  {loading === "elite" ? "Loading..." : "Get Personal AI Coaching"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Trust Layer */}
          <div className="flex items-center justify-center gap-8 text-sm animate-fade-in text-card-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {[{
            q: "Is this officially affiliated with ACCA?",
            a: "No. Outcomeo is an independent learning companion built around the publicly available ACCA syllabus. We help students study smarter — not replace official tuition or exams. All content is original and fully aligned with the structure and learning outcomes of ACCA."
          }, {
            q: "Can I use it while working full-time?",
            a: "Absolutely — the app was designed for busy professionals. Your personalized study plan adapts to your schedule and time until exam day. You can study 15 minutes a day on your commute or during breaks and still make measurable progress."
          }, {
            q: "How are the flashcards and questions created?",
            a: "Our content is written by qualified ACCA tutors and graduates, based entirely on ACCA's public syllabus and exam-style logic. Every flashcard, mini-problem, and explanation is original, practical, and updated annually to stay relevant."
          }, {
            q: "Do you have a mobile app?",
            a: "Yes — the web version works perfectly on all mobile devices. You can add it to your home screen for one-tap access, track your streaks, and study anywhere. A native app for iOS and Android is coming soon."
          }, {
            q: "Is it really free to start?",
            a: "Yes. You can start completely free with one ACCA paper to test the planner, flashcards, and analytics. Upgrade only when you're ready to unlock all 13 papers and premium features like streaks, leaderboards, and progress tracking."
          }, {
            q: "How does the \"readiness score\" work?",
            a: "The readiness score combines your XP, completed units, and quiz performance to estimate how prepared you are for your exam. It's a smart, data-driven way to know when you're exam-ready — no more guesswork."
          }, {
            q: "What makes Outcomeo different from traditional courses?",
            a: "Unlike static video courses, Outcomeo keeps you engaged, accountable, and consistent. We combine gamification, spaced repetition, and analytics to make studying feel rewarding — not exhausting."
          }, {
            q: "Is my progress and data secure?",
            a: "Yes. All your data is encrypted and stored securely in the cloud. We never share user information with third parties or use it for marketing without consent."
          }, {
            q: "Can my employer or tutor track my progress?",
            a: "If you're part of a team or mentorship plan, yes. You can share your dashboard with your manager or tutor to track goals and achievements. Otherwise, your data remains private by default."
          }, {
            q: "How can I contact you?",
            a: "You can reach our team anytime at hello@outcomeo.com. We typically respond within 24 hours. We love hearing feedback from students, tutors, and partners."
          }].map((faq, i) => <AccordionItem key={i} value={`item-${i}`} className="bg-amber-100 rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-semibold text-card-foreground">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-card-foreground/90">{faq.a}</AccordionContent>
              </AccordionItem>)}
          </Accordion>
          <div className="text-center mt-12 animate-fade-in">
            <p className="text-xl font-semibold mb-4">Still have questions?</p>
            <p className="text-muted-foreground mb-6">
              Chat with us or start your free plan today — and see how Outcomeo can transform your ACCA prep.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl">
              Start for free today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Let's connect</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <a href="mailto:hello@outcomeo.com" className="flex items-center gap-2 text-lg hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                hello@outcomeo.com
              </a>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <Instagram className="w-5 h-5" />
                
                <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">Coming Soon</Badge>
              </div>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                
                <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">Coming Soon</Badge>
              </div>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <Linkedin className="w-5 h-5" />
                
                <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">Coming Soon</Badge>
              </div>
            </div>
          </div>
          <Card className="p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input placeholder="Your name" className="rounded-xl bg-muted/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="your@email.com" className="rounded-xl bg-muted/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea placeholder="How can we help?" rows={4} className="rounded-xl bg-muted/30" />
              </div>
              <Button type="submit" className="w-full rounded-xl">Send Message</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              We reply within 24 hours — whether you're a student, tutor, or partner.
            </p>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Free resources to supercharge your ACCA prep</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[{
            title: "How to plan your ACCA studies effectively",
            desc: "A comprehensive guide to structuring your study schedule",
            link: "/blog/planning-studies"
          }, {
            title: "Top 10 mistakes ACCA students make",
            desc: "Learn from others and avoid common pitfalls",
            link: "/blog/common-mistakes"
          }, {
            title: "Ultimate checklist before your exam week",
            desc: "Everything you need to prepare for exam day",
            link: "/blog/exam-checklist"
          }].map((resource, i) => <Link key={i} to={resource.link}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer animate-slide-up h-full" style={{
              animationDelay: `${i * 0.1}s`
            }}>
                  <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground">{resource.desc}</p>
                </Card>
              </Link>)}
          </div>
          <div className="text-center">
            <Link to="/resources">
              <Button variant="outline" className="rounded-xl bg-amber-100">
                View all resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 md:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-use" className="hover:text-primary transition-colors">Terms of Use</Link>
              <Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
            </div>
            <p className="text-sm text-muted-foreground">Copyright © Outcomeo 2025</p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              ACCA is a registered trademark of the Association of Chartered Certified Accountants. 
              Outcomeo is an independent product and is not affiliated with, sponsored by, or endorsed by ACCA. 
              Our content is original and simply aligned with the public ACCA syllabus.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}