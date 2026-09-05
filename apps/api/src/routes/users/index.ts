import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { updateProfileSchema } from "@savoria/validation";
import { UserService } from "../../services/user.service.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { ok } from "../../lib/response.js";

export async function userRoutes(app: FastifyInstance) {
  const users = new UserService();
  app.get("/me", { preHandler: [requireAuth] }, async (request, reply) => ok(reply, await users.getProfile((request as any).userId)));
  app.patch("/me", { preHandler: [requireAuth, validateBody(updateProfileSchema)] }, async (request, reply) => {
    return ok(reply, await users.updateProfile((request as any).userId, request.body as any));
  });
  app.get("/me/favorites", { preHandler: [requireAuth, validateQuery(z.object({ page: z.coerce.number().default(1), pageSize: z.coerce.number().default(20) }))] }, async (request, reply) => {
    const q = request.query as any;
    return ok(reply, await users.listFavorites((request as any).userId, q.page, q.pageSize));
  });
  app.post("/me/favorites/:recipeId", { preHandler: [requireAuth, validateParams(z.object({ recipeId: z.string() }))] }, async (request, reply) => {
    return ok(reply, await users.addFavorite((request as any).userId, (request.params as any).recipeId));
  });
  app.delete("/me/favorites/:recipeId", { preHandler: [requireAuth, validateParams(z.object({ recipeId: z.string() }))] }, async (request, reply) => {
    return ok(reply, await users.removeFavorite((request as any).userId, (request.params as any).recipeId));
  });
}
