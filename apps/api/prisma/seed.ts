/**
 * Placeholder seed script. Phase 1 doesn't need seeded rows -- the
 * investable universe lives in packages/universe (static, code-level source
 * of truth), and fundamentals/scores/news are computed on demand and cached
 * in-process. This file exists so `pnpm prisma:seed` has something to grow
 * into once watchlists/paper-trading/alerts need demo data (phase 2).
 */
async function main() {
  console.log("Nada que sembrar todavía -- ver prisma/seed.ts");
}

main();
