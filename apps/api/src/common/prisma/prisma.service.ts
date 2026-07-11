import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Thin wrapper around PrismaClient (SQLite -- a single local file, created
 * by `pnpm db:push`, no Docker/cloud account needed). Deliberately does NOT
 * eagerly connect on bootstrap (Prisma connects lazily on first query) so
 * the API can still boot and serve every non-persistent route (companies,
 * scores, scanner, AI reports, news -- all backed by the market-data
 * providers + in-memory cache) even if the db file hasn't been created yet.
 * Only routes that actually touch the database (paper trading, and auth if
 * it's ever re-enabled) need `pnpm db:push` to have been run first.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      this.logger.warn("Base de datos no disponible -- ejecuta `pnpm db:push` para crear el archivo SQLite.");
      return false;
    }
  }
}
