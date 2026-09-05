import { prisma } from "@savoria/database";
import { RecipeStatus } from "@savoria/types";
import { env } from "../config/env.js";
import { BadRequestError } from "../lib/errors.js";

export class AIService {
  async chat(userId: string | undefined, message: string, conversationId?: string) {
    if (!message?.trim()) throw new BadRequestError("Message required");
    const stopWords = new Set(["what", "which", "where", "when", "does", "is", "are", "the", "a", "an", "and", "or", "with", "how", "can", "i", "me", "about"]);
    const terms = message.toLowerCase().match(/[a-z0-9]+/g)?.filter((term) => term.length > 2 && !stopWords.has(term)).slice(0, 6) ?? [];
    const recipes = await prisma.recipe.findMany({
      where: {
        status: RecipeStatus.PUBLISHED,
        ...(terms.length ? { OR: terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          { cuisine: { name: { contains: term, mode: "insensitive" as const } } },
          { category: { name: { contains: term, mode: "insensitive" as const } } },
          { tags: { some: { tag: { name: { contains: term, mode: "insensitive" as const } } } } },
          { ingredients: { some: { name: { contains: term, mode: "insensitive" as const } } } },
        ]) } : {}),
      },
      take: 5,
      select: { title: true, slug: true, description: true, tips: true },
    });
    const context = recipes.map((r) => `- ${r.title}: ${r.description ?? ""}`).join("\n") || "No matching recipes in database.";
    let reply: string;
    if (env.OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL,
            messages: [
              {
                role: "system",
                content: "You are Savoria AI Chef. Answer only cooking questions using the provided recipe context. Do not invent recipes not in context. Be concise and food-safe.",
              },
              { role: "user", content: `Context:\\n${context}\\n\\nQuestion: ${message}` },
            ],
            max_tokens: 800,
          }),
        });
        const data = await res.json() as any;
        reply = data.choices?.[0]?.message?.content ?? "I could not generate a response.";
      } catch {
        reply = `Based on our recipes:\n${context}\n\n(Configure OPENAI_API_KEY for full AI answers.)`.replaceAll("\\n", "\n");
      }
    } else {
      reply = `Based on SAVORIA recipes in the database:\n${context}\n\nTip: set OPENAI_API_KEY for generative answers grounded in this context.`.replaceAll("\\n", "\n");
    }

    let convId = conversationId;
    if (userId) {
      if (!convId) {
        const conv = await prisma.aIConversation.create({
          data: { userId, title: message.slice(0, 60) },
        });
        convId = conv.id;
      }
      await prisma.aIMessage.createMany({
        data: [
          { conversationId: convId!, role: "user", content: message },
          { conversationId: convId!, role: "assistant", content: reply },
        ],
      });
    }
    return { reply, conversationId: convId, sources: recipes };
  }
}
