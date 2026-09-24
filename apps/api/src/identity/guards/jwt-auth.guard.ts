import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['auth_token'] || this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET', 'ai-bos-secret-key-change-in-prod'),
      });

      if (payload.mfaPending) {
        throw new UnauthorizedException('MFA verification pending');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
