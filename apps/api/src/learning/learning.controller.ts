import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LearningService } from "./learning.service";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";

@ApiTags("learning")
@Controller("learning")
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get("roadmap")
  async roadmap() {
    return this.learning.getRoadmap();
  }

  @Get("lessons/:id")
  async lesson(@Param("id") id: string) {
    return this.learning.getLessonWithLiveStats(id);
  }

  @Post("lessons/:id/complete")
  async complete(@Param("id") id: string, @Body() dto: CompleteLessonDto) {
    return this.learning.completeLesson(id, dto.answers);
  }
}
