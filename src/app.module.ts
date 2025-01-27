import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './video/adapter/controller/jwt-auth.guard';
import { VideoController } from './video/adapter/controller/video.controller';

@Module({
  imports: [
    VideoModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
