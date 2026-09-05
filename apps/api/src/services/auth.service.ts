import { prisma } from "@savoria/database";
import { UserRole, UserStatus } from "@savoria/types";
import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from "../lib/errors.js";
import { env } from "../config/env.js";

export class AuthService {
  constructor(private app: FastifyInstance) {}

  async register(input: { email: string; password: string; name: string }) {
    if (env.FEATURE_REGISTRATION_ENABLED === "false") throw new BadRequestError("Registration disabled");
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictError("Email already registered");
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
      },
      select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true, createdAt: true },
    });
    const token = randomBytes(32).toString("hex");
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 86400000) },
    });
    return { user, verificationToken: env.NODE_ENV === "development" ? token : undefined };
  }

  async login(input: { email: string; password: string }, meta?: { userAgent?: string; ipAddress?: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user?.passwordHash) throw new UnauthorizedError("Invalid email or password");
    if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedError("Account is suspended or banned");
    }
    if (!(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.issueTokens(user.id, user.email, user.role, meta);
    return {
      user: {
        id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl,
        role: user.role, status: user.status, emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async issueTokens(userId: string, email: string, role: UserRole | string, meta?: { userAgent?: string; ipAddress?: string }) {
    const accessToken = this.app.jwt.sign({ sub: userId, email, role: role as UserRole }, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    await prisma.session.create({
      data: {
        userId, refreshToken, expiresAt,
        userAgent: meta?.userAgent ?? null,
        ipAddress: meta?.ipAddress ?? null,
      },
    });
    return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_EXPIRES_IN };
  }

  async refresh(refreshToken: string) {
    const session = await prisma.session.findUnique({ where: { refreshToken }, include: { user: true } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    await prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.user.id, session.user.email, session.user.role);
  }

  async logout(refreshToken: string) {
    await prisma.session.deleteMany({ where: { refreshToken } });
  }

  async logoutAll(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { ok: true };
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600000) },
    });
    return { ok: true, resetToken: env.NODE_ENV === "development" ? token : undefined };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date() || record.usedAt) throw new BadRequestError("Invalid or expired reset token");
    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);
    return { ok: true };
  }

  async verifyEmail(token: string) {
    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date() || record.usedAt) throw new BadRequestError("Invalid or expired verification token");
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true, emailVerifiedAt: new Date(), status: UserStatus.ACTIVE } }),
      prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    return { ok: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new NotFoundError("User not found");
    if (!(await verifyPassword(currentPassword, user.passwordHash))) throw new UnauthorizedError("Current password is incorrect");
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
    await prisma.session.deleteMany({ where: { userId } });
    return { ok: true };
  }
}
