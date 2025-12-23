import { z } from "zod";
import { 
  getQuoteRequestSchema, 
  getQuoteResponseSchema, 
  checkAnswerRequestSchema, 
  checkAnswerResponseSchema,
  scoreSchema
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  quotes: {
    get: {
      method: "GET" as const,
      path: "/api/quote",
      input: getQuoteRequestSchema,
      responses: {
        200: getQuoteResponseSchema,
        400: errorSchemas.validation,
      },
    },
    check: {
      method: "POST" as const,
      path: "/api/check",
      input: checkAnswerRequestSchema,
      responses: {
        200: checkAnswerResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    reset: {
      method: "POST" as const,
      path: "/api/reset",
      responses: {
        200: scoreSchema,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
