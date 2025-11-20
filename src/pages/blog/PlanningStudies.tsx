import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Target, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PlanningStudies = () => {
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
            How to Plan Your ACCA Studies Effectively
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            A comprehensive guide to structuring your study schedule for maximum success
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              8 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Planning your ACCA studies effectively is crucial for success. With proper structure and strategy, you can maximize your learning efficiency and boost your chances of passing on the first attempt.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Key Takeaway</h3>
                  <p className="text-muted-foreground">
                    Successful ACCA students spend 150-200 hours per paper on average. Breaking this down into a structured daily routine is essential for maintaining consistency and avoiding last-minute cramming.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Understanding Your Timeline</h2>
          <p className="mb-4">
            Before creating your study plan, assess how much time you have until your exam. The ACCA recommends 150-200 hours of study per paper, but this varies based on:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Your prior knowledge and experience in the subject area</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>The complexity of the paper (Applied Skills vs Strategic Professional)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Your available study time per week</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Your learning style and study preferences</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">Creating Your Study Schedule</h2>
          
          <h3 className="text-2xl font-bold mt-8 mb-4">Step 1: Calculate Your Available Hours</h3>
          <p className="mb-4">
            Start by working backwards from your exam date. If you have 12 weeks and can study 15 hours per week, that's 180 hours total - perfect for most papers. Be realistic about your commitments and build in buffer time for unexpected events.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4">Step 2: Break Down the Syllabus</h3>
          <p className="mb-4">
            Divide your syllabus into manageable chunks. Most ACCA papers have 15-20 main topics. Allocate time based on:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Topic weight:</strong> Spend more time on topics with higher exam weightings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Difficulty level:</strong> Complex topics need more attention</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Your knowledge gaps:</strong> Focus on areas where you're weakest</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-4">Step 3: Structure Each Study Session</h3>
          <p className="mb-4">
            An effective study session should include:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">📚 Review (10-15 minutes)</h4>
                  <p className="text-sm text-muted-foreground">Recap what you learned in the previous session</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">📖 New Material (40-50 minutes)</h4>
                  <p className="text-sm text-muted-foreground">Learn new concepts through reading and note-taking</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">✏️ Practice Questions (30-40 minutes)</h4>
                  <p className="text-sm text-muted-foreground">Apply what you've learned with relevant questions</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">🔄 Review & Revision (15-20 minutes)</h4>
                  <p className="text-sm text-muted-foreground">Summarize key points and identify areas for further study</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">The 70-20-10 Rule</h2>
          <p className="mb-4">
            Apply this proven study allocation method:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">70%</span>
              <span>Learning and understanding new material</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">20%</span>
              <span>Practicing questions and past papers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">10%</span>
              <span>Revision and mock exams</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">Weekly Planning Tips</h2>
          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Set weekly goals:</strong> Define what topics or chapters you'll cover each week</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Schedule study blocks:</strong> Treat study time like important appointments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Build in flexibility:</strong> Leave buffer time for unexpected events or challenging topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Track your progress:</strong> Monitor completion rates and adjust your plan as needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Include rest days:</strong> Schedule at least one day off per week to avoid burnout</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Final Month Strategy</h2>
          <p className="mb-4">
            The last 4 weeks before your exam should focus heavily on practice and revision:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Week -4:</strong> Complete all new material, start intensive question practice</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Week -3:</strong> Practice past papers under exam conditions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Week -2:</strong> Focus on weak areas identified in mock exams</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Week -1:</strong> Light revision, rest well, and maintain confidence</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">Common Pitfalls to Avoid</h2>
          <Card className="my-6 bg-destructive/5 border-destructive/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Starting too late - begin studying at least 12 weeks before the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Passive reading without active practice - doing questions is crucial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Neglecting exam technique - practice under timed conditions regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Overloading yourself - quality study beats quantity every time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">×</span>
                  <span>Ignoring your weaknesses - face difficult topics head-on early in your plan</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Conclusion</h2>
          <p className="mb-4">
            Effective study planning is the foundation of ACCA success. By creating a structured schedule, allocating time wisely, and staying consistent, you'll maximize your chances of passing. Remember, the best study plan is one you can actually stick to - so be realistic and build in flexibility.
          </p>
          <p className="mb-6">
            Ready to create your personalized study plan? Outcomeo's AI-powered planner can help you structure your schedule based on your exam date, available time, and learning style.
          </p>

          <Card className="my-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Start Planning Your Success Today</h3>
              <p className="text-muted-foreground mb-6">
                Get personalized study plans, track your progress, and achieve your ACCA goals with Outcomeo.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Get Started Free
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

export default PlanningStudies;
