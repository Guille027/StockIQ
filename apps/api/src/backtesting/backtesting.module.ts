import { Module } from "@nestjs/common";
import { BacktestingController } from "./backtesting.controller";

@Module({ controllers: [BacktestingController] })
export class BacktestingModule {}
