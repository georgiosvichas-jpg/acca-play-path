import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePapers } from "@/hooks/usePapers";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings as SettingsIcon, User, Globe, Shield, BookOpen, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCountry(profile.country || "");
      setIsOptedOut(profile.is_opted_out_of_leaderboard || false);
      setSelectedPapers(profile.selected_papers || []);
    }
  }, [profile]);

  const togglePaper = (paperCode: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperCode)
        ? prev.filter(p => p !== paperCode)
        : [...prev, paperCode]
    );
  };

  const handleSave = async () => {
    if (selectedPapers.length === 0) {
      toast.error("Please select at least one paper");
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        country: country || null,
        is_opted_out_of_leaderboard: isOptedOut,
        selected_papers: selectedPapers,
        selected_paper: selectedPapers[0], // Keep for backward compatibility
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
        <Navigation />

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
                          onClick={() => togglePaper(paper.paper_code)}
                        >
                          <Checkbox
                            id={paper.paper_code}
                            checked={selectedPapers.includes(paper.paper_code)}
                            onCheckedChange={() => togglePaper(paper.paper_code)}
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
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                  />
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
              <CardContent>
                <Button 
                  onClick={handleRestartTour}
                  variant="outline"
                  className="w-full"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Restart Guided Tour
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
