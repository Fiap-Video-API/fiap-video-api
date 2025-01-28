export class ErroNegocialException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ErroNegocialException';
    }
}