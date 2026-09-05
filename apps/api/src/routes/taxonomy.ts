import type { FastifyInstance } from "fastify";
import { prisma } from "@savoria/database";
import { ok } from "../lib/response.js";
export async function taxonomyRoutes(app: FastifyInstance) {
  app.get("/cuisines", async (_r, reply) => ok(reply, await prisma.cuisine.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { recipes: true } } } })));
  app.get("/countries", async (_r, reply) => ok(reply, await prisma.country.findMany({ orderBy: { name: "asc" } })));
  app.get("/categories", async (_r, reply) => ok(reply, await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })));
  app.get("/tags", async (_r, reply) => ok(reply, await prisma.tag.findMany({ orderBy: { name: "asc" } })));
  app.get("/diets", async (_r, reply) => ok(reply, await prisma.diet.findMany({ orderBy: { name: "asc" } })));
  app.get("/ingredients", async (_r, reply) => ok(reply, await prisma.ingredient.findMany({ orderBy: { name: "asc" }, take: 100 })));
}
