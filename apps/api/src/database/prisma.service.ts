import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@ai-bos/database';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public static readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async runWithTenant<T>(tenantId: string | undefined, fn: () => Promise<T>): Promise<T> {
    return PrismaService.asyncLocalStorage.run({ tenantId }, async () => {
      if (!tenantId) {
        return fn();
      }
      return this.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
        return fn();
      });
    });
  }
}
