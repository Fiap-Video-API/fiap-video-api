export abstract class IMessageConnectService {
  abstract excluirVíveoProcessado(receiptHandle: string): Promise<void>;
  abstract receberVideosProcessados(maxMessages: number): Promise<any[]>;
  abstract enviarVideoProcessamento(messageBody: string): Promise<void>;
}