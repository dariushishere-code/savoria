import { prisma, toPrismaPagination, buildPaginationMeta } from "@savoria/database";
import { NotFoundError, ConflictError } from "../lib/errors.js";

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, avatarUrl: true, bio: true, role: true, status: true,
        emailVerified: true, locale: true, timezone: true, createdAt: true, lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; bio?: string | null; locale?: string; timezone?: string; avatarUrl?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true, bio: true, locale: true, timezone: true, updatedAt: true },
    });
  }

  async addFavorite(userId: string, recipeId: string) {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundError("Recipe not found");
    try {
      await prisma.$transaction([
        prisma.favorite.create({ data: { userId, recipeId } }),
        prisma.recipe.update({ where: { id: recipeId }, data: { favoriteCount: { increment: 1 } } }),
      ]);
    } catch {
      throw new ConflictError("Already favorited");
    }
    return { ok: true };
  }

  async removeFavorite(userId: string, recipeId: string) {
    const fav = await prisma.favorite.findUnique({ where: { userId_recipeId: { userId, recipeId } } });
    if (!fav) throw new NotFoundError("Favorite not found");
    await prisma.$transaction([
      prisma.favorite.delete({ where: { id: fav.id } }),
      prisma.recipe.update({ where: { id: recipeId }, data: { favoriteCount: { decrement: 1 } } }),
    ]);
    return { ok: true };
  }

  async listFavorites(userId: string, page = 1, pageSize = 20) {
    const { skip, take } = toPrismaPagination(page, pageSize);
    const [rows, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId }, skip, take, orderBy: { createdAt: "desc" },
        include: {
          recipe: {
            select: {
              id: true, title: true, slug: true, description: true, difficulty: true,
              prepTimeMinutes: true, cookTimeMinutes: true, totalTimeMinutes: true, servings: true,
              calories: true, heroImageUrl: true, ratingAverage: true, ratingCount: true,
              favoriteCount: true, viewCount: true,
              cuisine: { select: { id: true, name: true, slug: true } },
              country: { select: { id: true, name: true, slug: true, flagEmoji: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);
    return {
      data: rows.map((f) => ({ id: f.id, createdAt: f.createdAt, recipe: f.recipe })),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  }
}
