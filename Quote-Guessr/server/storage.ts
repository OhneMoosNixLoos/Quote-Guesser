import { Quote, QuoteResponse } from "@shared/schema";
import fs from "fs";
import path from "path";

export interface IStorage {
  getQuote(difficulty: string): Promise<QuoteResponse>;
  checkAnswer(quoteId: number, answer: string, difficulty: string): Promise<{ correct: boolean, message: string, correctAuthor: string, source?: string }>;
  getAllQuotes(): Promise<Quote[]>;
}

export class JsonStorage implements IStorage {
  private quotes: Quote[];

  constructor() {
    const data = fs.readFileSync(path.join(process.cwd(), "quotes.json"), "utf-8");
    this.quotes = JSON.parse(data);
  }

  async getAllQuotes(): Promise<Quote[]> {
    return this.quotes;
  }

  async getQuote(difficulty: string): Promise<QuoteResponse> {
    // Map new difficulty modes to quote difficulty levels
    let quoteDifficulty: string[];
    let isMultipleChoice: boolean;

    if (difficulty === "mc-easy") {
      quoteDifficulty = ["easy"];
      isMultipleChoice = true;
    } else if (difficulty === "mc-hard") {
      quoteDifficulty = ["hard"];
      isMultipleChoice = true;
    } else if (difficulty === "type-easy") {
      quoteDifficulty = ["easy"];
      isMultipleChoice = false;
    } else if (difficulty === "type-hard") {
      quoteDifficulty = ["medium", "hard"];
      isMultipleChoice = false;
    } else {
      quoteDifficulty = ["easy"];
      isMultipleChoice = true;
    }

    const availableQuotes = this.quotes.filter(q => quoteDifficulty.includes(q.difficulty));
    const pool = availableQuotes.length > 0 ? availableQuotes : this.quotes;
    const randomQuote = pool[Math.floor(Math.random() * pool.length)];

    let options: string[] | undefined;

    if (isMultipleChoice) {
      const otherAuthors = Array.from(new Set(this.quotes
        .filter(q => q.author !== randomQuote.author)
        .map(q => q.author)
      ));
      
      const shuffled = otherAuthors.sort(() => 0.5 - Math.random());
      const selectedIncorrect = shuffled.slice(0, 3);
      
      options = [...selectedIncorrect, randomQuote.author];
      options.sort(() => 0.5 - Math.random());
    }

    return {
      id: randomQuote.id,
      text: randomQuote.text,
      difficulty: difficulty as "mc-easy" | "mc-hard" | "type-easy" | "type-hard",
      source: randomQuote.source,
      options,
    };
  }

  async checkAnswer(quoteId: number, answer: string, difficulty: string): Promise<{ correct: boolean, message: string, correctAuthor: string, source?: string }> {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    let correct = false;
    let message = "";

    if (difficulty === "mc-easy" || difficulty === "mc-hard") {
      // Multiple choice: exact match
      correct = quote.author === answer;
      message = correct ? "Correct!" : `Wrong! It was ${quote.author}`;
    } else if (difficulty === "type-easy") {
      // Type answer - Easy: fuzzy matching with Levenshtein
      const normalize = (str: string) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
      const input = normalize(answer);
      const target = normalize(quote.author);
      
      const dist = this.levenshtein(input, target);
      if (dist <= 2) {
        correct = true;
      } else {
        const lastName = target.split(" ").pop() || "";
        if (lastName.length > 3 && this.levenshtein(input, lastName) <= 1) {
          correct = true;
        }
      }
      
      message = correct ? "Correct!" : `Close, but no! It was ${quote.author}`;
    } else if (difficulty === "type-hard") {
      // Type answer - Hard: exact match required
      correct = quote.author.trim() === answer.trim();
      message = correct ? "Correct!" : `Incorrect. The author is ${quote.author}`;
    }

    return { correct, message, correctAuthor: quote.author, source: quote.source };
  }

  private levenshtein(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

export const storage = new JsonStorage();
