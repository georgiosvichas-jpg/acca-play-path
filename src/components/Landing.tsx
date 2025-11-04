import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Brain,
  TrendingUp,
  Trophy,
  Globe,
  CheckCircle,
  Star,
  Mail,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import heroObjects from "@/assets/hero-objects.png";

export default function Landing() {
  const navigate = useNavigate();
  const [navBg, setNavBg] = useState(false);

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
              { icon: Calendar, title: "Smart Planner", desc: "AI-driven study schedules that adapt to your goals and time left." },
              { icon: Brain, title: "Interactive Flashcards", desc: "5-minute daily drills that boost retention and exam confidence." },
              { icon: TrendingUp, title: "Progress Analytics", desc: "Visual dashboards that track readiness, XP, and streaks." },
              { icon: Trophy, title: "Gamification Engine", desc: "Earn XP, unlock badges, and compete with peers worldwide." },
              { icon: CheckCircle, title: "Officially Aligned", desc: "Based on the public ACCA syllabus, updated every year." },
              { icon: Globe, title: "Works Everywhere", desc: "Web and mobile responsive for on-the-go learning." },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <feature.icon className="w-10 h-10 text-primary mb-4" />
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
      <section id="pricing" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Simple pricing. Cancel anytime.</h2>
            <p className="text-xl text-muted-foreground">Save 20% with annual billing</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Free", price: "€0", desc: "Access one paper, basic planner, limited flashcards", features: ["1 Paper", "Basic Planner", "Limited Flashcards"] },
              { name: "Pro", price: "€19/month", desc: "Unlimited papers, analytics, leaderboards, all flashcards", features: ["All 13 Papers", "Full Analytics", "All Flashcards", "Leaderboards"], popular: true },
              { name: "Team", price: "€10/user/mo", desc: "Corporate or training provider access with mentor dashboard", features: ["All Pro Features", "Mentor Dashboard", "Team Analytics", "Priority Support"] },
            ].map((plan, i) => (
              <Card key={i} className={`p-8 hover:shadow-lg transition-all animate-slide-up relative ${plan.popular ? "border-primary border-2" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-display font-bold mb-4">{plan.price}</div>
                <p className="text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl" variant={plan.popular ? "default" : "outline"} onClick={() => navigate("/auth")}>
                  {plan.name === "Free" ? "Start Free" : "Get Started"}
                </Button>
              </Card>
            ))}
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
              { q: "Is this officially affiliated with ACCA?", a: "No, but all content aligns with the public ACCA syllabus and is updated regularly." },
              { q: "Can I use it while working full-time?", a: "Absolutely. The planner adjusts to your schedule and exam targets." },
              { q: "How are the flashcards created?", a: "They're built from syllabus topics and mini-problems inspired by official learning outcomes." },
              { q: "Do you have a mobile app?", a: "Yes — the web version works perfectly on mobile and tablets." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-background rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
