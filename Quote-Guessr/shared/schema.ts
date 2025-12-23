import { z } from "zod";

// API Schemas
export const difficultySchema = z.enum(["mc-easy", "mc-hard", "type-easy", "type-hard"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const quoteSchema = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  source: z.string().optional(),
});
export type Quote = z.infer<typeof quoteSchema>;

// Request/Response types
export const getQuoteRequestSchema = z.object({
  difficulty: difficultySchema,
});

export const getQuoteResponseSchema = z.object({
  id: z.number(),
  text: z.string(),
  difficulty: difficultySchema,
  source: z.string().optional(),
  options: z.array(z.string()).optional(),
});
export type QuoteResponse = z.infer<typeof getQuoteResponseSchema>;

export const checkAnswerRequestSchema = z.object({
  quoteId: z.number(),
  answer: z.string(),
  difficulty: difficultySchema,
});

export const checkAnswerResponseSchema = z.object({
  correct: z.boolean(),
  correctAuthor: z.string(),
  source: z.string().optional(),
  userScore: z.number(),
  message: z.string(),
});
export type CheckAnswerResponse = z.infer<typeof checkAnswerResponseSchema>;

// Session/Score type
export const scoreSchema = z.object({
  score: z.number(),
  total: z.number(),
});
