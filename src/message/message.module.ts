import { Module } from '@nestjs/common';
import { MessageConnectService } from './message-connect.service';

@Module({
  providers: [MessageConnectService]
})
export class MessageModule {}
