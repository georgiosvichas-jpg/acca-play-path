import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle,
  Star,
  Mail,
  Linkedin,
  ArrowRight,
  Lock,
  Crown,
} from "lucide-react";
import heroObjects from "@/assets/hero-objects.png";
import featurePlanner from "@/assets/feature-planner.png";
import featureFlashcards from "@/assets/feature-flashcards.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureGamification from "@/assets/feature-gamification.png";
import featureSyllabus from "@/assets/feature-syllabus.png";
import featureResponsive from "@/assets/feature-responsive.png";

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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg ? "bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl">ACCA Study Buddy</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {["features", "pricing", "faq", "contact", "resources"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-sm font-medium hover:text-primary transition-colors capitalize"
                >
                  {item}
                </button>
              ))}
              <Button onClick={() => navigate("/auth")} size="sm" className="rounded-xl">
                Start Free
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
              <Badge className="mb-4 rounded-full">Join 10,000+ aspiring accountants</Badge>
              <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
                Master your ACCA journey – smarter, faster, gamified
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plan, study, and track your progress across all 13 ACCA papers with personalized goals, XP, and streaks.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl shadow-lg">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("features")} className="rounded-xl">
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
      <section id="features" className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Study better with tools that make you unstoppable
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { img: featurePlanner, title: "Smart Planner", desc: "AI-driven study schedules that adapt to your goals and time left." },
              { img: featureFlashcards, title: "Interactive Flashcards", desc: "5-minute daily drills that boost retention and exam confidence." },
              { img: featureAnalytics, title: "Progress Analytics", desc: "Visual dashboards that track readiness, XP, and streaks." },
              { img: featureGamification, title: "Gamification Engine", desc: "Earn XP, unlock badges, and compete with peers worldwide." },
              { img: featureSyllabus, title: "Officially Aligned", desc: "Based on the public ACCA syllabus, updated every year." },
              { img: featureResponsive, title: "Works Everywhere", desc: "Web and mobile responsive for on-the-go learning." },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up overflow-hidden" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img src={feature.img} alt={feature.title} className="w-full h-48 object-cover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
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
            <Badge variant="secondary" className="rounded-full">
              92% of users say they study more consistently
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "Aisha K.", location: "Lagos", paper: "Paper PM", text: "Study Buddy completely changed how I prepare for my exams. The flashcards and progress tracker kept me consistent — and I passed PM on my first try!" },
              { name: "George L.", location: "London", paper: "Paper FR", text: "It makes studying actually fun. The gamified planner keeps me accountable — I finally enjoy revision." },
              { name: "Maria P.", location: "Athens", paper: "Paper MA", text: "The readiness score helped me know exactly when I was ready to book my next paper." },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 animate-slide-up hover:shadow-lg transition-all" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location} • {testimonial.paper}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl">
              Join them — start your free plan today
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 md:px-8 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Choose the plan that fits your ACCA journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free, master one paper, or unlock everything. Cancel anytime.
            </p>
            <div className="w-24 h-px bg-primary mx-auto mb-8" />
            
            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch 
                checked={isAnnual} 
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent-foreground">
                Save 20%
              </Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <Card className="p-8 rounded-3xl border-2 border-[#E5E7EB] bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-display font-bold">€0</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For curious learners exploring the app.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">Access to 1 demo paper</span>
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">10 flashcards & mini-problems</span>
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">Basic planner</span>
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">Limited XP tracking</span>
                </li>
              </ul>

              <Button 
                variant="outline" 
                className="w-full rounded-xl border-2 hover:border-primary hover:text-primary transition-all"
                onClick={() => navigate("/auth")}
              >
                Start free
              </Button>
            </Card>

            {/* Per Paper Plan */}
            <Card className="p-8 rounded-3xl border-2 border-primary bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up shadow-lg" style={{ animationDelay: "0.1s" }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Per Paper</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-display font-bold text-primary">€9</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  For focused learners preparing one paper.
                </p>
                <p className="text-xs text-primary font-medium">
                  Perfect if you're focusing on one exam this term.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Unlimited flashcards & planner for one paper</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Analytics and readiness score</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>

              <Button 
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => navigate("/auth")}
              >
                Unlock one paper
              </Button>
            </Card>

            {/* Pro Plan (Most Popular) */}
            <Card className="p-8 rounded-3xl border-2 border-primary bg-gradient-to-br from-[#00A67E] to-[#009A72] text-white hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up shadow-xl relative overflow-hidden" style={{ animationDelay: "0.2s" }}>
              <Badge className="absolute -top-1 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-none">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
              
              <div className="mb-6 mt-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-display font-bold">
                    €{isAnnual ? "15" : "19"}
                  </span>
                  <span className="text-white/80">/{isAnnual ? "month" : "month"}</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-white/90 mb-2">
                    Billed annually at €180/year
                  </p>
                )}
                <p className="text-sm text-white/90 mb-2">
                  For serious candidates who want full coverage and insight.
                </p>
                <p className="text-xs text-white font-medium">
                  Best value for ongoing learners preparing multiple papers.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-sm">Access to all 13 papers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-sm">Unlimited flashcards, analytics, and readiness score</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-sm">Smart planner with progress tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-sm">Global leaderboard and full XP rewards</span>
                </li>
              </ul>

              <Button 
                className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/auth")}
              >
                Upgrade to Pro
              </Button>
            </Card>
          </div>

          {/* Reassurance Text */}
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-sm text-[#6B7280]">
              14-day money-back guarantee. No hidden fees.<br />
              You keep your progress even if you downgrade.
            </p>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-12 pt-8 border-t border-border">
            <p className="text-lg text-muted-foreground mb-6">
              Still unsure? Start free and upgrade anytime — your progress is always saved.
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl border-2 hover:border-primary hover:text-primary"
              onClick={() => navigate("/auth")}
            >
              Start Free
            </Button>
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
            {[
              { 
                q: "Is this officially affiliated with ACCA?", 
                a: "No. Study Buddy is an independent learning companion built around the publicly available ACCA syllabus. We help students study smarter — not replace official tuition or exams. All content is original and fully aligned with the structure and learning outcomes of ACCA." 
              },
              { 
                q: "Can I use it while working full-time?", 
                a: "Absolutely — the app was designed for busy professionals. Your personalized study plan adapts to your schedule and time until exam day. You can study 15 minutes a day on your commute or during breaks and still make measurable progress." 
              },
              { 
                q: "How are the flashcards and questions created?", 
                a: "Our content is written by qualified ACCA tutors and graduates, based entirely on ACCA's public syllabus and exam-style logic. Every flashcard, mini-problem, and explanation is original, practical, and updated annually to stay relevant." 
              },
              { 
                q: "Do you have a mobile app?", 
                a: "Yes — the web version works perfectly on all mobile devices. You can add it to your home screen for one-tap access, track your streaks, and study anywhere. A native app for iOS and Android is coming soon." 
              },
              { 
                q: "Is it really free to start?", 
                a: "Yes. You can start completely free with one ACCA paper to test the planner, flashcards, and analytics. Upgrade only when you're ready to unlock all 13 papers and premium features like streaks, leaderboards, and progress tracking." 
              },
              { 
                q: "How does the \"readiness score\" work?", 
                a: "The readiness score combines your XP, completed units, and quiz performance to estimate how prepared you are for your exam. It's a smart, data-driven way to know when you're exam-ready — no more guesswork." 
              },
              { 
                q: "What makes Study Buddy different from traditional courses?", 
                a: "Unlike static video courses, Study Buddy keeps you engaged, accountable, and consistent. We combine gamification, spaced repetition, and analytics to make studying feel rewarding — not exhausting." 
              },
              { 
                q: "Is my progress and data secure?", 
                a: "Yes. All your data is encrypted and stored securely in the cloud. We never share user information with third parties or use it for marketing without consent." 
              },
              { 
                q: "Can my employer or tutor track my progress?", 
                a: "If you're part of a team or mentorship plan, yes. You can share your dashboard with your manager or tutor to track goals and achievements. Otherwise, your data remains private by default." 
              },
              { 
                q: "How can I contact you?", 
                a: "You can reach our team anytime at support@studybuddy.ai. We typically respond within 24 hours. We love hearing feedback from students, tutors, and partners." 
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-background rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-12 animate-fade-in">
            <p className="text-xl font-semibold mb-4">Still have questions?</p>
            <p className="text-muted-foreground mb-6">
              Chat with us or start your free plan today — and see how Study Buddy can transform your ACCA prep.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl">
              Start Free Today
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
              <a href="mailto:support@studybuddy.ai" className="flex items-center gap-2 text-lg hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                support@studybuddy.ai
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
                Study Buddy ACCA
              </a>
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
            {[
              { title: "How to plan your ACCA studies effectively", desc: "A comprehensive guide to structuring your study schedule" },
              { title: "Top 10 mistakes ACCA students make", desc: "Learn from others and avoid common pitfalls" },
              { title: "Ultimate checklist before your exam week", desc: "Everything you need to prepare for exam day" },
            ].map((resource, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-muted-foreground">{resource.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="rounded-xl">
              View all resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 md:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-primary transition-colors">Disclaimer</a>
            </div>
            <p className="text-sm text-muted-foreground">Copyright © ACCA Study Buddy 2025</p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              ACCA is a registered trademark of the Association of Chartered Certified Accountants.
              Study Buddy is an independent product inspired by the official syllabus.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
