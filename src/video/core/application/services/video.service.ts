import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Video } from '../../domain/Video';
import { VideoStatus } from '../../domain/VideoStatus';
import { IVideoService } from './video.service.port';
import { IMessageConnectService } from '../../../core/application/services/message-connect.service.port';
import { IVideoRepository } from '../repository/video-repository.port';
import { Transactional } from '../../../../database/transactional';
import { IEmailService } from '../../../core/application/services/email.service.port';
import { ErroNegocialException } from '../exception/erro-negocial.exception';

@Injectable()
export class VideoService implements IVideoService {

  constructor(
    @Inject(forwardRef(() => IMessageConnectService))
    private readonly messageConnectService: IMessageConnectService,
    private readonly videoRepository: IVideoRepository,
    private readonly emailService: IEmailService
  ){}

  @Transactional()
  async registrarUpload(file: Express.Multer.File, idUsuario: string, emailUsuario: string): Promise<Video> {
    console.log('VideoService: Registrando upload de vídeo para processamento');

    // validando dados de entrada
    if(!idUsuario || !emailUsuario || !file) {
      throw new ErroNegocialException('Dados de entrada inválidos');
    }

    // registra upload
    const video = await this.videoRepository.salvarVideo({
      idUsuario,
      emailUsuario,
      status: VideoStatus.PROCESSANDO,
      pathVideo: file.filename,
      dowload: false
    });

    // envia vídeo para fila de processamento
    await this.messageConnectService.enviarVideoProcessamento(JSON.stringify(video));

    return video;

  }

  @Transactional()
  async registrarDownload(id: string, idUsuario: string): Promise<Video> {
    console.log('VideoService: Registrando download de vídeo');

    const video = await this.videoRepository.adquirirPorID(id);

    if (video.idUsuario != idUsuario) {
      throw new ErroNegocialException(`Usuário sem permissão para o download`);
    }

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

  @Transactional()
  async adquirirStatusPorUsuario(idUsuario: string): Promise<Video[]> {

     // validando dados de entrada
     if(!idUsuario) {
      throw new ErroNegocialException('Usuário não informado');
    }

    return await this.videoRepository.adquirirPorUsuario(idUsuario);
  }

  @Transactional()
  async adquirirStatusPorVideo(idVideo: string, idUsuario: string): Promise<Video> {
    
    const video = await this.videoRepository.adquirirPorID(idVideo);

    if (video.idUsuario != idUsuario) {
      throw new ErroNegocialException(`Usuário sem permissão para o acessar dados do vídeo solicitado`);
    }

    return video;
  }
}