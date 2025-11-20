import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Target, CheckCircle, ArrowLeft, Lightbulb, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const ExamTechniques = () => {
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
            Master ACCA Exam Techniques: Proven Strategies to Maximize Your Marks
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Learn professional exam techniques that top performers use to ace their ACCA papers
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              12 min read
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Knowing the material is only half the battle. How you present your knowledge in the exam room determines your final grade. These proven techniques will help you maximize marks and demonstrate your understanding effectively.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">The Golden Rule</h3>
                  <p className="text-muted-foreground">
                    ACCA exams reward application and analysis, not just memorization. Show your thinking process, explain your reasoning, and always relate answers back to the scenario given.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">1. Reading and Planning (First 15 Minutes)</h2>
          
          <h3 className="text-2xl font-bold mt-8 mb-4">Read ALL Requirements First</h3>
          <p className="mb-4">
            Before diving into questions, spend 10-15 minutes reading through the entire exam. This helps you:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Identify easier questions to tackle first</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Spot connections between different requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Allow your subconscious to process difficult questions while you work on others</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Plan your time allocation based on marks available</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-4">Underline Key Words</h3>
          <p className="mb-4">
            As you read, underline or highlight command words and key information:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-3 text-primary">Command Words to Watch:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Explain</strong> - Why something happens</li>
                    <li>• <strong>Discuss</strong> - Pros and cons</li>
                    <li>• <strong>Evaluate</strong> - Assess with conclusion</li>
                    <li>• <strong>Calculate</strong> - Show workings</li>
                    <li>• <strong>Recommend</strong> - Suggest best option</li>
                    <li>• <strong>Advise</strong> - Professional guidance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-primary">Key Information:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Company names and roles</li>
                    <li>• Specific figures and dates</li>
                    <li>• Problems mentioned</li>
                    <li>• Stakeholders involved</li>
                    <li>• Time constraints</li>
                    <li>• Limiting factors</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">2. Strategic Question Selection</h2>
          
          <h3 className="text-2xl font-bold mt-8 mb-4">Start With What You Know Best</h3>
          <p className="mb-4">
            Don't necessarily answer questions in order. Start with questions where you:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Feel most confident about the topic</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Can quickly earn marks to build momentum</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Understand the requirements clearly</span>
            </li>
          </ul>

          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-2">Pro Tip: Build Confidence Early</h4>
                  <p className="text-sm text-muted-foreground">
                    Starting with an easier question builds confidence and gets marks on the board quickly. This psychological boost helps with harder questions later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">3. Structuring Your Answers</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Use Clear Headings and Paragraphs</h3>
          <p className="mb-4">
            Examiners appreciate well-structured answers. Use this format:
          </p>
          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Introduction (1-2 sentences)</h4>
                  <p className="text-sm text-muted-foreground">Briefly state what you will cover and your conclusion</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Main Body (Use sub-headings)</h4>
                  <p className="text-sm text-muted-foreground">Each point in its own paragraph with clear headings</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Conclusion (2-3 sentences)</h4>
                  <p className="text-sm text-muted-foreground">Summarize key points and give final recommendation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">The AIDA Framework for Discursive Questions</h3>
          <p className="mb-4">
            For discussion or evaluation questions, use AIDA:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-[120px]">Assert:</span>
              <span>Make your point clearly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-[120px]">Illustrate:</span>
              <span>Give an example from the scenario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-[120px]">Develop:</span>
              <span>Explain the implications or consequences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-[120px]">Apply:</span>
              <span>Relate it back to the specific context</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">4. Calculation Questions</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Always Show Your Workings</h3>
          <p className="mb-4">
            Even if your final answer is wrong, you can still earn method marks by showing clear workings:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Label every step clearly</p>
                    <p className="text-sm text-muted-foreground">Show what you're calculating at each stage</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Use formulae explicitly</p>
                    <p className="text-sm text-muted-foreground">Write out the formula before substituting numbers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Layout matters</p>
                    <p className="text-sm text-muted-foreground">Use columns, tables, or clear formatting</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">State your answer clearly</p>
                    <p className="text-sm text-muted-foreground">Underline or box final answers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Round Appropriately</h3>
          <p className="mb-4">
            Unless specified otherwise, round to 2 decimal places for money and percentages. Be consistent throughout your answer.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">5. Time Management Within Questions</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">The 1.8 Minute Rule</h3>
          <p className="mb-4">
            For a 3-hour exam (180 minutes) with 100 marks available:
          </p>
          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="font-bold text-lg">1 mark = 1.8 minutes</p>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>5 marks</strong> = 9 minutes</li>
                  <li>• <strong>10 marks</strong> = 18 minutes</li>
                  <li>• <strong>15 marks</strong> = 27 minutes</li>
                  <li>• <strong>20 marks</strong> = 36 minutes</li>
                  <li>• <strong>25 marks</strong> = 45 minutes</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Keep a running total and check your watch regularly. Move on if you exceed your allocated time.
                </p>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">What to Do When Stuck</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Write what you know - partial marks are better than zero</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Move to the next requirement or question</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Leave space to return later if time permits</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Don't waste time on one difficult mark when easier marks are available elsewhere</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">6. Written Communication Skills</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Professional Marks Matter</h3>
          <p className="mb-4">
            Many papers award professional marks (typically 4-5 marks) for:
          </p>
          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Appropriate format</p>
                    <p className="text-sm text-muted-foreground">Use the correct format (report, memo, letter) with proper headers</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Clear structure</p>
                    <p className="text-sm text-muted-foreground">Logical flow with headings, paragraphs, and conclusions</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Professional language</p>
                    <p className="text-sm text-muted-foreground">Formal tone, clear expression, no slang or abbreviations</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Persuasive argument</p>
                    <p className="text-sm text-muted-foreground">Build a coherent case with evidence and reasoning</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Use Business-Appropriate Language</h3>
          <p className="mb-4">
            Remember you're often writing as a professional advisor:
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Avoid
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "I think..."</li>
                  <li>• "Maybe you should..."</li>
                  <li>• Informal contractions (don't, can't)</li>
                  <li>• Vague terms (quite, very, lots)</li>
                  <li>• Personal opinions without justification</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Use
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "It is recommended..."</li>
                  <li>• "The analysis suggests..."</li>
                  <li>• Full words (do not, cannot)</li>
                  <li>• Specific terms (significantly, substantially)</li>
                  <li>• Evidence-based conclusions</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">7. Scenario Application</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Always Apply to the Scenario</h3>
          <p className="mb-4">
            Generic textbook answers score lower than applied answers. Use specific details from the scenario:
          </p>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-destructive mb-2">❌ Generic Answer:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "The company should improve internal controls to reduce risk."
                  </p>
                </div>
                <div>
                  <p className="font-bold text-primary mb-2">✅ Applied Answer:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "Given that ABC Co has recently expanded into three new countries, segregation of duties in the purchasing department should be strengthened. The scenario indicates only two staff handle all purchases, creating an unacceptable concentration of power that could lead to fraud, as evidenced by the recent unauthorized expense claims mentioned."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Use Names, Figures, and Specific Details</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Reference company names from the scenario</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Quote specific figures mentioned</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Refer to individuals by role (e.g., "the Finance Director")</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span>Cite problems or situations explicitly described</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">8. Final Review (Last 10 Minutes)</h2>

          <p className="mb-4">
            Always save 10 minutes at the end to:
          </p>
          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Check you've answered all requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Add any quick points you missed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Check calculations for obvious errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Ensure all workings are clearly labeled</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Make sure your writing is legible</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Key Takeaways</h2>
          <Card className="my-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Read everything first</strong> and plan your approach strategically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Structure answers clearly</strong> with headings and proper formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Always show workings</strong> in calculations for method marks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Apply to the scenario</strong> using specific names, figures, and details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Manage time strictly</strong> using the 1.8-minute rule per mark</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Write professionally</strong> to earn those valuable professional marks</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <p className="mb-6">
            Mastering these exam techniques takes practice. The more past papers you complete under timed conditions, the more natural these strategies will become. Remember, it's not just what you know, but how you demonstrate that knowledge in the exam hall.
          </p>

          <Card className="my-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Practice Makes Perfect</h3>
              <p className="text-muted-foreground mb-6">
                Apply these techniques with Outcomeo's timed mock exams and get instant feedback on your exam performance.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Start Practicing Now
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

export default ExamTechniques;
