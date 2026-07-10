import { Module } from "@nestjs/common";
import { PaperTradingController } from "./paper-trading.controller";

@Module({ controllers: [PaperTradingController] })
export class PaperTradingModule {}
