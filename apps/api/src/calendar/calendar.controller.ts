import { Controller, Get, NotImplementedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * TODO (phase 2): backed by `CalendarEvent` data pulled from the market-data
 * provider's earnings/dividend endpoints + a `calendar_events` table for
 * manually curated events (CEO changes, investor days). Contract:
 * GET /calendar?from=&to=&ticker= -> { events: CalendarEvent[] } (see
 * packages/shared-types/src/calendar.ts for the shape).
 */
@ApiTags("calendar")
@Controller("calendar")
export class CalendarController {
  @Get()
  notImplemented(): never {
    throw new NotImplementedException("Calendario todavía no implementado -- ver roadmap en docs/ARCHITECTURE.md.");
  }
}
