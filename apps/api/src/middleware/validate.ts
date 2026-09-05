import type { FastifyRequest } from "fastify";
import type { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../lib/errors.js";
function format(error: ZodError){
  const result: Record<string,string[]> = {};
  for (const i of error.issues){
    const p = i.path.join(".") || "_root";
    (result[p] ??= []).push(i.message);
  }
  return result;
}
export function validateBody<T>(schema: ZodSchema<T>){
  return async (request: FastifyRequest) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Validation failed", format(parsed.error));
    (request as any).body = parsed.data;
  };
}
export function validateQuery<T>(schema: ZodSchema<T>){
  return async (request: FastifyRequest) => {
    const parsed = schema.safeParse(request.query);
    if (!parsed.success) throw new ValidationError("Invalid query", format(parsed.error));
    (request as any).query = parsed.data;
  };
}
export function validateParams<T>(schema: ZodSchema<T>){
  return async (request: FastifyRequest) => {
    const parsed = schema.safeParse(request.params);
    if (!parsed.success) throw new ValidationError("Invalid params", format(parsed.error));
    (request as any).params = parsed.data;
  };
}
