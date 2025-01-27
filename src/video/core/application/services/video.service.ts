import { Injectable } from '@nestjs/common';
import { Video } from '../../domain/Video';
import { VideoStatus } from '../../domain/VideoStatus';
import { IVideoService } from './video.service.port';
import { IMessageConnectService } from 'src/message/core/message-connect.service.port';
import { IVideoRepository } from '../repository/video-repository.port';
import { Transactional } from 'src/database/transactional';
import { IEmailService } from 'src/email/core/email.service.port';

@Injectable()
export class VideoService implements IVideoService {

  constructor(
    private readonly messageConnectService: IMessageConnectService,
    private readonly videoRepository: IVideoRepository,
    private readonly emailService: IEmailService
  ){}

  @Transactional()
  async registrarUpload(file: Express.Multer.File, idUsuario: string, emailUsuario: string): Promise<Video> {
    console.log('VideoService: Registrando upload de vídeo para processamento');

    // validando dados de entrada
    if(!idUsuario || !emailUsuario || !file) {
      throw new Error('Dados de entrada inválidos');
    }

    // registra upload
    const video = await this.videoRepository.salvarVideo({
      id: null,
      idUsuario,
      emailUsuario,
      status: VideoStatus.PROCESSANDO,
      pathVideo: file.filename,
      pathZip: null,
      dowload: false
    });

    // envia vídeo para fila de processamento
    await this.messageConnectService.enviarVideoProcessamento(JSON.stringify(video));

    return video;

  }

  @Transactional()
  async registrarDownload(video: Video): Promise<Video> {
    console.log('VideoService: Registrando download de vídeo');

    // registra o download
    return await this.videoRepository.salvarVideo({
     ...video,
      dowload: true
    });

  }

  @Transactional()
  async retornoProcessamento(video: Video): Promise<void> {
    console.log('VideoService: Registrando retorno do processamento do vídeo');

    if (video.status == VideoStatus.FALHA){
      await this.emailService.enviarEmail([video.emailUsuario], 'Fiap Vídeo: Falha no processamento', 'Ops... Ocorreu uma falha no processamento do vídeo: ' + JSON.stringify(video));
    }

    // registra os dados do retorno
    await this.videoRepository.salvarVideo({
      ...video,
    });
    
  }

  
}
