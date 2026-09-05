import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';

export function toPrismaPagination(page = 1, pageSize = 20) {
  const p = Math.max(1, page);
  const size = Math.min(100, Math.max(1, pageSize));
  return { skip: (p - 1) * size, take: size, page: p, pageSize: size };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function incrementRecipeViews(
  client: PrismaClient,
  recipeId: string,
) {
  await client.recipe.update({
    where: { id: recipeId },
    data: { viewCount: { increment: 1 } },
  });
}
