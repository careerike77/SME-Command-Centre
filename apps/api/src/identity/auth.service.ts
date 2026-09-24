import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { PrismaService } from '../database/prisma.service';
import { RegisterTenantDto, LoginDto, MfaVerifyDto, MfaSetupVerifyDto } from './dto/auth.dto';
import { Response } from 'express';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  mfaPending?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerTenant(dto: RegisterTenantDto, res: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    // Create tenant, default branch, tax setting, and admin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          country: dto.country || 'US',
          currency: dto.currency || 'USD',
          industry: dto.industry,
        },
      });

      const primaryBranch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: 'Main Branch',
          code: 'MAIN',
          isPrimary: true,
          isActive: true,
        },
      });

      const taxSetting = await tx.taxSetting.create({
        data: {
          tenantId: tenant.id,
          vatEnabled: false,
          defaultTaxRate: 0.0,
          fiscalYearStart: '01-01',
        },
      });

      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email.toLowerCase(),
          passwordHash: hashedPassword,
          fullName: dto.fullName,
          role: 'ADMIN',
        },
      });

      return { tenant, primaryBranch, taxSetting, user: adminUser };
    });

    const token = this.issueToken({
      sub: result.user.id,
      tenantId: result.tenant.id,
      role: result.user.role,
    });

    this.setAuthCookie(res, token);

    return {
      message: 'Tenant registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        tenantId: result.tenant.id,
      },
      tenant: result.tenant,
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.mfaEnabled) {
      const mfaToken = this.jwtService.sign(
        { sub: user.id, tenantId: user.tenantId, role: user.role, mfaPending: true },
        {
          secret: this.configService.get('JWT_SECRET', 'ai-bos-secret-key-change-in-prod'),
          expiresIn: this.configService.get('MFA_PENDING_EXPIRATION', '5m'),
        },
      );
      return {
        mfaRequired: true,
        mfaPendingToken: mfaToken,
      };
    }

    const token = this.issueToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    this.setAuthCookie(res, token);

    return {
      mfaRequired: false,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = otplib.authenticator.generateSecret();
    const otpAuthUrl = otplib.authenticator.keyuri(user.email, 'AI-BOS', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);

    // Temporarily store secret
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return {
      secret,
      qrCodeUrl,
    };
  }

  async verifyMfaSetup(userId: string, dto: MfaSetupVerifyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup was not initiated');
    }

    const isValid = otplib.authenticator.verify({
      token: dto.code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA setup verified and enabled successfully' };
  }

  async verifyMfaLogin(mfaPendingToken: string, dto: MfaVerifyDto, res: Response) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(mfaPendingToken, {
        secret: this.configService.get('JWT_SECRET', 'ai-bos-secret-key-change-in-prod'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA session');
    }

    if (!payload.mfaPending) {
      throw new UnauthorizedException('Invalid MFA context');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('User or MFA configuration invalid');
    }

    const isValid = otplib.authenticator.verify({
      token: dto.code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const token = this.issueToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    this.setAuthCookie(res, token);

    return {
      message: 'MFA verification successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        mfaEnabled: true,
        createdAt: true,
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private issueToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'ai-bos-secret-key-change-in-prod'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 mins default
    });
  }
}
