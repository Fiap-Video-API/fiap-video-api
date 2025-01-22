import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class MessageConnectService {
  
  private readonly client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });
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
    });

    const response = await this.client.send(command);
    return response.Messages || [];
  }

  async excluirVíveoProcessado(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
    console.log(`Mensagem deletada: ${receiptHandle}`);
  }
}
