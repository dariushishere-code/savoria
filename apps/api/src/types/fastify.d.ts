import type { UserRole } from "@savoria/types";
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: UserRole };
    user: { sub: string; email: string; role: UserRole };
  }
}
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: UserRole;
  }
}
