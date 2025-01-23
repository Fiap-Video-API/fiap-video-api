import { Module } from '@nestjs/common';
import { VideoController } from './adapter/controller/video.controller';
import { VideoService } from './core/application/services/video.service';
import { MessageModule } from 'src/message/message.module';
import { DataSource } from 'typeorm';
import { VideoEntity } from './adapter/repository/entity/video.entity';
import { IVideoService } from './core/application/services/video.service.port';
import { IVideoRepository } from './core/application/repository/video-repository.port';
import { VideoRepositoryAdapter } from './adapter/repository/video-repository.adapter';
import { EmailModule } from 'src/email/email.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [
    {
      provide: IVideoService,
      useClass: VideoService,
    },
    {
      provide: IVideoRepository,
      useClass: VideoRepositoryAdapter,
    },
    {
      provide: 'VIDEO_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(VideoEntity),
      inject: ['DATA_SOURCE'],
    },
  ],
  controllers: [VideoController],
  imports: [MessageModule, EmailModule, DatabaseModule]
})
export class VideoModule {}
