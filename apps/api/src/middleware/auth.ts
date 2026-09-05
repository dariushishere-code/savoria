import type { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "@savoria/types";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.js";
const RANK: Record<string, number> = { USER:1, EDITOR:2, MODERATOR:3, ADMIN:4, SUPER_ADMIN:5 };
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply){
  try {
    const decoded = await request.jwtVerify<{ sub:string; email:string; role:UserRole }>();
    (request as any).userId = decoded.sub;
    (request as any).userRole = decoded.role;
  } catch { throw new UnauthorizedError("Invalid or expired token"); }
}
export async function optionalAuth(request: FastifyRequest){
  try {
    const decoded = await request.jwtVerify<{ sub:string; email:string; role:UserRole }>();
    (request as any).userId = decoded.sub;
    (request as any).userRole = decoded.role;
  } catch { /* anonymous */ }
}
export function requireRole(...roles: UserRole[]){
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    const role = (request as any).userRole as string;
    const level = RANK[role] ?? 0;
    const min = Math.min(...roles.map(r => RANK[r] ?? 99));
    if (level < min && !roles.includes(role as UserRole)) throw new ForbiddenError("Insufficient permissions");
  };
}
export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
export const requireEditor = requireRole(UserRole.EDITOR, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN);
