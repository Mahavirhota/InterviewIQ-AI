"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  History,
  Clock,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Activity as ActivityIcon,
  Plus
} from "lucide-react";

interface StatItem {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  totalPracticeTimeMinutes: number;
  completionRate: number;
}

interface SkillItem {
  skillName: string;
  score: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface DashboardData {
  stats: StatItem;
  skills: SkillItem[];
  strengths: SkillItem[];
  weaknesses: SkillItem[];
  activities: ActivityItem[];
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const json = await response.json();
        setData(json);
      } catch (err: unknown) {
        console.error("Dashboard Fetch Error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while loading your dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-red-400 font-semibold mb-4">{error || "Data load failure."}</p>
        <Button onClick={() => window.location.reload()}>Retry Load</Button>
      </div>
    );
  }

  const { stats, skills, activities } = data;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Track your progress and start your next practice session.</p>
        </div>
        <Link href="/generator">
          <Button className="rounded-xl glow-indigo">
            <Plus className="mr-2 h-5 w-5" />
            New Interview Session
          </Button>
        </Link>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Average Score */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Score
            </CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Trophy className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Target benchmark is 80%+</p>
          </CardContent>
        </Card>

        {/* KPI 2: Completed Interviews */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Sessions
            </CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{stats.completedInterviews}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalInterviews} sessions initiated</p>
          </CardContent>
        </Card>

        {/* KPI 3: Practice Time */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Practice Time
            </CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{stats.totalPracticeTimeMinutes}m</div>
            <p className="text-xs text-muted-foreground mt-1">Total minutes active in arena</p>
          </CardContent>
        </Card>

        {/* KPI 4: Answers Submitted */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Questions Answered
            </CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <History className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{stats.totalQuestionsAnswered}</div>
            <p className="text-xs text-muted-foreground mt-1">Individual responses graded</p>
          </CardContent>
        </Card>
      </div>

      {/* Start practicing banner CTA */}
      {stats.totalInterviews === 0 && (
        <Card className="border-indigo-500/20 bg-indigo-500/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-indigo-200 flex items-center justify-center md:justify-start gap-2">
              <BrainCircuit className="h-5.5 w-5.5 text-indigo-400" />
              Welcome to Your Mock Interview Arena!
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              You haven&apos;t started any interview sessions yet. Kick off your first session to generate customized questions and receive instant AI feedback.
            </p>
          </div>
          <Link href="/generator" className="w-full md:w-auto">
            <Button className="w-full md:w-auto rounded-xl shadow-lg shadow-indigo-500/20 glow-indigo">
              Start First Interview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Main Grid: Skills Scorecard & Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Skill Scorecard (2/3 width on large screens) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Skill Scorecard
            </CardTitle>
            <CardDescription>
              Your active competency profiles based on AI evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.skillName} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{skill.skillName}</span>
                    <span className="font-bold text-primary">{skill.score}%</span>
                  </div>
                  <Progress
                    value={skill.score}
                    colorClassName={
                      skill.score >= 80
                        ? "bg-emerald-500"
                        : skill.score >= 60
                        ? "bg-primary"
                        : "bg-amber-500"
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Complete an interview session to populate your skill competency scores.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Log of your practice sessions and milestones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-5">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3.5 text-sm">
                    <div className="mt-1 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-muted border border-border">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No recent activity. Get started by creating your first session.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- SKELETON LOADER FOR A PREMIUM INITIAL PAGE LOAD ---
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-muted" />
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded-md bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 rounded-md bg-muted" />
              <div className="h-3.5 w-32 rounded-md bg-muted" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Split */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-md bg-muted" />
            <div className="h-3.5 w-60 rounded-md bg-muted" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-28 rounded-md bg-muted" />
                <div className="h-4 w-10 rounded-md bg-muted" />
              </div>
              <div className="h-2 w-full rounded-full bg-muted" />
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-md bg-muted" />
            <div className="h-3.5 w-60 rounded-md bg-muted" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded-md bg-muted" />
                <div className="h-3 w-20 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
