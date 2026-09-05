import type { FastifyInstance } from "fastify";
import { prisma } from "@savoria/database";
import { RecipeStatus } from "@savoria/types";
import { requireAdmin } from "../../middleware/auth.js";
import { ok } from "../../lib/response.js";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAdmin);

  app.get("/dashboard", async (_req, reply) => {
    const [users, published, drafts, views, favorites, aiConversations, aiMessages] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count({ where: { status: RecipeStatus.PUBLISHED } }),
      prisma.recipe.count({ where: { status: RecipeStatus.DRAFT } }),
      prisma.recipe.aggregate({ _sum: { viewCount: true } }),
      prisma.favorite.count(),
      prisma.aIConversation.count(),
      prisma.aIMessage.count(),
    ]);
    const popularRecipes = await prisma.recipe.findMany({
      where: { status: RecipeStatus.PUBLISHED }, orderBy: { viewCount: "desc" }, take: 10,
      select: { id: true, title: true, slug: true, viewCount: true, ratingAverage: true },
    });
    return ok(reply, {
      totals: {
        users, recipes: published + drafts, publishedRecipes: published, draftRecipes: drafts,
        views: views._sum.viewCount ?? 0, activeUsers: users, newUsersToday: 0, newUsersWeek: 0,
        favorites, aiConversations, aiMessages, pendingReports: 0, pendingRecipes: 0,
      },
      popularRecipes,
      charts: { userGrowth: [], recipeGrowth: [] },
    });
  });

  app.get("/recipes", async (request, reply) => {
    const q = request.query as any;
    const page = Number(q.page) || 1;
    const pageSize = Number(q.pageSize) || 20;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.q) where.title = { contains: q.q, mode: "insensitive" };
    const [data, total] = await Promise.all([
      prisma.recipe.findMany({
        where, skip: (page-1)*pageSize, take: pageSize, orderBy: { updatedAt: "desc" },
        select: {
          id: true, title: true, slug: true, status: true, viewCount: true, ratingAverage: true, updatedAt: true,
          cuisine: { select: { name: true } }, author: { select: { name: true, email: true } },
        },
      }),
      prisma.recipe.count({ where }),
    ]);
    return ok(reply, { data, meta: { total, page, pageSize, totalPages: Math.ceil(total/pageSize)||1, hasNext: page*pageSize < total, hasPrev: page > 1 } });
  });

  app.get("/users", async (request, reply) => {
    const page = Number((request.query as any).page) || 1;
    const pageSize = 20;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page-1)*pageSize, take: pageSize, orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, lastLoginAt: true },
      }),
      prisma.user.count(),
    ]);
    return ok(reply, { data, meta: { total, page, pageSize, totalPages: Math.ceil(total/pageSize)||1, hasNext: page*pageSize < total, hasPrev: page > 1 } });
  });
}
