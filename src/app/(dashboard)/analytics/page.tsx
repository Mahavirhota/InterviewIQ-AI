"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Award,
  AlertTriangle,
  History,
  Calendar,
} from "lucide-react";

interface SkillItem {
  skillName: string;
  score: number;
}

interface TrendItem {
  id: string;
  date: string;
  score: number;
  label: string;
}

interface AnalyticsData {
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    totalQuestionsAnswered: number;
    totalPracticeTimeMinutes: number;
    completionRate: number;
  };
  skills: SkillItem[];
  strengths: SkillItem[];
  weaknesses: SkillItem[];
  scoreTrend: TrendItem[];
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const json = await response.json();
        setData(json);
      } catch (err: unknown) {
        console.error("Analytics Fetch Error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while loading analytics.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-red-400 font-semibold mb-4">{error || "Data load failure."}</p>
        <Button onClick={() => window.location.reload()}>Retry Load</Button>
      </div>
    );
  }

  const { strengths, weaknesses, scoreTrend } = data;

  // --- SVG CHART COORDINATES CALCULATOR ---
  // Renders a sleek responsive SVG Line Chart
  const renderTrendChart = () => {
    if (scoreTrend.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-muted/10">
          <Calendar className="h-8 w-8 mb-2 text-muted-foreground/60" />
          <span>Complete your first interview to generate a trend line.</span>
        </div>
      );
    }

    const width = 600;
    const height = 240;
    const padding = 40;

    // Minimum 2 points to draw a line, otherwise draw a single node
    const points = scoreTrend.map((item, idx) => {
      const x = padding + (idx / (scoreTrend.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (item.score / 100) * (height - padding * 2);
      return { x, y, score: item.score, date: item.date, label: item.label };
    });

    // Create SVG Path string
    let pathD = "";
    let areaD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      areaD = `M ${points[0].x} ${height - padding} L ${points[0].x} ${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
        areaD += ` L ${points[i].x} ${points[i].y}`;
      }
      areaD += ` L ${points[points.length - 1].x} ${height - padding} Z`;
    }

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto overflow-visible" aria-hidden="true">
          <defs>
            {/* Sleek Purple Line Gradient */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - padding - (level / 100) * (height - padding * 2);
            return (
              <g key={level}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 4} textAnchor="end" fill="#71717a" className="text-[10px] font-mono">
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Glowing Area under the curve */}
          {points.length > 1 && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Solid line path */}
          {points.length > 1 && (
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Data point nodes */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#09090b"
                stroke="#6366f1"
                strokeWidth="3"
                className="transition-all duration-200 hover:r-8"
              />
              {/* Tooltip elements on hover */}
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#fafafa" className="text-[10px] font-bold font-mono opacity-0 group-hover:opacity-100 bg-zinc-950 px-1 py-0.5 rounded transition-opacity">
                {pt.score}%
              </text>
              {/* Date label at the bottom */}
              {scoreTrend.length < 8 && (
                <text x={pt.x} y={height - padding + 18} textAnchor="middle" fill="#71717a" className="text-[9px]">
                  {pt.date}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Performance Insights</h1>
        <p className="text-muted-foreground mt-1">Deep analytics on your interview strengths, weaknesses, and history.</p>
      </div>

      {/* Main Grid: Trend Chart & Skill Highlights */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Score Trend (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Score Progression
            </CardTitle>
            <CardDescription>
              Your completed interview scores plotted chronologically to visualize growth.
            </CardDescription>
          </CardHeader>
          <CardContent>{renderTrendChart()}</CardContent>
        </Card>

        {/* Strength & Weakness Breakdown */}
        <div className="space-y-6">
          {/* Strengths Card */}
          <Card className="border-emerald-500/15 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Award className="h-4.5 w-4.5" />
                Demonstrated Strengths
              </CardTitle>
              <CardDescription className="text-xs">Competencies exceeding 70% benchmark</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {strengths.length > 0 ? (
                strengths.map((s) => (
                  <div key={s.skillName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{s.skillName}</span>
                      <span className="text-emerald-400">{s.score}%</span>
                    </div>
                    <Progress value={s.score} colorClassName="bg-emerald-500" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  Maintain consistency. Strengths will populate as your scores increase.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Weaknesses Card */}
          <Card className="border-amber-500/15 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                Focus Areas / Weaknesses
              </CardTitle>
              <CardDescription className="text-xs">Skills to prioritize for upcoming rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weaknesses.length > 0 ? (
                weaknesses.map((w) => (
                  <div key={w.skillName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{w.skillName}</span>
                      <span className="text-amber-400">{w.score}%</span>
                    </div>
                    <Progress value={w.score} colorClassName="bg-amber-500" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  Excellent. No critical weak areas currently flagged.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Interview History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Interview History Log
          </CardTitle>
          <CardDescription>
            Comprehensive list of all completed mock interview runs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scoreTrend.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm text-left border-collapse" aria-label="Mock Interview History">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3.5 pr-4">Target Role</th>
                    <th className="py-3.5 px-4">Focus Area</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 pl-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {scoreTrend.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="py-4 pr-4 font-semibold text-foreground">{item.label.split(" (")[0]}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.label}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.date}</td>
                      <td className="py-4 pl-4 text-right">
                        <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                          item.score >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                            : item.score >= 60
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                        }`}>
                          {item.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No historical data found. Finish an interview session to display history.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- SKELETON LOADER ---
function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="h-8 w-60 rounded-md bg-muted" />
        <div className="h-4 w-96 rounded-md bg-muted" />
      </div>

      {/* Split Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="h-5 w-40 rounded-md bg-muted" />
          <div className="h-3.5 w-72 rounded-md bg-muted" />
          <div className="h-64 w-full rounded-xl bg-muted mt-4" />
        </Card>

        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="h-5 w-36 rounded-md bg-muted" />
              <div className="h-3.5 w-52 rounded-md bg-muted" />
              <div className="space-y-3 pt-2">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-28 rounded-md bg-muted" />
                    <div className="h-2 w-full rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* History Card */}
      <Card className="p-6 space-y-4">
        <div className="h-5 w-40 rounded-md bg-muted" />
        <div className="h-3.5 w-72 rounded-md bg-muted" />
        <div className="h-40 w-full rounded-xl bg-muted mt-4" />
      </Card>
    </div>
  );
}
