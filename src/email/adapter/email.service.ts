import { SendEmailCommand, SendEmailCommandInput, SESClient } from "@aws-sdk/client-ses";
import { Inject, Injectable } from "@nestjs/common";
import { IEmailService } from "../core/email.service.port";

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    @Inject('SES_CLIENT') private readonly sesClient: SESClient,
  ) {}

  async enviarEmail(
    to: string[],
    subject: string,
    body: string
  ): Promise<void> {
    console.log('EmailService: Enviando email para ' + to);
    
    const input: SendEmailCommandInput = {
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: process.env.AWS_SES_FROM_EMAIL,
    };

    try {
      const command = new SendEmailCommand(input);
      await this.sesClient.send(command);
      console.log('EmailService: Email enviado com sucesso!');
    } catch (error) {
      console.error('EmailService: Erro ao enviar o email:', error);
      throw error;
    }
  }
}