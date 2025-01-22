import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    VideoModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MessageModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
