import { Module } from '@nestjs/common';
import { SESClient } from '@aws-sdk/client-ses';
import { EmailService } from './email.service';
import { IEmailService } from './email.service.port';

@Module({
  providers: [
    {
      provide: 'SES_CLIENT',
      useFactory: () => {
        return new SESClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        });
      },
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
  ],
  exports: ['SES_CLIENT', IEmailService],
})
export class EmailModule {}
