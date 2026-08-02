import { Module } from "@nestjs/common";
import { XpService } from "./xp.service";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";

/**
 * The learner's identity: XP, rank ("Rango", not to be confused with the
 * curriculum's Nivel 0-6), and daily streak. XpService is exported because
 * every other education module (learning, journal, coach, paper-trading)
 * grants XP through it -- it is the single, idempotent choke point.
 */
@Module({
  controllers: [ProfileController],
  providers: [XpService, ProfileService],
  exports: [XpService],
})
export class ProfileModule {}
