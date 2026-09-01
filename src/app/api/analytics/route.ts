import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Fetch all raw data in parallel
    const [completedInterviews, allInterviews, userSkills, recentActivities, answeredQuestionsCount, timeSpentAggregate] = await Promise.all([
      // Completed interviews for score trend
      db.interview.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          topic: true,
          role: true,
          difficulty: true,
          score: true,
          createdAt: true,
        },
      }),
      // All interviews to calculate completion rate
      db.interview.findMany({
        where: { userId },
        select: { status: true },
      }),
      // Skill scorecards
      db.userSkill.findMany({
        where: { userId },
        orderBy: { score: "desc" },
        select: {
          skillName: true,
          score: true,
          updatedAt: true,
        },
      }),
      // Recent activities for feed
      db.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
        },
      }),
      // Count of total questions answered
      db.question.count({
        where: {
          interview: { userId },
          score: { not: null },
        },
      }),
      // Sum of time spent on answered questions
      db.question.aggregate({
        where: {
          interview: { userId },
          score: { not: null },
        },
        _sum: {
          timeSpentSeconds: true,
        },
      }),
    ]);

    // 3. Compute KPIs
    const totalInterviewsCount = allInterviews.length;
    const completedInterviewsCount = completedInterviews.length;
    
    const averageScore = completedInterviewsCount > 0
      ? Math.round(completedInterviews.reduce((sum, int) => sum + (int.score || 0), 0) / completedInterviewsCount)
      : 0;

    const totalPracticeTimeSeconds = timeSpentAggregate._sum.timeSpentSeconds || 0;
    const totalPracticeTimeMinutes = Math.round(totalPracticeTimeSeconds / 60);

    const completionRate = totalInterviewsCount > 0
      ? Math.round((completedInterviewsCount / totalInterviewsCount) * 100)
      : 0;

    // 4. Identify Strengths and Weaknesses
    // Default core skills if user hasn't completed any interviews yet
    const defaultSkills = [
      { skillName: "Technical Depth", score: 0 },
      { skillName: "Problem Solving", score: 0 },
      { skillName: "Communication", score: 0 },
      { skillName: "System Design", score: 0 },
      { skillName: "Behavioral", score: 0 },
    ];

    const activeSkills = userSkills.length > 0 ? userSkills : defaultSkills;
    
    // Strengths: active skills with score >= 75 (or top 2)
    // Weaknesses: active skills with score < 75 (or bottom 2)
    const strengths = activeSkills.filter((s) => s.score >= 70);
    const weaknesses = activeSkills.filter((s) => s.score < 70);

    // If all are high or all are low, provide relative top/bottom
    const topSkills = [...activeSkills].slice(0, 2);
    const bottomSkills = [...activeSkills].reverse().slice(0, 2);

    // 5. Structure Response
    return NextResponse.json({
      stats: {
        totalInterviews: totalInterviewsCount,
        completedInterviews: completedInterviewsCount,
        averageScore,
        totalQuestionsAnswered: answeredQuestionsCount,
        totalPracticeTimeMinutes,
        completionRate,
      },
      skills: activeSkills,
      strengths: strengths.length > 0 ? strengths : topSkills,
      weaknesses: weaknesses.length > 0 ? weaknesses : bottomSkills,
      scoreTrend: completedInterviews.map((int) => ({
        id: int.id,
        date: int.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: int.score,
        label: `${int.topic} (${int.difficulty})`,
      })),
      activities: recentActivities,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("API /api/analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
