import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { IVideoService } from '../../core/application/services/video.service.port';
import { Video } from '../../core/domain/Video';
import { IMessageConnectService } from '../../core/application/services/message-connect.service.port';

@Injectable()
export class MessageConnectService implements IMessageConnectService {
  
  private readonly client: SQSClient;

  constructor(
    @Inject(forwardRef(() => IVideoService))
    private readonly videoService: IVideoService
  ) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });
  }

  async onModuleInit() {
    console.log('MessageConnectService: SQS Listener started...');
    this.listenQueue();
  }

  async listenQueue() {
    while (true) {
      try {
        
        const messages = await this.receberVideosProcessados(1);

        if (messages && messages.length > 0) {
          for (const message of messages) {
            console.log('MessageConnectService: mensagem recebida ', message.Body);

            const video: Video = { ...JSON.parse(message.Body)};
            try {
              await this.videoService.retornoProcessamento(video);
              await this.excluirVideoProcessado(message.ReceiptHandle);
            } catch(error){
              console.error('MessageConnectService: Erro ao processar mensagem:', error);
              await this.excluirVideoProcessado(message.ReceiptHandle);
            }
          }
        }
      } catch (error) {
        console.error('MessageConnectService: Erro ao receber mensagens:', error);
      }
    }
  }

  async enviarVideoProcessamento(messageBody: string): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSAR,
      MessageBody: messageBody,
    });

    await this.client.send(command);
    console.log(`Mensagem enviada: ${messageBody}`);
  }

  async receberVideosProcessados(maxMessages = 1): Promise<any[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 60,
      VisibilityTimeout: 10,
    });

    const response = await this.client.send(command);
    return response.Messages || [];
  }

  async excluirVideoProcessado(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
    console.log(`Mensagem deletada: ${receiptHandle}`);
  }
}
