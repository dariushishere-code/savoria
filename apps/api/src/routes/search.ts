import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { recipeSearchSchema } from "@savoria/validation";
import { SearchService } from "../services/search.service.js";
import { validateQuery } from "../middleware/validate.js";
import { ok } from "../lib/response.js";

export async function searchRoutes(app: FastifyInstance) {
  const search = new SearchService();
  app.get("/", { preHandler: [validateQuery(recipeSearchSchema)] }, async (request, reply) => {
    return ok(reply, await search.search(request.query as any));
  });
  app.get("/suggest", { preHandler: [validateQuery(z.object({ q: z.string().min(1), limit: z.coerce.number().default(8) }))] }, async (request, reply) => {
    const { q, limit } = request.query as any;
    return ok(reply, await search.suggest(q, limit));
  });
}
