import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, ArrowLeft, AlertTriangle, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const TimeManagement = () => {
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
            Time Management for ACCA Students: Balance Study, Work, and Life
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Practical strategies to fit ACCA studies into a busy schedule without burning out
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              11 min read
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Most ACCA students juggle work, family commitments, and studying simultaneously. Effective time management isn't about finding more hours in the day - it's about making the most of the hours you have. Here's how to create a sustainable study routine that works with your life, not against it.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">The Reality</h3>
                  <p className="text-muted-foreground">
                    The average ACCA student needs 150-200 hours per paper. That's just 12-15 hours per week over 12 weeks, or 2 hours per day. The challenge isn't the quantity - it's the consistency and quality of those hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">1. Audit Your Time</h2>
          
          <h3 className="text-2xl font-bold mt-8 mb-4">Track Where Your Time Actually Goes</h3>
          <p className="mb-4">
            Before creating a new schedule, understand your current time usage. For one week, track how you spend every hour:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Fixed Commitments (Can't Change)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Work hours (including commute)</li>
                    <li>• Sleep (7-8 hours minimum)</li>
                    <li>• Family obligations</li>
                    <li>• Essential household tasks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Flexible Activities (Can Be Optimized)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Social media scrolling</li>
                    <li>• TV and streaming</li>
                    <li>• Gaming</li>
                    <li>• Extended meal times</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Hidden Study Opportunities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Commute time</li>
                    <li>• Lunch breaks</li>
                    <li>• Early mornings</li>
                    <li>• Weekend mornings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Identify Your Time Leaks</h3>
          <p className="mb-4">
            Most people waste 2-3 hours daily on low-value activities without realizing it. Common time leaks:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <span>Social media (average 2.5 hours per day for adults)</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <span>Mindless TV watching</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <span>Excessive meeting attendance at work</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
              <span>Procrastination and indecision</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">2. Design Your Ideal Study Schedule</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Match Study to Your Energy Levels</h3>
          <p className="mb-4">
            Different times of day suit different study activities:
          </p>
          <div className="grid md:grid-cols-3 gap-4 my-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">🌅 Morning (6-9 AM)</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Best for:</strong> Complex topics, calculations, new material
                </p>
                <p className="text-xs text-muted-foreground">
                  Your brain is fresh and able to handle difficult concepts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">☀️ Afternoon (12-2 PM)</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Best for:</strong> Practice questions, active recall
                </p>
                <p className="text-xs text-muted-foreground">
                  Good for applying what you learned in the morning.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">🌙 Evening (7-10 PM)</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Best for:</strong> Review, flashcards, light reading
                </p>
                <p className="text-xs text-muted-foreground">
                  Your brain consolidates learning during sleep, so review before bed.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-bold mt-8 mb-4">Weekly Study Schedule Templates</h3>
          
          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Template A: Full-Time Worker (15 hours/week)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Monday - Friday</span>
                  <span>6:30-8:00 AM (1.5h) + Lunch (0.5h) = 2h/day × 5 = <strong>10 hours</strong></span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Saturday</span>
                  <span>9:00 AM - 1:00 PM = <strong>4 hours</strong></span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Sunday</span>
                  <span>Review only (flashcards, light reading) = <strong>1 hour</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Template B: Parent with Family (12 hours/week)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Monday, Wednesday, Friday</span>
                  <span>9:00-11:00 PM after kids sleep = <strong>6 hours</strong></span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Tuesday, Thursday</span>
                  <span>Lunch break = <strong>2 hours</strong></span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Saturday/Sunday</span>
                  <span>Early morning before family wakes = <strong>4 hours</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">3. Maximize Study Efficiency</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">The Pomodoro Technique</h3>
          <p className="mb-4">
            One of the most effective time management methods for studying:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">25</span>
                  <div>
                    <p className="font-semibold">Minutes of Focused Study</p>
                    <p className="text-sm text-muted-foreground">
                      No distractions, phone away, single task only
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">5</span>
                  <div>
                    <p className="font-semibold">Minute Break</p>
                    <p className="text-sm text-muted-foreground">
                      Stretch, walk, get water - but no phone or social media
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">4</span>
                  <div>
                    <p className="font-semibold">Pomodoros, Then Longer Break</p>
                    <p className="text-sm text-muted-foreground">
                      After 4 cycles (2 hours), take a 15-30 minute break
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Batch Similar Activities</h3>
          <p className="mb-4">
            Group similar tasks together to reduce context switching:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>All reading in one session, not scattered throughout the day</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Dedicated practice question sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Review all flashcards in one go</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Watch all lecture videos on one topic together</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">4. Leverage "Dead Time"</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Turn Wasted Time Into Study Time</h3>
          <p className="mb-4">
            Most people have 1-2 hours of "dead time" daily that can be converted into productive study:
          </p>
          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">🚗 Commute (30-60 min/day)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Listen to recorded lectures or audio notes</li>
                    <li>• Mental recall of yesterday's topics</li>
                    <li>• Podcast-style ACCA content</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">🍽️ Lunch Break (15-30 min)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Quick flashcard review on phone app</li>
                    <li>• Read one page of notes</li>
                    <li>• Practice mental calculations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">⏳ Waiting Time (10-20 min/day)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Appointments, queues, etc.</li>
                    <li>• Always have flashcards on your phone</li>
                    <li>• Review key formulas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">🏋️ Exercise (30-45 min)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Listen to lectures while walking/jogging</li>
                    <li>• Mental review during cardio</li>
                    <li>• Don't sacrifice health, but multitask when possible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">5. Balance Work and Study</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Communicate at Work</h3>
          <p className="mb-4">
            Your employer and colleagues should know you're studying:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Request exam leave in advance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Ask about study support programs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Block lunch breaks for study in your calendar</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Decline non-essential meetings near exam time</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-4">Set Boundaries</h3>
          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <p className="mb-4 font-semibold">Protected Study Time = Non-Negotiable Appointments</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Tell family/friends when you're unavailable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Use "Do Not Disturb" mode on devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Have a dedicated study space</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Learn to say no to social invitations during peak study periods</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">6. Prevent Burnout</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Schedule Rest Days</h3>
          <p className="mb-4">
            Recovery is not optional - it's essential for long-term success:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">One Full Rest Day Per Week</p>
                    <p className="text-sm text-muted-foreground">
                      No studying at all - guilt-free relaxation
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Maintain Sleep Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      7-8 hours minimum - don't sacrifice sleep for study
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Exercise Regularly</p>
                    <p className="text-sm text-muted-foreground">
                      30 minutes, 3-4 times per week improves focus and retention
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Social Connection</p>
                    <p className="text-sm text-muted-foreground">
                      Make time for friends/family - isolation hurts motivation
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Warning Signs of Burnout</h3>
          <Card className="my-6 bg-destructive/5 border-destructive/20">
            <CardContent className="p-6">
              <p className="font-semibold mb-3">If you experience these, take an immediate break:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Constant fatigue despite adequate sleep</li>
                <li>• Inability to concentrate or retain information</li>
                <li>• Irritability and mood swings</li>
                <li>• Physical symptoms (headaches, stomach issues)</li>
                <li>• Loss of motivation or feelings of hopelessness</li>
                <li>• Avoiding study despite having time</li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">7. Technology and Tools</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Productivity Apps</h3>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">Time Management</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Forest</strong> - Stay focused, don't touch phone</li>
                  <li>• <strong>Toggl</strong> - Track study hours</li>
                  <li>• <strong>Google Calendar</strong> - Block study time</li>
                  <li>• <strong>RescueTime</strong> - Analyze time usage</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">Focus Tools</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Cold Turkey</strong> - Block distracting sites</li>
                  <li>• <strong>Freedom</strong> - Block apps across devices</li>
                  <li>• <strong>Brain.fm</strong> - Focus-enhancing music</li>
                  <li>• <strong>Outcomeo</strong> - ACCA-specific study planner</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Conclusion</h2>
          <p className="mb-4">
            Effective time management for ACCA isn't about superhuman discipline or working 18-hour days. It's about being intentional with your time, protecting your study hours, and making small optimizations that compound over weeks and months.
          </p>
          <p className="mb-6">
            Remember: consistency beats intensity. Two focused hours daily is far more effective than one exhausting 14-hour weekend session. Build sustainable habits, and you'll not only pass your exams but maintain your health, relationships, and sanity in the process.
          </p>

          <Card className="my-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Let Outcomeo Manage Your Schedule</h3>
              <p className="text-muted-foreground mb-6">
                Get personalized study plans that fit your work schedule, track your time automatically, and stay on target for exam success.
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

export default TimeManagement;
