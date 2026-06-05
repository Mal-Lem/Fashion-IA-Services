import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

const COOKIE = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/v1/auth',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Creer un nouveau compte' })
  @ApiResponse({ status: 201, description: 'Compte cree avec succes' })
  @ApiResponse({ status: 409, description: 'Email deja utilise' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie(COOKIE, result.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { access_token: result.accessToken, user: result.user };
  }

  @ApiOperation({ summary: 'Connexion par email/mot de passe' })
  @ApiResponse({ status: 200, description: 'Connexion reussie' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user, dto.rememberMe);
    const maxAge = dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie(COOKIE, result.refreshToken, { ...COOKIE_OPTS, maxAge });
    return { access_token: result.accessToken, user: result.user };
  }

  @ApiOperation({ summary: 'Renouveler le token JWT' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[COOKIE];
    if (!refreshToken) throw new UnauthorizedException({ error: 'REFRESH_TOKEN_MISSING' });
    const result = await this.authService.refreshTokens(refreshToken);
    res.cookie(COOKIE, result.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { access_token: result.accessToken };
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Deconnexion' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[COOKIE];
    await this.authService.logout(req.user['sub'], refreshToken);
    res.clearCookie(COOKIE, COOKIE_OPTS);
  }

  @ApiOperation({ summary: 'Demande de reinitialisation mot de passe' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Recuperer le profil connecte' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
  const user = await this.authService.getProfile(req.user['sub'] || req.user['id']);
  return user;
}
@UseGuards(JwtAuthGuard)
@Post('verify-email')
@HttpCode(HttpStatus.OK)
async verifyEmail(@Req() req: Request, @Body() body: { code: string }) {
  return this.authService.verifyEmail(req.user['id'], body.code);
}

@UseGuards(JwtAuthGuard)
@Post('resend-verification')
@HttpCode(HttpStatus.OK)
async resendVerification(@Req() req: Request) {
  return this.authService.resendVerificationCode(req.user['id']);
}

@Post('reset-password')
@HttpCode(HttpStatus.OK)
async resetPassword(@Body() body: { token: string; password: string }) {
  return this.authService.resetPassword(body.token, body.password);
}
}