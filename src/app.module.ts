import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './video/adapter/controller/jwt-auth.guard';

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
  providers: [{
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },],
})
export class AppModule {}
