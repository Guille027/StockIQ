import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CoachService } from "./coach.service";

@ApiTags("coach")
@Controller("coach")
export class CoachController {
  constructor(private readonly coach: CoachService) {}

  /** Generates (or returns cached) mentor feedback for a closed trade. */
  @Post("trades/:orderId")
  generate(@Param("orderId") orderId: string) {
    return this.coach.getOrGenerateTradeFeedback(orderId);
  }

  /** Cached feedback or 404 -- the app uses this to decide whether to show the "Pedir feedback" button. */
  @Get("trades/:orderId")
  get(@Param("orderId") orderId: string) {
    return this.coach.getCachedTradeFeedback(orderId);
  }

  /** On-demand review of the last 10 planned trades. Cached per day. */
  @Post("review")
  review() {
    return this.coach.getOrGeneratePeriodReview();
  }
}
