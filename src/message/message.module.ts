import { Module } from '@nestjs/common';
import { MessageConnectService } from './adapter/message-connect.service';
import { IMessageConnectService } from './core/message-connect.service.port';
import { VideoModule } from 'src/video/video.module';

@Module({
  providers: [
    {
      provide: IMessageConnectService,
      useClass: MessageConnectService,
    },
    
  ],
  imports: [VideoModule],
  exports: [IMessageConnectService]
})
export class MessageModule {}
