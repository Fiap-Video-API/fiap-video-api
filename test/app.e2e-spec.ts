import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SESClient } from '@aws-sdk/client-ses';
import { IEmailService } from './../src/video/core/application/services/email.service.port';
import { IMessageConnectService } from './../src/video/core/application/services/message-connect.service.port';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideoEntity } from './../src/video/adapter/repository/entity/video.entity';

describe('Testes de Integração - VideoController', () => {
  let app: INestApplication;
  let uploadedVideoId: string;

  const mockSESClient = {
    sendEmail: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockMessageConnectService = {
    sendMessage: jest.fn(),
  };

  const mockVideoRepository = {
    save: jest.fn().mockResolvedValue({ id: 'mock-video-id' }),
    findOne: jest.fn().mockResolvedValue({ id: 'mock-video-id', status: 'completed' }),
    find: jest.fn().mockResolvedValue([{ id: 'mock-video-id', status: 'completed' }]),
  };

  beforeEach(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(SESClient)
        .useValue(mockSESClient)
        .overrideProvider(IEmailService)
        .useValue(mockEmailService)
        .overrideProvider(IMessageConnectService)
        .useValue(mockMessageConnectService)
        .overrideProvider(getRepositoryToken(VideoEntity))
        .useValue(mockVideoRepository)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (error) {
      console.error('Erro na inicialização da aplicação:', error);
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Deve registrar um upload de vídeo', async () => {
    const mockFile = Buffer.from('teste');

    const response = await request(app.getHttpServer())
      .post('/videos/upload')
      .attach('file', mockFile, 'video.mp4')
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    uploadedVideoId = response.body.id;
  });

  it('Deve registrar um download de vídeo', async () => {
    return request(app.getHttpServer())
      .get(`/videos/download/${uploadedVideoId}`)
      .expect(HttpStatus.OK);
  });

  it('Deve obter status dos vídeos do usuário', async () => {
    const response = await request(app.getHttpServer())
      .get('/videos/status')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('status', 'completed');
  });

  it('Deve obter status de um vídeo específico', async () => {
    return request(app.getHttpServer())
      .get(`/videos/status/${uploadedVideoId}`)
      .expect(HttpStatus.OK);
  });
});
