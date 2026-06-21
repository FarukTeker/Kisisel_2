import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { WidgetDto } from './widget.dto';

export class SaveDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetDto)
  widgets: WidgetDto[];

  @IsOptional()
  @IsIn(['S', 'H', 'F'])
  readingMode?: 'S' | 'H' | 'F';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  columns?: number;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsIn(['en', 'tr'])
  language?: 'en' | 'tr';
}
