import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    VideoModule,
  ],
})
export class AppModule {}
