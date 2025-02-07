import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { IMessageConnectService } from '../services/message-connect.service.port';
import { IVideoRepository } from '../repository/video-repository.port';
import { IEmailService } from '../../../core/application/services/email.service.port';
import { Video } from '../../domain/Video';
import { VideoStatus } from '../../domain/VideoStatus';
import { ErroNegocialException } from '../exception/erro-negocial.exception';
import { DataSource } from 'typeorm';

describe('VideoService', () => {
  let service: VideoService;
  let messageConnectService: IMessageConnectService;
  let videoRepository: IVideoRepository;
  let emailService: IEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: IMessageConnectService,
          useValue: {
            enviarVideoProcessamento: jest.fn(),
          },
        },
        {
          provide: IVideoRepository,
          useValue: {
            salvarVideo: jest.fn(),
            adquirirPorID: jest.fn(),
            adquirirPorUsuario: jest.fn(),
          },
        },
        {
          provide: IEmailService,
          useValue: {
            enviarEmail: jest.fn(),
          },
        },
        {
          provide: 'DATA_SOURCE',
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    messageConnectService = module.get<IMessageConnectService>(IMessageConnectService);
    videoRepository = module.get<IVideoRepository>(IVideoRepository);
    emailService = module.get<IEmailService>(IEmailService);
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('Deve registrar um upload de vídeo com sucesso', async () => {
    const mockFile = { filename: 'video.mp4' } as Express.Multer.File;
    const mockVideo: Video = {
      idUsuario: '123',
      emailUsuario: 'user@example.com',
      status: VideoStatus.PROCESSANDO,
      pathVideo: mockFile.filename,
      dowload: false,
    };

    (videoRepository.salvarVideo as jest.Mock).mockResolvedValue(mockVideo);
    (messageConnectService.enviarVideoProcessamento as jest.Mock).mockResolvedValue(undefined);

    const result = await service.registrarUpload(mockFile, '123', 'user@example.com');

    expect(videoRepository.salvarVideo).toHaveBeenCalledWith(mockVideo);
    expect(messageConnectService.enviarVideoProcessamento).toHaveBeenCalledWith(JSON.stringify(mockVideo));
    expect(result).toBe(mockVideo);
  });

  it('Deve registrar um download de vídeo', async () => {
    const mockVideo: Video = {
      idUsuario: '123',
      emailUsuario: 'user@example.com',
      status: VideoStatus.PROCESSANDO,
      pathVideo: 'video.mp4',
      dowload: false,
    };

    (videoRepository.adquirirPorID as jest.Mock).mockResolvedValue(mockVideo);
    (videoRepository.salvarVideo as jest.Mock).mockResolvedValue({ ...mockVideo, dowload: true });

    const result = await service.registrarDownload('video123', '123');

    expect(videoRepository.salvarVideo).toHaveBeenCalledWith({ ...mockVideo, dowload: true });
    expect(result.dowload).toBe(true);
  });

  it('Deve registrar o retorno do processamento de vídeo', async () => {
    const mockVideo: Video = {
      idUsuario: '123',
      emailUsuario: 'user@example.com',
      status: VideoStatus.FINALIZADO,
      pathVideo: 'video.mp4',
      dowload: false,
    };

    (videoRepository.salvarVideo as jest.Mock).mockResolvedValue(mockVideo);

    await service.retornoProcessamento(mockVideo);

    expect(videoRepository.salvarVideo).toHaveBeenCalledWith(mockVideo);
  });

  it('Deve enviar um e-mail se o processamento falhar', async () => {
    const mockVideo: Video = {
      idUsuario: '123',
      emailUsuario: 'user@example.com',
      status: VideoStatus.FALHA,
      pathVideo: 'video.mp4',
      dowload: false,
    };

    (videoRepository.salvarVideo as jest.Mock).mockResolvedValue(mockVideo);
    (emailService.enviarEmail as jest.Mock).mockResolvedValue(undefined);

    await service.retornoProcessamento(mockVideo);

    expect(emailService.enviarEmail).toHaveBeenCalledWith(
      [mockVideo.emailUsuario],
      'Fiap Vídeo: Falha no processamento',
      expect.stringContaining(JSON.stringify(mockVideo)),
    );
  });

  it('Deve adquirir status dos vídeos do usuário', async () => {
    const mockVideos: Video[] = [
      {
        idUsuario: '123',
        emailUsuario: 'user@example.com',
        status: VideoStatus.PROCESSANDO,
        pathVideo: 'video.mp4',
        dowload: false,
      },
    ];

    (videoRepository.adquirirPorUsuario as jest.Mock).mockResolvedValue(mockVideos);

    const result = await service.adquirirStatusPorUsuario('123');

    expect(videoRepository.adquirirPorUsuario).toHaveBeenCalledWith('123');
    expect(result).toBe(mockVideos);
  });

  it('Deve adquirir status de um vídeo específico', async () => {
    const mockVideo: Video = {
      idUsuario: '123',
      emailUsuario: 'user@example.com',
      status: VideoStatus.FINALIZADO,
      pathVideo: 'video.mp4',
      dowload: true,
    };

    (videoRepository.adquirirPorID as jest.Mock).mockResolvedValue(mockVideo);

    const result = await service.adquirirStatusPorVideo('video123', '123');

    expect(videoRepository.adquirirPorID).toHaveBeenCalledWith('video123');
    expect(result).toBe(mockVideo);
  });

  it('Deve lançar uma exceção ao tentar acessar status de um vídeo sem permissão', async () => {
    const mockVideo: Video = {
      idUsuario: '456',
      emailUsuario: 'user@example.com',
      status: VideoStatus.FINALIZADO,
      pathVideo: 'video.mp4',
      dowload: true,
    };

    (videoRepository.adquirirPorID as jest.Mock).mockResolvedValue(mockVideo);

    await expect(service.adquirirStatusPorVideo('video123', '123')).rejects.toThrow(
      new ErroNegocialException('Usuário sem permissão para acessar dados do vídeo solicitado'),
    );
  });
});
