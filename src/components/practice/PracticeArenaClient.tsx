"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  order: number;
  answerText: string | null;
  score: number | null;
  feedbackText: string | null;
}

interface Interview {
  id: string;
  role: string;
  topic: string;
  difficulty: string;
  status: string;
  questions: Question[];
}

interface PracticeArenaClientProps {
  interview: Interview;
}

interface AIFeedback {
  score: number;
  feedbackText: string;
  skillsAssessed: Record<string, number>;
}

// Browser SpeechRecognition Type Declarations
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

export function PracticeArenaClient({ interview }: PracticeArenaClientProps) {
  const router = useRouter();

  // Active question state
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Loaded questions state (incorporating any previously submitted data)
  const [localQuestions, setLocalQuestions] = React.useState<Question[]>(interview.questions);
  const activeQuestion = localQuestions[currentIndex] || interview.questions[currentIndex];

  // Form states
  const [answerInput, setAnswerInput] = React.useState(
    interview.questions[0]?.answerText || ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Voice & Audio States
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);

  // Safely detect browser speech capabilities across SSR & client
  const speechSupported = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );

  const recognitionSupported = React.useSyncExternalStore(
    () => () => {},
    () =>
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    () => false
  );

  // Time tracking
  // Total interview timer: 15 minutes (900 seconds)
  const [timeLeft, setTimeLeft] = React.useState(900);
  const [questionTimes, setQuestionTimes] = React.useState<number[]>(
    new Array(interview.questions.length).fill(0)
  );
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle total timer countdown
  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });

      // Accumulate time spent on the active question
      setQuestionTimes((prev) => {
        const next = [...prev];
        next[currentIndex] = next[currentIndex] + 1;
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  // Stop speech or recording when unmounting or switching questions
  const stopAllVoiceOperations = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      stopAllVoiceOperations();
    };
  }, [stopAllVoiceOperations]);

  // AI Voice Narration (Text-to-Speech)
  const toggleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion.questionText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onend = () => {
      setIsSpeakingQuestion(false);
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
    };

    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Answer Recording (Speech-to-Text)
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setError("Speech recognition is not supported in your current browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      const previousTranscript = answerInput ? answerInput.trim() + " " : "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let liveTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript;
        }
        setAnswerInput(previousTranscript + liveTranscript);
      };

      recognition.onerror = (event: unknown) => {
        console.error("Speech Recognition Error:", event);
        setIsListening(false);
        setError("Microphone access error or recognition interrupted.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to start speech recognition:", err);
      setError("Could not access microphone. Check permissions.");
      setIsListening(false);
    }
  };

  const handleSubmitAnswer = React.useCallback(async () => {
    if (isSubmitting || !activeQuestion) return;

    // Stop listening before submitting
    stopAllVoiceOperations();

    const text = answerInput.trim();
    if (text.length < 5) {
      setError("Your response must be at least 5 characters long before submitting.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const timeSpent = questionTimes[currentIndex] || 5; // Fallback to 5s if 0

      const response = await fetch(`/api/practice/${interview.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          answerText: text,
          timeSpentSeconds: timeSpent,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to submit answer.");
      }

      const evalResult: AIFeedback & { isCompleted: boolean } = await response.json();

      // Update local state with the AI feedback
      setLocalQuestions((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          answerText: text,
          score: evalResult.score,
          feedbackText: evalResult.feedbackText,
        };
        return next;
      });
    } catch (err: unknown) {
      console.error("Answer Submission Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    activeQuestion,
    answerInput,
    questionTimes,
    currentIndex,
    interview.id,
    stopAllVoiceOperations,
  ]);

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to submit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmitAnswer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmitAnswer]);

  const changeQuestion = (nextIndex: number) => {
    stopAllVoiceOperations();
    setCurrentIndex(nextIndex);
    setAnswerInput(localQuestions[nextIndex]?.answerText || "");
    setError(null);
  };

  const handleNext = () => {
    if (currentIndex < localQuestions.length - 1) {
      changeQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      changeQuestion(currentIndex - 1);
    }
  };

  // Format time remaining (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isCurrentQuestionAnswered = localQuestions[currentIndex].score !== null;
  const totalCompletedQuestions = localQuestions.filter((q) => q.score !== null).length;
  const isInterviewFinished = totalCompletedQuestions === localQuestions.length;

  return (
    <div className="space-y-6">
      {/* Top Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 border border-indigo-500/15 px-3 py-1 rounded-full">
            {interview.difficulty} • {interview.topic}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-2.5">
            Practice Arena: {interview.role}
          </h1>
        </div>

        {/* Real-time timer and progress */}
        <div className="flex items-center space-x-6">
          {/* Progress bar */}
          <div className="hidden md:block text-right">
            <span className="text-xs text-muted-foreground">Progress</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-bold text-foreground">
                {totalCompletedQuestions}/{localQuestions.length}
              </span>
              <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(totalCompletedQuestions / localQuestions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center space-x-2.5 rounded-xl border px-4 py-2.5 shadow-xs transition-colors ${
              timeLeft < 60
                ? "border-red-500/30 bg-red-500/5 text-red-400 animate-pulse"
                : "border-border bg-card/40"
            }`}
            role="timer"
            aria-live="polite"
            aria-label={`Time remaining: ${formatTime(timeLeft)}`}
          >
            <Timer className={`h-5 w-5 ${timeLeft < 60 ? "text-red-400" : "text-amber-400"}`} />
            <span className="font-mono text-lg font-bold tracking-tight">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Completion Alert Banner */}
      {isInterviewFinished && (
        <Card className="border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 flex-shrink-0">
              <CheckCircle className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-400">Interview Completed!</h2>
              <p className="text-sm text-muted-foreground">
                You have successfully answered all mock questions and received comprehensive grading.
              </p>
            </div>
          </div>
          <Button
            className="w-full sm:w-auto rounded-xl shadow-lg shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => router.push("/analytics")}
          >
            <TrendingUp className="mr-2 h-4.5 w-4.5" />
            View Performance Insights
          </Button>
        </Card>
      )}

      {/* Main Split Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Active Question & Input Form */}
        <div className="space-y-6">
          <Card className="border border-border shadow-md">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Question {activeQuestion.order} of {localQuestions.length}
                </span>
                <div className="flex items-center gap-2">
                  {/* AI Question Voice Narration Button */}
                  {speechSupported && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleSpeakQuestion}
                      className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                        isSpeakingQuestion
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={isSpeakingQuestion ? "Stop voice narration" : "Listen to question aloud"}
                      aria-label={isSpeakingQuestion ? "Stop voice narration" : "Listen to question aloud"}
                    >
                      {isSpeakingQuestion ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 mr-1" />
                          Stop Audio
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                          Speak Question
                        </>
                      )}
                    </Button>
                  )}

                  {isCurrentQuestionAnswered && (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Graded: {activeQuestion.score}%
                    </span>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-foreground leading-relaxed mt-3">
                {activeQuestion.questionText}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="answer" className="text-sm font-semibold text-foreground">
                  Your Response
                </label>

                {/* Voice Input Controls & Visualizer */}
                <div className="flex items-center gap-3">
                  {recognitionSupported && !isCurrentQuestionAnswered && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleListening}
                      disabled={isSubmitting}
                      className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                        isListening
                          ? "border-red-500/50 bg-red-500/10 text-red-400 shadow-sm shadow-red-500/20 animate-pulse"
                          : "hover:border-indigo-500/50 hover:bg-indigo-500/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                          Voice Answer
                        </>
                      )}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {answerInput.trim().length} characters
                  </span>
                </div>
              </div>

              {/* Active Voice Waveform Banner */}
              {isListening && (
                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-fade-in text-xs text-red-300">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="font-medium">Listening... Speak your answer into your microphone</span>
                  </div>
                  {/* Animated Wave Bars */}
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-3 bg-red-400 animate-pulse rounded-full" />
                    <div className="w-1 h-5 bg-red-400 animate-pulse delay-75 rounded-full" />
                    <div className="w-1 h-2 bg-red-400 animate-pulse delay-150 rounded-full" />
                    <div className="w-1 h-4 bg-red-400 animate-pulse delay-100 rounded-full" />
                  </div>
                </div>
              )}

              <Textarea
                id="answer"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Type your structured technical response or click 'Voice Answer' to dictate with your microphone..."
                rows={10}
                disabled={isSubmitting || isCurrentQuestionAnswered}
                className="resize-none font-sans leading-relaxed"
                aria-describedby="answer-instructions"
              />
              <p id="answer-instructions" className="text-xs text-muted-foreground">
                Tip: Press <kbd className="font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-[10px]">Cmd + Enter</kbd> to submit.
              </p>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border border-red-500/15 p-3 rounded-lg">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4 bg-muted/10">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous question"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex === localQuestions.length - 1}
                  aria-label="Next question"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              </div>

              {!isCurrentQuestionAnswered ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || answerInput.trim().length < 5}
                  size="sm"
                  className="rounded-xl glow-indigo font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit & Grade Answer
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleNext}
                  disabled={currentIndex === localQuestions.length - 1}
                >
                  Next Question
                  <ChevronRight className="ml-2 h-4.5 w-4.5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live AI Feedback Panel */}
        <div className="space-y-6">
          <Card className="h-full border border-border bg-card/40 backdrop-blur-md flex flex-col justify-between">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                AI Feedback Panel
              </CardTitle>
              <CardDescription>
                Real-time evaluation and grading breakdown by our Senior AI Interviewer.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 flex-1 flex flex-col justify-center min-h-[300px]">
              {isCurrentQuestionAnswered ? (
                <div className="space-y-6 text-left animate-fade-in" aria-live="assertive">
                  {/* Score circle */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 font-extrabold text-2xl border border-indigo-500/20 shadow-md">
                      {activeQuestion.score}%
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">Graded Response</h3>
                      <p className="text-xs text-muted-foreground">Competency assessment parsed successfully.</p>
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Detailed Evaluation</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 border border-border/40 rounded-xl">
                      {activeQuestion.feedbackText}
                    </p>
                  </div>
                </div>
              ) : (
                // Unanswered Placeholder
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted-foreground">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground">
                    <HelpCircle className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-sm font-semibold text-foreground">Awaiting Response Submission</h3>
                    <p className="text-xs leading-relaxed">
                      Formulate and submit your answer in the left column. The AI panel will immediately compile and render your scorecard and constructive feedback.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/30 pt-4 pb-6 bg-muted/5 flex items-center justify-center text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-indigo-400 mr-2 animate-pulse" />
              <span>Feedback is generated using customized role-specific rubrics.</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default PracticeArenaClient;
