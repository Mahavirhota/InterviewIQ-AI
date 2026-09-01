import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { evaluateAnswer } from "@/lib/openai";
import { z } from "zod";

const SubmitAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answerText: z.string().min(5, "Answer must be at least 5 characters long"),
  timeSpentSeconds: z.number().min(0, "Time spent must be positive"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: interviewId } = await params;

    // 2. Validate body
    const body = await req.json();
    const validation = SubmitAnswerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }
    const { questionId, answerText, timeSpentSeconds } = validation.data;

    // 3. Verify interview ownership and retrieve the question
    const interview = await db.interview.findUnique({
      where: { id: interviewId, userId },
      include: { questions: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found or access denied." }, { status: 404 });
    }

    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found in this interview session." }, { status: 404 });
    }

    // 4. Run AI Evaluation
    const evaluation = await evaluateAnswer(
      question.questionText,
      answerText,
      question.suggestedRubric || ""
    );

    // 5. Update Database in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update Question with user's response, score and AI feedback
      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: {
          answerText,
          timeSpentSeconds,
          score: evaluation.score,
          feedbackText: evaluation.feedbackText,
        },
      });

      // Update User Skill Scores (exponential moving average or upsert)
      const skillPromises = Object.entries(evaluation.skillsAssessed).map(async ([skillName, newScore]) => {
        const existingSkill = await tx.userSkill.findUnique({
          where: {
            userId_skillName: {
              userId,
              skillName,
            },
          },
        });

        if (existingSkill) {
          // Rolling average: 60% weight to history, 40% to new performance
          const calculatedScore = Math.round((existingSkill.score * 0.6) + (newScore * 0.4));
          return tx.userSkill.update({
            where: { id: existingSkill.id },
            data: { score: Math.min(Math.max(calculatedScore, 0), 100) },
          });
        } else {
          return tx.userSkill.create({
            data: {
              userId,
              skillName,
              score: newScore,
            },
          });
        }
      });

      await Promise.all(skillPromises);

      // Check if all questions in this interview have been answered to complete the session
      const allQuestions = await tx.question.findMany({
        where: { interviewId },
      });

      // Find out if any question is unanswered (answerText is null or empty)
      // Note: we check the updated state, including the one we just updated
      const unanswered = allQuestions.filter(
        (q) => q.id !== questionId && (!q.answerText || q.answerText.trim() === "")
      );

      const isCompleted = unanswered.length === 0;

      if (isCompleted) {
        // Recalculate average score for this interview
        const totalScore = allQuestions.reduce((acc, q) => acc + (q.id === questionId ? evaluation.score : (q.score || 0)), 0);
        const averageScore = Math.round(totalScore / allQuestions.length);

        await tx.interview.update({
          where: { id: interviewId },
          data: {
            status: "COMPLETED",
            score: averageScore,
          },
        });

        // Log completion activity
        await tx.activity.create({
          data: {
            userId,
            type: "INTERVIEW_COMPLETED",
            description: `Completed ${interview.difficulty} ${interview.topic} interview with an average score of ${averageScore}%`,
          },
        });
      } else {
        // If not completed yet, update status to IN_PROGRESS
        if (interview.status === "CREATED") {
          await tx.interview.update({
            where: { id: interviewId },
            data: { status: "IN_PROGRESS" },
          });
        }
      }

      return {
        question: updatedQuestion,
        isCompleted,
      };
    });

    return NextResponse.json({
      score: evaluation.score,
      feedbackText: evaluation.feedbackText,
      skillsAssessed: evaluation.skillsAssessed,
      isCompleted: result.isCompleted,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("API /api/practice/[id] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
