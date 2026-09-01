"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Wand2, Terminal, ShieldAlert } from "lucide-react";

const loadingSteps = [
  "Spinning up AI interviewer...",
  "Reviewing role requirements...",
  "Generating custom questions...",
  "Tailoring evaluation rubrics...",
  "Finalizing interview arena...",
];

export default function GeneratorPage() {
  const router = useRouter();
  
  // Form States
  const [role, setRole] = React.useState("Frontend Engineer");
  const [topic, setTopic] = React.useState("React & JavaScript");
  const [difficulty, setDifficulty] = React.useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [customInstructions, setCustomInstructions] = React.useState("");

  // UI States
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // Animate loading text step-by-step
  React.useEffect(() => {
    if (!isGenerating) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          topic,
          difficulty,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to generate interview. Please try again.");
      }

      const interview = await response.json();
      
      // Redirect user to practice arena
      router.push(`/practice/${interview.id}`);
    } catch (err: unknown) {
      console.error("Generator Submission Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        {/* Animated Glowing Radar Loader */}
        <div className="relative flex items-center justify-center mb-8 h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-primary/20 border border-primary/40 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl glow-indigo">
            <BrainCircuit className="h-9 w-9 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground tracking-tight">Creating Your Custom Arena</h2>
        
        {/* Dynamic terminal step logs */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-muted-foreground text-sm font-mono bg-muted/40 border border-border/50 px-4 py-2 rounded-xl">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span>{loadingSteps[loadingStep]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Mock Arena Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your role, topic, and difficulty to generate a tailored mock interview session.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Arena Setup Parameters</CardTitle>
            <CardDescription>
              Provide your target position details so the AI generates highly accurate industry-standard questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Target Job Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-semibold text-foreground">
                Target Job Role
              </label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Frontend Engineer, Lead DevOps, Senior PM"
                required
                aria-describedby="role-help"
              />
              <p id="role-help" className="text-xs text-muted-foreground">
                Enter the job title you are interviewing for to establish context.
              </p>
            </div>

            {/* Grid for Topic & Difficulty */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Interview Topic */}
              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-semibold text-foreground">
                  Focus Area / Topic
                </label>
                <Select
                  id="topic"
                  value={topic}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value)}
                >
                  <option value="React & JavaScript">React & JavaScript</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Behavioral & Leadership">Behavioral & Leadership</option>
                  <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                  <option value="Cloud & DevOps Engineering">Cloud & DevOps Engineering</option>
                </Select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label htmlFor="difficulty" className="text-sm font-semibold text-foreground">
                  Difficulty Level
                </label>
                <Select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")
                  }
                >
                  <option value="Beginner">Beginner (Entry-Level)</option>
                  <option value="Intermediate">Intermediate (Mid-Level)</option>
                  <option value="Advanced">Advanced (Senior / Staff)</option>
                </Select>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <label htmlFor="customInstructions" className="text-sm font-semibold text-foreground flex items-center gap-2">
                Custom Context or Job Description
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </label>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Paste the job posting description, specific technologies (e.g., Next.js, Docker, GraphQL), or focus areas you want the interviewer to drill you on..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/40 pt-6">
            <Button
              type="submit"
              className="w-full sm:w-auto ml-auto rounded-xl shadow-lg shadow-indigo-500/20 glow-indigo font-semibold"
            >
              <Wand2 className="mr-2 h-4.5 w-4.5" />
              Generate Practice Session
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
