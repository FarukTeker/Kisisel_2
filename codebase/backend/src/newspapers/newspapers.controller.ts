import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { NewspapersService } from './newspapers.service';
import { SaveDashboardDto } from './dto/save-dashboard.dto';
import { ShareDashboardDto } from './dto/share-dashboard.dto';

@Controller('newspapers')
export class NewspapersController {
  constructor(private readonly newspapers: NewspapersService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.newspapers.getDashboard(user.sub);
  }

  @Post('dashboard')
  @UseGuards(JwtAuthGuard)
  saveDashboard(@CurrentUser() user: JwtPayload, @Body() dto: SaveDashboardDto) {
    return this.newspapers.saveDashboard(user.sub, dto);
  }

  @Post('share')
  @UseGuards(JwtAuthGuard)
  share(@CurrentUser() user: JwtPayload, @Body() dto: ShareDashboardDto) {
    return this.newspapers.share(user.sub, dto);
  }

  // Public — list of shared newspapers for the Discover page.
  @Get('discover')
  discover() {
    return this.newspapers.discover();
  }

  // Public — anyone with the slug can view a shared newspaper.
  @Get('shared/:slug')
  getShared(@Param('slug') slug: string) {
    return this.newspapers.getShared(slug);
  }
}
