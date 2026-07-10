import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { getSectors } from "@stockiq/universe";
import { ScannerService } from "./scanner.service";
import { ScannerFilterDto } from "./dto/scanner-filter.dto";

@ApiTags("scanner")
@Controller("scanner")
export class ScannerController {
  constructor(private readonly scanner: ScannerService) {}

  @Post()
  async run(@Body() filter: ScannerFilterDto) {
    const results = await this.scanner.run(filter);
    return { count: results.length, results };
  }

  @Get("sectors")
  getSectors() {
    return { sectors: getSectors() };
  }
}
