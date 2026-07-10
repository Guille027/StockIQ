import { Controller, Get, NotFoundException, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AiService } from "./ai.service";

@ApiTags("ai")
@Controller()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("companies/:ticker/ai-report")
  async getReport(@Param("ticker") ticker: string) {
    const cached = this.ai.getCachedReport(ticker.toUpperCase());
    if (!cached) {
      throw new NotFoundException("Todavía no se ha generado un informe IA para esta empresa. Haz POST a este mismo endpoint para generarlo.");
    }
    return cached;
  }

  @Post("companies/:ticker/ai-report")
  async generateReport(@Param("ticker") ticker: string, @Query("regenerate") regenerate?: string) {
    return this.ai.generateReport(ticker, regenerate === "true");
  }

  @Get("market/daily-summary")
  async getDailySummary() {
    return this.ai.getDailySummary();
  }
}
