import { prisma, toPrismaPagination, buildPaginationMeta } from "@savoria/database";
import { RecipeStatus } from "@savoria/types";
import type { RecipeSearchInput } from "@savoria/validation";
import { RecipeService } from "./recipe.service.js";

export class SearchService {
  private recipes = new RecipeService();

  async search(filters: RecipeSearchInput & { includeFacets?: boolean }) {
    const result = await this.recipes.list(filters);
    if (filters.q) {
      prisma.searchLog.create({
        data: { query: filters.q.slice(0, 200), results: result.meta.total, filters: { sort: filters.sort } as any },
      }).catch(() => {});
    }
    return result;
  }

  async suggest(q: string, limit = 8) {
    if (!q || q.trim().length < 2) return { recipes: [], popularQueries: [] };
    const recipes = await prisma.recipe.findMany({
      where: {
        status: RecipeStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { viewCount: "desc" },
      select: { id: true, title: true, slug: true, heroImageUrl: true, cuisine: { select: { name: true } } },
    });
    return { recipes, popularQueries: [] as { query: string; count: number }[] };
  }
}
