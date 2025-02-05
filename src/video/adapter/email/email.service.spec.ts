import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { IEmailService } from '../../core/application/services/email.service.port';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

jest.mock('@aws-sdk/client-ses');

describe('EmailService', () => {
  let service: EmailService;
  let sesClient: SESClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'SES_CLIENT',
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    sesClient = module.get<SESClient>('SES_CLIENT');
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('Deve enviar um e-mail com sucesso', async () => {
    const to = ['test@example.com'];
    const subject = 'Teste de E-mail';
    const body = '<p>Este é um e-mail de teste</p>';

    (sesClient.send as jest.Mock).mockResolvedValueOnce({ MessageId: '12345' });

    await service.enviarEmail(to, subject, body);

    expect(sesClient.send).toHaveBeenCalledWith(expect.any(SendEmailCommand));
  });

  it('Deve lançar um erro caso o envio falhe', async () => {
    const to = ['test@example.com'];
    const subject = 'Teste de E-mail';
    const body = '<p>Este é um e-mail de teste</p>';

    (sesClient.send as jest.Mock).mockRejectedValueOnce(new Error('Erro no SES'));

    await expect(service.enviarEmail(to, subject, body)).rejects.toThrow('Erro no SES');
  });
});
