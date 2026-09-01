import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PracticeArenaClient } from "@/components/practice/PracticeArenaClient";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Check user authentication
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // 2. Resolve parameters (Next.js 15 async params)
  const { id: interviewId } = await params;

  // 3. Query the database for the interview session, including questions
  const interview = await db.interview.findUnique({
    where: {
      id: interviewId,
      userId,
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // 4. Redirect if not found or unauthorized
  if (!interview) {
    redirect("/dashboard");
  }

  // 5. Render client-side practice arena
  return <PracticeArenaClient interview={interview} />;
}
