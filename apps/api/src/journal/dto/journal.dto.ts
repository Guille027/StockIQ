import { ArrayMaxSize, IsArray, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SaveReflectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reflection!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  mistakes!: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  learnings!: string[];
}

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}
