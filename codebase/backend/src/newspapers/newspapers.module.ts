import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NewspapersController } from './newspapers.controller';
import { NewspapersService } from './newspapers.service';

@Module({
  imports: [AuthModule],
  controllers: [NewspapersController],
  providers: [NewspapersService],
})
export class NewspapersModule {}
