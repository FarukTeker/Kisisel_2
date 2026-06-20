import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class WidgetDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  layoutType: string;

  @IsString()
  kind: string;

  @IsOptional()
  @IsString()
  publisherId?: string;

  @IsOptional()
  @IsString()
  editorialBody?: string;

  @IsOptional()
  @IsString()
  categoryFilter?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) layoutX?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) layoutY?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) layoutW?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) layoutH?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) layoutMinW?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) layoutMinH?: number;
}
