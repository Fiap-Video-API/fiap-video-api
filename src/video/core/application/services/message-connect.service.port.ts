import { OnModuleInit } from "@nestjs/common";

export abstract class IMessageConnectService implements OnModuleInit {
  abstract excluirVideoProcessado(receiptHandle: string): Promise<void>;
  abstract receberVideosProcessados(maxMessages: number): Promise<any[]>;
  abstract enviarVideoProcessamento(messageBody: string): Promise<void>;
  abstract onModuleInit(): any;
  abstract listenQueue(): any;
}