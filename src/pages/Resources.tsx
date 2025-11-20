import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, BookOpen, FileText, Video, Headphones, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Resources = () => {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Study Guides",
      description: "Comprehensive guides covering all ACCA papers",
      items: [
        "Complete syllabus breakdowns",
        "Key concept summaries",
        "Exam technique tips",
        "Time management strategies"
      ]
    },
    {
      icon: FileText,
      title: "Practice Materials",
      description: "Free questions and mock exams to test your knowledge",
      items: [
        "Sample question banks",
        "Past paper questions",
        "Mini practice tests",
        "Solutions and explanations"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Visual learning resources for complex topics",
      items: [
        "Topic introduction videos",
        "Worked example walkthroughs",
        "Exam technique demonstrations",
        "Quick revision clips"
      ]
    },
    {
      icon: Headphones,
      title: "Audio Resources",
      description: "Study on the go with audio content",
      items: [
        "Podcast-style lessons",
        "Key points audio summaries",
        "Revision audio tracks",
        "Motivational content"
      ]
    }
  ];

  const downloadableResources = [
    {
      title: "ACCA Study Planner Template",
      description: "A customizable Excel template to plan your study schedule",
      format: "XLSX",
      size: "2.4 MB"
    },
    {
      title: "Flashcard Starter Pack",
      description: "500+ essential flashcards covering key topics",
      format: "PDF",
      size: "8.1 MB"
    },
    {
      title: "Formula Sheet Collection",
      description: "All important formulas for quantitative papers",
      format: "PDF",
      size: "1.8 MB"
    },
    {
      title: "Exam Technique Guide",
      description: "Proven strategies to maximize your exam performance",
      format: "PDF",
      size: "3.2 MB"
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
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
          Free ACCA Study Resources
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Access our collection of free study materials, practice questions, and learning resources
          to boost your ACCA exam preparation.
        </p>
      </section>

      {/* Resource Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {resourceCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Downloadable Resources</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get instant access to our carefully curated collection of study materials
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {downloadableResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-8 w-8 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {resource.format}
                  </span>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="text-sm">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{resource.size}</span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Want More?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sign up for free to unlock personalized study plans, advanced analytics,
              and AI-powered coaching to accelerate your ACCA journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
