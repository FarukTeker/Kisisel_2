import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ArticlesModule } from './articles/articles.module';
import { NewspapersModule } from './newspapers/newspapers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    IngestionModule,
    ArticlesModule,
    NewspapersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
