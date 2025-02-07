import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { IVideoService } from '../../core/application/services/video.service.port';
import { Video } from '../../core/domain/Video';
import { StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('VideoController', () => {
  let controller: VideoController;
  let videoService: IVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: IVideoService,
          useValue: {
            registrarUpload: jest.fn(),
            registrarDownload: jest.fn(),
            adquirirStatusPorUsuario: jest.fn(),
            adquirirStatusPorVideo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    videoService = module.get<IVideoService>(IVideoService);
  });

  it('Deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('Deve registrar um upload de vídeo', async () => {
    const mockFile = { originalname: 'video.mp4' } as Express.Multer.File;
    const mockUser = { id: '123', email: 'user@example.com' };
    const mockReq = { user: mockUser };
    const mockVideo = new Video();

    (videoService.registrarUpload as jest.Mock).mockResolvedValue(mockVideo);

    const result = await controller.uploadFile(mockFile, mockReq);

    expect(videoService.registrarUpload).toHaveBeenCalledWith(mockFile, mockUser.id, mockUser.email);
    expect(result).toBe(mockVideo);
  });

  it('Deve lançar uma exceção ao falhar no upload', async () => {
    const mockFile = { originalname: 'video.mp4' } as Express.Multer.File;
    const mockReq = { user: { id: '123', email: 'user@example.com' } };

    (videoService.registrarUpload as jest.Mock).mockRejectedValue(new Error('Erro ao processar upload'));

    await expect(controller.uploadFile(mockFile, mockReq)).rejects.toThrow('Erro ao processar upload');
  });

  it('Deve registrar um download de vídeo e retornar um arquivo', async () => {
    const mockRes: any = {
      set: jest.fn(),
    };
    const mockReq = { user: { id: '123' } };
    const mockId = 'video123';
  
    (videoService.registrarDownload as jest.Mock).mockResolvedValue(undefined);
  
    const mockStream = new Readable();
    mockStream.push('mock data');
    mockStream.push(null);
  
    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);
  
    const result = await controller.downloadFile(mockId, mockRes, mockReq);
  
    expect(videoService.registrarDownload).toHaveBeenCalledWith(mockId, mockReq.user.id);
    expect(mockRes.set).toHaveBeenCalledWith({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${mockId}.zip"`,
    });
  
    expect(result).toBeInstanceOf(StreamableFile);
  
    expect(result.getStream()).toBe(mockStream);
  });

  it('Deve lançar uma exceção ao falhar no download', async () => {
    const mockRes: any = { set: jest.fn() };
    const mockReq = { user: { id: '123' } };
    const mockId = 'video123';

    (videoService.registrarDownload as jest.Mock).mockRejectedValue(new Error('Erro ao registrar download'));

    await expect(controller.downloadFile(mockId, mockRes, mockReq)).rejects.toThrow('Erro ao registrar download');
  });

  it('Deve obter status dos vídeos do usuário', async () => {
    const mockReq = { user: { id: '123' } };
    const mockVideos: Video[] = [new Video()];

    (videoService.adquirirStatusPorUsuario as jest.Mock).mockResolvedValue(mockVideos);

    const result = await controller.status(mockReq);

    expect(videoService.adquirirStatusPorUsuario).toHaveBeenCalledWith(mockReq.user.id);
    expect(result).toBe(mockVideos);
  });

  it('Deve obter status de um vídeo específico', async () => {
    const mockReq = { user: { id: '123' } };
    const mockId = 'video123';
    const mockVideo = new Video();

    (videoService.adquirirStatusPorVideo as jest.Mock).mockResolvedValue(mockVideo);

    const result = await controller.statusVideo(mockReq, mockId);

    expect(videoService.adquirirStatusPorVideo).toHaveBeenCalledWith(mockId, mockReq.user.id);
    expect(result).toBe(mockVideo);
  });
});
