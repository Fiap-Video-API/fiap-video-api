import { Module } from '@nestjs/common';
import { MessageConnectService } from './message-connect.service';
import { IMessageConnectService } from './message-connect.service.port';

@Module({
  providers: [
    {
      provide: IMessageConnectService,
      useClass: MessageConnectService,
    },
    
  ],
  exports: [IMessageConnectService]
})
export class MessageModule {}
