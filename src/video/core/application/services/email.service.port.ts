export abstract class IEmailService {
  abstract enviarEmail(
    to: string[],
    subject: string,
    body: string
  ): Promise<void>;
}