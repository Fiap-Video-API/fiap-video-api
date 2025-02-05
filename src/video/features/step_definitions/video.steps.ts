import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import assert from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { Video } from '../../core/domain/Video';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Mock do repositório de vídeos
class FakeVideoRepository {
  private videos: Video[] = [];

  async save(video: Video): Promise<Video> {
    if (this.videos.find((v) => v.pathVideo === video.pathVideo)) {
      throw new Error('Título já cadastrado.');
    }
    const newVideo = { ...video, id: String(this.videos.length + 1) };
    this.videos.push(newVideo);
    return newVideo;
  }

  async findOne(id: string): Promise<Video | null> {
    return this.videos.find((v) => v.id === id) || null;
  }
}

let app: INestApplication;
let videoRepository: FakeVideoRepository;
let video: Video;
let response: any;
let videoIdPesquisa: string;

const ERROR_MESSAGES = {
  TITLE_EXISTS: 'Título já cadastrado.',
  INVALID_URL: 'URL inválida',
  INVALID_TITLE: 'Título inválido',
  VIDEO_NOT_FOUND: 'Vídeo não encontrado.',
};

const VIDEO1 = {
  idUsuario: 'usuario1',
  emailUsuario: 'usuario1@teste.com',
  status: 'ativo',
  pathVideo: 'path/to/video1.mp4',
  dowload: true,
  id: null,
};

const VIDEO2 = {
  idUsuario: 'usuario2',
  emailUsuario: 'usuario2@teste.com',
  status: 'inativo',
  pathVideo: 'path/to/video2.mp4',
  dowload: false,
  id: null,
};

Before(async function () {
  console.log('Iniciando aplicação de testes...');
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(getRepositoryToken(Video))
    .useValue(new FakeVideoRepository()) // Substitui o repositório real pelo fake
    .compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  videoRepository = moduleFixture.get(getRepositoryToken(Video));
});

After(async function () {
  console.log('Finalizando aplicação de testes...');
  if (app) {
    await app.close();
  }
});

// Steps do Cucumber

Given('que o usuário fornece um título, descrição e URL válidos', function () {
  video = { ...VIDEO1 };
});

Given('que o usuário fornece um título já cadastrado', async function () {
  await videoRepository.save(VIDEO1);
  video = { ...VIDEO2, pathVideo: 'https://path/to/another-video.mp4' };
});

Given('que o usuário fornece uma URL inválida', function () {
  video = { ...VIDEO1, pathVideo: 'invalid-url' };
});

Given('que o usuário fornece um título inválido', function () {
  video = { ...VIDEO1, idUsuario: '' };
});

Given('que seja informado um ID de vídeo já cadastrado', async function () {
  const savedVideo = await videoRepository.save(VIDEO1);
  videoIdPesquisa = savedVideo.id;
});

Given('que seja informado um ID de vídeo não cadastrado', function () {
  videoIdPesquisa = 'nonexistent-id';
});

When('o usuário solicita o cadastro', async function () {
  try {
    response = await request(app.getHttpServer()).post('/videos').send(video);
  } catch (error) {
    response = { status: HttpStatus.BAD_REQUEST, body: { message: error.message } };
  }
});

When('realizada a busca do vídeo por ID', async function () {
  const videoEncontrado = await videoRepository.findOne(videoIdPesquisa);
  if (!videoEncontrado) {
    response = { status: HttpStatus.BAD_REQUEST, body: { message: ERROR_MESSAGES.VIDEO_NOT_FOUND } };
  } else {
    response = { status: HttpStatus.OK, body: videoEncontrado };
  }
});

Then('o vídeo é cadastrado com sucesso', function () {
  assert.strictEqual(response.status, HttpStatus.CREATED);
});

Then('o sistema retorna um ID válido', function () {
  assert.ok(response.body.id);
});

Then('uma exceção informando que o título já existe deve ser lançada', function () {
  assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
  assert.strictEqual(response.body.message, ERROR_MESSAGES.TITLE_EXISTS);
});

Then('uma exceção informando que a URL é inválida deve ser lançada', function () {
  assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
  assert.strictEqual(response.body.message, ERROR_MESSAGES.INVALID_URL);
});

Then('uma exceção informando que o título é inválido deve ser lançada', function () {
  assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
  assert.strictEqual(response.body.message, ERROR_MESSAGES.INVALID_TITLE);
});

Then('os dados do vídeo cadastrado devem ser retornados', function () {
  assert.strictEqual(response.status, HttpStatus.OK);
  assert.strictEqual(response.body.id, videoIdPesquisa);
});

Then('uma exceção informando que o vídeo não foi encontrado deve ser lançada', function () {
  assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
  assert.strictEqual(response.body.message, ERROR_MESSAGES.VIDEO_NOT_FOUND);
});
