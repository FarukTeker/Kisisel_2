import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { FollowsService } from './follows.service';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}

  @Get()
  listFollowing(@CurrentUser() user: JwtPayload) {
    return this.follows.listFollowing(user.sub);
  }

  @Get('feed')
  feed(@CurrentUser() user: JwtPayload) {
    return this.follows.feed(user.sub);
  }

  @Post(':userId')
  follow(@CurrentUser() user: JwtPayload, @Param('userId') userId: string) {
    return this.follows.follow(user.sub, userId);
  }

  @Delete(':userId')
  unfollow(@CurrentUser() user: JwtPayload, @Param('userId') userId: string) {
    return this.follows.unfollow(user.sub, userId);
  }
}
