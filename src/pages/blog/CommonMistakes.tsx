import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowLeft, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const CommonMistakes = () => {
  const mistakes = [
    {
      title: "Starting Preparation Too Late",
      problem: "Many students underestimate how much time they need to prepare, starting just 4-6 weeks before the exam.",
      impact: "This leads to cramming, stress, shallow understanding, and ultimately poor performance or failure.",
      solution: "Begin studying at least 12-16 weeks before your exam. This allows time for deep learning, practice, and revision without overwhelming pressure."
    },
    {
      title: "Passive Reading Without Practice",
      problem: "Students spend hours reading study texts but don't practice enough questions or apply what they've learned.",
      impact: "You might feel like you understand the material, but struggle to apply it in exam conditions. Knowledge without application is quickly forgotten.",
      solution: "Follow the 70-20-10 rule: 70% learning, 20% practicing questions, 10% mock exams and final revision. Always test your understanding with practice questions."
    },
    {
      title: "Ignoring the Exam Format",
      problem: "Not understanding the exam structure, question types, time allocation, or marking scheme until it's too late.",
      impact: "Poor time management during the exam, unexpected question formats, and not knowing how to structure answers for maximum marks.",
      solution: "Study the exam format from day one. Practice past papers under timed conditions. Understand what examiners are looking for in answers."
    },
    {
      title: "Neglecting Weak Areas",
      problem: "Focusing only on topics you find easy or interesting while avoiding difficult subjects that make you uncomfortable.",
      impact: "Weak areas remain weak and could cost you crucial marks. These topics often appear in the exam and can make the difference between pass and fail.",
      solution: "Identify your weak areas early through diagnostic tests. Allocate extra time to challenging topics. Seek help from tutors, study groups, or online resources."
    },
    {
      title: "Poor Note-Taking Habits",
      problem: "Either not taking notes at all, or copying everything word-for-word from study materials without processing the information.",
      impact: "Difficulty retaining information, no quick reference for revision, and wasted study time on ineffective note-taking methods.",
      solution: "Create concise, personalized notes in your own words. Use mind maps, flashcards, and summary sheets. Focus on key concepts, formulas, and exam techniques."
    },
    {
      title: "Studying in Isolation",
      problem: "Never discussing topics with others, not joining study groups, and avoiding asking questions when stuck.",
      impact: "Missing out on different perspectives, explanations, and support. Stuck on problems longer than necessary. Increased stress and motivation issues.",
      solution: "Join study groups (online or in-person), participate in forums, discuss tricky topics with peers, and don't hesitate to ask tutors for help."
    },
    {
      title: "Inconsistent Study Routine",
      problem: "Studying intensively for a few days, then taking long breaks. No regular schedule or rhythm to studying.",
      impact: "Information doesn't stick, difficult to build momentum, and last-minute panic before exams. Burnout from irregular intense sessions.",
      solution: "Create a consistent daily or weekly study routine. Even 1-2 hours daily is more effective than 10 hours once a week. Build studying into your lifestyle."
    },
    {
      title: "Not Practicing Under Exam Conditions",
      problem: "Only practicing questions in a relaxed environment with notes available, never simulating real exam pressure.",
      impact: "Shock during the actual exam, poor time management, exam anxiety, and underperformance despite knowing the material.",
      solution: "Complete at least 3-4 full mock exams under strict timed conditions. Practice writing out full answers by hand. Build exam stamina and confidence."
    },
    {
      title: "Multitasking While Studying",
      problem: "Studying with phone notifications on, TV in the background, or frequently switching between tasks and social media.",
      impact: "Significantly reduced focus and retention. What should take 2 hours of focused study takes 4-5 hours of distracted study with poor results.",
      solution: "Create a distraction-free study environment. Use the Pomodoro Technique (25-minute focused sessions). Turn off notifications. One task at a time."
    },
    {
      title: "Forgetting About Physical and Mental Health",
      problem: "Sacrificing sleep, exercise, and healthy eating in favor of more study time. Studying through exhaustion and burnout.",
      impact: "Reduced cognitive function, poor memory retention, increased stress and anxiety, and ultimately worse exam performance despite more study hours.",
      solution: "Prioritize 7-8 hours of sleep, regular exercise, healthy meals, and breaks. A well-rested, healthy mind learns faster and retains more. Quality over quantity."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Outcomeo Logo" className="h-8" />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Resources
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Top 10 Mistakes ACCA Students Make
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Learn from others and avoid these common pitfalls that cost students their pass
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              10 min read
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-lg leading-relaxed mb-6">
            After analyzing thousands of ACCA student experiences and exam results, we've identified the top 10 mistakes that consistently prevent students from achieving their potential. The good news? All of these are completely avoidable with the right awareness and approach.
          </p>

          <Card className="my-8 bg-destructive/5 border-destructive/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Important</h3>
                  <p className="text-muted-foreground">
                    According to ACCA's own data, the average pass rate across all papers is only 50-55%. Most failures aren't due to lack of intelligence, but rather poor study strategies and avoidable mistakes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mistakes List */}
        <div className="space-y-12">
          {mistakes.map((mistake, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-destructive/5 p-6 border-b">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-destructive">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{mistake.title}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <h3 className="font-bold text-destructive">The Problem</h3>
                    </div>
                    <p className="text-muted-foreground pl-7">{mistake.problem}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h3 className="font-bold text-orange-500">The Impact</h3>
                    </div>
                    <p className="text-muted-foreground pl-7">{mistake.impact}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-primary">The Solution</h3>
                    </div>
                    <p className="text-muted-foreground pl-7">{mistake.solution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conclusion */}
        <div className="prose prose-lg max-w-none mt-12">
          <h2 className="text-3xl font-bold mb-6">Turning Mistakes Into Success</h2>
          <p className="mb-4">
            The difference between students who pass and those who don't often comes down to avoiding these common mistakes. By being aware of these pitfalls and taking proactive steps to avoid them, you're already ahead of the curve.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Quick Self-Assessment</h3>
              <p className="text-muted-foreground mb-4">
                Ask yourself honestly: How many of these mistakes am I currently making? Identifying your weak points is the first step to improvement.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Review this list regularly throughout your study journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Implement one solution at a time rather than trying to fix everything at once</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Track your progress and celebrate improvements in your study habits</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Share this knowledge with study partners to keep each other accountable</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <p className="mb-6">
            Remember, making mistakes is part of the learning process. What matters is recognizing them, learning from them, and adjusting your approach. With the right strategies and mindset, you can avoid these common pitfalls and set yourself up for ACCA success.
          </p>

          <Card className="my-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Get Back on Track With Outcomeo</h3>
              <p className="text-muted-foreground mb-6">
                Our AI-powered platform helps you avoid these mistakes with personalized study plans, progress tracking, and smart recommendations.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default CommonMistakes;
