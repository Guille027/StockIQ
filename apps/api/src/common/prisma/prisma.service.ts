import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Thin wrapper around PrismaClient (managed Postgres, e.g. Neon's free
 * tier -- see .env.example). Deliberately does NOT eagerly connect on
 * bootstrap (Prisma connects lazily on first query) so the API can still
 * boot and serve every non-persistent route (companies, scores, scanner,
 * AI reports, news -- all backed by the market-data providers + in-memory
 * cache) even if DATABASE_URL is missing or the schema hasn't been pushed
 * yet. Only routes that actually touch the database (profile/XP, learning
 * progress, journal, paper trading) need `pnpm db:push` to have run first.
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
      this.logger.warn("Base de datos no disponible -- comprueba DATABASE_URL y ejecuta `pnpm db:push`.");
      return false;
    }
  }
}
