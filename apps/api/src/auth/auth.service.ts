import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 10;
  private readonly REFRESH_TOKEN_TTL_DAYS = 7;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private eventsService: EventsService,
  ) {}

  async register(dto: RegisterDto) {
  const existing = await this.prisma.user.findUnique({
    where: { email: dto.email.toLowerCase() },
  });

  if (existing) {
    throw new ConflictException({
      error: 'EMAIL_ALREADY_EXISTS',
      message: 'Cet email est déjà associé à un compte',
    });
  }

  const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

  // Générer un code de vérification à 6 chiffres
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setMinutes(verificationExpiresAt.getMinutes() + 15); // 15 min

  const monthlyResetAt = new Date();
  monthlyResetAt.setMonth(monthlyResetAt.getMonth() + 1);
  monthlyResetAt.setDate(1);

  const user = await this.prisma.user.create({
    data: {
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: (dto.role as any) || 'user',
      monthlyResetAt,
      emailVerified: false,
      verificationCode,
      verificationExpiresAt,
    },
  });

  // Envoyer le code par email
  await this.sendVerificationEmail(user.email, user.firstName, verificationCode);

  await this.eventsService.emit('user_registered', user.id, { role: user.role });

  const tokens = await this.generateTokens(user.id, user.role);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: this.sanitizeUser(user),
    requiresVerification: true,
  };
}
async verifyEmail(userId: string, code: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new UnauthorizedException('Utilisateur non trouve');
  if (user.emailVerified) return { message: 'Email deja verifie' };

  if (
    !user.verificationCode ||
    user.verificationCode !== code ||
    !user.verificationExpiresAt ||
    user.verificationExpiresAt < new Date()
  ) {
    throw new UnauthorizedException('Code invalide ou expire');
  }

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
    },
  });

  return { message: 'Email verifie avec succes' };
}

async resendVerificationCode(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedException('Utilisateur non trouve');
  if (user.emailVerified) return { message: 'Email deja verifie' };

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setMinutes(verificationExpiresAt.getMinutes() + 15);

  await this.prisma.user.update({
    where: { id: userId },
    data: { verificationCode, verificationExpiresAt },
  });

  await this.sendVerificationEmail(user.email, user.firstName, verificationCode);
  return { message: 'Code renvoye avec succes' };
}
private async sendVerificationEmail(email: string, firstName: string, code: string) {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: false,
      auth: this.config.get('SMTP_USER') ? {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      } : undefined,
    });

    await transporter.sendMail({
      from: `"Mallem" <noreply@mallem.fr>`,
      to: email,
      subject: 'Votre code de confirmation — Mallem',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #5E35B1, #EC407A); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">✦</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #212121; margin: 0;">Mallem</h1>
          </div>

          <div style="background: #FAFAFA; border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center;">
            <h2 style="color: #212121; font-size: 20px; margin-bottom: 16px;">
              Bonjour ${firstName} 👋
            </h2>
            <p style="color: #616161; line-height: 1.6; margin-bottom: 24px;">
              Merci de vous être inscrit sur Mallem ! 
              Voici votre code de confirmation :
            </p>
            <div style="background: linear-gradient(135deg, #5E35B1, #EC407A); border-radius: 16px; padding: 24px; margin: 24px 0;">
              <p style="color: white; font-size: 48px; font-weight: 700; letter-spacing: 12px; margin: 0;">
                ${code}
              </p>
            </div>
            <p style="color: #9E9E9E; font-size: 14px;">
              Ce code expire dans <strong>15 minutes</strong>.
            </p>
          </div>

          <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
            Si vous n'avez pas créé de compte sur Mallem, ignorez cet email.
          </p>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E0E0E0;">
            <p style="color: #9E9E9E; font-size: 12px;">
              © 2026 Mallem — Fait avec ❤️ pour valoriser les couturières
            </p>
          </div>
        </div>
      `,
    });

    this.logger.log(`Code de verification envoye a : ${email}`);
  } catch (error) {
    this.logger.error('Erreur envoi email verification', error.message);
  }
}
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    return user;
  }

  async login(user: any, rememberMe = false) {
    const tokens = await this.generateTokens(user.id, user.role, rememberMe);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: this.sanitizeUser(user) };
  }

  async refreshTokens(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException({ error: 'REFRESH_TOKEN_EXPIRED', message: 'Session expirée' });
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const tokens = await this.generateTokens(stored.userId, stored.user.role);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async requestPasswordReset(email: string) {
  
  const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  this.logger.log(`Reset demande pour: ${email} — user trouve: ${!!user}`);
  if (!user) {
    return { message: 'Si ce compte existe, un email a été envoyé' };
  }

  // Générer un token de reset
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = this.hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expire dans 30 min

  // Supprimer les anciens tokens
  await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Créer le nouveau token
  await this.prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // URL de reset
  const resetUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${rawToken}`;

  // Envoyer l'email via Nodemailer
  await this.sendResetEmail(user.email, user.firstName, resetUrl);

  this.logger.log(`Reset password demande pour : ${email}`);
  return { message: 'Si ce compte existe, un email a été envoyé' };
}

async resetPassword(token: string, newPassword: string) {
  const tokenHash = this.hashToken(token);

  const resetToken = await this.prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!resetToken) {
    throw new UnauthorizedException('Token invalide ou expiré');
  }

  // Hasher le nouveau mot de passe
  const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

  // Mettre à jour le mot de passe
  await this.prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  // Marquer le token comme utilisé
  await this.prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  // Révoquer tous les refresh tokens
  await this.prisma.refreshToken.updateMany({
    where: { userId: resetToken.userId },
    data: { revokedAt: new Date() },
  });

  return { message: 'Mot de passe modifié avec succès' };
}

private async sendResetEmail(email: string, firstName: string, resetUrl: string) {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: false,
      auth: this.config.get('SMTP_USER') ? {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      } : undefined,
    });

    await transporter.sendMail({
      from: `"Mallem" <noreply@mallem.fr>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — Mallem',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #5E35B1, #EC407A); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">✦</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #212121; margin: 0;">Mallem</h1>
          </div>
          
          <div style="background: #FAFAFA; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #212121; font-size: 20px; margin-bottom: 16px;">
              Bonjour ${firstName} 👋
            </h2>
            <p style="color: #616161; line-height: 1.6; margin-bottom: 24px;">
              Vous avez demandé la réinitialisation de votre mot de passe. 
              Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${resetUrl}" 
                style="display: inline-block; background: linear-gradient(135deg, #5E35B1, #EC407A); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #9E9E9E; font-size: 14px; text-align: center;">
              Ce lien expire dans <strong>30 minutes</strong>.
            </p>
          </div>
          
          <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br/>
            Votre mot de passe ne sera pas modifié.
          </p>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E0E0E0;">
            <p style="color: #9E9E9E; font-size: 12px;">
              © 2026 Mallem — Fait avec ❤️ pour valoriser les couturières
            </p>
          </div>
        </div>
      `,
    });

    this.logger.log(`Email de reset envoyé à : ${email}`);
  } catch (error) {
    this.logger.error('Erreur envoi email reset', error.message);
  }
}

  async getProfile(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      gender: true,
      morphologyJson: true,
      preferencesJson: true,
      subscriptionStatus: true,
      aiCredits: true,
      monthlyGenerationsUsed: true,
      createdAt: true,
    },
  });
}
private async generateTokens(userId: string, role: string, longSession = false) {
    const accessToken = this.jwt.sign({ sub: userId, role }, { expiresIn: '15m' });
    const rawRefreshToken = randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (longSession ? 30 : this.REFRESH_TOKEN_TTL_DAYS));
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
