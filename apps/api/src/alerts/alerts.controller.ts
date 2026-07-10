import { Controller, Get, NotImplementedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * TODO (phase 2): CRUD over `Alert` (Prisma model already defined, condition
 * shape in packages/shared-types/src/alert.ts) plus a periodic evaluation
 * job that checks each active alert's condition against fresh scores/prices
 * and triggers a push notification (see docs/ARCHITECTURE.md roadmap for
 * the notifications subsystem). Contract: GET/POST /alerts.
 */
@ApiTags("alerts")
@Controller("alerts")
export class AlertsController {
  @Get()
  notImplemented(): never {
    throw new NotImplementedException("Alertas todavía no implementadas -- ver roadmap en docs/ARCHITECTURE.md.");
  }
}
