import { prisma, toPrismaPagination, buildPaginationMeta, incrementRecipeViews } from "@savoria/database";
import { RecipeStatus } from "@savoria/types";
import { NotFoundError, ForbiddenError } from "../lib/errors.js";
import { uniqueSlug } from "../lib/slug.js";
import type { CreateRecipeInput, UpdateRecipeInput, RecipeSearchInput } from "@savoria/validation";

const listSelect = {
  id: true, title: true, slug: true, description: true, difficulty: true,
  prepTimeMinutes: true, cookTimeMinutes: true, totalTimeMinutes: true, servings: true, calories: true,
  heroImageUrl: true, ratingAverage: true, ratingCount: true, favoriteCount: true, viewCount: true, publishedAt: true,
  cuisine: { select: { id: true, name: true, slug: true } },
  country: { select: { id: true, name: true, slug: true, flagEmoji: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} as const;

export class RecipeService {
  async list(filters: RecipeSearchInput) {
    const { skip, take, page, pageSize } = toPrismaPagination(filters.page, filters.pageSize);
    const where: any = { status: RecipeStatus.PUBLISHED };
    if (filters.q) {
      const terms = filters.q.trim().split(/\s+/).filter(Boolean);
      where.OR = [
        ...terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { cuisine: { name: { contains: term, mode: "insensitive" } } },
          { category: { name: { contains: term, mode: "insensitive" } } },
          { tags: { some: { tag: { name: { contains: term, mode: "insensitive" } } } } },
          { ingredients: { some: { name: { contains: term, mode: "insensitive" } } } },
          { ingredients: { some: { ingredient: { name: { contains: term, mode: "insensitive" } } } } },
        ]),
      ];
    }
    if (filters.cuisine) {
      const values = Array.isArray(filters.cuisine) ? filters.cuisine : [filters.cuisine];
      where.cuisine = { slug: { in: values } };
    }
    if (filters.difficulty) {
      const values = Array.isArray(filters.difficulty) ? filters.difficulty : [filters.difficulty];
      where.difficulty = { in: values };
    }
    if (filters.country) {
      const values = Array.isArray(filters.country) ? filters.country : [filters.country];
      where.country = { slug: { in: values } };
    }
    if (filters.category) {
      const values = Array.isArray(filters.category) ? filters.category : [filters.category];
      where.category = { slug: { in: values } };
    }
    if (filters.mealType) {
      const values = Array.isArray(filters.mealType) ? filters.mealType : [filters.mealType];
      where.mealType = { in: values };
    }
    if (filters.tag) {
      const values = Array.isArray(filters.tag) ? filters.tag : [filters.tag];
      where.tags = { some: { tag: { slug: { in: values } } } };
    }
    if (filters.diet) {
      const values = Array.isArray(filters.diet) ? filters.diet : [filters.diet];
      where.diets = { some: { diet: { slug: { in: values } } } };
    }
    if (filters.ingredient) {
      const values = Array.isArray(filters.ingredient) ? filters.ingredient : [filters.ingredient];
      where.ingredients = { some: { OR: [{ name: { in: values, mode: "insensitive" } }, { ingredient: { slug: { in: values } } }] } };
    }
    if (filters.maxPrepTime !== undefined) where.prepTimeMinutes = { lte: filters.maxPrepTime };
    if (filters.maxCookTime !== undefined) where.cookTimeMinutes = { lte: filters.maxCookTime };
    if (filters.maxCalories !== undefined) where.calories = { lte: filters.maxCalories };
    if (filters.minRating !== undefined) where.ratingAverage = { gte: filters.minRating };
    let orderBy: any = { publishedAt: "desc" };
    if (filters.sort === "popular") orderBy = { viewCount: "desc" };
    if (filters.sort === "rating") orderBy = { ratingAverage: "desc" };
    if (filters.sort === "fastest") orderBy = { totalTimeMinutes: "asc" };
    if (filters.sort === "newest") orderBy = { publishedAt: "desc" };
    const [rows, total] = await Promise.all([
      prisma.recipe.findMany({ where, select: listSelect, skip, take, orderBy }),
      prisma.recipe.count({ where }),
    ]);
    return {
      data: rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag) })),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  }

  async getBySlug(slug: string, opts?: { incrementView?: boolean }) {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        cuisine: true, country: true, category: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        ingredients: { orderBy: { sortOrder: "asc" }, include: { ingredient: true } },
        instructions: { orderBy: { stepNumber: "asc" } },
        nutrition: true,
        tags: { include: { tag: true } },
        diets: { include: { diet: true } },
      },
    });
    if (!recipe || recipe.status !== RecipeStatus.PUBLISHED) throw new NotFoundError("Recipe not found");
    if (opts?.incrementView) incrementRecipeViews(prisma, recipe.id).catch(() => {});
    return { ...recipe, tags: recipe.tags.map((t) => t.tag), diets: recipe.diets.map((d) => d.diet) };
  }

  async getById(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        cuisine: true, country: true, category: true,
        ingredients: { orderBy: { sortOrder: "asc" } },
        instructions: { orderBy: { stepNumber: "asc" } },
        nutrition: true,
        tags: { include: { tag: true } },
        diets: { include: { diet: true } },
      },
    });
    if (!recipe) throw new NotFoundError("Recipe not found");
    return { ...recipe, tags: recipe.tags.map((t) => t.tag), diets: recipe.diets.map((d) => d.diet) };
  }

  async create(authorId: string, input: CreateRecipeInput) {
    const slug = input.slug ?? (await uniqueSlug(input.title, async (s) => !!(await prisma.recipe.findUnique({ where: { slug: s } }))));
    const recipe = await prisma.recipe.create({
      data: {
        title: input.title, slug, description: input.description ?? null,
        status: (input.status as any) ?? RecipeStatus.DRAFT,
        difficulty: input.difficulty as any, mealType: input.mealType as any,
        prepTimeMinutes: input.prepTimeMinutes ?? null, cookTimeMinutes: input.cookTimeMinutes ?? null,
        totalTimeMinutes: input.totalTimeMinutes ?? ((input.prepTimeMinutes ?? 0) + (input.cookTimeMinutes ?? 0) || null),
        servings: input.servings, calories: input.calories ?? null,
        cuisineId: input.cuisineId ?? null, countryId: input.countryId ?? null, categoryId: input.categoryId ?? null,
        authorId, heroImageUrl: input.heroImageUrl ?? null, tips: input.tips ?? null,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        ingredients: { create: input.ingredients.map((ing, i) => ({
          ingredientId: ing.ingredientId ?? null, name: ing.name ?? null, amount: ing.amount ?? null,
          unit: ing.unit ?? null, note: ing.note ?? null, group: ing.group ?? null,
          sortOrder: ing.sortOrder ?? i, optional: ing.optional ?? false,
        })) },
        instructions: { create: input.instructions.map((inst) => ({
          stepNumber: inst.stepNumber, title: inst.title ?? null, content: inst.content,
          imageUrl: inst.imageUrl ?? null, timerSeconds: inst.timerSeconds ?? null, tip: inst.tip ?? null,
        })) },
        nutrition: input.nutrition ? { create: input.nutrition } : undefined,
        tags: input.tagIds?.length ? { create: input.tagIds.map((tagId) => ({ tagId })) } : undefined,
        diets: input.dietIds?.length ? { create: input.dietIds.map((dietId) => ({ dietId })) } : undefined,
      },
    });
    return this.getById(recipe.id);
  }

  async update(id: string, userId: string, role: string, input: UpdateRecipeInput) {
    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Recipe not found");
    const isAdmin = ["ADMIN","SUPER_ADMIN","EDITOR"].includes(role);
    if (existing.authorId !== userId && !isAdmin) throw new ForbiddenError("You cannot edit this recipe");
    await prisma.recipe.update({
      where: { id },
      data: {
        title: input.title, description: input.description, status: input.status as any,
        difficulty: input.difficulty as any, mealType: input.mealType as any,
        prepTimeMinutes: input.prepTimeMinutes, cookTimeMinutes: input.cookTimeMinutes,
        totalTimeMinutes: input.totalTimeMinutes, servings: input.servings, calories: input.calories,
        cuisineId: input.cuisineId, countryId: input.countryId, categoryId: input.categoryId,
        heroImageUrl: input.heroImageUrl, tips: input.tips,
        publishedAt: input.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
      },
    });
    return this.getById(id);
  }

  async delete(id: string, userId: string, role: string) {
    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Recipe not found");
    if (existing.authorId !== userId && !["ADMIN","SUPER_ADMIN"].includes(role)) {
      throw new ForbiddenError("You cannot delete this recipe");
    }
    await prisma.recipe.delete({ where: { id } });
    return { ok: true };
  }
}
