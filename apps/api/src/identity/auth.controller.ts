import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterTenantDto, LoginDto, MfaVerifyDto, MfaSetupVerifyDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-tenant')
  async registerTenant(@Body() dto: RegisterTenantDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.registerTenant(dto, res);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  async setupMfa(@Req() req: Request) {
    const user = req.user;
    return this.authService.setupMfa(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify-setup')
  async verifyMfaSetup(@Req() req: Request, @Body() dto: MfaSetupVerifyDto) {
    const user = req.user;
    return this.authService.verifyMfaSetup(user.sub, dto);
  }

  @Post('mfa/verify')
  async verifyMfa(
    @Headers('x-mfa-pending-token') mfaPendingHeaderToken: string,
    @Body() dto: MfaVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyMfaLogin(mfaPendingHeaderToken, dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user;
    return this.authService.getMe(user.sub);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
