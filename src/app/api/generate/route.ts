import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateQuestions } from "@/lib/openai";
import { z } from "zod";

// Input validation schema
const GenerateRequestSchema = z.object({
  role: z.string().min(2, "Job role must be at least 2 characters."),
  topic: z.string().min(2, "Topic must be at least 2 characters."),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  customInstructions: z.string().max(2000, "Instructions must be under 2000 characters.").optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Validate request body
    const body = await req.json();
    const validation = GenerateRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { role, topic, difficulty, customInstructions } = validation.data;

    // 3. Generate questions using OpenAI helper
    const aiQuestions = await generateQuestions(role, topic, difficulty, customInstructions);

    if (!aiQuestions || aiQuestions.length === 0) {
      return NextResponse.json({ error: "Failed to generate interview questions." }, { status: 500 });
    }

    // 4. Save to Database in a Prisma Transaction
    const interview = await db.$transaction(async (tx) => {
      // Create Interview Session
      const newInterview = await tx.interview.create({
        data: {
          userId,
          role,
          topic,
          difficulty,
          status: "CREATED",
        },
      });

      // Create Questions linked to this Interview
      const questionsData = aiQuestions.map((q, index) => ({
        interviewId: newInterview.id,
        questionText: q.questionText,
        suggestedRubric: q.suggestedRubric,
        order: index + 1,
      }));

      await tx.question.createMany({
        data: questionsData,
      });

      // Log User Activity
      await tx.activity.create({
        data: {
          userId,
          type: "INTERVIEW_STARTED",
          description: `Started a new ${difficulty} ${topic} interview for ${role}`,
        },
      });

      // Retrieve full interview with questions
      return tx.interview.findUnique({
        where: { id: newInterview.id },
        include: {
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              questionText: true,
              order: true,
            },
          },
        },
      });
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error: unknown) {
    console.error("API /api/generate Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
