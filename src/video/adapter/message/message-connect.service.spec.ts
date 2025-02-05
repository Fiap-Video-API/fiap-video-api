import { Test, TestingModule } from '@nestjs/testing';
import { MessageConnectService } from './message-connect.service';
import { IVideoService } from '../../core/application/services/video.service.port';
import { SQSClient, SendMessageCommand, DeleteMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs');

describe('MessageConnectService', () => {
  let service: MessageConnectService;
  let videoService: IVideoService;
  let sqsClient: SQSClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageConnectService,
        {
          provide: IVideoService,
          useValue: {
            retornoProcessamento: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageConnectService>(MessageConnectService);
    videoService = module.get<IVideoService>(IVideoService);
    sqsClient = new SQSClient({});
    (sqsClient.send as jest.Mock) = jest.fn();
    
    (service as any).client = sqsClient;
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('Deve enviar um vídeo para processamento', async () => {
    const messageBody = JSON.stringify({ id: '123', nome: 'Teste Video' });

    await service.enviarVideoProcessamento(messageBody);

    expect(sqsClient.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
  });

  it('Deve lidar com erro ao enviar um vídeo', async () => {
    (sqsClient.send as jest.Mock).mockRejectedValue(new Error('Erro ao enviar vídeo'));

    await expect(service.enviarVideoProcessamento(JSON.stringify({ id: '123' })))
      .rejects.toThrow('Erro ao enviar vídeo');
  });

  it('Deve receber vídeos processados', async () => {
    (sqsClient.send as jest.Mock).mockResolvedValueOnce({
      Messages: [
        {
          Body: JSON.stringify({ id: '123' }),
          ReceiptHandle: 'abc123',
        },
      ],
    });

    const messages = await service.receberVideosProcessados();

    expect(messages).toHaveLength(1);
    expect(messages[0].Body).toBe(JSON.stringify({ id: '123' }));
  });

  it('Deve lidar com erro ao receber vídeos processados', async () => {
    (sqsClient.send as jest.Mock).mockRejectedValue(new Error('Erro ao receber mensagens'));

    await expect(service.receberVideosProcessados()).rejects.toThrow('Erro ao receber mensagens');
  });

  it('Deve excluir um vídeo processado', async () => {
    const receiptHandle = 'abc123';

    await service.excluirVideoProcessado(receiptHandle);

    expect(sqsClient.send).toHaveBeenCalledWith(expect.any(DeleteMessageCommand));
  });

  it('Deve lidar com erro ao excluir um vídeo processado', async () => {
    (sqsClient.send as jest.Mock).mockRejectedValue(new Error('Erro ao excluir mensagem'));

    await expect(service.excluirVideoProcessado('abc123')).rejects.toThrow('Erro ao excluir mensagem');
  });

  it('Deve processar mensagens corretamente', async () => {
    (sqsClient.send as jest.Mock).mockResolvedValueOnce({
      Messages: [{ Body: JSON.stringify({ id: '123' }), ReceiptHandle: 'abc123' }],
    });

    (videoService.retornoProcessamento as jest.Mock).mockResolvedValueOnce(true);

    await service.listenQueue(true);

    expect(videoService.retornoProcessamento).toHaveBeenCalled();
    expect(sqsClient.send).toHaveBeenCalledWith(expect.any(DeleteMessageCommand));
  });
});
