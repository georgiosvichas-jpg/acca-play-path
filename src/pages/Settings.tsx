import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import { useSubscription } from "@/hooks/useSubscription";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings as SettingsIcon, User, Globe, Shield, BookOpen, HelpCircle, CreditCard, ExternalLink, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { BTQuestionImporter } from "@/components/BTQuestionImporter";
import { FAQuestionImporter } from "@/components/FAQuestionImporter";
import { FRQuestionImporter } from "@/components/FRQuestionImporter";
import { LWQuestionImporter } from "@/components/LWQuestionImporter";
import { MAQuestionImporter } from "@/components/MAQuestionImporter";
import PMQuestionImporter from "@/components/PMQuestionImporter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string | null;
  paid: boolean;
  created: number;
  period_start: number;
  period_end: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

const settingsSchema = z.object({
  displayName: z.string()
    .max(100, "Display name must be less than 100 characters")
    .optional()
    .transform(val => val?.trim() || null),
  country: z.string().optional(),
  selectedPapers: z.array(z.string())
    .min(1, "Please select at least one paper")
});

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "China",
  "Japan",
  "Brazil",
  "South Africa",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "Saudi Arabia",
  "Nigeria",
  "Kenya",
  "Pakistan",
  "Bangladesh",
  "Malaysia",
  "Other",
];

