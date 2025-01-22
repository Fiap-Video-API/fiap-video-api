import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Video } from '../../domain/Video';
import { VideoStatus } from '../../domain/VideoStatus';
import { MessageConnectService } from 'src/message/message-connect.service';

@Injectable()
export class VideoService {

  constructor(private readonly messageConnectService: MessageConnectService){}

  async saveFile(file: Express.Multer.File): Promise<Video> {

    const video = {
      id: '',
      status: VideoStatus.PROCESSANDO,
      pathVideo: file.filename,
      pathZip: null
    };

    this.messageConnectService.enviarVideoProcessamento(JSON.stringify(video));

    return video;

  }
}
