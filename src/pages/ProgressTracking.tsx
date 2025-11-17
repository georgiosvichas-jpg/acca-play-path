import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface SessionData {
  date: string;
  accuracy: number;
  total_questions: number;
  unit_code?: string;
}

interface TrendData {
  period: string;
  accuracy: number;
  questions: number;
}

interface UnitTrendData {
  period: string;
  [key: string]: number | string;
}

export default function ProgressTracking() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("raw_log", "is", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process sessions into a format we can use
      const processedSessions: SessionData[] = [];
      const unitsSet = new Set<string>();

      data?.forEach(session => {
        const date = new Date(session.created_at!).toLocaleDateString();
        const accuracy = session.total_questions 
          ? (session.correct_answers / session.total_questions) * 100 
          : 0;

        processedSessions.push({
          date,
          accuracy,
          total_questions: session.total_questions || 0
        });

        // Extract units from raw_log
        if (session.raw_log && Array.isArray(session.raw_log)) {
          session.raw_log.forEach((entry: any) => {
            if (entry.unit_code) {
              unitsSet.add(entry.unit_code);
              
              processedSessions.push({
                date,
                accuracy: entry.correct ? 100 : 0,
                total_questions: 1,
                unit_code: entry.unit_code
              });
            }
          });
        }
      });

      setSessions(processedSessions);
      setAvailableUnits(Array.from(unitsSet).sort());
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (): TrendData[] => {
    const now = new Date();
    let filteredSessions = sessions;

    // Filter by time range
    if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredSessions = sessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Filter by unit if selected
    if (selectedUnit !== "all") {
      filteredSessions = filteredSessions.filter(s => s.unit_code === selectedUnit);
    } else {
      // Only include overall sessions (no unit_code)
      filteredSessions = filteredSessions.filter(s => !s.unit_code);
    }

    // Group by date
    const grouped = filteredSessions.reduce((acc, session) => {
      const period = session.date;
      if (!acc[period]) {
        acc[period] = { accuracy: 0, questions: 0, count: 0 };
      }
      acc[period].accuracy += session.accuracy;
      acc[period].questions += session.total_questions;
      acc[period].count += 1;
      return acc;
    }, {} as Record<string, { accuracy: number; questions: number; count: number }>);

    // Convert to array and calculate averages
    return Object.entries(grouped).map(([period, data]) => ({
      period,
      accuracy: Math.round(data.accuracy / data.count),
      questions: data.questions
    }));
  };

  const getUnitTrendData = (): UnitTrendData[] => {
    const now = new Date();
    let filteredSessions = sessions.filter(s => s.unit_code);

    // Filter by time range
    if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredSessions = filteredSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredSessions = filteredSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Group by date and unit
    const grouped = filteredSessions.reduce((acc, session) => {
      const period = session.date;
      const unit = session.unit_code!;
      
      if (!acc[period]) {
        acc[period] = {};
      }
      if (!acc[period][unit]) {
        acc[period][unit] = { accuracy: 0, count: 0 };
      }
      
      acc[period][unit].accuracy += session.accuracy;
      acc[period][unit].count += 1;
      
      return acc;
    }, {} as Record<string, Record<string, { accuracy: number; count: number }>>);

    // Convert to array format for chart
    return Object.entries(grouped).map(([period, units]) => {
      const data: UnitTrendData = { period };
      Object.entries(units).forEach(([unit, stats]) => {
        data[unit] = Math.round(stats.accuracy / stats.count);
      });
      return data;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">Loading progress data...</div>
      </div>
    );
  }

  const overallData = getFilteredData();
  const unitTrendData = getUnitTrendData();
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Visualize your improvement over time</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overall">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overall Progress
          </TabsTrigger>
          <TabsTrigger value="units">
            <BarChart3 className="h-4 w-4 mr-2" />
            By Unit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          {overallData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No data available for the selected time range.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Trend</CardTitle>
                  <CardDescription>Your accuracy percentage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overallData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Accuracy (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Questions Attempted</CardTitle>
                  <CardDescription>Number of questions you've practiced</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="questions" fill="#10b981" name="Questions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <div className="flex gap-3">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {availableUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUnit === "all" ? (
            unitTrendData.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No unit data available for the selected time range.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Unit Performance Comparison</CardTitle>
                  <CardDescription>Compare accuracy across all units</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={unitTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {availableUnits.slice(0, 6).map((unit, idx) => (
                        <Line 
                          key={unit}
                          type="monotone" 
                          dataKey={unit} 
                          stroke={colors[idx % colors.length]} 
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          ) : (
            overallData.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No data available for {selectedUnit} in the selected time range.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedUnit} Progress</CardTitle>
                  <CardDescription>Your performance on {selectedUnit} questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overallData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Accuracy (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
