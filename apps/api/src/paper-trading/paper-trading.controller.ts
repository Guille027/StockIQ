import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaperTradingService } from "./paper-trading.service";
import { CreatePortfolioDto } from "./dto/create-portfolio.dto";
import { PlaceOrderDto } from "./dto/place-order.dto";

@ApiTags("paper-trading")
@Controller("paper-trading/portfolios")
export class PaperTradingController {
  constructor(private readonly paperTrading: PaperTradingService) {}

  @Get()
  list() {
    return this.paperTrading.listPortfolios();
  }

  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.paperTrading.createPortfolio(dto.name, dto.startingBalance);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.paperTrading.getPortfolio(id);
  }

  @Get(":id/orders")
  orders(@Param("id") id: string) {
    return this.paperTrading.listOrders(id);
  }

  @Post(":id/orders")
  placeOrder(@Param("id") id: string, @Body() dto: PlaceOrderDto) {
    return this.paperTrading.placeOrder(id, dto.ticker, dto.side, dto.quantity);
  }

  @Post(":id/reset")
  reset(@Param("id") id: string) {
    return this.paperTrading.resetPortfolio(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.paperTrading.deletePortfolio(id);
  }
}
