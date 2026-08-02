import { Module } from "@nestjs/common";
import { ProfileModule } from "../profile/profile.module";
import { JournalService } from "./journal.service";
import { JournalController } from "./journal.controller";

/**
 * The investor's journal: every trade auto-creates an entry (from
 * PaperTradingService); the user enriches it later with a reflection.
 * Free-form notes are also supported. Exported so CoachModule can read
 * entries when critiquing a trade.
 */
@Module({
  imports: [ProfileModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
