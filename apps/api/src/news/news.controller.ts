import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NewsService } from "./news.service";

@ApiTags("news")
@Controller("news")
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  async list(@Query("ticker") ticker?: string, @Query("limit") limit?: string) {
    const items = ticker ? await this.news.getForTicker(ticker.toUpperCase(), Number(limit) || 10) : await this.news.getMarketNews(Number(limit) || 20);
    return { isMock: this.news.isMock, items };
  }
}
