import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  async get() {
    return this.profile.getProfile();
  }
}
