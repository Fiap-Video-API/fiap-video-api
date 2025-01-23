import { Injectable } from '@nestjs/common';
import { Video } from '../../domain/Video';
import { VideoStatus } from '../../domain/VideoStatus';
import { IVideoService } from './video.service.port';
import { IMessageConnectService } from 'src/message/message-connect.service.port';

@Injectable()
export class VideoService implements IVideoService {

  constructor(private readonly messageConnectService: IMessageConnectService){}

  async processarArquivo(file: Express.Multer.File): Promise<Video> {

    const video = {
      id: '',
      status: VideoStatus.PROCESSANDO,
      pathVideo: file.filename,
      pathZip: null
    };

    // this.messageConnectService.enviarVideoProcessamento(JSON.stringify(video));

    return video;

  }

  async registrarDownload(video: Video): Promise<Video> {

    return video;

  }
}
