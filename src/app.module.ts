import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    VideoModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MessageModule,
    DatabaseModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
