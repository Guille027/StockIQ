import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JournalService } from "./journal.service";
import { CreateNoteDto, SaveReflectionDto } from "./dto/journal.dto";

@ApiTags("journal")
@Controller("journal")
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  list(@Query("ticker") ticker?: string, @Query("kind") kind?: string) {
    return this.journal.listEntries({ ticker, kind });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.journal.getEntry(id);
  }

  @Patch(":id/reflection")
  reflect(@Param("id") id: string, @Body() dto: SaveReflectionDto) {
    return this.journal.saveReflection(id, dto);
  }

  @Post()
  createNote(@Body() dto: CreateNoteDto) {
    return this.journal.createNote(dto.text);
  }
}
