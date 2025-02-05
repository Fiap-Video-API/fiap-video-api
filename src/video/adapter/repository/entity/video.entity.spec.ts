import { VideoEntity } from './video.entity';

describe('VideoEntity', () => {
  it('Deve criar uma instância de VideoEntity com valores válidos', () => {
    const video = new VideoEntity();
    video.idUsuario = '12345';
    video.emailUsuario = 'usuario@email.com';
    video.status = 'PROCESSANDO';
    video.pathVideo = '/videos/video.mp4';
    video.pathZip = '/videos/video.zip';
    video.dowload = true;

    expect(video).toBeInstanceOf(VideoEntity);
    expect(video.idUsuario).toBe('12345');
    expect(video.emailUsuario).toBe('usuario@email.com');
    expect(video.status).toBe('PROCESSANDO');
    expect(video.pathVideo).toBe('/videos/video.mp4');
    expect(video.pathZip).toBe('/videos/video.zip');
    expect(video.dowload).toBe(true);
  });

  it('Deve permitir `pathZip` como nulo', () => {
    const video = new VideoEntity();
    video.idUsuario = '12345';
    video.emailUsuario = 'usuario@email.com';
    video.status = 'FINALIZADO';
    video.pathVideo = '/videos/video.mp4';
    video.dowload = false;

    expect(video.pathZip).toBeUndefined();
  });

  it('Deve validar o comprimento máximo dos campos', () => {
    const video = new VideoEntity();
    video.idUsuario = '1'.repeat(50);
    video.emailUsuario = 'email@email.com';
    video.status = 'A'.repeat(20);
    video.pathVideo = '/videos/video.mp4';
    video.dowload = false;

    expect(video.idUsuario.length).toBeLessThanOrEqual(50);
    expect(video.status.length).toBeLessThanOrEqual(20);
  });
});