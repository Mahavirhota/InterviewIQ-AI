import { generateQuestions, evaluateAnswer, GeneratedQuestionsSchema, EvaluationResultSchema } from "@/lib/openai";

describe("OpenAI Integration & Mock Fallback", () => {
  describe("generateQuestions", () => {
    it("returns exactly 5 structured questions matching the Zod schema", async () => {
      const role = "Software Engineer";
      const topic = "React & Redux";
      const difficulty = "Intermediate";

      const questions = await generateQuestions(role, topic, difficulty);

      // Verify length
      expect(questions).toHaveLength(5);

      // Validate schema
      const parseResult = GeneratedQuestionsSchema.safeParse(questions);
      expect(parseResult.success).toBe(true);

      // Verify structural details
      questions.forEach((q) => {
        expect(q).toHaveProperty("questionText");
        expect(q).toHaveProperty("suggestedRubric");
        expect(typeof q.questionText).toBe("string");
        expect(typeof q.suggestedRubric).toBe("string");
        expect(q.questionText.length).toBeGreaterThan(5);
      });
    });
  });

  describe("evaluateAnswer", () => {
    it("correctly evaluates a normal length answer with appropriate score and feedback", async () => {
      const questionText = "Explain the difference between useEffect and useLayoutEffect.";
      const answerText = "useEffect runs asynchronously after the render paint, which is non-blocking. useLayoutEffect runs synchronously before paint, blocking visual updates, which is ideal for measuring DOM layout.";
      const rubric = "Look for mention of paint timing and DOM measurements.";

      const evaluation = await evaluateAnswer(questionText, answerText, rubric);

      // Validate schema
      const parseResult = EvaluationResultSchema.safeParse(evaluation);
      expect(parseResult.success).toBe(true);

      // Verify bounds
      expect(evaluation.score).toBeGreaterThanOrEqual(60);
      expect(evaluation.score).toBeLessThanOrEqual(100);
      expect(typeof evaluation.feedbackText).toBe("string");
      expect(evaluation.feedbackText.length).toBeGreaterThan(10);
      
      // Verify sub-skills are evaluated
      expect(evaluation.skillsAssessed).toHaveProperty("Technical Depth");
      expect(evaluation.skillsAssessed).toHaveProperty("Communication");
      expect(typeof evaluation.skillsAssessed["Technical Depth"]).toBe("number");
    });

    it("returns a low score and helpful feedback for extremely short answers", async () => {
      const questionText = "Explain the difference between useEffect and useLayoutEffect.";
      const answerText = "Idk."; // Too short

      const evaluation = await evaluateAnswer(questionText, answerText, "");

      expect(evaluation.score).toBe(15);
      expect(evaluation.feedbackText).toContain("extremely brief");
      expect(evaluation.skillsAssessed["Technical Depth"]).toBe(10);
    });
  });
});
