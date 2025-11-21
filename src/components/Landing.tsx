import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, CheckCircle, Star, Mail, Linkedin, Instagram, MessageCircle, ArrowRight, Lock } from "lucide-react";
import heroObjects from "@/assets/hero-objects.png";
import featurePlanner from "@/assets/feature-planner.png";
import featureFlashcards from "@/assets/feature-flashcards.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureGamification from "@/assets/feature-gamification.png";
import featureSyllabus from "@/assets/feature-syllabus.png";
import featureResponsive from "@/assets/feature-responsive.png";
import logo from "@/assets/logo-new.png";
export default function Landing() {
  const navigate = useNavigate();
  const [navBg, setNavBg] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg ? "bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-[25px] h-[25px] flex items-center justify-center overflow-visible">
                <img src={logo} alt="Outcomeo" className="w-full h-full object-contain scale-[1.8]" />
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
              <Badge className="mb-4 rounded-full bg-sidebar-ring">Join 10,000+ aspiring accountants</Badge>
              <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
                Master your ACCA exam journey – smarter, faster, gamified
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Daily micro-practice, adaptive difficulty, real-exam style questions and personalised coaching that builds mastery one step at a time                  
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl shadow-lg">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("features")} className="rounded-xl bg-sidebar-ring">
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

          {/* Feature Block 1 - Smart Planner */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32 animate-fade-in">
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                  <img src={featurePlanner} alt="Smart Planner Interface" className="w-full h-auto" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Smart Planner
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Plan your studies intelligently with AI-assisted schedules that adapt to your available time and exam date. 
                No spreadsheets — just automatic balance between topics, difficulty, and deadlines.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-primary/10 bg-blue-100 text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Students who plan with Outcomeo complete 3× more study hours per week."</span>
              </div>
            </div>
          </div>

          {/* Feature Block 2 - Interactive Flashcards */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32 animate-fade-in">
            <div className="space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Interactive Flashcards
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Turn complex ACCA theory into quick 5-minute learning bursts. 
                Reinforce memory with mini-problems and smart repetition that keeps you exam-ready anytime.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-secondary/10 text-blue-800 bg-blue-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Based on proven cognitive recall techniques."</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                <img src={featureFlashcards} alt="Interactive Flashcards Interface" className="w-full h-auto" />
              </div>
            </div>
          </div>

          {/* Feature Block 3 - Progress Analytics */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32 animate-fade-in">
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                  <img src={featureAnalytics} alt="Progress Analytics Dashboard" className="w-full h-auto" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Progress Analytics
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Visualize your preparation like never before. 
                Track your readiness, XP, and streaks — and know exactly when you're exam-ready. 
                No more guessing if you're prepared enough.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-accent/10 text-blue-800 bg-blue-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Your personal data-driven progress coach."</span>
              </div>
            </div>
          </div>

          {/* Feature Block 4 - Gamification Engine */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32 animate-fade-in">
            <div className="space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Gamification Engine
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Earn XP, unlock badges, and climb leaderboards as you study. 
                Stay consistent, motivated, and accountable — because progress feels better when it's visible.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-primary/10 bg-blue-100 text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Turn discipline into a daily habit."</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                <img src={featureGamification} alt="Gamification Engine Interface" className="w-full h-auto" />
              </div>
            </div>
          </div>

          {/* Feature Block 5 - Officially Aligned */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32 animate-fade-in">
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                  <img src={featureSyllabus} alt="Officially Aligned Syllabus Tracker" className="w-full h-auto" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Officially Aligned
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                All Outcomeo content is structured directly from the public ACCA syllabus and learning outcomes — updated annually to reflect the latest standards. 
                You focus on learning, we handle the updates.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-secondary/10 text-blue-800 bg-blue-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Trusted by ACCA candidates worldwide."</span>
              </div>
            </div>
          </div>

          {/* Feature Block 6 - Learn Anywhere */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 animate-fade-in">
            <div className="space-y-6">
              
              <h3 className="text-3xl md:text-4xl font-display font-bold">
                Learn Anywhere
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Seamlessly switch between desktop, tablet, and mobile. 
                Outcomeo is fully responsive, cloud-synced, and built for the modern learner.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl border border-accent/10 bg-blue-100 text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>"Stay productive wherever you are."</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-transform duration-500 hover:scale-[1.02]">
                <img src={featureResponsive} alt="Multi-device Responsive Design" className="w-full h-auto" />
              </div>
            </div>
          </div>

          {/* Section Footer CTA */}
          <div className="text-center pt-16 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="text-2xl md:text-3xl font-display font-bold">
                Join thousands of ACCA students studying smarter with Outcomeo
              </h3>
              <Button size="lg" onClick={() => scrollToSection("pricing")} className="rounded-xl shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 bg-primary hover:bg-primary/90">
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
            <Badge variant="secondary" className="rounded-full text-card bg-sidebar-ring">
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
          }].map((testimonial, i) => <Card key={i} className="p-6 animate-slide-up hover:shadow-lg transition-all" style={{
            animationDelay: `${i * 0.2}s`
          }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0F172A]" style={{
            fontWeight: 700
          }}>
              Choose your plan for smarter ACCA prep
            </h2>
            <p className="text-lg md:text-xl text-[#475569] max-w-3xl mx-auto mb-8">
              Start free, focus on one paper, or unlock everything. Simple pricing. Cancel anytime.
            </p>
            <div className="w-32 h-px bg-[#E5E7EB] mx-auto" />
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in">
            <span className={`text-sm font-medium transition-colors duration-200 ${!isAnnual ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
              Monthly
            </span>
            <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-[#00A67E]" />
            <span className={`text-sm font-medium transition-colors duration-200 ${isAnnual ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
              Annual
            </span>
            <Badge className="ml-2 bg-[#00A67E]/10 text-[#00A67E] border-[#00A67E]/20 hover:bg-[#00A67E]/10">
              Save 20%
            </Badge>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
            {/* Card 1 - Free */}
            <Card className="relative bg-white border-[#E5E7EB] rounded-[24px] p-8 flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-slide-up">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#0F172A]" style={{
                  fontWeight: 700
                }}>
                    Free
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#0F172A]" style={{
                    fontWeight: 700
                  }}>€0</span>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Perfect for exploring the platform.
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A67E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">10% of each question bank</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A67E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">10 flashcards per day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A67E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">1 timed mock exam</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00A67E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">Basic analytics (accuracy only)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#64748B]">1-week study plan preview</span>
                  </li>
                </ul>
              </div>

              <Button id="cta-start-free" aria-label="Start free" variant="outline" className="w-full mt-6 h-12 rounded-xl border-2 border-[#00A67E] text-[#00A67E] hover:bg-[#00A67E] hover:text-white transition-all duration-200" onClick={() => navigate("/auth")}>
                Start free
              </Button>
            </Card>

            {/* Card 2 - Pro (Most Popular) */}
            <Card className="relative rounded-[24px] p-8 flex flex-col h-full transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] animate-slide-up overflow-hidden" style={{
            animationDelay: "0.1s",
            background: "linear-gradient(135deg, #00A67E 0%, #009D73 100%)"
          }}>
              <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-[#00A67E] border-none text-xs px-4 py-1.5 font-semibold min-w-[120px] justify-center">
                Most Popular
              </Badge>
              
              <div className="flex-1 space-y-6 mt-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white" style={{
                  fontWeight: 700
                }}>
                    Pro
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white" style={{
                    fontWeight: 700
                  }}>
                      €{isAnnual ? "5.75" : "9.99"}
                    </span>
                    <span className="text-white/80">/month</span>
                  </div>
                  {isAnnual && <p className="text-sm text-white/90">
                      Billed annually at €69/year
                    </p>}
                  <p className="text-sm text-white/90 leading-relaxed pt-2">
                    Full access with AI-powered features.
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white">Full question banks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white">Unlimited flashcards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white">4 timed mocks per week</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white">AI explanations & heatmaps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white">Full study planner & spaced repetition</span>
                  </li>
                </ul>
              </div>

              <Button id="cta-upgrade-pro" aria-label="Upgrade to Pro" className="w-full mt-6 h-12 rounded-xl bg-white text-[#00A67E] hover:bg-[#00A67E] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl font-semibold" onClick={() => navigate("/auth")}>
                Upgrade to Pro
              </Button>
            </Card>

            {/* Card 3 - Elite */}
            <Card style={{
            animationDelay: "0.2s"
          }} className="relative border-2 border-[#9333EA] rounded-[24px] p-8 flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-slide-up bg-primary-foreground">
              <div className="flex items-center justify-center gap-2 mb-4">
                
                <Badge className="bg-[#9333EA]/10 text-[#9333EA] border-none text-xs px-4 py-1.5 font-semibold min-w-[120px] justify-center">
                  Elite
                </Badge>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#0F172A]" style={{
                  fontWeight: 700
                }}>
                    Elite
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#0F172A]" style={{
                    fontWeight: 700
                  }}>€{isAnnual ? "8.25" : "14.99"}</span>
                    <span className="text-[#64748B]">/month</span>
                  </div>
                  {isAnnual && <p className="text-sm text-[#475569]">
                      Billed annually at €99/year
                    </p>}
                  <p className="text-sm text-[#475569] leading-relaxed pt-2">
                    Everything in Pro, plus advanced AI tools.
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#9333EA] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#9333EA] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">Unlimited timed mocks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#9333EA] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">AI Tutor chat</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#9333EA] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">Predictive analytics & pass probability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#9333EA] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#475569]">AI Copilot & early access</span>
                  </li>
                </ul>
              </div>

              <Button id="cta-upgrade-elite" aria-label="Upgrade to Elite" onClick={() => navigate("/auth")} className="w-full mt-6 h-12 rounded-xl text-white transition-all duration-200 shadow-md hover:shadow-lg bg-sidebar-ring">
                Upgrade to Elite
              </Button>
            </Card>
          </div>

          {/* Trust Layer */}
          <div className="text-center space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-[#0F172A]" style={{
            fontWeight: 700
          }}>
              14-day money-back guarantee. No hidden fees.
            </p>
            <p className="text-sm text-[#64748B]">
              You keep your progress even if you downgrade. Payments are SSL-secured via Stripe.
            </p>
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
            a: "You can reach our team anytime at support@outcomeo.ai. We typically respond within 24 hours. We love hearing feedback from students, tutors, and partners."
          }].map((faq, i) => <AccordionItem key={i} value={`item-${i}`} className="bg-background rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
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
                <Input placeholder="Your name" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="your@email.com" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea placeholder="How can we help?" rows={4} className="rounded-xl" />
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
              <Button variant="outline" className="rounded-xl">
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