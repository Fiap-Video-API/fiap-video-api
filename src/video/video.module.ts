import { Module } from '@nestjs/common';
import { VideoController } from './adapter/controller/video.controller';
import { VideoService } from './core/application/services/video.service';
import { DownloadController } from './adapter/controller/download.controller';
import { MessageModule } from 'src/message/message.module';
import { DownloadService } from './core/application/services/download.service';
import { DataSource } from 'typeorm';
import { VideoEntity } from './adapter/repository/entity/video.entity';

@Module({
  providers: [
    // {
    //   provide: ICadastrarClienteUseCase,
    //   useClass: CadastrarClienteService,
    // },
    DownloadService, VideoService,
    {
      provide: 'VIDEO_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(VideoEntity),
      inject: ['DATA_SOURCE'],
    },
  ],
  controllers: [VideoController, DownloadController],
  imports: [MessageModule]
})
export class VideoModule {}
