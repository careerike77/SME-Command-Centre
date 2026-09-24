import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { UpdateTenantDto, CreateBranchDto, UpdateTaxSettingDto } from './dto/tenant.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('tenants/me')
  async getTenantMe(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.tenantService.getTenantMe(tenantId);
  }

  @Patch('tenants/me')
  async updateTenantMe(@Req() req: Request, @Body() dto: UpdateTenantDto) {
    const tenantId = req.user.tenantId;
    return this.tenantService.updateTenantMe(tenantId, dto);
  }

  @Get('branches')
  async getBranches(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.tenantService.getBranches(tenantId);
  }

  @Post('branches')
  async createBranch(@Req() req: Request, @Body() dto: CreateBranchDto) {
    const tenantId = req.user.tenantId;
    return this.tenantService.createBranch(tenantId, dto);
  }

  @Get('tax-settings')
  async getTaxSettings(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.tenantService.getTaxSettings(tenantId);
  }

  @Patch('tax-settings')
  async updateTaxSettings(@Req() req: Request, @Body() dto: UpdateTaxSettingDto) {
    const tenantId = req.user.tenantId;
    return this.tenantService.updateTaxSettings(tenantId, dto);
  }
}