export default function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useUserProfile();
  const { papers, loading: papersLoading } = usePapers();
  const { planType, isSubscribed, subscriptionEnd, openCustomerPortal } = useSubscription();
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCountry(profile.country || "");
      setIsOptedOut(profile.is_opted_out_of_leaderboard || false);
      setSelectedPapers(profile.selected_papers || []);
    }
  }, [profile]);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isSubscribed) return;
      
      setLoadingInvoices(true);
      try {
        const { data, error } = await supabase.functions.invoke("billing-history");
        
        if (error) throw error;
        
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Error fetching billing history:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [isSubscribed]);

  const togglePaper = (paperCode: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperCode)
        ? prev.filter(p => p !== paperCode)
        : [...prev, paperCode]
    );
  };

  const handleSave = async () => {
    setErrors({});

    // Validate inputs
    const validation = settingsSchema.safeParse({
      displayName,
      country,
      selectedPapers
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]);
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        display_name: validation.data.displayName,
        country: validation.data.country || null,
        is_opted_out_of_leaderboard: isOptedOut,
        selected_papers: validation.data.selectedPapers,
        selected_paper: validation.data.selectedPapers[0], // Keep for backward compatibility
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRestartTour = () => {
    if ((window as any).restartNavigationTour) {
      (window as any).restartNavigationTour();
      toast.success("Starting guided tour...");
    } else {
      toast.error("Tour not available");
    }
  };

  const handleReopenChecklist = () => {
    if ((window as any).reopenOnboardingChecklist) {
      (window as any).reopenOnboardingChecklist();
      toast.success("Checklist reopened!");
    } else {
      toast.error("Checklist not available");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading settings...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <main className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>
            <p className="text-muted-foreground ml-15">
              Manage your profile and leaderboard preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Study Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Study Preferences
                </CardTitle>
                <CardDescription>
                  Select the ACCA papers you're currently studying
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Selected Papers ({selectedPapers.length})</Label>
                  {papersLoading ? (
                    <div className="text-sm text-muted-foreground">Loading papers...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {papers.map((paper) => (
                        <div
                          key={paper.id}
                          className={cn(
                            "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                            selectedPapers.includes(paper.paper_code)
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50"
                          )}
                          onClick={() => {
                            togglePaper(paper.paper_code);
                            setErrors(prev => ({ ...prev, selectedPapers: "" }));
                          }}
                        >
                          <Checkbox
                            id={paper.paper_code}
                            checked={selectedPapers.includes(paper.paper_code)}
                            onCheckedChange={() => {
                              togglePaper(paper.paper_code);
                              setErrors(prev => ({ ...prev, selectedPapers: "" }));
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={paper.paper_code}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {paper.paper_code}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {paper.title}
                            </p>
                            <span className={cn(
                              "text-xs mt-1 inline-block px-2 py-0.5 rounded",
                              paper.level === "Applied Skills" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-purple-100 text-purple-700"
                            )}>
                              {paper.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.selectedPapers && (
                    <p className="text-sm text-red-500">{errors.selectedPapers}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Your flashcards and study plan will be based on these papers
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your display name and country appear on the leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setErrors(prev => ({ ...prev, displayName: "" }));
                    }}
                    maxLength={100}
                    className={errors.displayName ? "border-red-500" : ""}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-500">{errors.displayName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave blank to show as "Learner-{user?.id.slice(0, 4)}"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Used for country-specific leaderboard rankings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your visibility on public leaderboards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="opt-out">Hide me from public leaderboards</Label>
                    <p className="text-sm text-muted-foreground">
                      You can still view leaderboards and track your own progress
                    </p>
                  </div>
                  <Switch
                    id="opt-out"
                    checked={isOptedOut}
                    onCheckedChange={setIsOptedOut}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Created</span>
                  <span className="text-sm font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  Manage your billing and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="text-sm font-semibold capitalize">
                    {planType === "free" && <span className="text-muted-foreground">Free</span>}
                    {planType === "pro" && <span className="text-primary">Pro</span>}
                    {planType === "elite" && <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Elite</span>}
                  </span>
                </div>
                
                {isSubscribed && subscriptionEnd && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Renewal Date</span>
                    <span className="text-sm font-medium">
                      {new Date(subscriptionEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {planType === "free" ? (
                  <Button asChild className="w-full">
                    <Link to="/checkout">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={openCustomerPortal} 
                    variant="outline" 
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {planType === "free" 
                    ? "Upgrade to unlock unlimited access to all features"
                    : "Update payment method, view invoices, or cancel subscription"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Billing History */}
            {isSubscribed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Billing History
                  </CardTitle>
                  <CardDescription>
                    View and download your past invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingInvoices ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      Loading invoices...
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No invoices found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {invoice.number || invoice.id}
                              </span>
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  invoice.paid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                )}
                              >
                                {invoice.paid ? "Paid" : invoice.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.created * 1000).toLocaleDateString()} •{" "}
                              {invoice.currency} {invoice.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Period: {new Date(invoice.period_start * 1000).toLocaleDateString()} -{" "}
                              {new Date(invoice.period_end * 1000).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {invoice.invoice_pdf && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={invoice.invoice_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {invoice.hosted_invoice_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={invoice.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Invoice
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Data Management - Question Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Import Question Banks
                </CardTitle>
                <CardDescription>
                  Import questions for practice quizzes, mock exams, and spaced repetition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="BT">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="BT">BT</TabsTrigger>
                    <TabsTrigger value="MA">MA</TabsTrigger>
                    <TabsTrigger value="FA">FA</TabsTrigger>
                    <TabsTrigger value="LW">LW</TabsTrigger>
                    <TabsTrigger value="FR">FR</TabsTrigger>
                    <TabsTrigger value="PM">PM</TabsTrigger>
                  </TabsList>
                  <TabsContent value="BT" className="mt-4">
                    <BTQuestionImporter />
                  </TabsContent>
                  <TabsContent value="MA" className="mt-4">
                    <MAQuestionImporter />
                  </TabsContent>
                  <TabsContent value="FA" className="mt-4">
                    <FAQuestionImporter />
                  </TabsContent>
                  <TabsContent value="LW" className="mt-4">
                    <LWQuestionImporter />
                  </TabsContent>
                  <TabsContent value="FR" className="mt-4">
                    <FRQuestionImporter />
                  </TabsContent>
                  <TabsContent value="PM" className="mt-4">
                    <PMQuestionImporter />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Help & Support
                </CardTitle>
                <CardDescription>
                  Get help using ACCA Master
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleRestartTour}
                  variant="outline"
                  className="w-full"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Restart Guided Tour
                </Button>
                <Button 
                  onClick={handleReopenChecklist}
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Show Onboarding Checklist
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
