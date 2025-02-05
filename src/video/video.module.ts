// video.module.ts
import { Module } from '@nestjs/common';
import { VideoController } from './adapter/controller/video.controller';
import { VideoService } from './core/application/services/video.service';
import { DataSource } from 'typeorm';
import { VideoEntity } from './adapter/repository/entity/video.entity';
import { IVideoService } from './core/application/services/video.service.port';
import { IVideoRepository } from './core/application/repository/video-repository.port';
import { VideoRepositoryAdapter } from './adapter/repository/video-repository.adapter';
import { SESClient } from '@aws-sdk/client-ses';
import { IEmailService } from './core/application/services/email.service.port';
import { EmailService } from './adapter/email/email.service';
import { IMessageConnectService } from './core/application/services/message-connect.service.port';
import { MessageConnectService } from './adapter/message/message-connect.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [
    {
      provide: 'VIDEO_REPOSITORY',
      useFactory: (dataSource: DataSource) => {
        return dataSource.getRepository(VideoEntity);
      },
      inject: ['DATA_SOURCE'],
    },    
    {
      provide: 'SES_CLIENT',
      useFactory: () => {
        return new SESClient({
          region: process.env.AWS_REGION,
          endpoint: process.env.AWS_SQS_ENDPOINT,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        });
      },
    },
    {
      provide: IVideoService,
      useClass: VideoService,
    },
    {
      provide: IVideoRepository,
      useClass: VideoRepositoryAdapter,
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
    {
      provide: IMessageConnectService,
      useClass: MessageConnectService,
    }
  ],
  controllers: [VideoController],
  imports: [DatabaseModule]
})
export class VideoModule {}