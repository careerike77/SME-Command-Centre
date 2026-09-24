import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateTenantDto, CreateBranchDto, UpdateTaxSettingDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantMe(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async () => {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          branches: true,
          taxSettings: true,
        },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      return tenant;
    });
  }

  async updateTenantMe(tenantId: string, dto: UpdateTenantDto) {
    return this.prisma.runWithTenant(tenantId, async () => {
      return this.prisma.tenant.update({
        where: { id: tenantId },
        data: dto,
      });
    });
  }

  async getBranches(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async () => {
      return this.prisma.branch.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    return this.prisma.runWithTenant(tenantId, async () => {
      if (dto.isPrimary) {
        // Demote existing primary branch
        await this.prisma.branch.updateMany({
          where: { tenantId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return this.prisma.branch.create({
        data: {
          tenantId,
          ...dto,
        },
      });
    });
  }

  async getTaxSettings(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async () => {
      let setting = await this.prisma.taxSetting.findFirst({
        where: { tenantId },
      });

      if (!setting) {
        setting = await this.prisma.taxSetting.create({
          data: {
            tenantId,
            vatEnabled: false,
            defaultTaxRate: 0.0,
            fiscalYearStart: '01-01',
          },
        });
      }

      return setting;
    });
  }

  async updateTaxSettings(tenantId: string, dto: UpdateTaxSettingDto) {
    return this.prisma.runWithTenant(tenantId, async () => {
      const existing = await this.getTaxSettings(tenantId);
      return this.prisma.taxSetting.update({
        where: { id: existing.id },
        data: dto,
      });
    });
  }
}
