import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
export async function hashPassword(p: string){ return bcrypt.hash(p, env.BCRYPT_ROUNDS); }
export async function verifyPassword(p: string, h: string){ return bcrypt.compare(p, h); }
