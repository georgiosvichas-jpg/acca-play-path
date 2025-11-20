import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, ArrowLeft, FileText, Brain, Heart, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const ExamChecklist = () => {
  const weekBeforeChecklist = [
    "Complete your final mock exam and review weak areas",
    "Create a one-page summary sheet of key formulas and concepts",
    "Review examiner reports from previous sessions",
    "Prepare all required documents (exam entry confirmation, ID)",
    "Plan your route to the exam center and check travel times",
    "Gather permitted materials (calculator, pens, pencils, ruler)",
    "Check weather forecast and plan appropriate clothing",
    "Arrange time off work and inform family of your schedule"
  ];

  const dayBeforeChecklist = [
    "Do light revision only - avoid learning new material",
    "Review your summary sheets and flashcards",
    "Pack your exam bag with all required items",
    "Set multiple alarms and arrange backup wake-up calls",
    "Prepare healthy meals and snacks for exam day",
    "Get to bed early (aim for 8 hours sleep)",
    "Avoid caffeine after 2 PM",
    "Do something relaxing in the evening (walk, meditation, light reading)"
  ];

  const examDayChecklist = [
    "Eat a nutritious breakfast (avoid heavy or unfamiliar foods)",
    "Arrive at exam center 30 minutes early",
    "Use the bathroom before entering the exam room",
    "Have water and energy snacks ready (if permitted)",
    "Double-check you have all required documents and materials",
    "Turn off mobile phone completely (not just silent)",
    "Find your seat and get comfortable",
    "Take deep breaths and stay calm"
  ];

  const duringExamChecklist = [
    "Read all instructions carefully before starting",
    "Allocate time for each question based on marks available",
    "Answer the questions you know best first",
    "Show all workings clearly for calculation questions",
    "Manage your time strictly - move on if stuck",
    "Leave space to add more if time permits",
    "Keep track of time with regular checks",
    "Use the last 10 minutes to review answers"
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
            Ultimate Checklist Before Your Exam Week
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Everything you need to prepare for exam day - from one week out to the final minute
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              7 min read
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Exam week can be stressful, but with proper preparation, you can approach your ACCA exam with confidence. This comprehensive checklist covers everything from one week before to the moment you sit down in the exam hall.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
                  <p className="text-muted-foreground">
                    Print this checklist and tick off items as you complete them. The physical act of checking boxes reduces anxiety and helps ensure nothing is forgotten.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* One Week Before */}
        <section className="my-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">One Week Before</h2>
              <p className="text-muted-foreground">Final preparation phase - get organized and focused</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {weekBeforeChecklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Day Before */}
        <section className="my-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-secondary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">The Day Before</h2>
              <p className="text-muted-foreground">Rest, prepare, and stay calm</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {dayBeforeChecklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-orange-500/5 border-orange-500/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">⚠️ What NOT to Do the Day Before</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Don't study late into the night</li>
                <li>• Don't learn new topics or material</li>
                <li>• Don't consume excessive caffeine or alcohol</li>
                <li>• Don't engage in stressful activities or arguments</li>
                <li>• Don't stay up late binge-watching or gaming</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Exam Day Morning */}
        <section className="my-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Exam Day Morning</h2>
              <p className="text-muted-foreground">Final preparations before heading to the center</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {examDayChecklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Your Exam Bag */}
        <section className="my-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-secondary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">What to Pack in Your Exam Bag</h2>
              <p className="text-muted-foreground">Essential items for exam day</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">✅ Required Items</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Valid photo ID (passport, driver's license)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Exam entry confirmation/admission slip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Approved non-programmable calculator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Black/blue pens (bring spares)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Pencils and eraser for workings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Clear ruler (30cm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Silent analog watch</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">💡 Recommended Items</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Water bottle (clear, no label)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Energy snack (chocolate, banana)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Tissues or handkerchief</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Light jacket (rooms can be cold)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Glucose tablets for energy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Small towel (if you tend to sweat)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Spare calculator batteries</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* During the Exam */}
        <section className="my-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">During the Exam</h2>
              <p className="text-muted-foreground">Stay focused and execute your strategy</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {duringExamChecklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Time Management Guide */}
        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">Time Management Strategy</h2>
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-primary min-w-[80px]">0-5 min:</div>
                  <div>
                    <p className="font-semibold">Reading Time</p>
                    <p className="text-sm text-muted-foreground">Read all questions, plan your approach, allocate time per question</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="font-bold text-primary min-w-[80px]">5-170 min:</div>
                  <div>
                    <p className="font-semibold">Answer Time</p>
                    <p className="text-sm text-muted-foreground">Work through questions strategically, stick to time allocations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="font-bold text-primary min-w-[80px]">170-180 min:</div>
                  <div>
                    <p className="font-semibold">Review Time</p>
                    <p className="text-sm text-muted-foreground">Check answers, fill gaps, ensure all questions attempted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final Tips */}
        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">Final Mental Preparation Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">🧘 Stay Calm</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Practice deep breathing if you feel anxious</li>
                  <li>• Remember that some anxiety is normal and can help you focus</li>
                  <li>• Trust in your preparation - you've done the work</li>
                  <li>• Focus on what you can control, not the outcome</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">💪 Stay Confident</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You only need 50% to pass - you don't need perfection</li>
                  <li>• Every question you answer well improves your chances</li>
                  <li>• Other candidates are just as nervous as you</li>
                  <li>• You've prepared for this moment - now execute</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card className="my-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Track Your Exam Preparation</h3>
            <p className="text-muted-foreground mb-6">
              Use Outcomeo's exam countdown and checklist features to stay organized and confident as exam day approaches.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </article>

      <Footer />
    </div>
  );
};

export default ExamChecklist;
