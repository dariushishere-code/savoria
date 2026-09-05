import type { FastifyReply } from "fastify";
export function ok<T>(reply: FastifyReply, data: T, message?: string){ return reply.status(200).send({ success:true, data, message }); }
export function created<T>(reply: FastifyReply, data: T, message?: string){ return reply.status(201).send({ success:true, data, message }); }
