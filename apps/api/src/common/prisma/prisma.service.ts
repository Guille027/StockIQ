import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Thin wrapper around PrismaClient. Deliberately does NOT eagerly connect on
 * bootstrap (Prisma connects lazily on first query) so the API can boot and
 * serve every non-persistent route (companies, scores, scanner, AI reports,
 * news -- all backed by the market-data providers + in-memory cache) even
 * when no Postgres instance is reachable yet. Only routes that actually
 * touch the database (auth, watchlists, paper trading, alerts) require
 * DATABASE_URL to be configured and reachable.
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
      this.logger.warn(
        "Postgres no disponible (DATABASE_URL sin configurar o inalcanzable). Las rutas de auth/watchlist/paper-trading fallarán hasta que levantes la base de datos.",
      );
      return false;
    }
  }
}
