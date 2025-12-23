import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);

  // Configure session middleware
  app.use(
    session({
      secret: "quote-guessing-secret",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
    })
  );

  // Initialize session data
  app.use((req, res, next) => {
    if (!req.session.score) {
      req.session.score = 0;
    }
    if (!req.session.total) {
      req.session.total = 0;
    }
    next();
  });

  // GET /api/quote
  app.get(api.quotes.get.path, async (req, res) => {
    try {
      const difficulty = req.query.difficulty as string;
      
      if (!difficulty || !["mc-easy", "mc-hard", "type-easy", "type-hard"].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid or missing difficulty" });
      }

      const quote = await storage.getQuote(difficulty);
      res.json(quote);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  // POST /api/check
  app.post(api.quotes.check.path, async (req, res) => {
    try {
      const input = api.quotes.check.input.parse(req.body);
      const result = await storage.checkAnswer(input.quoteId, input.answer, input.difficulty);
      
      // Update session score
      if (result.correct) {
        req.session.score = (req.session.score || 0) + 1;
      } else {
        // Reset score on wrong answer
        req.session.score = 0;
      }
      req.session.total = (req.session.total || 0) + 1;
      
      res.json({
        correct: result.correct,
        correctAuthor: result.correctAuthor,
        source: result.source,
        userScore: req.session.score,
        message: result.message
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error && err.message === "Quote not found") {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/reset
  app.post(api.quotes.reset.path, (req, res) => {
    req.session.score = 0;
    req.session.total = 0;
    res.json({ score: 0, total: 0 });
  });

  return httpServer;
}

// Extend session type
declare module "express-session" {
  interface SessionData {
    score: number;
    total: number;
  }
}
