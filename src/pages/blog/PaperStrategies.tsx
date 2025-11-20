import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, ArrowLeft, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PaperStrategies = () => {
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
            Paper-Specific Strategies: Tailored Approaches for Each ACCA Exam
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Customized study strategies for Applied Knowledge, Applied Skills, and Strategic Professional papers
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              March 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              15 min read
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Not all ACCA papers are created equal. Each level requires different skills, techniques, and preparation strategies. Understanding these differences is crucial for efficient study and exam success. This guide breaks down specific approaches for each paper category.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Key Insight</h3>
                  <p className="text-muted-foreground">
                    Applied Knowledge papers test recall and understanding. Applied Skills papers test application and analysis. Strategic Professional papers test synthesis and professional judgment. Your study strategy must evolve accordingly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Applied Knowledge Level (BT, MA, FA)</h2>
          
          <h3 className="text-2xl font-bold mt-8 mb-4">Paper Characteristics</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Format:</strong> Computer-based, 2 hours, objective test</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Questions:</strong> Multiple choice, multi-task, and matching</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Pass mark:</strong> 50%</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Focus:</strong> Knowledge recall and basic application</span>
            </li>
          </ul>

          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Specific Strategy for BT (Business & Technology)</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">✓ Memorization Techniques</p>
                  <p className="text-muted-foreground">Heavy emphasis on business models, theories, and frameworks. Use mnemonics, acronyms, and flashcards extensively.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Broad Coverage</p>
                  <p className="text-muted-foreground">Every syllabus area can be tested. Don't skip topics. 80% coverage = maximum 80% score.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Practice Under Time Pressure</p>
                  <p className="text-muted-foreground">You need to answer roughly 50 questions in 120 minutes. Speed matters. Do timed practice tests weekly.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Eliminate Wrong Answers</p>
                  <p className="text-muted-foreground">For MCQs, cross out obviously wrong options first. This improves your guessing odds from 25% to 50%.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Specific Strategy for MA (Management Accounting)</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">✓ Master Calculations</p>
                  <p className="text-muted-foreground">Heavy computation focus. Practice calculations until they're automatic. Know all formulas cold.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Understand, Don't Just Memorize</p>
                  <p className="text-muted-foreground">Questions test whether you truly understand concepts like cost behavior, not just formula recall.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Calculator Efficiency</p>
                  <p className="text-muted-foreground">Learn your calculator shortcuts. Shave seconds off each calculation to save minutes overall.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Watch for Tricky Wording</p>
                  <p className="text-muted-foreground">Questions often include red herrings or require you to identify what's relevant. Read carefully.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Specific Strategy for FA (Financial Accounting)</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">✓ Double-Entry Bookkeeping Mastery</p>
                  <p className="text-muted-foreground">Core skill. Practice T-accounts and journal entries until automatic. This underpins everything.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Standards Knowledge</p>
                  <p className="text-muted-foreground">Know key accounting standards and their requirements. Questions test specific standard provisions.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Financial Statement Preparation</p>
                  <p className="text-muted-foreground">Regularly practice preparing full financial statements from trial balance. Core exam requirement.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Adjustments Practice</p>
                  <p className="text-muted-foreground">Accruals, prepayments, depreciation, bad debts - practice these adjustments repeatedly.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Applied Skills Level (LW, PM, TX, FR, AA, FM)</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Paper Characteristics</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Format:</strong> Computer-based or written, 3 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Questions:</strong> Mix of objective test and constructed response</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Pass mark:</strong> 50%</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <span><strong>Focus:</strong> Application and analysis of knowledge</span>
            </li>
          </ul>

          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4">Key Differences from Applied Knowledge</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Scenarios are crucial:</strong> Questions based on realistic business contexts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Written answers required:</strong> Ability to explain and justify is tested</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Professional skills emerge:</strong> Communication, analysis, evaluation begin to matter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Calculations with narrative:</strong> Show workings AND explain what they mean</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Universal Applied Skills Strategies</h3>
          
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">1. Master Both Theory and Application</h4>
                  <p className="text-sm text-muted-foreground">
                    It's not enough to know definitions. You must be able to apply concepts to scenarios. Practice past papers extensively.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">2. Develop Written Communication Skills</h4>
                  <p className="text-sm text-muted-foreground">
                    Practice writing clear, concise explanations. Structure answers with headings. Make every word count.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">3. Time Management is Critical</h4>
                  <p className="text-sm text-muted-foreground">
                    Section A and Section B have different time pressures. Practice under timed conditions to find your rhythm.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">4. Answer Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Spend 2-3 minutes planning written answers. Quick bullet points prevent rambling and missed requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">Paper-Specific Applied Skills Strategies</h3>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-3">PM (Performance Management)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Heavy calculations but with business context - always interpret results</li>
                  <li>• Variance analysis is core - practice until automatic</li>
                  <li>• Understand the "why" behind techniques, not just how to do them</li>
                  <li>• Section C often tests newer syllabus areas - don't neglect them</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-3">FR (Financial Reporting)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Consolidated financial statements are heavily tested - master these</li>
                  <li>• Standards application is key - know key standards in detail</li>
                  <li>• Practice writing up adjustments systematically and quickly</li>
                  <li>• Show clear workings for all calculations - examiners follow your method</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-3">AA (Audit & Assurance)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Strong emphasis on professional skepticism and judgment</li>
                  <li>• ISAs (International Standards on Auditing) must be known well</li>
                  <li>• Questions test practical audit scenarios - think like an auditor</li>
                  <li>• Ethics and independence questions common - don't skip this area</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-3">FM (Financial Management)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Calculations heavy but must explain business implications</li>
                  <li>• Investment appraisal is core - know NPV, IRR, payback cold</li>
                  <li>• Working capital management appears in most exams</li>
                  <li>• Formulae are not provided - you must memorize all key formulas</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Strategic Professional Level</h2>

          <h3 className="text-2xl font-bold mt-8 mb-4">Overview</h3>
          <p className="mb-4">
            Strategic Professional papers (SBL, SBR, AFM, APM, ATX, AAA) test high-level professional competence. These papers require:
          </p>
          <Card className="my-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Integration of Knowledge</p>
                    <p className="text-sm text-muted-foreground">Combine learning from multiple previous papers</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Professional Judgment</p>
                    <p className="text-sm text-muted-foreground">No single right answer - justify your recommendations</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Complex Scenarios</p>
                    <p className="text-sm text-muted-foreground">Multi-faceted business problems requiring holistic solutions</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Professional Skills</p>
                    <p className="text-sm text-muted-foreground">Communication, commercial acumen, analysis, evaluation, skepticism</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">SBL (Strategic Business Leader) - The Cornerstone</h3>
          <Card className="my-6 bg-card border">
            <CardContent className="p-6">
              <p className="font-semibold mb-3">Unique Characteristics:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 4-hour exam (longer than other papers)</li>
                <li>• Based on pre-seen case study (released 7 weeks before exam)</li>
                <li>• Tests strategic thinking and leadership capability</li>
                <li>• Heavy emphasis on professional skills (50% of marks)</li>
              </ul>
              <p className="font-semibold mt-4 mb-3">Preparation Strategy:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Read pre-seen material thoroughly multiple times</li>
                <li>• Research the industry, competitors, and market trends</li>
                <li>• Create comprehensive notes on the company's situation</li>
                <li>• Practice exam technique with past pre-seen scenarios</li>
                <li>• Focus on recommendations and implementation, not just analysis</li>
              </ul>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold mt-8 mb-4">General Strategic Professional Strategies</h3>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">✓ Do This</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Think like a senior professional advisor</li>
                  <li>• Always recommend specific actions</li>
                  <li>• Consider practical implementation challenges</li>
                  <li>• Use real-world business knowledge</li>
                  <li>• Structure answers logically with clear conclusions</li>
                  <li>• Demonstrate commercial awareness</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">✗ Avoid This</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Textbook theory without application</li>
                  <li>• Listing points without explanation</li>
                  <li>• Ignoring the specific scenario context</li>
                  <li>• Vague, generic recommendations</li>
                  <li>• Poor written communication</li>
                  <li>• Focusing only on technical knowledge</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Cross-Paper Success Principles</h2>

          <Card className="my-6 bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">1. Read Examiner Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Every sitting, the examiner publishes reports explaining what students did well and poorly. These are gold dust - read them for your paper.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">2. Practice Past Papers Under Exam Conditions</h4>
                  <p className="text-sm text-muted-foreground">
                    No amount of studying replaces actual exam practice. Do at least 3-4 full past papers per exam under strict time limits.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">3. Understand Mark Schemes</h4>
                  <p className="text-sm text-muted-foreground">
                    Review mark schemes to understand what examiners reward. Often there are easy marks you're missing.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">4. Adapt Your Approach</h4>
                  <p className="text-sm text-muted-foreground">
                    What worked for Applied Knowledge won't work for Strategic Professional. Evolve your study strategy as you progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Conclusion</h2>
          <p className="mb-4">
            Understanding the unique demands of each paper allows you to tailor your preparation effectively. Don't make the mistake of using the same approach for every exam - what works for FA won't work for SBL.
          </p>
          <p className="mb-6">
            Research your specific paper thoroughly, understand what skills it tests, and adapt your study strategy accordingly. The students who succeed are those who prepare strategically, not just those who study the most hours.
          </p>

          <Card className="my-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Paper-Specific Study Plans</h3>
              <p className="text-muted-foreground mb-6">
                Get customized study plans tailored to your specific ACCA paper with Outcomeo's intelligent learning platform.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Start Your Journey
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

export default PaperStrategies;
